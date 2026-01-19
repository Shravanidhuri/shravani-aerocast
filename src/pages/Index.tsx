import { useWeather } from '@/hooks/useWeather';
import { SearchInput } from '@/components/SearchInput';
import { WeatherCard } from '@/components/WeatherCard';
import { AQICard } from '@/components/AQICard';
import { LoadingCard } from '@/components/LoadingCard';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Cloud, Sun } from 'lucide-react';

const Index = () => {
  const {
    weatherData,
    aqiData,
    isLoading,
    isLocating,
    error,
    weatherCondition,
    searchCity,
    detectLocation,
  } = useWeather();

  const getBackgroundGradient = () => {
    switch (weatherCondition) {
      case 'sunny':
        return 'from-amber-400 via-orange-400 to-rose-400';
      case 'cloudy':
        return 'from-slate-400 via-gray-400 to-slate-500';
      case 'rainy':
        return 'from-blue-500 via-indigo-500 to-purple-600';
      case 'stormy':
        return 'from-gray-700 via-slate-700 to-gray-800';
      case 'snowy':
        return 'from-blue-200 via-slate-200 to-gray-300';
      default:
        return 'from-blue-500 via-indigo-500 to-purple-600';
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${getBackgroundGradient()} transition-all duration-1000 ease-in-out`}
    >
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 opacity-20">
          <Cloud className="w-32 h-32 text-white animate-float" style={{ animationDelay: '0s' }} />
        </div>
        <div className="absolute top-40 right-20 opacity-15">
          <Sun className="w-24 h-24 text-white animate-float" style={{ animationDelay: '1s' }} />
        </div>
        <div className="absolute bottom-40 left-1/4 opacity-10">
          <Cloud className="w-48 h-48 text-white animate-float" style={{ animationDelay: '2s' }} />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Cloud className="w-10 h-10 text-white drop-shadow-lg" />
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              Weather & AQI
            </h1>
          </div>
          <p className="text-white/80 text-lg max-w-md mx-auto">
            Check real-time weather conditions and air quality for any city worldwide
          </p>
        </header>

        {/* Search */}
        <div className="mb-12">
          <SearchInput
            onSearch={searchCity}
            onGetLocation={detectLocation}
            isLoading={isLoading}
            isLocating={isLocating}
          />
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {error && (
            <ErrorMessage
              message={error}
              onRetry={() => weatherData && searchCity(weatherData.city)}
            />
          )}

          {isLoading && !error && (
            <div className="grid md:grid-cols-2 gap-6">
              <LoadingCard />
              <LoadingCard />
            </div>
          )}

          {weatherData && aqiData && !isLoading && !error && (
            <div className="grid md:grid-cols-2 gap-6">
              <WeatherCard data={weatherData} />
              <AQICard data={aqiData} />
            </div>
          )}

          {!weatherData && !isLoading && !error && (
            <div className="glass-card rounded-3xl p-12 text-center animate-fade-in">
              <Cloud className="w-20 h-20 mx-auto mb-6 text-white/60" />
              <h2 className="text-2xl font-semibold text-white mb-3">
                Welcome to Weather & AQI
              </h2>
              <p className="text-white/70 max-w-md mx-auto">
                Enter a city name above or click the location button to get started with weather and air quality information.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-white/50 text-sm">
          <p>
            Powered by OpenWeatherMap API • Built with React & Tailwind CSS
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
