import React, { useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

function ErrorNotification() {
  const { error, clearError } = useApp();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (!error) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-white border border-error-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-error-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-error-800">Error</p>
            <p className="text-sm text-error-600 mt-1 break-words">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="p-1 hover:bg-error-100 rounded transition-colors"
          >
            <X className="h-4 w-4 text-error-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorNotification; 