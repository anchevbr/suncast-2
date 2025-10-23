# Suncast - Sunset Quality Forecasting

A beautiful, professional web application that predicts sunset quality using meteorological data and advanced scoring algorithms.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## Features

- **7-Day Sunset Forecasts** - Detailed predictions based on real-time weather data
- **Proprietary Scoring Algorithm** - 0-100 quality score based on 7+ meteorological factors
- **Historical Analysis** - Year-to-date sunset quality tracking
- **Location Autocomplete** - Smart location search powered by OpenStreetMap
- **Redis Caching** - Fast responses with intelligent cache management
- **Beautiful UI** - Smooth animations and responsive design
- **Real-time Air Quality** - US AQI integration for enhanced predictions

## Tech Stack

### Frontend
- **React 18.2** - Modern UI framework
- **Vite 4.5** - Lightning-fast build tool
- **Tailwind CSS 3.3** - Utility-first styling
- **Framer Motion 10.16** - Smooth animations
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - Runtime environment
- **Express 4.18** - Web framework
- **Redis 4.6** - Caching layer
- **ES Modules** - Modern JavaScript

### APIs
- **Open-Meteo Weather API** - Free weather forecasts
- **Open-Meteo Archive API** - Historical weather data
- **Open-Meteo Air Quality API** - US AQI data
- **Nominatim OpenStreetMap API** - Geocoding & location search

## Project Structure

```
suncast-2/
├── src/                          # React frontend
│   ├── components/               # React components
│   │   ├── ui/                   # Reusable UI components
│   │   ├── weather/              # Weather-specific components
│   │   └── sunset/               # Sunset visualization
│   ├── hooks/                    # Custom React hooks
│   │   └── useGeocoding.js       # Location search hook
│   ├── services/                 # API & data services
│   │   ├── apiService.js         # Backend API calls
│   │   ├── dataProcessingService.js  # Data transformation
│   │   ├── historicalService.js  # Historical data orchestration
│   │   ├── scoringService.js     # Re-export shared scoring
│   │   └── storageService.js     # Local storage management
│   ├── utils/                    # Utility functions
│   │   ├── colorPalette.js       # Color configurations
│   │   └── weatherCalculations.js # Re-export shared scoring
│   ├── App.jsx                   # App wrapper
│   ├── Home.jsx                  # Landing page
│   ├── SunsetForecast.jsx        # Forecast display
│   └── DayCard.jsx               # Individual day card
├── backend/                      # Express backend
│   ├── server.js                 # API server with Redis caching
│   ├── scoringService.js         # Re-export shared scoring
│   └── env.example               # Environment variables template
├── shared/                       # Shared code (frontend + backend)
│   ├── scoringService.js         # ⭐ Sunset quality scoring logic
│   └── constants.js              # ⭐ Application constants
├── .env.example                  # Frontend environment template
├── vite.config.js                # Vite configuration
├── tailwind.config.js            # Tailwind configuration
└── package.json                  # Frontend dependencies
```

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **Redis** (for caching)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd suncast-2
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Set up environment variables**

   **Frontend (.env.local)**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:
   ```env
   VITE_API_URL=http://localhost:3001
   VITE_NOMINATIM_EMAIL=your-email@example.com
   ```

   **Backend (backend/.env)**
   ```bash
   cd backend
   cp env.example .env
   ```

   Edit `backend/.env`:
   ```env
   PORT=3001
   NODE_ENV=development
   REDIS_URL=redis://localhost:6379
   ```

5. **Start Redis** (if not already running)
   ```bash
   # macOS (with Homebrew)
   brew services start redis

   # Linux
   sudo systemctl start redis

   # Docker
   docker run -d -p 6379:6379 redis:latest
   ```

6. **Start the development servers**

   **Terminal 1 - Backend**
   ```bash
   cd backend
   npm run dev
   ```

   **Terminal 2 - Frontend**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   ```
   http://localhost:5173
   ```

## Environment Variables

### Frontend Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3001` |
| `VITE_NOMINATIM_EMAIL` | Email for Nominatim API compliance | `suncast-app@example.com` |

### Backend Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |

## API Endpoints

### GET `/api/forecast/:lat/:lon`
Get 7-day sunset forecast for coordinates.

**Response:**
```json
{
  "location": "Location Name",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "days": [...],
  "cached": false,
  "lastUpdated": "2025-01-01T12:00:00Z"
}
```

### GET `/api/historical/:lat/:lon/:year`
Get historical sunset data for a location and year.

### DELETE `/api/cache/forecast/:lat/:lon`
Clear cache for specific location forecast.

### DELETE `/api/cache/all`
Clear all cache entries.

### GET `/api/cache/stats`
Get cache statistics.

## Sunset Scoring Algorithm

Our proprietary algorithm calculates sunset quality based on:

1. **Cloud Type & Height (30%)** - High clouds (6-12km) are ideal
2. **Cloud Coverage (20%)** - Optimal range: 25-40%
3. **Precipitation (15%)** - Rain significantly reduces quality
4. **Air Quality (12%)** - Cleaner air = better sunsets
5. **Humidity (8%)** - Lower humidity enhances colors
6. **Visibility (8%)** - Good visibility is crucial
7. **Wind Speed (7%)** - Light wind helps cloud formations

**Score Ranges:**
- 0-39: Poor
- 40-59: Fair
- 60-79: Good
- 80-89: Excellent
- 90-100: Spectacular

## Caching Strategy

- **Forecast Data**: 2-hour TTL (weather changes frequently)
- **Historical Data**: 24-hour TTL (static historical data)
- **Redis**: In-memory caching for fast responses
- **localStorage**: Frontend caching for historical data

## Development

### Available Scripts

**Frontend**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

**Backend**
```bash
npm run dev          # Start with nodemon (auto-reload)
npm start            # Start production server
```

### Code Quality

- **ES Modules** throughout the project
- **Shared constants** for maintainability
- **JSDoc** documentation on functions
- **Error handling** with try-catch blocks
- **Proper separation of concerns**

## Architecture Highlights

### Shared Code Pattern

The `shared/` directory contains code used by both frontend and backend:

- `scoringService.js` - Single source of truth for sunset scoring
- `constants.js` - Centralized configuration values

This ensures consistency and eliminates code duplication.

### Re-export Pattern

Frontend and backend have lightweight re-export files:
- `src/services/scoringService.js` → re-exports `shared/scoringService.js`
- `backend/scoringService.js` → re-exports `shared/scoringService.js`

This provides clean import paths while maintaining a single source of truth.

## Performance Optimizations

- **Redis caching** reduces API calls by 80%+
- **Debounced location search** (300ms) prevents excessive API requests
- **Optimized React rendering** with proper key props
- **Code splitting** with Vite
- **Lazy loading** of historical data

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- **Open-Meteo** for free weather APIs
- **OpenStreetMap** for geocoding services
- **SunsetWx** & **Sunsethue** for sunset quality research
- **Atmospheric science community** for meteorological insights

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing documentation
- Review API provider documentation

## Roadmap

- [ ] Add sunset photography tips based on conditions
- [ ] Implement user accounts and favorites
- [ ] Add push notifications for spectacular sunsets
- [ ] Integrate with weather station data
- [ ] Add sunset time-lapse generator
- [ ] Mobile app (React Native)

---

**Made with ☀️ by the Suncast Team**
