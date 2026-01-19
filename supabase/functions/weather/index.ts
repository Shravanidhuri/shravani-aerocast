import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeoLocation {
  lat: number;
  lon: number;
  name: string;
  country: string;
}

interface WeatherResponse {
  weather: WeatherData;
  aqi: AQIData;
  lastUpdated: string;
}

interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  description: string;
  icon: string;
  timestamp: number;
}

interface AQIData {
  aqi: number;
  category: string;
  pm25: number;
  pm10: number;
  co: number;
  no2: number;
  o3: number;
  so2: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const API_KEY = Deno.env.get('OPENWEATHERMAP_API_KEY');
    
    if (!API_KEY) {
      console.error('OPENWEATHERMAP_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'API key is not configured. Please add your OpenWeatherMap API key.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { city, lat, lon } = await req.json();
    console.log(`Weather request received - city: ${city}, lat: ${lat}, lon: ${lon}`);

    let coords: { lat: number; lon: number; name?: string; country?: string };

    // If lat/lon provided, use them directly (for geolocation)
    if (lat !== undefined && lon !== undefined) {
      console.log(`Using provided coordinates: ${lat}, ${lon}`);
      
      // Reverse geocode to get city name
      const reverseGeoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
      console.log('Fetching reverse geocode data...');
      
      const reverseGeoResponse = await fetch(reverseGeoUrl);
      if (!reverseGeoResponse.ok) {
        if (reverseGeoResponse.status === 401) {
          throw new Error('Invalid API key. Please check your OpenWeatherMap API key. Note: New API keys may take up to 2 hours to activate.');
        }
        throw new Error('Failed to get location name');
      }
      
      const reverseGeoData = await reverseGeoResponse.json();
      coords = {
        lat,
        lon,
        name: reverseGeoData[0]?.name || 'Unknown',
        country: reverseGeoData[0]?.country || ''
      };
    } else if (city) {
      // Geocode city name to coordinates
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;
      console.log(`Fetching geocode data for city: ${city}`);
      
      const geoResponse = await fetch(geoUrl);
      if (!geoResponse.ok) {
        console.error('Geocode API error:', geoResponse.status);
        if (geoResponse.status === 401) {
          throw new Error('Invalid API key. Please check your OpenWeatherMap API key. Note: New API keys may take up to 2 hours to activate.');
        }
        throw new Error('Failed to fetch location data');
      }

      const geoData: GeoLocation[] = await geoResponse.json();
      console.log('Geocode response:', JSON.stringify(geoData));

      if (!geoData || geoData.length === 0) {
        console.error('City not found:', city);
        return new Response(
          JSON.stringify({ error: `City "${city}" not found. Please check the spelling and try again.` }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      coords = {
        lat: geoData[0].lat,
        lon: geoData[0].lon,
        name: geoData[0].name,
        country: geoData[0].country
      };
    } else {
      return new Response(
        JSON.stringify({ error: 'Please provide a city name or coordinates.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Coordinates resolved: ${coords.lat}, ${coords.lon}`);

    // Fetch weather and AQI data in parallel
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&units=metric&appid=${API_KEY}`;
    const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}`;

    console.log('Fetching weather and AQI data...');
    
    const [weatherResponse, aqiResponse] = await Promise.all([
      fetch(weatherUrl),
      fetch(aqiUrl)
    ]);

    if (!weatherResponse.ok) {
      console.error('Weather API error:', weatherResponse.status);
      throw new Error('Failed to fetch weather data');
    }

    if (!aqiResponse.ok) {
      console.error('AQI API error:', aqiResponse.status);
      throw new Error('Failed to fetch air quality data');
    }

    const weatherData = await weatherResponse.json();
    const aqiData = await aqiResponse.json();

    console.log('Weather data received:', JSON.stringify(weatherData.main));
    console.log('AQI data received:', JSON.stringify(aqiData.list[0]));

    // Map OpenWeatherMap AQI (1-5) to descriptive categories
    const aqiValue = aqiData.list[0].main.aqi;
    const aqiCategories: Record<number, string> = {
      1: 'Good',
      2: 'Fair',
      3: 'Moderate',
      4: 'Poor',
      5: 'Very Poor',
    };

    const components = aqiData.list[0].components;

    const response: WeatherResponse = {
      weather: {
        city: coords.name || weatherData.name,
        country: coords.country || weatherData.sys.country,
        temperature: Math.round(weatherData.main.temp),
        feelsLike: Math.round(weatherData.main.feels_like),
        humidity: weatherData.main.humidity,
        windSpeed: Math.round(weatherData.wind.speed * 3.6), // Convert m/s to km/h
        condition: weatherData.weather[0].main,
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon,
        timestamp: weatherData.dt,
      },
      aqi: {
        aqi: aqiValue,
        category: aqiCategories[aqiValue] || 'Unknown',
        pm25: Math.round(components.pm2_5 * 10) / 10,
        pm10: Math.round(components.pm10 * 10) / 10,
        co: Math.round(components.co * 10) / 10,
        no2: Math.round(components.no2 * 10) / 10,
        o3: Math.round(components.o3 * 10) / 10,
        so2: Math.round(components.so2 * 10) / 10,
      },
      lastUpdated: new Date(weatherData.dt * 1000).toISOString(),
    };

    console.log('Sending response for:', response.weather.city);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in weather function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
