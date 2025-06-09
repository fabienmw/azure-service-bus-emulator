import React, { useState } from 'react';
import { 
  GitBranch, 
  MessageSquare, 
  AlertTriangle,
  BarChart3,
  Clock,
  RefreshCw,
  Settings,
  Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import MessageList from './MessageList';

function SubscriptionDetails() {
  const [activeTab, setActiveTab] = useState('messages');
  const { 
    selectedSubscription, 
    messages,
    loading,
    loadSubscriptionMessages,
    setMessagePreview
  } = useApp();

  const handlePeekMessage = (message) => {
    setMessagePreview(message);
  };

  const handleRefresh = () => {
    if (!selectedSubscription) return;
    loadSubscriptionMessages(selectedSubscription.topicName, selectedSubscription.name);
  };

  if (!selectedSubscription) return null;

  return (
    <div className="flex-1 flex flex-col bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-secondary-800 mb-1">
              {selectedSubscription.name}
            </h1>
            <p className="text-secondary-600">
              Subscription for topic: {selectedSubscription.topicName}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
            <div className="flex items-center space-x-2 mb-2">
              <MessageSquare className="h-5 w-5 text-primary-600" />
              <span className="text-sm font-medium text-primary-800">Total Messages</span>
            </div>
            <div className="text-2xl font-bold text-primary-700">
              {selectedSubscription.messageCount || 0}
            </div>
          </div>

          <div className="bg-success-50 rounded-lg p-4 border border-success-200">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="h-5 w-5 text-success-600" />
              <span className="text-sm font-medium text-success-800">Active Messages</span>
            </div>
            <div className="text-2xl font-bold text-success-700">
              {selectedSubscription.activeMessageCount || 0}
            </div>
          </div>

          <div className="bg-error-50 rounded-lg p-4 border border-error-200">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-error-600" />
              <span className="text-sm font-medium text-error-800">Dead Letters</span>
            </div>
            <div className="text-2xl font-bold text-error-700">
              {selectedSubscription.deadLetterMessageCount || 0}
            </div>
          </div>

          <div className="bg-secondary-50 rounded-lg p-4 border border-secondary-200">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-5 w-5 text-secondary-600" />
              <span className="text-sm font-medium text-secondary-800">Status</span>
            </div>
            <div className="text-lg font-bold text-secondary-700">
              {selectedSubscription.status || 'Active'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-secondary-200">
        <div className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('messages')}
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'messages'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-secondary-500 hover:text-secondary-700'
            }`}
          >
            Messages ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'settings'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-secondary-500 hover:text-secondary-700'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'messages' && (
          <MessageList 
            messages={messages}
            onPeekMessage={handlePeekMessage}
            loading={loading}
            emptyMessage="No messages in subscription"
          />
        )}

        {activeTab === 'settings' && (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
              <h3 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Subscription Properties
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-600 mb-1">Name</label>
                  <div className="text-secondary-800 bg-secondary-50 p-3 rounded-lg border">
                    {selectedSubscription.name}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-600 mb-1">Topic Name</label>
                  <div className="text-secondary-800 bg-secondary-50 p-3 rounded-lg border">
                    {selectedSubscription.topicName}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-600 mb-1">Status</label>
                  <div className="text-secondary-800 bg-secondary-50 p-3 rounded-lg border">
                    {selectedSubscription.status || 'Active'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-600 mb-1">Created</label>
                  <div className="text-secondary-800 bg-secondary-50 p-3 rounded-lg border">
                    {selectedSubscription.createdAt ? new Date(selectedSubscription.createdAt).toLocaleString() : 'N/A'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-600 mb-1">Updated</label>
                  <div className="text-secondary-800 bg-secondary-50 p-3 rounded-lg border">
                    {selectedSubscription.updatedAt ? new Date(selectedSubscription.updatedAt).toLocaleString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubscriptionDetails; 