import React, { useState, useRef, useEffect } from "react";
import { MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LocationAutocomplete from './components/LocationAutocomplete';
import { fetchForecastData } from './services/apiService';
import SunsetForecast from "./SunsetForecast";

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef(null);

  // Track horizontal scroll progress for gradient transition
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const scrollWidth = container.scrollWidth - container.clientWidth;
      const progress = scrollWidth > 0 ? scrollLeft / scrollWidth : 0;
      setScrollProgress(progress);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [forecast]);

  // Generate dynamic gradient based on scroll progress
  const getBackgroundGradient = () => {
    // Late evening blue (left) to sunset colors (right)
    const blue = { r: 30, g: 58, b: 138 };      // Deep blue
    const purple = { r: 91, g: 33, b: 182 };    // Deep purple
    const pink = { r: 219, g: 39, b: 119 };     // Hot pink
    const orange = { r: 249, g: 115, b: 22 };   // Orange

    let color1, color2, color3;

    if (scrollProgress < 0.33) {
      // Blue to Purple transition
      const localProgress = scrollProgress / 0.33;
      color1 = interpolateColor(blue, purple, localProgress);
      color2 = interpolateColor(purple, pink, localProgress * 0.5);
      color3 = interpolateColor(pink, orange, localProgress * 0.3);
    } else if (scrollProgress < 0.66) {
      // Purple to Pink transition
      const localProgress = (scrollProgress - 0.33) / 0.33;
      color1 = interpolateColor(purple, pink, localProgress);
      color2 = interpolateColor(pink, orange, localProgress);
      color3 = orange;
    } else {
      // Pink to Orange transition (full sunset)
      const localProgress = (scrollProgress - 0.66) / 0.34;
      color1 = interpolateColor(pink, orange, localProgress);
      color2 = orange;
      color3 = { r: 251, g: 146, b: 60 }; // Lighter orange
    }

    return `linear-gradient(to bottom,
      rgb(${color1.r}, ${color1.g}, ${color1.b}),
      rgb(${color2.r}, ${color2.g}, ${color2.b}),
      rgb(${color3.r}, ${color3.g}, ${color3.b}))`;
  };

  const interpolateColor = (color1, color2, progress) => {
    return {
      r: Math.round(color1.r + (color2.r - color1.r) * progress),
      g: Math.round(color1.g + (color2.g - color1.g) * progress),
      b: Math.round(color1.b + (color2.b - color1.b) * progress),
    };
  };

  /**
   * Handle location selection from autocomplete
   */
  const handleLocationSelect = async (locationData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use coordinates directly from the selected location
      const coords = {
        latitude: parseFloat(locationData.lat),
        longitude: parseFloat(locationData.lon),
        name: locationData.display_name.split(',')[0],
        country: locationData.address?.country || 'Unknown'
      };

      const locationName = `${coords.name}, ${coords.country}`;
      const forecastData = await fetchForecastData(`${coords.latitude}, ${coords.longitude}`, locationName);

      // Create new forecast object to ensure React detects the change
      const newForecast = {
        location: locationName,
        latitude: forecastData.latitude,
        longitude: forecastData.longitude,
        days: [...forecastData.days]
      };

      setForecast(newForecast);

      // Smooth scroll to forecast section (scroll right)
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTo({
            left: window.innerWidth,
            behavior: 'smooth'
          });
        }
      }, 300);
    } catch (error) {
      setError('Unable to fetch forecast data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // First, get the city name from coordinates using reverse geocoding
            const geocodingResponse = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18&email=${import.meta.env.VITE_NOMINATIM_EMAIL || 'suncast-app@example.com'}`
            );

            if (!geocodingResponse.ok) {
              throw new Error('Failed to get location name');
            }

            const locationData = await geocodingResponse.json();

            // Extract city name more reliably
            let cityName = 'Unknown Location';
            let countryName = '';

            if (locationData.address) {
              const addr = locationData.address;
              cityName = addr.city || addr.town || addr.village || addr.hamlet || addr.suburb || addr.county || 'Unknown';
              countryName = addr.country || '';
            } else if (locationData.display_name) {
              // Fallback to parsing display_name
              const parts = locationData.display_name.split(',');
              cityName = parts[0].trim();
              countryName = parts[parts.length - 1].trim();
            }

            const locationName = countryName ? `${cityName}, ${countryName}` : cityName;
            const forecastData = await fetchForecastData(`${latitude}, ${longitude}`, locationName);

            const newForecast = {
              location: locationName,
              latitude: forecastData.latitude,
              longitude: forecastData.longitude,
              days: [...forecastData.days]
            };

            setForecast(newForecast);

            setTimeout(() => {
              if (containerRef.current) {
                containerRef.current.scrollTo({
                  left: window.innerWidth,
                  behavior: 'smooth'
                });
              }
            }, 300);
          } catch (error) {
            setError('Unable to fetch forecast data. Please try again.');
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          setError("Unable to get your location. Please search manually.");
          setIsLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  const handleBackToSearch = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative h-screen flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth"
      style={{
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none', // IE and Edge
        background: getBackgroundGradient(),
        transition: 'background 0.5s ease-out'
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

        /* Hide scrollbar for Chrome, Safari and Opera */
        *::-webkit-scrollbar {
          display: none;
        }

        /* Prevent body scroll */
        body {
          overflow: hidden;
          overscroll-behavior: none;
        }
      `}</style>

      {/* Landing Page Section - Late Evening Blue */}
      <div
        className="min-w-full h-full flex items-center justify-center relative snap-start flex-shrink-0"
      >
        <div className="p-6 md:p-8 z-10 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full text-center space-y-10"
          >
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-4xl md:text-5xl font-light text-white tracking-wide">
                  Golden Hour
                </h1>
                <p className="text-sm text-white/80 font-normal max-w-md mx-auto leading-relaxed">
                  Will tonight's sunset be spectacular?
                </p>
              </div>
            </div>

            {/* Minimal Search Interface */}
            <div className="space-y-6">
              <LocationAutocomplete
                onLocationSelect={handleLocationSelect}
                placeholder="Enter location..."
              />

              <div className="flex items-center justify-center space-x-4 text-sm text-white/70">
                <button
                  onClick={handleGetCurrentLocation}
                  disabled={isLoading}
                  className="flex items-center space-x-2 hover:text-white transition-colors duration-200 disabled:opacity-50"
                  aria-label="Use current location"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Use current location</span>
                </button>
              </div>
            </div>

            {error && (
              <div
                id="error-message"
                role="alert"
                className="p-4 bg-red-100 border-2 border-red-400 rounded-xl text-red-800 text-sm"
              >
                {error}
              </div>
            )}

            {/* Scroll indicator */}
            {forecast && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-white/50 text-xs"
              >
                Scroll right to see your forecast →
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Mountain silhouettes for landing page - darker for blue theme */}
        <div className="absolute bottom-0 left-0 right-0 h-48 sm:h-64 md:h-80 lg:h-96 pointer-events-none">
          <div
            className="absolute bottom-0 left-0 right-0 h-full w-full"
            style={{
              background: 'linear-gradient(to top, #0f172a 0%, #1e293b 50%, transparent 100%)',
              clipPath: 'polygon(0 100%, 0 70%, 10% 80%, 20% 60%, 35% 85%, 50% 70%, 65% 90%, 80% 75%, 90% 90%, 100% 70%, 100% 100%)'
            }}
          ></div>

          <div
            className="absolute bottom-0 left-0 right-0 h-full w-full"
            style={{
              background: 'linear-gradient(to top, #020617 0%, #0f172a 50%, transparent 100%)',
              clipPath: 'polygon(0 100%, 0 85%, 15% 95%, 30% 75%, 45% 90%, 60% 80%, 75% 95%, 90% 80%, 100% 85%, 100% 100%)'
            }}
          ></div>
        </div>
      </div>

      {/* Forecast Section */}
      <AnimatePresence>
        {forecast && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-w-full h-full flex-shrink-0 snap-start relative"
          >
            <SunsetForecast
              forecast={forecast}
              onBack={handleBackToSearch}
              scrollProgress={scrollProgress}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
