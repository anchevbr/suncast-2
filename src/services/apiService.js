/**
 * Unified API service for all weather and sunset data
 * Handles both live and historical data fetching
 */

/**
 * Fetch live forecast data from backend API
 * @param {string} locationQuery - Location name or coordinates
 * @param {string} customLocationName - Optional custom location name
 * @returns {Promise<Object>} - Complete forecast object
 */
export const fetchForecastData = async (locationQuery, customLocationName = null) => {
  // Step 1: Parse coordinates
  let coords;
  let locationName;
  
  const coordMatch = locationQuery.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  if (coordMatch) {
    coords = {
      latitude: parseFloat(coordMatch[1]),
      longitude: parseFloat(coordMatch[2]),
      name: customLocationName ? customLocationName.split(',')[0] : 'Current Location',
      country: customLocationName ? customLocationName.split(',').slice(1).join(',').trim() : ''
    };
    locationName = customLocationName || 'Current Location';
  } else {
    throw new Error('Location must be provided as coordinates or through autocomplete');
  }

  // Step 2: Fetch from backend API with Redis caching
  const response = await fetch(`http://localhost:3001/api/forecast/${coords.latitude}/${coords.longitude}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch forecast data from backend');
  }
  
  const apiData = await response.json();
  
  // Backend already processes all the data, just return it
  return {
    location: locationName,
    latitude: coords.latitude,
    longitude: coords.longitude,
    days: apiData.days,
    cached: apiData.cached,
    lastUpdated: apiData.lastUpdated
  };
};

/**
 * Fetch historical weather data from Open-Meteo Archive API
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<Object>} - Historical weather data object
 */
export const fetchHistoricalWeatherData = async (latitude, longitude) => {
  const year = new Date().getFullYear();
  const startDate = `${year}-01-01`;
  const endDate = new Date().toISOString().split('T')[0]; // Today's date
  
  const url = `https://archive-api.open-meteo.com/v1/archive?` +
    `latitude=${latitude}&` +
    `longitude=${longitude}&` +
    `start_date=${startDate}&` +
    `end_date=${endDate}&` +
    `hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,cloud_cover,visibility,wind_speed_10m&` +
    `daily=weather_code,temperature_2m_max,temperature_2m_min,sunset,sunrise&` +
    `timezone=auto`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Historical weather data fetch failed: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  return data;
};

/**
 * Fetch historical air quality data from Open-Meteo Archive API
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<Object>} - Historical air quality data object
 */
export const fetchHistoricalAirQualityData = async (latitude, longitude) => {
  // Open-Meteo Archive API doesn't support historical air quality data
  // Use the current air quality API instead for the current year
  const year = new Date().getFullYear();
  const startDate = `${year}-01-01`;
  const endDate = new Date().toISOString().split('T')[0]; // Today's date
  
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?` +
    `latitude=${latitude}&` +
    `longitude=${longitude}&` +
    `start_date=${startDate}&` +
    `end_date=${endDate}&` +
    `hourly=us_aqi&` +
    `timezone=auto`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Historical air quality data fetch failed: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  return data;
};
