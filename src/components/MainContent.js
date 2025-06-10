import React from 'react';
import { useApp } from '../context/AppContext';
import WelcomeScreen from './WelcomeScreen';
import QueueDetails from './QueueDetails';
import TopicDetails from './TopicDetails';
import SubscriptionDetails from './SubscriptionDetails';

function MainContent() {
  const { 
    activeConnection, 
    selectedQueue, 
    selectedTopic, 
    selectedSubscription 
  } = useApp();

  // Show welcome screen if no connection
  if (!activeConnection) {
    return <WelcomeScreen />;
  }

  // Show queue details if queue is selected
  if (selectedQueue) {
    return (
      <div className="h-full">
        <QueueDetails />
      </div>
    );
  }

  // Show subscription details if subscription is selected
  if (selectedSubscription) {
    return (
      <div className="h-full">
        <SubscriptionDetails />
      </div>
    );
  }

  // Show topic details if topic is selected
  if (selectedTopic) {
    return (
      <div className="h-full">
        <TopicDetails />
      </div>
    );
  }

  // Default state - show connection info
  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-secondary-50 to-secondary-100">
      <div className="text-center">
        <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">
              {activeConnection.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-secondary-800 mb-2">
          Connected to {activeConnection.name}
        </h2>
        <p className="text-secondary-600 mb-6">
          Select queues or topics from the sidebar to view their details and messages.
        </p>
        <div className="flex justify-center space-x-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-secondary-200">
            <div className="text-2xl font-bold text-primary-600 mb-1">Ready</div>
            <div className="text-sm text-secondary-600">Connection Status</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainContent; 