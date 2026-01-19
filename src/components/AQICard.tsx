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
        return 'Air quality is satisfactory, and air pollution poses little or no risk.';
      case 'Moderate':
        return 'Air quality is acceptable. Some pollutants may pose a moderate health concern.';
      case 'Poor':
        return 'Members of sensitive groups may experience health effects.';
      case 'Very Poor':
        return 'Health alert: The risk of health effects is increased for everyone.';
      case 'Severe':
        return 'Health warning of emergency conditions. Everyone is likely to be affected.';
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
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-4 text-center">
          <Gauge className="h-5 w-5 mx-auto mb-2 text-aqi-moderate" />
          <p className="text-xs text-foreground/60 mb-1">PM2.5</p>
          <p className="text-lg font-semibold text-foreground">{data.pm25} µg/m³</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <Gauge className="h-5 w-5 mx-auto mb-2 text-aqi-poor" />
          <p className="text-xs text-foreground/60 mb-1">PM10</p>
          <p className="text-lg font-semibold text-foreground">{data.pm10} µg/m³</p>
        </div>
      </div>
    </div>
  );
};
