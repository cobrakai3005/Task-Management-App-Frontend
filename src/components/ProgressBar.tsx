import React from 'react';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="flex items-center space-x-3 w-full">
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-primary h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-10 text-right">{progress}%</span>
    </div>
  );
};

export default ProgressBar;
