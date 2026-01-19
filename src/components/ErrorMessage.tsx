import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
  return (
    <div className="glass-card rounded-3xl p-8 text-center animate-fade-in">
      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
      <h3 className="text-lg font-semibold text-foreground mb-2">Oops! Something went wrong</h3>
      <p className="text-foreground/70 mb-6">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="glass-card border-white/20 hover:bg-white/20"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
};
