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
  const containerRef = useRef(null);

  // Prevent scrolling when forecast is shown
  useEffect(() => {
    if (forecast) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [forecast]);

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

      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTo({
            top: window.innerHeight,
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
                  top: window.innerHeight,
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
        top: 0,
        behavior: 'smooth'
      });
    }
    setTimeout(() => {
      setForecast(null);
    }, 800);
  };

  return (
    <div 
      ref={containerRef}
      className="relative h-screen overflow-y-auto overflow-x-hidden"
      style={{ 
        scrollBehavior: 'smooth',
        pointerEvents: forecast ? 'none' : 'auto'
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        
        /* Disable user scrolling when forecast is shown */
        body {
          overscroll-behavior: none;
        }
      `}</style>

      {/* Hero Section */}
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-500 to-orange-400 flex items-center justify-center relative overflow-hidden">
        <div className="p-6 md:p-8 z-10" style={{ pointerEvents: 'auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-xl text-center space-y-10"
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
          </motion.div>
        </div>

        {/* Mountain silhouettes - same as forecast page */}
        <div className="absolute bottom-0 left-0 right-0 h-48 sm:h-64 md:h-80 lg:h-96 pointer-events-none">
            {/* Back mountain layer */}
            <div 
                className="absolute bottom-0 left-0 right-0 h-full w-full"
                style={{
                    background: 'linear-gradient(to top, #1a2332 0%, #2d1b69 50%, transparent 100%)',
                    clipPath: 'polygon(0 100%, 0 70%, 10% 80%, 20% 60%, 35% 85%, 50% 70%, 65% 90%, 80% 75%, 90% 90%, 100% 70%, 100% 100%)'
                }}
            ></div>
            
            {/* Middle mountain layer */}
            <div 
                className="absolute bottom-0 left-0 right-0 h-full w-full"
                style={{
                    background: 'linear-gradient(to top, #0d1419 0%, #1a0d3a 50%, transparent 100%)',
                    clipPath: 'polygon(0 100%, 0 85%, 15% 95%, 30% 75%, 45% 90%, 60% 80%, 75% 95%, 90% 80%, 100% 85%, 100% 100%)'
                }}
            ></div>
            
            {/* Front mountain layer */}
            <div 
                className="absolute bottom-0 left-0 right-0 h-full w-full"
                style={{
                    background: 'linear-gradient(to top, #050a0d 0%, #0f0a1a 50%, transparent 100%)',
                    clipPath: 'polygon(0 100%, 0 90%, 12% 98%, 25% 88%, 40% 95%, 55% 85%, 70% 92%, 85% 87%, 100% 90%, 100% 100%)'
                }}
            ></div>
        </div>
      </div>

      {/* Results Section */}
      <AnimatePresence>
        {forecast && (
          <div className="min-h-screen" style={{ pointerEvents: 'auto' }}>
            <SunsetForecast 
              forecast={forecast} 
              onBack={handleBackToSearch} 
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;