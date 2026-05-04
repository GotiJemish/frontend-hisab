import React from 'react';

export const Loader = ({ fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <div className="absolute h-full w-full rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
        <div className="absolute h-full w-full animate-spin rounded-full border-4 border-blue-600 border-t-transparent dark:border-blue-500 dark:border-t-transparent"></div>
      </div>
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wider">Loading...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-[#0F172A]/80">
        {content}
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center p-8">
      {content}
    </div>
  );
};
