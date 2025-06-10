import React, { useState } from 'react';
import { X, Cloud, AlertCircle, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

function ConnectionModal({ onClose }) {
  const [connectionString, setConnectionString] = useState('');
  const [connectionName, setConnectionName] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { createConnection } = useApp();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!connectionString.trim() || !connectionName.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsConnecting(true);
    setError('');
    
    try {
      await createConnection(connectionString.trim(), connectionName.trim());
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Cloud className="h-5 w-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-bold text-secondary-800">New Connection</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-secondary-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Connection Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Connection Name
            </label>
            <input
              type="text"
              value={connectionName}
              onChange={(e) => setConnectionName(e.target.value)}
              placeholder="e.g., Production Service Bus"
              className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              disabled={isConnecting}
            />
          </div>

          {/* Connection String */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Connection String
            </label>
            <textarea
              value={connectionString}
              onChange={(e) => setConnectionString(e.target.value)}
              placeholder="Endpoint=sb://your-namespace.servicebus.windows.net/;SharedAccessKeyName=..."
              rows={4}
              className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
              disabled={isConnecting}
            />
            <p className="text-xs text-secondary-500 mt-2">
              Get this from your Azure Service Bus namespace in the Azure portal
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-error-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-error-800">Connection Failed</p>
                <p className="text-sm text-error-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-success-500" />
              <p className="text-sm font-medium text-success-800">
                Connection established successfully!
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-secondary-600 hover:bg-secondary-100 rounded-lg transition-colors"
              disabled={isConnecting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isConnecting || success}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              {isConnecting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>{isConnecting ? 'Connecting...' : 'Connect'}</span>
            </button>
          </div>
        </form>

        {/* Help Section */}
        <div className="px-6 pb-6">
          <div className="bg-secondary-50 rounded-lg p-4">
            <h3 className="font-medium text-secondary-800 mb-2">Need help?</h3>
            <ul className="text-sm text-secondary-600 space-y-1">
              <li>• Find your connection string in Azure Portal → Service Bus → Shared access policies</li>
              <li>• Make sure the policy has the necessary permissions (Manage, Send, Listen)</li>
              <li>• Connection strings typically start with "Endpoint=sb://"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConnectionModal; 