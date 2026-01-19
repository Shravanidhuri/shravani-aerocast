export interface WeatherData {
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

export interface AQIData {
  aqi: number;
  category: 'Good' | 'Fair' | 'Moderate' | 'Poor' | 'Very Poor';
  pm25: number;
  pm10: number;
  co: number;
  no2: number;
  o3: number;
  so2: number;
}

export interface WeatherResponse {
  weather: WeatherData;
  aqi: AQIData;
  lastUpdated: string;
}

export interface LocationCoords {
  lat: number;
  lon: number;
}

export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'default';
