import { useState, useCallback } from 'react';
import { WeatherData, AQIData, WeatherCondition } from '@/types/weather';
import { fetchWeatherData, fetchAQIData, getCurrentLocation, getCityFromCoords } from '@/utils/weatherApi';

interface UseWeatherReturn {
  weatherData: WeatherData | null;
  aqiData: AQIData | null;
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

  const searchCity = useCallback(async (city: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const [weather, aqi] = await Promise.all([
        fetchWeatherData(city),
        fetchAQIData(city),
      ]);

      setWeatherData(weather);
      setAqiData(aqi);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      setWeatherData(null);
      setAqiData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const detectLocation = useCallback(async () => {
    setIsLocating(true);
    setError(null);

    try {
      const coords = await getCurrentLocation();
      const city = await getCityFromCoords(coords);
      await searchCity(city);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to detect location');
    } finally {
      setIsLocating(false);
    }
  }, [searchCity]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    weatherData,
    aqiData,
    isLoading,
    isLocating,
    error,
    weatherCondition,
    searchCity,
    detectLocation,
    clearError,
  };
};
