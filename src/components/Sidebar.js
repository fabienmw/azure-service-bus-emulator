import React from 'react';
import { 
  Plus, 
  Database, 
  MessageSquare, 
  Users, 
  GitBranch, 
  Wifi, 
  WifiOff,
  ChevronRight,
  ChevronDown,
  Inbox,
  Rss,
  Settings
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import classNames from 'classnames';

function Sidebar({ onNewConnection }) {
  const {
    connections,
    activeConnection,
    queues,
    topics,
    subscriptions,
    selectedQueue,
    selectedTopic,
    selectedSubscription,
    sidebarSection,
    setActiveConnection,
    loadQueues,
    loadTopics,
    selectQueue,
    selectTopic,
    selectSubscription,
    setSidebarSection,
    disconnectConnection,
  } = useApp();

  return (
    <div className="w-80 bg-white border-r border-secondary-200 flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-secondary-200 bg-gradient-to-r from-primary-500 to-primary-600">
        <h1 className="text-xl font-bold text-white mb-1">Azure Service Bus</h1>
        <p className="text-primary-100 text-sm">Manager</p>
      </div>

      {/* Connection Section */}
      <div className="p-4 border-b border-secondary-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-secondary-700">Connections</h2>
          <button
            onClick={onNewConnection}
            className="p-1 hover:bg-secondary-100 rounded-lg transition-colors"
            title="New Connection"
          >
            <Plus className="h-4 w-4 text-secondary-600" />
          </button>
        </div>

        <div className="space-y-2">
          {connections.length === 0 ? (
            <p className="text-sm text-secondary-500 italic">No connections</p>
          ) : (
            connections.map((connection) => (
              <div
                key={connection.id}
                className={classNames(
                  'flex items-center justify-between p-2 rounded-lg border transition-all duration-200 cursor-pointer',
                  activeConnection?.id === connection.id
                    ? 'bg-primary-50 border-primary-200 shadow-sm'
                    : 'bg-secondary-50 border-secondary-200 hover:bg-secondary-100'
                )}
                onClick={() => setActiveConnection(connection)}
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {connection.connected ? (
                    <Wifi className="h-4 w-4 text-success-500 flex-shrink-0" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-error-500 flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium text-secondary-700 truncate">
                    {connection.name}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    disconnectConnection(connection.id);
                  }}
                  className="p-1 hover:bg-error-100 rounded transition-colors"
                  title="Disconnect"
                >
                  <WifiOff className="h-3 w-3 text-error-500" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      {activeConnection && (
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* Queues Section */}
          <div className="p-4 border-b border-secondary-200">
            <button
              onClick={loadQueues}
              className={classNames(
                'flex items-center justify-between w-full p-2 rounded-lg transition-colors',
                sidebarSection === 'queues' 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'hover:bg-secondary-100 text-secondary-700'
              )}
            >
              <div className="flex items-center space-x-2">
                <Inbox className="h-4 w-4" />
                <span className="font-medium">Queues</span>
                <span className="text-xs bg-secondary-200 text-secondary-600 px-2 py-1 rounded-full">
                  {queues.length}
                </span>
              </div>
              {sidebarSection === 'queues' ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {sidebarSection === 'queues' && (
              <div className="mt-2 space-y-1 ml-6">
                {queues.map((queue) => (
                  <div
                    key={queue.name}
                    onClick={() => selectQueue(queue)}
                    className={classNames(
                      'p-2 rounded-lg cursor-pointer transition-colors',
                      selectedQueue?.name === queue.name
                        ? 'bg-primary-100 text-primary-800'
                        : 'hover:bg-secondary-100 text-secondary-600'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{queue.name}</span>
                      <span className="text-xs bg-primary-200 text-primary-700 px-2 py-1 rounded-full">
                        {queue.messageCount || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Topics Section */}
          <div className="p-4 border-b border-secondary-200">
            <button
              onClick={loadTopics}
              className={classNames(
                'flex items-center justify-between w-full p-2 rounded-lg transition-colors',
                sidebarSection === 'topics' 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'hover:bg-secondary-100 text-secondary-700'
              )}
            >
              <div className="flex items-center space-x-2">
                <Rss className="h-4 w-4" />
                <span className="font-medium">Topics</span>
                <span className="text-xs bg-secondary-200 text-secondary-600 px-2 py-1 rounded-full">
                  {topics.length}
                </span>
              </div>
              {sidebarSection === 'topics' ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {sidebarSection === 'topics' && (
              <div className="mt-2 space-y-1 ml-6">
                {topics.map((topic) => (
                  <div
                    key={topic.name}
                    onClick={() => selectTopic(topic)}
                    className={classNames(
                      'p-2 rounded-lg cursor-pointer transition-colors',
                      selectedTopic?.name === topic.name
                        ? 'bg-primary-100 text-primary-800'
                        : 'hover:bg-secondary-100 text-secondary-600'
                    )}
                  >
                    <span className="text-sm font-medium truncate">{topic.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subscriptions Section */}
          {sidebarSection === 'subscriptions' && subscriptions.length > 0 && (
            <div className="p-4 border-b border-secondary-200">
              <div className="flex items-center space-x-2 mb-2">
                <GitBranch className="h-4 w-4 text-secondary-700" />
                <span className="font-medium text-secondary-700">
                  Subscriptions ({selectedTopic ? selectedTopic.name : ''})
                </span>
              </div>
              
              <div className="space-y-1 ml-6">
                {subscriptions.map((subscription) => (
                  <div
                    key={subscription.name}
                    onClick={() => selectSubscription(subscription)}
                    className={classNames(
                      'p-2 rounded-lg cursor-pointer transition-colors',
                      selectedSubscription?.name === subscription.name
                        ? 'bg-primary-100 text-primary-800'
                        : 'hover:bg-secondary-100 text-secondary-600'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{subscription.name}</span>
                      <span className="text-xs bg-primary-200 text-primary-700 px-2 py-1 rounded-full">
                        {subscription.messageCount || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-secondary-200 bg-secondary-50">
        <div className="flex items-center justify-between text-sm text-secondary-600">
          <span>v1.0.0</span>
          <Settings className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export default Sidebar; 