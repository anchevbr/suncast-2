import React from "react";
import { Card } from "./components/ui/card";
import { Sun } from "lucide-react";
import { motion } from "framer-motion";
import WeatherIcon from "./components/weather/WeatherIcon";
import { getScoreColors } from "./utils/colorPalette";

const DayCard = ({ day, index }) => {
  const scoreColors = getScoreColors(day.sunset_score);

  return (
    <motion.div
      initial={{ x: 50, scale: 0.9, opacity: 0 }}
      animate={{ x: 0, scale: 1, opacity: 1 }}
      transition={{
        delay: index * 0.1,
        duration: 0.6,
        ease: "easeOut"
      }}
      whileHover={{
        y: -8,
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      role="listitem"
      className="relative w-32 md:w-36"
    >
      {/* Fixed blur background that doesn't animate */}
      <div 
        className="absolute inset-0 backdrop-blur-md rounded-2xl"
        style={{ backdropFilter: "blur(8px)" }}
      />
      <Card className="relative bg-white/50 border-0 shadow-lg hover:shadow-xl transition-shadow rounded-2xl overflow-hidden">
        <div className="p-3 flex flex-col items-center space-y-2">
          {/* Date Header - More Compact */}
          <div className="text-center pb-1 border-b border-gray-200 h-[40px] flex flex-col justify-center">
            <p className="text-gray-700 text-xs font-semibold uppercase tracking-wide">
              {day.day_of_week}
            </p>
            <p className="text-gray-900 text-xs font-semibold mt-1">
              {day.date}
            </p>
          </div>

          {/* Score Circle - More Compact */}
          <div className="flex flex-col items-center justify-center py-1 h-[80px]">
            <div className={`w-12 h-12 rounded-full ${scoreColors.bg} flex items-center justify-center shadow-md`}>
              <span 
                className={`text-lg font-bold ${scoreColors.text}`}
                aria-label={`Sunset quality score: ${day.sunset_score} out of 100`}
              >
                {day.sunset_score}
              </span>
            </div>
            <p className="text-xs font-semibold text-white text-center mt-1">
              {scoreColors.label}
            </p>
          </div>

          {/* Weather Icon - More Compact */}
          <div className="h-[40px] flex items-center justify-center">
            <WeatherIcon day={day} />
          </div>

          {/* Sunset Time */}
          <div className="flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 w-3/4 mx-auto">
            <Sun className="w-3 h-3 text-white flex-shrink-0" aria-hidden="true" />
            <span className="text-white text-xs font-semibold uppercase tracking-wide">
              {day.sunset_time}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default DayCard;