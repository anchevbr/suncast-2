import React, { useState, useEffect } from "react";
import { Button } from "./components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import DayCard from "./DayCard";
import MinimalHistoricalSunsets from "./components/MinimalHistoricalSunsets";
import { fetchHistoricalForecastWithProgress } from "./services/historicalService.js";

const SunsetForecast = ({ forecast, onBack, scrollProgress }) => {
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
    <div className="relative w-full h-full overflow-y-auto overflow-x-hidden">
      {/* Back to Search Button */}
      <div className="absolute top-6 left-6 z-30">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Button
            onClick={onBack}
            className="bg-white/10 hover:bg-white/20 text-white font-thin transition-all border border-white/20 shadow-lg flex items-center space-x-2 text-sm px-4 py-2 rounded-lg backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back</span>
          </Button>
        </motion.div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center p-6 md:p-12">
        {/* Location Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h2 className="text-3xl md:text-5xl font-light text-white drop-shadow-2xl text-center">
            {forecast.location}
          </h2>
        </motion.div>

        {/* 7-Day Forecast Cards - Horizontal Layout */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-7xl mb-12"
        >
          <div
            className="flex gap-4 md:gap-6 justify-center flex-wrap px-4"
            role="list"
            aria-label="7-day sunset forecast"
          >
            {forecast.days.map((day, index) => (
              <div key={index} className="flex-shrink-0">
                <DayCard day={day} index={index} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Historical Sunsets Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-full max-w-7xl backdrop-blur-md bg-white/5 rounded-3xl p-6 md:p-8 shadow-2xl mb-8"
        >
          <MinimalHistoricalSunsets
            historicalData={historicalData}
            isLoading={isLoadingHistorical}
          />
        </motion.div>

        {/* Scoring System & Weather Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="w-full max-w-4xl mb-8"
        >
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 backdrop-blur-sm bg-white/5 rounded-2xl p-6">
            {/* Scoring System */}
            <div className="flex flex-col items-center">
              <h3 className="text-sm font-medium text-white/80 mb-4 text-center">Scoring System</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-4 rounded-full bg-gradient-to-r from-gray-500 via-amber-500 via-orange-500 via-pink-500 to-rose-500">
                  {/* Score markers */}
                  <div className="absolute left-1/4 top-0 w-px h-4 bg-white/50"></div>
                  <div className="absolute left-1/2 top-0 w-px h-4 bg-white/50"></div>
                  <div className="absolute left-3/4 top-0 w-px h-4 bg-white/50"></div>

                  {/* Score numbers */}
                  <div className="absolute -top-6 left-0 text-white/60 text-xs">0</div>
                  <div className="absolute -top-6 left-1/4 transform -translate-x-1/2 text-white/60 text-xs">25</div>
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-white/60 text-xs">50</div>
                  <div className="absolute -top-6 left-3/4 transform -translate-x-1/2 text-white/60 text-xs">75</div>
                  <div className="absolute -top-6 right-0 text-white/60 text-xs">100</div>
                </div>
              </div>
            </div>

            {/* Visual Separator */}
            <div className="hidden lg:block w-px h-16 bg-white/30"></div>

            {/* Weather Explanation */}
            <div className="flex flex-col items-center max-w-md">
              <h3 className="text-lg font-semibold text-white mb-2 text-center">How Weather Affects Sunset</h3>
              <p className="text-sm text-white/70 text-center leading-relaxed">
                Cloud coverage and height dramatically impact sunset quality, with high clouds creating beautiful light scattering effects.
                Our algorithm analyzes 7+ meteorological factors to predict spectacular sunset experiences.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Mountain silhouettes at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-48 sm:h-64 pointer-events-none">
          <div
            className="absolute bottom-0 left-0 right-0 h-full w-full opacity-40"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
              clipPath: 'polygon(0 100%, 0 70%, 10% 80%, 20% 60%, 35% 85%, 50% 70%, 65% 90%, 80% 75%, 90% 90%, 100% 70%, 100% 100%)'
            }}
          ></div>

          <div
            className="absolute bottom-0 left-0 right-0 h-full w-full opacity-60"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
              clipPath: 'polygon(0 100%, 0 85%, 15% 95%, 30% 75%, 45% 90%, 60% 80%, 75% 95%, 90% 80%, 100% 85%, 100% 100%)'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default SunsetForecast;
