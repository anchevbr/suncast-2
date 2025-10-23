import React, { useState, useEffect } from "react";
import { Button } from "./components/ui/button";
import { ArrowUp } from "lucide-react";
import { motion } from "framer-motion";
import SunsetBackground from "./components/sunset/SunsetBackground";
import DayCard from "./DayCard";
import MinimalHistoricalSunsets from "./components/MinimalHistoricalSunsets";
import { fetchHistoricalForecastWithProgress } from "./services/historicalService.js";

const SunsetForecast = ({ forecast, onBack }) => {
  const [historicalData, setHistoricalData] = useState(null);
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(true);

  // Auto-load historical data when component mounts
  useEffect(() => {
    const loadHistoricalData = async () => {
      try {
        const location = {
          latitude: forecast.latitude || 0,
          longitude: forecast.longitude || 0,
          name: forecast.location
        };

        const data = await fetchHistoricalForecastWithProgress(
          location,
          () => {} // Ignore progress updates
        );

        setHistoricalData(data);
        setIsLoadingHistorical(false);
      } catch (error) {
        console.error('Failed to load historical data:', error);
        setIsLoadingHistorical(false);
      }
    };

    loadHistoricalData();
  }, [forecast.location, forecast.latitude, forecast.longitude]);


  return (
    <div className="relative w-full min-h-screen">
      <style>{`
        /* Custom horizontal scrollbar styling */
        .horizontal-scroll::-webkit-scrollbar {
          height: 8px;
        }
        .horizontal-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .horizontal-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }
        .horizontal-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
      
      {/* Sunset Background Scene */}
      <SunsetBackground location={forecast.location} />

      <div className="relative z-20 flex flex-col items-center justify-start p-6 md:p-8 pt-8">
        {/* Back to Search - Outside blur container */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="mb-2"
        >
          <Button
            onClick={onBack}
            className="bg-transparent hover:bg-transparent text-white/70 hover:text-white/90 font-thin transition-all border-none shadow-none flex flex-col items-center space-y-1 text-sm p-0"
          >
            <ArrowUp className="w-3 h-3" aria-hidden="true" />
            <span>Back to Search</span>
          </Button>
        </motion.div>

        <div className="w-full max-w-7xl space-y-8 backdrop-blur-md bg-white/5 rounded-3xl p-8 shadow-2xl">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-white drop-shadow-lg">
              {forecast.location}
            </h2>
          </motion.div>

          {/* 7-Day Forecast - Horizontal Scroll */}
          <div 
            className="flex gap-4 overflow-x-auto pb-4 horizontal-scroll"
            role="list"
            aria-label="7-day sunset forecast"
          >
            {forecast.days.map((day, index) => (
              <div key={index} className="flex-shrink-0 w-48">
                <DayCard day={day} index={index} />
              </div>
            ))}
          </div>

          {/* Historical Sunsets - Fixed height to prevent layout shift */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="mt-0 min-h-[180px]"
          >
            <MinimalHistoricalSunsets
              historicalData={historicalData}
              isLoading={isLoadingHistorical}
            />
          </motion.div>

          {/* Scoring System & Weather Explanation - Now on bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.0 }}
            className="mt-16"
          >
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
              {/* Scoring System */}
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-medium text-white/80 mb-6 text-center">Scoring System</h3>
                        <div className="flex items-center justify-center">
                          <div className="relative w-32 h-3 rounded-full bg-gradient-to-r from-gray-500 via-amber-500 via-orange-500 via-pink-500 to-rose-500">
                            {/* Score markers - removed left and right edges */}
                            <div className="absolute left-1/4 top-0 w-px h-3 bg-white/50"></div>
                            <div className="absolute left-1/2 top-0 w-px h-3 bg-white/50"></div>
                            <div className="absolute left-3/4 top-0 w-px h-3 bg-white/50"></div>

                            {/* Score numbers */}
                            <div className="absolute -top-5 left-0 text-white/60 text-xs">0</div>
                            <div className="absolute -top-5 left-1/4 transform -translate-x-1/2 text-white/60 text-xs">25</div>
                            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-white/60 text-xs">50</div>
                            <div className="absolute -top-5 left-3/4 transform -translate-x-1/2 text-white/60 text-xs">75</div>
                            <div className="absolute -top-5 right-0 text-white/60 text-xs">100</div>
                          </div>
                        </div>
              </div>

              {/* Visual Separator */}
              <div className="hidden lg:block w-px h-16 bg-white/20"></div>

              {/* Weather Explanation */}
              <div className="flex flex-col items-center max-w-2xl">
                <h3 className="text-lg font-bold text-white mb-1 text-center">How Weather Affects Sunset</h3>
                <p className="text-xs text-white/70 text-center leading-relaxed">
                  Cloud coverage and height dramatically impact sunset quality, with high clouds creating beautiful light scattering effects.
                  Our algorithm analyzes 12+ weather factors to predict the perfect sunset experience.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SunsetForecast;