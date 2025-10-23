import express from 'express';
import { createClient } from 'redis';
import cors from 'cors';
import dotenv from 'dotenv';
import { getSunsetQualityScore, getCloudTypeFromWeatherCode } from './scoringService.js';
import { CACHE_TTL, SUNSET_HOUR } from '../shared/constants.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Redis client
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redis.on('error', (err) => console.log('Redis Client Error', err));
await redis.connect();

// Middleware
app.use(cors());
app.use(express.json());

// Cache durations imported from shared constants

/**
 * Get forecast data with Redis caching
 */
app.get('/api/forecast/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;
    const cacheKey = `forecast_${lat}_${lon}`;
    
    // Check Redis cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({
        ...JSON.parse(cached),
        cached: true
      });
    }
    
    // Fetch fresh data from Open-Meteo API
    const forecastData = await fetchForecastFromAPI(lat, lon);
    
    // Cache the result
    await redis.setEx(cacheKey, CACHE_TTL.FORECAST, JSON.stringify(forecastData));
    
    res.json({
      ...forecastData,
      cached: false
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});

/**
 * Get historical data with Redis caching
 */
app.get('/api/historical/:lat/:lon/:year', async (req, res) => {
  try {
    const { lat, lon, year } = req.params;
    const cacheKey = `historical_${lat}_${lon}_${year}`;
    
    // Check Redis cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({
        ...JSON.parse(cached),
        cached: true
      });
    }
    
    // Fetch fresh data from Open-Meteo Archive API
    const historicalData = await fetchHistoricalFromAPI(lat, lon, year);
    
    // Cache the result
    await redis.setEx(cacheKey, CACHE_TTL.HISTORICAL, JSON.stringify(historicalData));
    
    res.json({
      ...historicalData,
      cached: false
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

/**
 * Clear cache for specific location
 */
app.delete('/api/cache/forecast/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;
    const cacheKey = `forecast_${lat}_${lon}`;
    await redis.del(cacheKey);
    res.json({ message: 'Forecast cache cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

/**
 * Clear all cache
 */
app.delete('/api/cache/all', async (req, res) => {
  try {
    await redis.flushAll();
    res.json({ message: 'All cache cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear all cache' });
  }
});

/**
 * Get cache statistics
 */
app.get('/api/cache/stats', async (req, res) => {
  try {
    const keys = await redis.keys('*');
    const forecastKeys = keys.filter(key => key.startsWith('forecast_'));
    const historicalKeys = keys.filter(key => key.startsWith('historical_'));
    
    res.json({
      totalKeys: keys.length,
      forecastKeys: forecastKeys.length,
      historicalKeys: historicalKeys.length,
      memoryUsage: await redis.memory('usage')
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get cache stats' });
  }
});

/**
 * Fetch forecast data from Open-Meteo API
 */
async function fetchForecastFromAPI(lat, lon) {
  // Fetch weather data
  const weatherResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?` +
    `latitude=${lat}&` +
    `longitude=${lon}&` +
    `hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,cloud_cover,visibility,wind_speed_10m&` +
    `daily=weather_code,temperature_2m_max,temperature_2m_min,sunset,sunrise&` +
    `timezone=auto&` +
    `forecast_days=7`
  );
  
  if (!weatherResponse.ok) {
    throw new Error('Weather API failed');
  }
  
  const weatherData = await weatherResponse.json();
  
  // Fetch air quality data
  let aqiData = null;
  try {
    const aqiResponse = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?` +
      `latitude=${lat}&` +
      `longitude=${lon}&` +
      `hourly=us_aqi&` +
      `timezone=auto&` +
      `forecast_days=7`
    );
    
    if (aqiResponse.ok) {
      aqiData = await aqiResponse.json();
    }
  } catch (error) {
    console.error('Failed to fetch air quality data:', error.message);
  }
  
  // Process forecast data (same logic as frontend)
  return processForecastData(weatherData, aqiData, lat, lon);
}

/**
 * Fetch historical data from Open-Meteo Archive API
 */
async function fetchHistoricalFromAPI(lat, lon, year) {
  const startDate = `${year}-01-01`;
  const endDate = new Date().toISOString().split('T')[0];
  
  const weatherResponse = await fetch(
    `https://archive-api.open-meteo.com/v1/archive?` +
    `latitude=${lat}&` +
    `longitude=${lon}&` +
    `start_date=${startDate}&` +
    `end_date=${endDate}&` +
    `hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,cloud_cover,visibility,wind_speed_10m&` +
    `daily=weather_code,temperature_2m_max,temperature_2m_min,sunset,sunrise&` +
    `timezone=auto`
  );
  
  if (!weatherResponse.ok) {
    throw new Error('Historical weather API failed');
  }
  
  const weatherData = await weatherResponse.json();
  
  // Process historical data (same logic as frontend)
  return processHistoricalData(weatherData, lat, lon, year);
}


/**
 * Process forecast data (same logic as frontend)
 */
function processForecastData(weatherData, aqiData, lat, lon) {
  const days = [];
  const today = new Date();

  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + dayIndex);

    // Get sunset time from daily data and format it properly
    const rawSunsetTime = weatherData.daily?.sunset?.[dayIndex] || '18:30';
    let sunsetTime = '18:30';
    if (rawSunsetTime && rawSunsetTime.includes('T')) {
      // Extract time from ISO format (e.g., "2025-10-23T18:36" -> "18:36")
      sunsetTime = rawSunsetTime.split('T')[1]?.split(':').slice(0, 2).join(':') || '18:30';
    } else if (rawSunsetTime) {
      sunsetTime = rawSunsetTime;
    }
    
    // Calculate hour index for sunset
    const hourIndex = (dayIndex * 24) + SUNSET_HOUR;
    const safeHourIndex = Math.min(hourIndex, weatherData.hourly.time.length - 1);

    // Get weather data for sunset hour
    const weatherCode = weatherData.hourly.weather_code?.[safeHourIndex] || 0;
    const cloudCover = weatherData.hourly.cloud_cover?.[safeHourIndex] || 50;
    const temperature = Math.round(weatherData.hourly.temperature_2m?.[safeHourIndex] || weatherData.daily.temperature_2m_max?.[dayIndex] || 20);
    const humidity = weatherData.hourly.relative_humidity_2m?.[safeHourIndex] || 50;
    const windSpeed = Math.round(weatherData.hourly.wind_speed_10m?.[safeHourIndex] || 10);
    const precipitationChance = weatherData.hourly.precipitation_probability?.[safeHourIndex] || 0;
    const visibility = weatherData.hourly.visibility?.[safeHourIndex] || 10000;

    // Get AQI data
    let aqi = 50;
    if (aqiData && aqiData.hourly && aqiData.hourly.us_aqi) {
      aqi = aqiData.hourly.us_aqi[safeHourIndex] || 50;
    }

    // Determine cloud type and height based on weather code
    const cloudInfo = getCloudTypeFromWeatherCode(weatherCode);
    
    // Calculate sunset quality score
    const scoreData = getSunsetQualityScore({
      cloud_type: cloudInfo.type,
      cloud_height_km: cloudInfo.height,
      cloud_coverage: cloudCover,
      precipitation_chance: precipitationChance,
      air_quality_index: Math.round(aqi),
      humidity: humidity,
      visibility: visibility,
      wind_speed: windSpeed,
      temperature_stable: weatherCode <= 3
    });

    const dayData = {
      date: currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      day_of_week: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
      temperature: temperature,
      cloud_coverage: cloudCover,
      cloud_type: cloudInfo.type,
      cloud_height_km: cloudInfo.height,
      precipitation_chance: precipitationChance,
      humidity: humidity,
      wind_speed: windSpeed,
      visibility: visibility,
      air_quality_index: Math.round(aqi),
      temperature_stable: weatherCode <= 3,
      sunset_time: sunsetTime,
      conditions: cloudInfo.type,
      weather_code: weatherCode,
      sunset_score: scoreData.score
    };

    days.push(dayData);
  }

  return {
    location: `Location ${lat}, ${lon}`,
    latitude: parseFloat(lat),
    longitude: parseFloat(lon),
    days: days,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Process historical data (same logic as frontend)
 */
function processHistoricalData(weatherData, lat, lon, year) {
  // Import your existing processing logic here
  // This would be the same logic from your frontend historicalForecastService.js
  return {
    location: { latitude: parseFloat(lat), longitude: parseFloat(lon) },
    year: parseInt(year),
    days: [], // Process your historical data here
    top5: [], // Top 5 sunsets
    statistics: {}, // Statistics
    lastUpdated: new Date().toISOString()
  };
}

app.listen(PORT, () => {
  console.log(`Suncast Backend API running on port ${PORT}`);
  console.log(`Redis connected: ${redis.isOpen}`);
});
