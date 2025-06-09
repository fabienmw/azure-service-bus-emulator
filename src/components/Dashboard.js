import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import ConnectionModal from './ConnectionModal';
import MessagePreviewModal from './MessagePreviewModal';
import ErrorNotification from './ErrorNotification';
import LoadingOverlay from './LoadingOverlay';
import { useApp } from '../context/AppContext';

function Dashboard() {
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const { loading, error, messagePreview, setMessagePreview } = useApp();

  return (
    <div className="flex h-screen bg-secondary-50">
      {/* Loading Overlay */}
      {loading && <LoadingOverlay />}
      
      {/* Error Notification */}
      {error && <ErrorNotification />}
      
      {/* Sidebar */}
      <Sidebar onNewConnection={() => setIsConnectionModalOpen(true)} />
      
      {/* Main Content */}
      <MainContent />
      
      {/* Connection Modal */}
      {isConnectionModalOpen && (
        <ConnectionModal onClose={() => setIsConnectionModalOpen(false)} />
      )}
      
      {/* Message Preview Modal */}
      {messagePreview && (
        <MessagePreviewModal 
          message={messagePreview}
          onClose={() => setMessagePreview(null)}
        />
      )}
    </div>
  );
}

export default Dashboard; 