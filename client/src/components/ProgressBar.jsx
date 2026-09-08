import React from 'react';

const ProgressBar = ({ value = 0, max = 100, color = 'bg-emerald-500', size = 'md', showLabel = false, className = '' }) => {
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500 dark:text-gray-400">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div 
          className={`${sizeClasses[size]} ${color} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
