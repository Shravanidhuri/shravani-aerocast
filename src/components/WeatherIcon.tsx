import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog, Moon, CloudSun } from 'lucide-react';

interface WeatherIconProps {
  condition: string;
  icon?: string;
  size?: number;
  className?: string;
}

export const WeatherIcon = ({ condition, icon, size = 64, className = '' }: WeatherIconProps) => {
  const isNight = icon?.includes('n');
  const iconProps = { size, className: `${className} drop-shadow-lg` };

  const getIcon = () => {
    const conditionLower = condition.toLowerCase();

    if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
      return <CloudLightning {...iconProps} className={`${iconProps.className} text-weather-stormy`} />;
    }
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return <CloudRain {...iconProps} className={`${iconProps.className} text-weather-rainy`} />;
    }
    if (conditionLower.includes('snow')) {
      return <CloudSnow {...iconProps} className={`${iconProps.className} text-weather-snowy`} />;
    }
    if (conditionLower.includes('mist') || conditionLower.includes('fog') || conditionLower.includes('haze')) {
      return <CloudFog {...iconProps} className={`${iconProps.className} text-weather-cloudy`} />;
    }
    if (conditionLower.includes('cloud')) {
      if (conditionLower.includes('few') || conditionLower.includes('scattered')) {
        return <CloudSun {...iconProps} className={`${iconProps.className} text-weather-cloudy`} />;
      }
      return <Cloud {...iconProps} className={`${iconProps.className} text-weather-cloudy`} />;
    }
    if (conditionLower.includes('clear')) {
      if (isNight) {
        return <Moon {...iconProps} className={`${iconProps.className} text-primary`} />;
      }
      return <Sun {...iconProps} className={`${iconProps.className} text-weather-sunny`} />;
    }

    return <Sun {...iconProps} className={`${iconProps.className} text-weather-sunny`} />;
  };

  return (
    <div className="animate-float">
      {getIcon()}
    </div>
  );
};
