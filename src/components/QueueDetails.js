import React, { useState } from 'react';
import { 
  Eye, 
  Download, 
  Trash, 
  RefreshCw, 
  MessageSquare, 
  Clock, 
  AlertTriangle,
  BarChart3,
  Settings
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import MessageList from './MessageList';

function QueueDetails() {
  const [activeTab, setActiveTab] = useState('messages');
  const { 
    selectedQueue, 
    messages, 
    deadLetterMessages,
    loading,
    loadQueueMessages,
    loadDeadLetterMessages,
    receiveMessage,
    setMessagePreview,
    activeConnection
  } = useApp();

  const handlePeekMessage = (message) => {
    setMessagePreview(message);
  };

  const handlePopMessage = async () => {
    if (!selectedQueue) return;
    
    try {
      const message = await receiveMessage(selectedQueue.name);
      if (message) {
        setMessagePreview(message);
      }
    } catch (error) {
      console.error('Error popping message:', error);
    }
  };

  const handleRefresh = () => {
    if (!selectedQueue) return;
    
    if (activeTab === 'messages') {
      loadQueueMessages(selectedQueue.name);
    } else if (activeTab === 'deadletter') {
      loadDeadLetterMessages(selectedQueue.name);
    }
  };

  if (!selectedQueue) return null;

  return (
    <div className="flex-1 flex flex-col bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-secondary-800 mb-1">
              {selectedQueue.name}
            </h1>
            <p className="text-secondary-600">Queue Details</p>
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
            <button
              onClick={handlePopMessage}
              disabled={loading || !selectedQueue.messageCount}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>Pop Message</span>
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
              {selectedQueue.messageCount || 0}
            </div>
          </div>

          <div className="bg-success-50 rounded-lg p-4 border border-success-200">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="h-5 w-5 text-success-600" />
              <span className="text-sm font-medium text-success-800">Active Messages</span>
            </div>
            <div className="text-2xl font-bold text-success-700">
              {selectedQueue.activeMessageCount || 0}
            </div>
          </div>

          <div className="bg-error-50 rounded-lg p-4 border border-error-200">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-error-600" />
              <span className="text-sm font-medium text-error-800">Dead Letters</span>
            </div>
            <div className="text-2xl font-bold text-error-700">
              {selectedQueue.deadLetterMessageCount || 0}
            </div>
          </div>

          <div className="bg-secondary-50 rounded-lg p-4 border border-secondary-200">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-5 w-5 text-secondary-600" />
              <span className="text-sm font-medium text-secondary-800">Status</span>
            </div>
            <div className="text-lg font-bold text-secondary-700">
              {selectedQueue.status || 'Active'}
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
            onClick={() => {
              setActiveTab('deadletter');
              loadDeadLetterMessages(selectedQueue.name);
            }}
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'deadletter'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-secondary-500 hover:text-secondary-700'
            }`}
          >
            Dead Letter Queue ({deadLetterMessages.length})
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
            emptyMessage="No messages in queue"
          />
        )}
        
        {activeTab === 'deadletter' && (
          <MessageList 
            messages={deadLetterMessages}
            onPeekMessage={handlePeekMessage}
            loading={loading}
            emptyMessage="No messages in dead letter queue"
            isDeadLetter={true}
          />
        )}

        {activeTab === 'settings' && (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
              <h3 className="text-lg font-semibold text-secondary-800 mb-4">Queue Properties</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-600 mb-1">Name</label>
                  <div className="text-secondary-800">{selectedQueue.name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-600 mb-1">Status</label>
                  <div className="text-secondary-800">{selectedQueue.status || 'Active'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-600 mb-1">Size (Bytes)</label>
                  <div className="text-secondary-800">{selectedQueue.sizeInBytes || 0}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-600 mb-1">Created</label>
                  <div className="text-secondary-800">
                    {selectedQueue.createdAt ? new Date(selectedQueue.createdAt).toLocaleString() : 'N/A'}
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

export default QueueDetails; 