import { WeatherData, AQIData, LocationCoords } from '@/types/weather';

const API_KEY = 'demo'; // Will be replaced with actual API key

// Demo data for when API key is not configured
const getDemoWeatherData = (city: string): WeatherData => ({
  city: city,
  country: 'Demo',
  temperature: 22,
  feelsLike: 24,
  humidity: 65,
  windSpeed: 12,
  condition: 'Clear',
  description: 'Clear sky',
  icon: '01d',
});

const getDemoAQIData = (): AQIData => ({
  aqi: 42,
  category: 'Good',
  pm25: 12,
  pm10: 25,
});

// Fetch coordinates for a city
export const getCoordinates = async (city: string): Promise<LocationCoords> => {
  if (API_KEY === 'demo') {
    return { lat: 40.7128, lon: -74.0060 };
  }

  const response = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch location data');
  }

  const data = await response.json();

  if (data.length === 0) {
    throw new Error('City not found. Please check the spelling and try again.');
  }

  return { lat: data[0].lat, lon: data[0].lon };
};

// Fetch weather data
export const fetchWeatherData = async (city: string): Promise<WeatherData> => {
  if (API_KEY === 'demo') {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return getDemoWeatherData(city);
  }

  const coords = await getCoordinates(city);

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&units=metric&appid=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }

  const data = await response.json();

  return {
    city: data.name,
    country: data.sys.country,
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
    condition: data.weather[0].main,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
  };
};

// Fetch AQI data
export const fetchAQIData = async (city: string): Promise<AQIData> => {
  if (API_KEY === 'demo') {
    await new Promise(resolve => setTimeout(resolve, 600));
    return getDemoAQIData();
  }

  const coords = await getCoordinates(city);

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/air_pollution?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch AQI data');
  }

  const data = await response.json();
  const aqi = data.list[0].main.aqi;
  const components = data.list[0].components;

  // Map OpenWeatherMap AQI (1-5) to descriptive categories
  const aqiCategories: Record<number, 'Good' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe'> = {
    1: 'Good',
    2: 'Moderate',
    3: 'Poor',
    4: 'Very Poor',
    5: 'Severe',
  };

  // Convert to a more readable AQI scale (1-500)
  const aqiScale: Record<number, number> = {
    1: 25,
    2: 75,
    3: 125,
    4: 200,
    5: 350,
  };

  return {
    aqi: aqiScale[aqi] || 0,
    category: aqiCategories[aqi] || 'Good',
    pm25: Math.round(components.pm2_5),
    pm10: Math.round(components.pm10),
  };
};

// Get user's current location
export const getCurrentLocation = (): Promise<LocationCoords> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error('Unable to retrieve your location'));
      }
    );
  });
};

// Reverse geocoding to get city name from coordinates
export const getCityFromCoords = async (coords: LocationCoords): Promise<string> => {
  if (API_KEY === 'demo') {
    return 'New York';
  }

  const response = await fetch(
    `https://api.openweathermap.org/geo/1.0/reverse?lat=${coords.lat}&lon=${coords.lon}&limit=1&appid=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error('Failed to get city name');
  }

  const data = await response.json();
  return data[0]?.name || 'Unknown';
};
