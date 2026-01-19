import { WeatherData } from '@/types/weather';
import { WeatherIcon } from './WeatherIcon';
import { Thermometer, Droplets, Wind, MapPin } from 'lucide-react';

interface WeatherCardProps {
  data: WeatherData;
}

export const WeatherCard = ({ data }: WeatherCardProps) => {
  return (
    <div className="glass-card rounded-3xl p-8 animate-fade-in">
      {/* Location */}
      <div className="flex items-center gap-2 text-foreground/80 mb-6">
        <MapPin className="h-4 w-4" />
        <span className="text-lg font-medium">{data.city}, {data.country}</span>
      </div>

      {/* Main temperature display */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-7xl md:text-8xl font-light tracking-tight text-foreground">
            {data.temperature}°
          </div>
          <p className="text-lg text-foreground/70 capitalize mt-2">
            {data.description}
          </p>
        </div>
        <WeatherIcon condition={data.condition} icon={data.icon} size={80} />
      </div>

      {/* Weather details */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4 text-center">
          <Thermometer className="h-5 w-5 mx-auto mb-2 text-weather-sunny" />
          <p className="text-xs text-foreground/60 mb-1">Feels Like</p>
          <p className="text-lg font-semibold text-foreground">{data.feelsLike}°</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <Droplets className="h-5 w-5 mx-auto mb-2 text-weather-rainy" />
          <p className="text-xs text-foreground/60 mb-1">Humidity</p>
          <p className="text-lg font-semibold text-foreground">{data.humidity}%</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <Wind className="h-5 w-5 mx-auto mb-2 text-weather-cloudy" />
          <p className="text-xs text-foreground/60 mb-1">Wind</p>
          <p className="text-lg font-semibold text-foreground">{data.windSpeed} km/h</p>
        </div>
      </div>
    </div>
  );
};
