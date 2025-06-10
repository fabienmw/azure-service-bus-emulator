import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import ResizableLayout from './ResizableLayout';
import ConnectionModal from './ConnectionModal';
import MessagePreviewModal from './MessagePreviewModal';
import ErrorNotification from './ErrorNotification';
import LoadingOverlay from './LoadingOverlay';
import { useApp } from '../context/AppContext';

function Dashboard() {
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const { loading, error, messagePreview, setMessagePreview } = useApp();

  return (
    <div className="h-screen bg-secondary-50">
      {/* Loading Overlay */}
      {loading && <LoadingOverlay />}
      
      {/* Error Notification */}
      {error && <ErrorNotification />}
      
      {/* Resizable Layout */}
      <ResizableLayout 
        leftPanel={<Sidebar onNewConnection={() => setIsConnectionModalOpen(true)} />}
        rightPanel={<MainContent />}
        initialWidth={320}
        minWidth={250}
        maxWidth={800}
      />
      
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