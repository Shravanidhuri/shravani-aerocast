import { useState } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
  onSearch: (city: string) => void;
  onGetLocation: () => void;
  isLoading: boolean;
  isLocating: boolean;
}

export const SearchInput = ({ onSearch, onGetLocation, isLoading, isLocating }: SearchInputProps) => {
  const [city, setCity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="pl-10 h-12 glass-card border-white/20 bg-white/10 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50"
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !city.trim()}
          className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Search'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onGetLocation}
          disabled={isLocating || isLoading}
          className="h-12 px-4 glass-card border-white/20 hover:bg-white/20"
          title="Use my location"
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
        </Button>
      </div>
    </form>
  );
};
