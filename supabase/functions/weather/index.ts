import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

// Map WMO weather codes to conditions
function getWeatherCondition(code: number): { condition: string; description: string; icon: string } {
  const weatherCodes: Record<number, { condition: string; description: string; icon: string }> = {
    0: { condition: 'Clear', description: 'clear sky', icon: '01d' },
    1: { condition: 'Clear', description: 'mainly clear', icon: '01d' },
    2: { condition: 'Clouds', description: 'partly cloudy', icon: '02d' },
    3: { condition: 'Clouds', description: 'overcast', icon: '04d' },
    45: { condition: 'Fog', description: 'fog', icon: '50d' },
    48: { condition: 'Fog', description: 'depositing rime fog', icon: '50d' },
    51: { condition: 'Drizzle', description: 'light drizzle', icon: '09d' },
    53: { condition: 'Drizzle', description: 'moderate drizzle', icon: '09d' },
    55: { condition: 'Drizzle', description: 'dense drizzle', icon: '09d' },
    56: { condition: 'Drizzle', description: 'light freezing drizzle', icon: '09d' },
    57: { condition: 'Drizzle', description: 'dense freezing drizzle', icon: '09d' },
    61: { condition: 'Rain', description: 'slight rain', icon: '10d' },
    63: { condition: 'Rain', description: 'moderate rain', icon: '10d' },
    65: { condition: 'Rain', description: 'heavy rain', icon: '10d' },
    66: { condition: 'Rain', description: 'light freezing rain', icon: '13d' },
    67: { condition: 'Rain', description: 'heavy freezing rain', icon: '13d' },
    71: { condition: 'Snow', description: 'slight snow fall', icon: '13d' },
    73: { condition: 'Snow', description: 'moderate snow fall', icon: '13d' },
    75: { condition: 'Snow', description: 'heavy snow fall', icon: '13d' },
    77: { condition: 'Snow', description: 'snow grains', icon: '13d' },
    80: { condition: 'Rain', description: 'slight rain showers', icon: '09d' },
    81: { condition: 'Rain', description: 'moderate rain showers', icon: '09d' },
    82: { condition: 'Rain', description: 'violent rain showers', icon: '09d' },
    85: { condition: 'Snow', description: 'slight snow showers', icon: '13d' },
    86: { condition: 'Snow', description: 'heavy snow showers', icon: '13d' },
    95: { condition: 'Thunderstorm', description: 'thunderstorm', icon: '11d' },
    96: { condition: 'Thunderstorm', description: 'thunderstorm with slight hail', icon: '11d' },
    99: { condition: 'Thunderstorm', description: 'thunderstorm with heavy hail', icon: '11d' },
  };
  
  return weatherCodes[code] || { condition: 'Unknown', description: 'unknown', icon: '01d' };
}

// Calculate AQI from pollutant concentrations using US EPA breakpoints
function calculateAQI(pm25: number, pm10: number, o3: number, no2: number, so2: number, co: number): { aqi: number; category: string } {
  // Simplified AQI calculation based on PM2.5 (primary indicator)
  // Using US EPA breakpoints for PM2.5 (24-hour average converted to 1-5 scale)
  let aqiValue: number;
  
  if (pm25 <= 12) {
    aqiValue = 1; // Good
  } else if (pm25 <= 35.4) {
    aqiValue = 2; // Fair
  } else if (pm25 <= 55.4) {
    aqiValue = 3; // Moderate
  } else if (pm25 <= 150.4) {
    aqiValue = 4; // Poor
  } else {
    aqiValue = 5; // Very Poor
  }
  
  const categories: Record<number, string> = {
    1: 'Good',
    2: 'Fair',
    3: 'Moderate',
    4: 'Poor',
    5: 'Very Poor',
  };
  
  return { aqi: aqiValue, category: categories[aqiValue] };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city, lat, lon } = await req.json();
    console.log(`Weather request received - city: ${city}, lat: ${lat}, lon: ${lon}`);

    let coords: { lat: number; lon: number; name: string; country: string };

    // If lat/lon provided, use them directly (for geolocation)
    if (lat !== undefined && lon !== undefined) {
      console.log(`Using provided coordinates: ${lat}, ${lon}`);
      
      // Reverse geocode to get city name using Open-Meteo geocoding
      const reverseGeoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=&latitude=${lat}&longitude=${lon}&count=1&language=en&format=json`;
      
      // Use Nominatim for reverse geocoding (Open-Meteo doesn't support reverse geocoding directly)
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`;
      console.log('Fetching reverse geocode data from Nominatim...');
      
      const reverseGeoResponse = await fetch(nominatimUrl, {
        headers: { 'User-Agent': 'AeroCast Weather App' }
      });
      
      if (!reverseGeoResponse.ok) {
        console.error('Reverse geocode error:', reverseGeoResponse.status);
        coords = { lat, lon, name: 'Unknown', country: '' };
      } else {
        const reverseGeoData = await reverseGeoResponse.json();
        const address = reverseGeoData.address || {};
        coords = {
          lat,
          lon,
          name: address.city || address.town || address.village || address.municipality || 'Unknown',
          country: address.country_code?.toUpperCase() || ''
        };
      }
    } else if (city) {
      // Geocode city name using Open-Meteo
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
      console.log(`Fetching geocode data for city: ${city}`);
      
      const geoResponse = await fetch(geoUrl);
      if (!geoResponse.ok) {
        console.error('Geocode API error:', geoResponse.status);
        throw new Error('Failed to fetch location data');
      }

      const geoData = await geoResponse.json();
      console.log('Geocode response:', JSON.stringify(geoData));

      if (!geoData.results || geoData.results.length === 0) {
        console.error('City not found:', city);
        return new Response(
          JSON.stringify({ error: `City "${city}" not found. Please check the spelling and try again.` }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const result = geoData.results[0];
      coords = {
        lat: result.latitude,
        lon: result.longitude,
        name: result.name,
        country: result.country_code || result.country || ''
      };
    } else {
      return new Response(
        JSON.stringify({ error: 'Please provide a city name or coordinates.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Coordinates resolved: ${coords.lat}, ${coords.lon} - ${coords.name}, ${coords.country}`);

    // Fetch weather and AQI data in parallel from Open-Meteo
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coords.lat}&longitude=${coords.lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`;

    console.log('Fetching weather and AQI data from Open-Meteo...');
    
    const [weatherResponse, aqiResponse] = await Promise.all([
      fetch(weatherUrl),
      fetch(aqiUrl)
    ]);

    if (!weatherResponse.ok) {
      console.error('Weather API error:', weatherResponse.status);
      throw new Error('Failed to fetch weather data');
    }

    const weatherData = await weatherResponse.json();
    console.log('Weather data received:', JSON.stringify(weatherData.current));

    // Parse weather data
    const current = weatherData.current;
    const weatherCondition = getWeatherCondition(current.weather_code);

    // Parse AQI data (may not always be available)
    let aqiResult: AQIData;
    if (aqiResponse.ok) {
      const aqiData = await aqiResponse.json();
      console.log('AQI data received:', JSON.stringify(aqiData.current));
      
      const aqiCurrent = aqiData.current;
      const pm25 = aqiCurrent.pm2_5 || 0;
      const pm10 = aqiCurrent.pm10 || 0;
      const o3 = aqiCurrent.ozone || 0;
      const no2 = aqiCurrent.nitrogen_dioxide || 0;
      const so2 = aqiCurrent.sulphur_dioxide || 0;
      const co = aqiCurrent.carbon_monoxide || 0;
      
      const { aqi, category } = calculateAQI(pm25, pm10, o3, no2, so2, co);
      
      aqiResult = {
        aqi,
        category,
        pm25: Math.round(pm25 * 10) / 10,
        pm10: Math.round(pm10 * 10) / 10,
        co: Math.round(co * 10) / 10,
        no2: Math.round(no2 * 10) / 10,
        o3: Math.round(o3 * 10) / 10,
        so2: Math.round(so2 * 10) / 10,
      };
    } else {
      console.log('AQI data not available, using defaults');
      aqiResult = {
        aqi: 1,
        category: 'Good',
        pm25: 0,
        pm10: 0,
        co: 0,
        no2: 0,
        o3: 0,
        so2: 0,
      };
    }

    const timestamp = Math.floor(new Date(current.time).getTime() / 1000);

    const response: WeatherResponse = {
      weather: {
        city: coords.name,
        country: coords.country,
        temperature: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m), // Already in km/h
        condition: weatherCondition.condition,
        description: weatherCondition.description,
        icon: weatherCondition.icon,
        timestamp,
      },
      aqi: aqiResult,
      lastUpdated: new Date(current.time).toISOString(),
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
