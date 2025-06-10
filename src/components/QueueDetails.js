import React, { useState, useEffect, useRef } from 'react';
import { 
  Eye, 
  Download, 
  Trash, 
  RefreshCw, 
  MessageSquare, 
  Clock, 
  AlertTriangle,
  BarChart3,
  Settings,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import MessageList from './MessageList';

function QueueDetails() {
  const [activeTab, setActiveTab] = useState('messages');
  const [showLoadAllOption, setShowLoadAllOption] = useState(false);
  const dropdownRef = useRef(null);
  const { 
    selectedQueue, 
    messages, 
    deadLetterMessages,
    allMessages,
    messageFilter,
    loading,
    messageCount,
    loadQueueMessages,
    loadDeadLetterMessages,
    loadAllMessageTypes,
    setMessageFilter,
    setMessageCount,
    receiveMessage,
    setMessagePreview,
    activeConnection
  } = useApp();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLoadAllOption(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    
    if (messageFilter === 'all') {
      loadAllMessageTypes(selectedQueue.name, messageCount);
    } else if (messageFilter === 'deadletter') {
      loadDeadLetterMessages(selectedQueue.name, messageCount);
    } else {
      loadQueueMessages(selectedQueue.name, messageCount);
    }
  };

  const handleFilterClick = async (filter) => {
    if (!selectedQueue) return;
    
    setMessageFilter(filter);
    setActiveTab('messages'); // Switch to messages tab when filtering
    
    if (filter === 'all') {
      await loadAllMessageTypes(selectedQueue.name, messageCount);
    } else if (filter === 'deadletter') {
      await loadDeadLetterMessages(selectedQueue.name, messageCount);
    } else if (filter === 'active') {
      await loadQueueMessages(selectedQueue.name, messageCount);
    }
  };

  // Get the current messages based on filter
  const getCurrentMessages = () => {
    switch (messageFilter) {
      case 'all':
        return allMessages;
      case 'deadletter':
        return deadLetterMessages;
      case 'active':
      default:
        return messages;
    }
  };

  const getCurrentMessageCount = () => {
    const currentMessages = getCurrentMessages();
    return currentMessages.length;
  };

  const handleMessageCountChange = async (newCount) => {
    if (!selectedQueue) return;
    
    setMessageCount(newCount);
    setShowLoadAllOption(false);
    
    // Reload messages with new count
    if (messageFilter === 'all') {
      await loadAllMessageTypes(selectedQueue.name, newCount);
    } else if (messageFilter === 'deadletter') {
      await loadDeadLetterMessages(selectedQueue.name, newCount);
    } else {
      await loadQueueMessages(selectedQueue.name, newCount);
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
          <button
            onClick={() => handleFilterClick('all')}
            className={`bg-primary-50 rounded-lg p-4 border border-primary-200 text-left transition-all hover:bg-primary-100 hover:shadow-md ${
              messageFilter === 'all' ? 'ring-2 ring-primary-500 bg-primary-100' : ''
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <MessageSquare className="h-5 w-5 text-primary-600" />
              <span className="text-sm font-medium text-primary-800">Total Messages</span>
            </div>
            <div className="text-2xl font-bold text-primary-700">
              {selectedQueue.messageCount || 0}
            </div>
            {messageFilter === 'all' && (
              <div className="text-xs text-primary-600 mt-1">Showing all messages</div>
            )}
          </button>

          <button
            onClick={() => handleFilterClick('active')}
            className={`bg-success-50 rounded-lg p-4 border border-success-200 text-left transition-all hover:bg-success-100 hover:shadow-md ${
              messageFilter === 'active' ? 'ring-2 ring-success-500 bg-success-100' : ''
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="h-5 w-5 text-success-600" />
              <span className="text-sm font-medium text-success-800">Active Messages</span>
            </div>
            <div className="text-2xl font-bold text-success-700">
              {selectedQueue.activeMessageCount || 0}
            </div>
            {messageFilter === 'active' && (
              <div className="text-xs text-success-600 mt-1">Showing active only</div>
            )}
          </button>

          <button
            onClick={() => handleFilterClick('deadletter')}
            className={`bg-error-50 rounded-lg p-4 border border-error-200 text-left transition-all hover:bg-error-100 hover:shadow-md ${
              messageFilter === 'deadletter' ? 'ring-2 ring-error-500 bg-error-100' : ''
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-error-600" />
              <span className="text-sm font-medium text-error-800">Dead Letters</span>
            </div>
            <div className="text-2xl font-bold text-error-700">
              {selectedQueue.deadLetterMessageCount || 0}
            </div>
            {messageFilter === 'deadletter' && (
              <div className="text-xs text-error-600 mt-1">Showing dead letters only</div>
            )}
          </button>

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
        <div className="flex justify-between items-center px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('messages')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'messages'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700'
              }`}
            >
              Messages ({getCurrentMessageCount()})
              {messageFilter !== 'active' && (
                <span className="ml-1 text-xs text-secondary-500">
                  {messageFilter === 'all' ? '(All)' : messageFilter === 'deadletter' ? '(Dead Letter)' : ''}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('deadletter');
                setMessageFilter('deadletter');
                loadDeadLetterMessages(selectedQueue.name, messageCount);
              }}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'deadletter'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700'
              }`}
            >
              Dead Letter Queue ({deadLetterMessages.length}{selectedQueue.deadLetterMessageCount > deadLetterMessages.length ? `/${selectedQueue.deadLetterMessageCount}` : ''})
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

          {/* Message Count Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-secondary-600">Show:</span>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowLoadAllOption(!showLoadAllOption)}
                className="flex items-center space-x-2 px-3 py-2 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 rounded-lg transition-colors text-sm"
              >
                <span>{messageCount === 'all' ? 'All' : messageCount} messages</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showLoadAllOption ? 'rotate-180' : ''}`} />
              </button>
              
              {showLoadAllOption && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-secondary-200 rounded-lg shadow-lg z-10 min-w-32">
                  {[10, 20, 50, 100, 'all'].map((count) => (
                    <button
                      key={count}
                      onClick={() => handleMessageCountChange(count)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        messageCount === count 
                          ? 'bg-primary-50 text-primary-700' 
                          : 'text-secondary-700 hover:bg-secondary-50'
                      }`}
                    >
                      {count === 'all' ? 'All messages' : `${count} messages`}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 bg-primary-100 hover:bg-primary-200 disabled:bg-primary-50 text-primary-700 disabled:text-primary-400 rounded-lg transition-colors text-sm"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'messages' && (
          <MessageList 
            messages={getCurrentMessages()}
            onPeekMessage={handlePeekMessage}
            loading={loading}
            emptyMessage={
              messageFilter === 'all' ? "No messages found" :
              messageFilter === 'deadletter' ? "No dead letter messages found" :
              "No active messages found"
            }
            isDeadLetter={messageFilter === 'deadletter'}
            showMessageType={messageFilter === 'all'}
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