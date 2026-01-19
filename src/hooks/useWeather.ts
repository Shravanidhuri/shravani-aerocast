import { useState, useCallback } from 'react';
import { WeatherData, AQIData, WeatherCondition, WeatherResponse } from '@/types/weather';
import { fetchWeatherByCity, fetchWeatherByCoords, getCurrentLocation } from '@/utils/weatherApi';

interface UseWeatherReturn {
  weatherData: WeatherData | null;
  aqiData: AQIData | null;
  lastUpdated: string | null;
  isLoading: boolean;
  isLocating: boolean;
  error: string | null;
  weatherCondition: WeatherCondition;
  searchCity: (city: string) => Promise<void>;
  detectLocation: () => Promise<void>;
  clearError: () => void;
}

export const useWeather = (): UseWeatherReturn => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [aqiData, setAqiData] = useState<AQIData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getWeatherCondition = (condition: string): WeatherCondition => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('clear') || conditionLower.includes('sun')) return 'sunny';
    if (conditionLower.includes('cloud')) return 'cloudy';
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) return 'rainy';
    if (conditionLower.includes('thunder') || conditionLower.includes('storm')) return 'stormy';
    if (conditionLower.includes('snow')) return 'snowy';
    return 'default';
  };

  const weatherCondition: WeatherCondition = weatherData
    ? getWeatherCondition(weatherData.condition)
    : 'default';

  const processResponse = (response: WeatherResponse) => {
    console.log('[useWeather] Processing response:', response.weather.city);
    setWeatherData(response.weather);
    setAqiData(response.aqi);
    setLastUpdated(response.lastUpdated);
  };

  const searchCity = useCallback(async (city: string) => {
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    console.log('[useWeather] Searching for city:', city);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchWeatherByCity(city);
      processResponse(response);
    } catch (err) {
      console.error('[useWeather] Search error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError(errorMessage);
      setWeatherData(null);
      setAqiData(null);
      setLastUpdated(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const detectLocation = useCallback(async () => {
    console.log('[useWeather] Detecting location...');
    setIsLocating(true);
    setError(null);

    try {
      const coords = await getCurrentLocation();
      setIsLoading(true);
      setIsLocating(false);
      
      const response = await fetchWeatherByCoords(coords);
      processResponse(response);
    } catch (err) {
      console.error('[useWeather] Location detection error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to detect location';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsLocating(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    weatherData,
    aqiData,
    lastUpdated,
    isLoading,
    isLocating,
    error,
    weatherCondition,
    searchCity,
    detectLocation,
    clearError,
  };
};
