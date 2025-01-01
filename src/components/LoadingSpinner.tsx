import React from 'react';

const LoadingSpinner = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-muted-foreground animate-pulse">{message}</p>
    </div>
  );
};

export default LoadingSpinner;