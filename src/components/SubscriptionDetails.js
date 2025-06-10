import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Inbox, 
  AlertTriangle,
  BarChart3,
  Clock,
  RefreshCw,
  Settings,
  Eye,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import MessageList from './MessageList';

function SubscriptionDetails() {
  const [activeTab, setActiveTab] = useState('messages');
  const [showLoadAllOption, setShowLoadAllOption] = useState(false);
  const dropdownRef = useRef(null);
  const { 
    selectedSubscription, 
    messages,
    deadLetterMessages,
    allMessages,
    messageFilter,
    loading,
    messageCount,
    loadSubscriptionMessages,
    loadSubscriptionDeadLetterMessages,
    loadAllSubscriptionMessages,
    setMessageFilter,
    setMessageCount,
    setMessagePreview
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

  const handleRefresh = async () => {
    if (!selectedSubscription) return;
    
    // Always refresh all message types to maintain state consistency across filters
    // This ensures that switching filters after refresh will still work correctly
    await loadAllSubscriptionMessages(selectedSubscription.topicName, selectedSubscription.name, messageCount);
    
    // The current messageFilter state is preserved, so the user sees the same view
    // but with refreshed data that's consistent across all filter types
  };

  const handleFilterClick = async (filter) => {
    if (!selectedSubscription) return;
    
    setActiveTab('messages'); // Switch to messages tab when filtering
    
    // Always ensure we have all message types loaded if switching to 'all'
    // For individual filters, we can use the cached data from 'all' if available
    if (filter === 'all') {
      // Only reload if we don't have all messages or if the combined count doesn't match individual arrays
      const needsReload = allMessages.length === 0 || 
                         (messages.length === 0 && deadLetterMessages.length === 0);
      if (needsReload) {
        await loadAllSubscriptionMessages(selectedSubscription.topicName, selectedSubscription.name, messageCount);
      }
    }
    
    // Set the filter after potential loading to avoid showing empty state
    setMessageFilter(filter);
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
    if (!selectedSubscription) return;
    
    setMessageCount(newCount);
    setShowLoadAllOption(false);
    
    // Reload messages with new count based on current filter
    if (messageFilter === 'all') {
      await loadAllSubscriptionMessages(selectedSubscription.topicName, selectedSubscription.name, newCount);
    } else if (messageFilter === 'deadletter') {
      await loadSubscriptionDeadLetterMessages(selectedSubscription.topicName, selectedSubscription.name, newCount);
    } else {
      await loadSubscriptionMessages(selectedSubscription.topicName, selectedSubscription.name, newCount);
    }
  };

  if (!selectedSubscription) return null;

  return (
    <div className="h-full flex flex-col bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 p-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-secondary-800 mb-1 flex items-center">
              <Bell className="h-6 w-6 mr-2 text-primary-600" />
              {selectedSubscription.name}
            </h1>
            <p className="text-secondary-600">
              Subscription on Topic: <span className="font-medium">{selectedSubscription.topicName}</span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-secondary-600">Show:</span>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowLoadAllOption(!showLoadAllOption)}
                className="flex items-center space-x-2 px-4 py-2 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 rounded-lg transition-colors"
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
              className="flex items-center space-x-2 px-4 py-2 bg-primary-100 hover:bg-primary-200 disabled:bg-primary-50 text-primary-700 disabled:text-primary-400 rounded-lg transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats - Now Clickable */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => handleFilterClick('all')}
            className={`bg-primary-50 rounded-lg p-4 border border-primary-200 text-left transition-all duration-200 hover:shadow-md ${
              messageFilter === 'all' ? 'ring-2 ring-primary-400 shadow-lg' : 'hover:border-primary-300'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <Inbox className="h-5 w-5 text-primary-600" />
              <span className="text-sm font-medium text-primary-800">Total Messages</span>
            </div>
            <div className="text-2xl font-bold text-primary-700">
              {selectedSubscription.messageCount || 0}
            </div>
            {messageFilter === 'all' && (
              <div className="text-xs text-primary-600 mt-1 font-medium">● Active Filter</div>
            )}
          </button>

          <button
            onClick={() => handleFilterClick('active')}
            className={`bg-success-50 rounded-lg p-4 border border-success-200 text-left transition-all duration-200 hover:shadow-md ${
              messageFilter === 'active' ? 'ring-2 ring-success-400 shadow-lg' : 'hover:border-success-300'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="h-5 w-5 text-success-600" />
              <span className="text-sm font-medium text-success-800">Active Messages</span>
            </div>
            <div className="text-2xl font-bold text-success-700">
              {selectedSubscription.activeMessageCount || 0}
            </div>
            {messageFilter === 'active' && (
              <div className="text-xs text-success-600 mt-1 font-medium">● Active Filter</div>
            )}
          </button>

          <button
            onClick={() => handleFilterClick('deadletter')}
            className={`bg-error-50 rounded-lg p-4 border border-error-200 text-left transition-all duration-200 hover:shadow-md ${
              messageFilter === 'deadletter' ? 'ring-2 ring-error-400 shadow-lg' : 'hover:border-error-300'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-error-600" />
              <span className="text-sm font-medium text-error-800">Dead Letters</span>
            </div>
            <div className="text-2xl font-bold text-error-700">
              {selectedSubscription.deadLetterMessageCount || 0}
            </div>
            {messageFilter === 'deadletter' && (
              <div className="text-xs text-error-600 mt-1 font-medium">● Active Filter</div>
            )}
          </button>

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
      <div className="bg-white border-b border-secondary-200 flex-shrink-0">
        <div className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('messages')}
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'messages'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-secondary-500 hover:text-secondary-700'
            }`}
          >
            Messages ({getCurrentMessageCount()})
            {messageFilter === 'active' && (
              <span className="ml-1 text-xs bg-success-100 text-success-700 px-2 py-1 rounded-full">Active</span>
            )}
            {messageFilter === 'deadletter' && (
              <span className="ml-1 text-xs bg-error-100 text-error-700 px-2 py-1 rounded-full">Dead Letter</span>
            )}
            {messageFilter === 'all' && (
              <span className="ml-1 text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">All</span>
            )}
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
      <div className="flex-1 flex flex-col min-h-0">
        {activeTab === 'messages' && (
          <div className="flex-1 min-h-0">
            <MessageList 
              messages={getCurrentMessages()}
              onPeekMessage={handlePeekMessage}
              loading={loading}
              emptyMessage={
                messageFilter === 'deadletter' 
                  ? "No dead letter messages in subscription" 
                  : messageFilter === 'all' 
                    ? "No messages in subscription" 
                    : "No active messages in subscription"
              }
              isDeadLetter={messageFilter === 'deadletter'}
              showMessageType={messageFilter === 'all'}
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-6">
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