import { supabase } from '@/integrations/supabase/client';
import { WeatherResponse, LocationCoords } from '@/types/weather';

/**
 * Fetches real-time weather and AQI data from OpenWeatherMap API
 * via our secure backend function
 */
export const fetchWeatherByCity = async (city: string): Promise<WeatherResponse> => {
  console.log(`[WeatherAPI] Fetching weather data for city: ${city}`);
  
  const { data, error } = await supabase.functions.invoke('weather', {
    body: { city }
  });

  if (error) {
    console.error('[WeatherAPI] Supabase function error:', error);
    throw new Error(error.message || 'Failed to fetch weather data');
  }

  if (data.error) {
    console.error('[WeatherAPI] API error:', data.error);
    throw new Error(data.error);
  }

  console.log('[WeatherAPI] Weather data received:', data.weather?.city);
  return data as WeatherResponse;
};

/**
 * Fetches weather data using geographic coordinates
 */
export const fetchWeatherByCoords = async (coords: LocationCoords): Promise<WeatherResponse> => {
  console.log(`[WeatherAPI] Fetching weather data for coords: ${coords.lat}, ${coords.lon}`);
  
  const { data, error } = await supabase.functions.invoke('weather', {
    body: { lat: coords.lat, lon: coords.lon }
  });

  if (error) {
    console.error('[WeatherAPI] Supabase function error:', error);
    throw new Error(error.message || 'Failed to fetch weather data');
  }

  if (data.error) {
    console.error('[WeatherAPI] API error:', data.error);
    throw new Error(data.error);
  }

  console.log('[WeatherAPI] Weather data received:', data.weather?.city);
  return data as WeatherResponse;
};

/**
 * Gets the user's current geographic location
 */
export const getCurrentLocation = (): Promise<LocationCoords> => {
  console.log('[WeatherAPI] Requesting user geolocation...');
  
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      console.error('[WeatherAPI] Geolocation not supported');
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        console.log('[WeatherAPI] Geolocation obtained:', coords);
        resolve(coords);
      },
      (error) => {
        console.error('[WeatherAPI] Geolocation error:', error.message);
        reject(new Error('Unable to retrieve your location. Please allow location access or enter a city manually.'));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000 // Cache for 5 minutes
      }
    );
  });
};

/**
 * Formats a Unix timestamp to a readable local time string
 */
export const formatLastUpdated = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};
