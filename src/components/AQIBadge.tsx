import { cn } from '@/lib/utils';

interface AQIBadgeProps {
  category: 'Good' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';
  aqi: number;
  size?: 'sm' | 'md' | 'lg';
}

export const AQIBadge = ({ category, aqi, size = 'md' }: AQIBadgeProps) => {
  const getAQIStyles = () => {
    switch (category) {
      case 'Good':
        return 'bg-aqi-good text-white';
      case 'Moderate':
        return 'bg-aqi-moderate text-foreground';
      case 'Poor':
        return 'bg-aqi-poor text-white';
      case 'Very Poor':
        return 'bg-aqi-very-poor text-white';
      case 'Severe':
        return 'bg-aqi-severe text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full font-semibold shadow-lg transition-all duration-300',
        getAQIStyles(),
        getSizeStyles()
      )}
    >
      <span className="font-bold">{aqi}</span>
      <span className="opacity-90">• {category}</span>
    </span>
  );
};
