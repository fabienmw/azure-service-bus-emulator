import React from 'react';
import { Eye, Calendar, Hash, Tag, AlertTriangle } from 'lucide-react';

function MessageList({ messages, onPeekMessage, loading, emptyMessage, isDeadLetter = false }) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="h-8 w-8 text-secondary-400" />
          </div>
          <h3 className="text-lg font-medium text-secondary-700 mb-2">No Messages</h3>
          <p className="text-secondary-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden bg-white">
      <div className="h-full overflow-y-auto scrollbar-thin">
        <table className="w-full">
          <thead className="bg-secondary-50 border-b border-secondary-200 sticky top-0">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-secondary-700">Message ID</th>
              <th className="text-left py-3 px-4 font-medium text-secondary-700">Label</th>
              <th className="text-left py-3 px-4 font-medium text-secondary-700">Enqueued</th>
              <th className="text-left py-3 px-4 font-medium text-secondary-700">Delivery Count</th>
              {isDeadLetter && (
                <th className="text-left py-3 px-4 font-medium text-secondary-700">Dead Letter Reason</th>
              )}
              <th className="text-left py-3 px-4 font-medium text-secondary-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-200">
            {messages.map((message, index) => (
              <tr key={message.messageId || index} className="hover:bg-secondary-50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <Hash className="h-4 w-4 text-secondary-400" />
                    <span className="text-sm font-mono text-secondary-700 truncate max-w-xs">
                      {message.messageId || 'N/A'}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-secondary-400" />
                    <span className="text-sm text-secondary-700 truncate max-w-xs">
                      {message.label || 'No label'}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-secondary-400" />
                    <span className="text-sm text-secondary-700">
                      {message.enqueuedTimeUtc 
                        ? new Date(message.enqueuedTimeUtc).toLocaleString() 
                        : 'N/A'
                      }
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    (message.deliveryCount || 0) > 0 
                      ? 'bg-warning-100 text-warning-800' 
                      : 'bg-success-100 text-success-800'
                  }`}>
                    {message.deliveryCount || 0}
                  </span>
                </td>
                {isDeadLetter && (
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-error-500" />
                      <span className="text-sm text-error-700 truncate max-w-xs">
                        {message.deadLetterReason || 'Unknown'}
                      </span>
                    </div>
                  </td>
                )}
                <td className="py-3 px-4">
                  <button
                    onClick={() => onPeekMessage(message)}
                    className="flex items-center space-x-2 px-3 py-1 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg transition-colors text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MessageList; 