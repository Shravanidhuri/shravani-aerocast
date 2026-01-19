import { AQIData } from '@/types/weather';
import { AQIBadge } from './AQIBadge';
import { Wind, Gauge } from 'lucide-react';

interface AQICardProps {
  data: AQIData;
}

export const AQICard = ({ data }: AQICardProps) => {
  const getAQIDescription = (category: string) => {
    switch (category) {
      case 'Good':
        return 'Air quality is excellent. Ideal for outdoor activities.';
      case 'Fair':
        return 'Air quality is acceptable. Sensitive individuals should limit prolonged outdoor exertion.';
      case 'Moderate':
        return 'Air quality is moderately polluted. Reduce outdoor activities if you experience symptoms.';
      case 'Poor':
        return 'Health alert: Everyone may experience health effects. Avoid prolonged outdoor exertion.';
      case 'Very Poor':
        return 'Health warning: Emergency conditions. Everyone should avoid outdoor activities.';
      default:
        return 'Air quality data is being processed.';
    }
  };

  return (
    <div className="glass-card rounded-3xl p-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Wind className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Air Quality Index</h2>
      </div>

      {/* AQI Badge */}
      <div className="flex justify-center mb-6">
        <AQIBadge category={data.category} aqi={data.aqi} size="lg" />
      </div>

      {/* Description */}
      <p className="text-center text-foreground/70 mb-8 text-sm leading-relaxed">
        {getAQIDescription(data.category)}
      </p>

      {/* Pollutant details */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-2xl p-3 text-center">
          <Gauge className="h-4 w-4 mx-auto mb-1 text-aqi-moderate" />
          <p className="text-xs text-foreground/60">PM2.5</p>
          <p className="text-sm font-semibold text-foreground">{data.pm25} µg/m³</p>
        </div>
        <div className="glass-card rounded-2xl p-3 text-center">
          <Gauge className="h-4 w-4 mx-auto mb-1 text-aqi-poor" />
          <p className="text-xs text-foreground/60">PM10</p>
          <p className="text-sm font-semibold text-foreground">{data.pm10} µg/m³</p>
        </div>
        <div className="glass-card rounded-2xl p-3 text-center">
          <Gauge className="h-4 w-4 mx-auto mb-1 text-weather-cloudy" />
          <p className="text-xs text-foreground/60">CO</p>
          <p className="text-sm font-semibold text-foreground">{data.co} µg/m³</p>
        </div>
        <div className="glass-card rounded-2xl p-3 text-center">
          <Gauge className="h-4 w-4 mx-auto mb-1 text-weather-rainy" />
          <p className="text-xs text-foreground/60">O₃</p>
          <p className="text-sm font-semibold text-foreground">{data.o3} µg/m³</p>
        </div>
      </div>
    </div>
  );
};
