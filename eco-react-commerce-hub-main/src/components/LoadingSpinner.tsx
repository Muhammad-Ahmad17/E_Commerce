
import React from 'react';

type LoadingSpinnerProps = {
  size?: 'small' | 'medium' | 'large';
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`loader ${sizeClasses[size]} border-4`} />
    </div>
  );
};

export default LoadingSpinner;
