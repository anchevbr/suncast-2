import React from "react";
import { WiDaySunny, WiCloudy, WiRain, WiSnow, WiFog, WiDayCloudy, WiDayRain, WiDaySnow } from "react-icons/wi";

/**
 * WeatherIcon component that displays appropriate weather icon based on conditions
 * @param {Object} props - Component props
 * @param {Object} props.day - Weather data for the day
 * @returns {JSX.Element} - Weather icon component
 */
const WeatherIcon = ({ day }) => {
  const getDetailedWeatherIcon = () => {
    const conditions = day.conditions?.toLowerCase() || '';
    const precip = day.precipitation_chance || 0;
    const clouds = day.cloud_coverage || 0;
    
    // Rain conditions
    if (precip > 70 || conditions.includes('rain') || conditions.includes('shower')) {
      return <WiDayRain className="w-10 h-10 text-blue-600" />;
    }
    if (precip > 40 || conditions.includes('drizzle')) {
      return <WiRain className="w-10 h-10 text-blue-500" />;
    }
    
    // Snow
    if (conditions.includes('snow')) {
      return <WiDaySnow className="w-10 h-10 text-blue-400" />;
    }
    
    // Fog
    if (conditions.includes('fog') || conditions.includes('mist')) {
      return <WiFog className="w-10 h-10 text-gray-500" />;
    }
    
    // Cloudy conditions
    if (clouds > 70 || conditions.includes('overcast') || conditions.includes('mostly cloudy')) {
      return <WiCloudy className="w-10 h-10 text-gray-600" />;
    }
    if (clouds > 40 || conditions.includes('partly cloudy') || conditions.includes('cloudy')) {
      return <WiDayCloudy className="w-10 h-10 text-gray-600" />;
    }
    
    // Clear/Sunny
    return <WiDaySunny className="w-10 h-10 text-orange-500" />;
  };

  return (
    <div className="h-[60px] flex items-center justify-center">
      {getDetailedWeatherIcon()}
    </div>
  );
};

export default WeatherIcon;
