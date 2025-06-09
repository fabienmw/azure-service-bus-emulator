import React from 'react';
import { Database, Plus, Zap, Shield, BarChart3 } from 'lucide-react';

function WelcomeScreen() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-secondary-50 via-primary-50 to-secondary-100">
      <div className="text-center max-w-2xl mx-auto p-8">
        {/* Logo/Icon */}
        <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
          <Database className="h-16 w-16 text-white" />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-secondary-800 mb-4">
          Azure Service Bus Manager
        </h1>
        
        <p className="text-xl text-secondary-600 mb-8">
          Powerful desktop application for managing your Azure Service Bus instances
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-secondary-200 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Zap className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="font-semibold text-secondary-800 mb-2">Real-time Management</h3>
            <p className="text-sm text-secondary-600">
              Monitor and manage queues, topics, and subscriptions in real-time
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-secondary-200 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Shield className="h-6 w-6 text-success-600" />
            </div>
            <h3 className="font-semibold text-secondary-800 mb-2">Secure Connections</h3>
            <p className="text-sm text-secondary-600">
              Connect securely to multiple Azure Service Bus namespaces
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-secondary-200 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <BarChart3 className="h-6 w-6 text-warning-600" />
            </div>
            <h3 className="font-semibold text-secondary-800 mb-2">Message Analytics</h3>
            <p className="text-sm text-secondary-600">
              View message details, peek/pop messages, and manage dead letters
            </p>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white rounded-xl p-8 shadow-lg border border-secondary-200">
          <h2 className="text-2xl font-bold text-secondary-800 mb-4">Get Started</h2>
          <p className="text-secondary-600 mb-6">
            Connect to your Azure Service Bus namespace to start managing your messaging infrastructure
          </p>
          <div className="flex items-center justify-center space-x-2 text-primary-600">
            <Plus className="h-5 w-5" />
            <span className="font-medium">Click "+" in the sidebar to add your first connection</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-sm text-secondary-500">
          Built for Azure Service Bus management and monitoring
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen; 