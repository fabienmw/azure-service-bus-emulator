import React from 'react';
import { Rss, Bell, Settings, Clock, BarChart3 } from 'lucide-react';
import { useApp } from '../context/AppContext';

function TopicDetails() {
  const { selectedTopic, subscriptions } = useApp();

  if (!selectedTopic) return null;

  return (
    <div className="h-full flex flex-col bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 p-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-secondary-800 mb-1">
              {selectedTopic.name}
            </h1>
            <p className="text-secondary-600">Topic Details</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
            <div className="flex items-center space-x-2 mb-2">
              <Bell className="h-5 w-5 text-primary-600" />
              <span className="text-sm font-medium text-primary-800">Subscriptions</span>
            </div>
            <div className="text-2xl font-bold text-primary-700">
              {subscriptions.length}
            </div>
          </div>

          <div className="bg-secondary-50 rounded-lg p-4 border border-secondary-200">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="h-5 w-5 text-secondary-600" />
              <span className="text-sm font-medium text-secondary-800">Size (Bytes)</span>
            </div>
            <div className="text-2xl font-bold text-secondary-700">
              {selectedTopic.sizeInBytes || 0}
            </div>
          </div>

          <div className="bg-success-50 rounded-lg p-4 border border-success-200">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-5 w-5 text-success-600" />
              <span className="text-sm font-medium text-success-800">Status</span>
            </div>
            <div className="text-lg font-bold text-success-700">
              {selectedTopic.status || 'Active'}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-secondary-800 mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Topic Properties
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-600 mb-1">Name</label>
              <div className="text-secondary-800 bg-secondary-50 p-3 rounded-lg border">
                {selectedTopic.name}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-600 mb-1">Status</label>
              <div className="text-secondary-800 bg-secondary-50 p-3 rounded-lg border">
                {selectedTopic.status || 'Active'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-600 mb-1">Size (Bytes)</label>
              <div className="text-secondary-800 bg-secondary-50 p-3 rounded-lg border">
                {selectedTopic.sizeInBytes || 0}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-secondary-600 mb-1">Created</label>
              <div className="text-secondary-800 bg-secondary-50 p-3 rounded-lg border">
                {selectedTopic.createdAt ? new Date(selectedTopic.createdAt).toLocaleString() : 'N/A'}
              </div>
            </div>
          </div>

          {/* Subscriptions Section */}
          {subscriptions.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-semibold text-secondary-800 mb-3">Subscriptions</h4>
              <div className="space-y-2">
                {subscriptions.map((subscription) => (
                  <div
                    key={subscription.name}
                    className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg border"
                  >
                    <div className="flex items-center space-x-3">
                      <Bell className="h-4 w-4 text-secondary-600" />
                      <span className="font-medium text-secondary-800">{subscription.name}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-secondary-600">
                      <span>Messages: {subscription.messageCount || 0}</span>
                      <span>Active: {subscription.activeMessageCount || 0}</span>
                      <span>Dead Letters: {subscription.deadLetterMessageCount || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TopicDetails; 