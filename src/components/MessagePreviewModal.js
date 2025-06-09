import React, { useState } from 'react';
import { X, Copy, Download, Code, Info } from 'lucide-react';


function MessagePreviewModal({ message, onClose }) {
  const [activeTab, setActiveTab] = useState('content');
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(message, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleDownload = () => {
    const dataStr = JSON.stringify(message, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `message-${message.messageId || 'unknown'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Code className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-secondary-800">Message Preview</h2>
              <p className="text-sm text-secondary-600">
                ID: {message.messageId || 'N/A'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyToClipboard}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                copied 
                  ? 'bg-success-100 text-success-700' 
                  : 'bg-secondary-100 hover:bg-secondary-200 text-secondary-700'
              }`}
            >
              <Copy className="h-4 w-4" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-3 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-secondary-600" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-secondary-200 px-6">
          <button
            onClick={() => setActiveTab('content')}
            className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'content'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-secondary-500 hover:text-secondary-700'
            }`}
          >
            Message Content
          </button>
          <button
            onClick={() => setActiveTab('properties')}
            className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'properties'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-secondary-500 hover:text-secondary-700'
            }`}
          >
            Properties
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'content' && (
            <div className="h-full p-6 overflow-y-auto scrollbar-thin">
              <div className="bg-secondary-50 rounded-lg p-4 h-full">
                {message.body ? (
                  <pre className="text-sm text-secondary-800 whitespace-pre-wrap overflow-auto max-h-96 p-4 bg-white rounded border">
                    {typeof message.body === 'string' 
                      ? message.body 
                      : JSON.stringify(message.body, null, 2)
                    }
                  </pre>
                ) : (
                  <div className="text-center text-secondary-500 py-8">
                    <Code className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No message content available</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'properties' && (
            <div className="h-full p-6 overflow-y-auto scrollbar-thin">
              <div className="space-y-6">
                {/* Basic Properties */}
                <div className="bg-white border border-secondary-200 rounded-lg p-4">
                  <h3 className="font-semibold text-secondary-800 mb-3 flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Basic Properties
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-600 mb-1">Message ID</label>
                      <div className="text-sm text-secondary-800 font-mono bg-secondary-50 p-2 rounded border">
                        {message.messageId || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-600 mb-1">Label</label>
                      <div className="text-sm text-secondary-800 bg-secondary-50 p-2 rounded border">
                        {message.label || 'No label'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-600 mb-1">Correlation ID</label>
                      <div className="text-sm text-secondary-800 font-mono bg-secondary-50 p-2 rounded border">
                        {message.correlationId || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-600 mb-1">Session ID</label>
                      <div className="text-sm text-secondary-800 bg-secondary-50 p-2 rounded border">
                        {message.sessionId || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-600 mb-1">Partition Key</label>
                      <div className="text-sm text-secondary-800 bg-secondary-50 p-2 rounded border">
                        {message.partitionKey || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-600 mb-1">Delivery Count</label>
                      <div className="text-sm text-secondary-800 bg-secondary-50 p-2 rounded border">
                        {message.deliveryCount || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timing Properties */}
                <div className="bg-white border border-secondary-200 rounded-lg p-4">
                  <h3 className="font-semibold text-secondary-800 mb-3">Timing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-600 mb-1">Enqueued Time</label>
                      <div className="text-sm text-secondary-800 bg-secondary-50 p-2 rounded border">
                        {message.enqueuedTimeUtc 
                          ? new Date(message.enqueuedTimeUtc).toLocaleString() 
                          : 'N/A'
                        }
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-600 mb-1">Expires At</label>
                      <div className="text-sm text-secondary-800 bg-secondary-50 p-2 rounded border">
                        {message.expiresAtUtc 
                          ? new Date(message.expiresAtUtc).toLocaleString() 
                          : 'N/A'
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Application Properties */}
                {message.applicationProperties && Object.keys(message.applicationProperties).length > 0 && (
                  <div className="bg-white border border-secondary-200 rounded-lg p-4">
                    <h3 className="font-semibold text-secondary-800 mb-3">Application Properties</h3>
                    <pre className="text-sm text-secondary-800 whitespace-pre-wrap overflow-auto max-h-48 p-3 bg-secondary-50 rounded border">
                      {JSON.stringify(message.applicationProperties, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Dead Letter Properties (if applicable) */}
                {(message.deadLetterReason || message.deadLetterErrorDescription) && (
                  <div className="bg-error-50 border border-error-200 rounded-lg p-4">
                    <h3 className="font-semibold text-error-800 mb-3">Dead Letter Information</h3>
                    <div className="space-y-3">
                      {message.deadLetterReason && (
                        <div>
                          <label className="block text-sm font-medium text-error-600 mb-1">Reason</label>
                          <div className="text-sm text-error-800 bg-white p-2 rounded border border-error-200">
                            {message.deadLetterReason}
                          </div>
                        </div>
                      )}
                      {message.deadLetterErrorDescription && (
                        <div>
                          <label className="block text-sm font-medium text-error-600 mb-1">Error Description</label>
                          <div className="text-sm text-error-800 bg-white p-2 rounded border border-error-200">
                            {message.deadLetterErrorDescription}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessagePreviewModal; 