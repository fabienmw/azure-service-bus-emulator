import React from 'react';
import { 
  Plus, 
  Cloud, 
  Inbox, 
  Bell, 
  Rss, 
  Wifi, 
  WifiOff,
  ChevronRight,
  ChevronDown,
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
    subscriptionsByTopic,
    queueMessageCounts,
    subscriptionMessageCounts,
    selectedQueue,
    selectedTopic,
    selectedSubscription,
    expandedStates,
    setActiveConnection,
    toggleConnectionChildren,
    selectQueue,
    selectTopic,
    selectSubscription,
    toggleConnectionsExpanded,
    toggleQueuesExpanded,
    toggleTopicsExpanded,
    toggleTopicDetailsExpanded,
    toggleTopicSubscriptionsExpanded,
    disconnectConnection,
  } = useApp();

  return (
    <div className="h-full bg-white border-r border-secondary-200 flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-secondary-200 bg-gradient-to-r from-primary-500 to-primary-600">
        <h1 className="text-xl font-bold text-white mb-1">Azure Service Bus</h1>
        <p className="text-primary-100 text-sm">Manager</p>
      </div>

      {/* Tree Structure */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
        <div className="p-2 min-w-0"> {/* Prevents text overflow issues */}
          {/* Connections Section */}
          <div className="space-y-1">
            <button
              onClick={toggleConnectionsExpanded}
              className="flex items-center justify-between w-full p-2 rounded-lg transition-colors hover:bg-secondary-100 text-secondary-700"
            >
              <div className="flex items-center space-x-2">
                {expandedStates.connections ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <Cloud className="h-4 w-4" />
                <span className="font-medium">Connections</span>
                <span className="text-xs bg-secondary-200 text-secondary-600 px-2 py-1 rounded-full">
                  {connections.length}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNewConnection();
                }}
                className="p-1 hover:bg-secondary-200 rounded transition-colors"
                title="New Connection"
              >
                <Plus className="h-3 w-3 text-secondary-600" />
              </button>
            </button>

            {expandedStates.connections && (
              <div className="ml-6 space-y-2 mt-1">
                {connections.length === 0 ? (
                  <p className="text-sm text-secondary-500 italic p-2">No connections</p>
                ) : (
                  connections.map((connection) => (
                    <div key={connection.id} className="space-y-1">
                      {/* Connection Node */}
                      <div
                        className={classNames(
                          'flex items-center justify-between p-2 rounded-lg border transition-all duration-200 cursor-pointer',
                          activeConnection?.id === connection.id
                            ? 'bg-primary-50 border-primary-200 shadow-sm'
                            : 'bg-secondary-50 border-secondary-200 hover:bg-secondary-100'
                        )}
                      >
                        <div 
                          className="flex items-center space-x-2 flex-1 min-w-0"
                          onClick={async () => {
                            // If this connection is already active, just toggle its children
                            if (activeConnection?.id === connection.id) {
                              toggleConnectionChildren(connection.id);
                            } else {
                              // Set as active and expand children
                              await setActiveConnection(connection);
                              if (!expandedStates.connectionChildren[connection.id]) {
                                toggleConnectionChildren(connection.id);
                              }
                            }
                          }}
                        >
                          <button className="p-0.5 hover:bg-secondary-200 rounded transition-colors">
                            {expandedStates.connectionChildren[connection.id] ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </button>
                          {connection.connected ? (
                            <Wifi className="h-4 w-4 text-success-500 flex-shrink-0" />
                          ) : (
                            <WifiOff className="h-4 w-4 text-error-500 flex-shrink-0" />
                          )}
                          <span className="text-sm font-medium text-secondary-700 truncate">
                            {connection.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* Show counts immediately when connection is active */}
                          {activeConnection?.id === connection.id && (
                            <div className="flex items-center space-x-2 text-xs text-secondary-600">
                              <div className="flex items-center space-x-1 bg-secondary-200 px-2 py-1 rounded-full">
                                <Inbox className="h-3 w-3" />
                                <span>{queues.length}</span>
                              </div>
                              <div className="flex items-center space-x-1 bg-secondary-200 px-2 py-1 rounded-full">
                                <Rss className="h-3 w-3" />
                                <span>{topics.length}</span>
                              </div>
                            </div>
                          )}
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
                      </div>

                      {/* Child nodes (Queues and Topics) - show when connection is expanded */}
                      {activeConnection?.id === connection.id && expandedStates.connectionChildren[connection.id] && (
                        <div className="ml-4 space-y-1">
                          {/* Queues Section */}
                          <div>
                            <button
                              onClick={toggleQueuesExpanded}
                              className="flex items-center justify-between w-full p-2 rounded-lg transition-colors hover:bg-secondary-100 text-secondary-700"
                            >
                              <div className="flex items-center space-x-2">
                                {expandedStates.queues ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                                <Inbox className="h-4 w-4" />
                                <span className="font-medium">Queues</span>
                                <span className="text-xs bg-secondary-200 text-secondary-600 px-2 py-1 rounded-full">
                                  {queues.length}
                                </span>
                              </div>
                            </button>

                            {expandedStates.queues && (
                              <div className="ml-6 space-y-1 mt-1">
                                {queues.map((queue) => (
                                  <div
                                    key={queue.name}
                                    onClick={() => selectQueue(queue)}
                                    className={classNames(
                                      'flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors',
                                      selectedQueue?.name === queue.name
                                        ? 'bg-primary-100 text-primary-800 border border-primary-200'
                                        : 'hover:bg-secondary-100 text-secondary-600'
                                    )}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <Inbox className="h-3 w-3" />
                                      <span className="text-sm font-medium truncate">{queue.name}</span>
                                    </div>
                                    <span className="text-xs bg-primary-200 text-primary-700 px-2 py-1 rounded-full">
                                      {queueMessageCounts[queue.name] !== undefined ? queueMessageCounts[queue.name] : (queue.messageCount || 0)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Topics Section */}
                          <div>
                            <button
                              onClick={toggleTopicsExpanded}
                              className="flex items-center justify-between w-full p-2 rounded-lg transition-colors hover:bg-secondary-100 text-secondary-700"
                            >
                              <div className="flex items-center space-x-2">
                                {expandedStates.topics ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                                <Rss className="h-4 w-4" />
                                <span className="font-medium">Topics</span>
                                <span className="text-xs bg-secondary-200 text-secondary-600 px-2 py-1 rounded-full">
                                  {topics.length}
                                </span>
                              </div>
                            </button>

                            {expandedStates.topics && (
                              <div className="ml-6 space-y-1 mt-1">
                                {topics.map((topic) => (
                                  <div key={topic.name} className="space-y-1">
                                    {/* Topic Node */}
                                    <div
                                      className={classNames(
                                        'flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors',
                                        selectedTopic?.name === topic.name
                                          ? 'bg-primary-100 text-primary-800 border border-primary-200'
                                          : 'hover:bg-secondary-100 text-secondary-600'
                                      )}
                                    >
                                      <div 
                                        className="flex items-center space-x-2 flex-1"
                                        onClick={() => {
                                          selectTopic(topic);
                                          toggleTopicDetailsExpanded(topic.name);
                                        }}
                                      >
                                        <button className="p-0.5 hover:bg-secondary-200 rounded transition-colors">
                                          {expandedStates.topicDetails[topic.name] ? (
                                            <ChevronDown className="h-3 w-3" />
                                          ) : (
                                            <ChevronRight className="h-3 w-3" />
                                          )}
                                        </button>
                                        <Rss className="h-3 w-3" />
                                        <span className="text-sm font-medium truncate">{topic.name}</span>
                                      </div>
                                      <span className="text-xs bg-secondary-200 text-secondary-600 px-2 py-1 rounded-full">
                                        {subscriptionsByTopic[topic.name]?.length || 0}
                                      </span>
                                    </div>

                                    {/* Subscriptions section under this topic */}
                                    {expandedStates.topicDetails[topic.name] && (
                                      <div className="ml-6 space-y-1">
                                        {/* Subscriptions Tab */}
                                        <button
                                          onClick={() => toggleTopicSubscriptionsExpanded(topic.name)}
                                          className="flex items-center justify-between w-full p-2 rounded-lg transition-colors hover:bg-secondary-100 text-secondary-700"
                                        >
                                          <div className="flex items-center space-x-2">
                                            {expandedStates.topicSubscriptions[topic.name] ? (
                                              <ChevronDown className="h-4 w-4" />
                                            ) : (
                                              <ChevronRight className="h-4 w-4" />
                                            )}
                                            <Bell className="h-4 w-4" />
                                            <span className="font-medium">Subscriptions</span>
                                            <span className="text-xs bg-secondary-200 text-secondary-600 px-2 py-1 rounded-full">
                                              {subscriptionsByTopic[topic.name]?.length || 0}
                                            </span>
                                          </div>
                                        </button>

                                        {/* Individual Subscriptions */}
                                        {expandedStates.topicSubscriptions[topic.name] && 
                                         subscriptionsByTopic[topic.name] && (
                                          <div className="ml-6 space-y-1">
                                            {subscriptionsByTopic[topic.name].map((subscription) => (
                                              <div
                                                key={subscription.name}
                                                onClick={() => selectSubscription({ ...subscription, topicName: topic.name })}
                                                className={classNames(
                                                  'flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors',
                                                  selectedSubscription?.name === subscription.name && 
                                                  selectedSubscription?.topicName === topic.name
                                                    ? 'bg-primary-100 text-primary-800 border border-primary-200'
                                                    : 'hover:bg-secondary-100 text-secondary-600'
                                                )}
                                              >
                                                <div className="flex items-center space-x-2">
                                                  <Bell className="h-3 w-3" />
                                                  <span className="text-sm font-medium truncate">
                                                    {subscription.name}
                                                  </span>
                                                </div>
                                                <span className="text-xs bg-success-200 text-success-700 px-2 py-1 rounded-full">
                                                  {subscriptionMessageCounts[`${topic.name}_${subscription.name}`] !== undefined 
                                                    ? subscriptionMessageCounts[`${topic.name}_${subscription.name}`] 
                                                    : (subscription.messageCount || 0)}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

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