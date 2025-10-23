/**
 * Application-wide constants
 * Centralized configuration for scoring, thresholds, and timing
 */

// === SUNSET SCORING CONSTANTS ===

// Cloud Height Ranges (in kilometers)
export const CLOUD_HEIGHT = {
  VERY_HIGH_MIN: 12,
  HIGH_MIN: 6,
  HIGH_MAX: 12,
  MID_MIN: 2,
  MID_MAX: 6,
  LOW_MAX: 2,
};

// Cloud Coverage Thresholds (percentage)
export const CLOUD_COVERAGE = {
  OPTIMAL_MIN: 25,
  OPTIMAL_MAX: 40,
  GOOD_MIN: 40,
  GOOD_MAX: 55,
  MODERATE_MIN: 15,
  MODERATE_MAX: 25,
  LIGHT_MIN: 5,
  LIGHT_MAX: 15,
  HEAVY: 60,
  OVERCAST: 80,
};

// Precipitation Thresholds (percentage)
export const PRECIPITATION = {
  HEAVY: 70,
  MODERATE_HEAVY: 50,
  MODERATE: 30,
  LIGHT: 15,
  VERY_LOW: 5,
  MINIMAL: 10,
};

// Air Quality Index Thresholds
export const AQI = {
  EXCEPTIONAL: 20,
  EXCELLENT: 40,
  GOOD: 60,
  MODERATE: 100,
  UNHEALTHY_SENSITIVE: 150,
  DEFAULT: 50,
};

// Humidity Thresholds (percentage)
export const HUMIDITY = {
  VERY_LOW: 25,
  LOW: 45,
  MODERATE: 65,
  HIGH: 85,
  DEFAULT: 50,
};

// Visibility Thresholds (meters)
export const VISIBILITY = {
  EXCEPTIONAL: 15000,
  EXCELLENT: 10000,
  GOOD: 7000,
  FAIR: 4000,
  DEFAULT: 10000,
};

// Wind Speed Thresholds (km/h)
export const WIND_SPEED = {
  IDEAL_MIN: 5,
  IDEAL_MAX: 12,
  LIGHT_MIN: 3,
  LIGHT_MAX: 5,
  MODERATE_MIN: 12,
  MODERATE_MAX: 20,
  STRONG: 30,
  WINDY: 20,
  DEFAULT: 10,
};

// Sunset Duration Constants (minutes)
export const SUNSET_DURATION = {
  BASE: 18,
  MIN: 5,
  MAX: 45,
  EXTENDED: 30,
  LONG: 20,
  NORMAL: 15,
  BRIEF: 10,
};

// === TIME CONSTANTS ===

// Sunset hour approximation (24-hour format)
export const SUNSET_HOUR = 18;

// Debounce timing (milliseconds)
export const DEBOUNCE_DELAY = 300;

// === CACHE CONSTANTS ===

// Cache Time-To-Live (seconds)
export const CACHE_TTL = {
  FORECAST: 2 * 60 * 60,    // 2 hours
  HISTORICAL: 24 * 60 * 60, // 24 hours
};

// === API CONSTANTS ===

// Geocoding API limits
export const GEOCODING = {
  MIN_QUERY_LENGTH: 3,
  MAX_SUGGESTIONS: 5,
  RESULTS_LIMIT: 8,
};

// === SCORE RANGES ===

export const SCORE_RANGES = {
  MIN: 0,
  MAX: 100,
  PERFECT_BONUS: 10,
};
