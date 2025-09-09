
import React from 'react';

const LoadingSpinner: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-text-secondary">
      <div className="w-12 h-12 border-4 border-brand-green-light border-t-brand-green rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
