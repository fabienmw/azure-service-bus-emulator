import React from 'react';
import { Loader2 } from 'lucide-react';

function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg p-6 shadow-xl flex items-center space-x-3">
        <Loader2 className="h-6 w-6 text-primary-600 animate-spin" />
        <span className="text-secondary-700 font-medium">Loading...</span>
      </div>
    </div>
  );
}

export default LoadingOverlay; 