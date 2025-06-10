import React from 'react';
import { AppProvider } from './context/AppContext';
import Dashboard from './components/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import UpdateNotification from './components/UpdateNotification';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <div className="App h-screen bg-gradient-to-br from-secondary-50 to-secondary-100">
          <Dashboard />
          <UpdateNotification />
        </div>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App; 