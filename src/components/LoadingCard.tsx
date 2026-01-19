export const LoadingCard = () => {
  return (
    <div className="glass-card rounded-3xl p-8 animate-pulse">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-4 w-4 bg-foreground/20 rounded-full" />
        <div className="h-4 w-32 bg-foreground/20 rounded" />
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-20 w-40 bg-foreground/20 rounded mb-2" />
          <div className="h-4 w-24 bg-foreground/20 rounded" />
        </div>
        <div className="h-20 w-20 bg-foreground/20 rounded-full" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card rounded-2xl p-4">
            <div className="h-5 w-5 bg-foreground/20 rounded mx-auto mb-2" />
            <div className="h-3 w-16 bg-foreground/20 rounded mx-auto mb-1" />
            <div className="h-5 w-12 bg-foreground/20 rounded mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
};
