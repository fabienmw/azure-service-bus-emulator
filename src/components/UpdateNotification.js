import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, X, CheckCircle } from 'lucide-react';

const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };

function UpdateNotification() {
  const [updateStatus, setUpdateStatus] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('');

  useEffect(() => {
    if (!ipcRenderer) return;

    // Get current version
    ipcRenderer.invoke('get-app-version').then(setCurrentVersion);

    // Listen for update events
    const handleUpdateChecking = () => {
      setUpdateStatus('checking');
      setIsVisible(true);
    };

    const handleUpdateAvailable = (event, info) => {
      setUpdateStatus('available');
      setUpdateInfo(info);
      setIsVisible(true);
    };

    const handleUpdateNotAvailable = () => {
      setUpdateStatus('not-available');
      setIsVisible(true);
      // Hide after 3 seconds
      setTimeout(() => setIsVisible(false), 3000);
    };

    const handleUpdateError = (event, error) => {
      setUpdateStatus('error');
      setIsVisible(true);
      console.error('Update error:', error);
    };

    const handleDownloadProgress = (event, progressObj) => {
      setUpdateStatus('downloading');
      setDownloadProgress(progressObj.percent);
      setIsVisible(true);
    };

    const handleUpdateDownloaded = (event, info) => {
      setUpdateStatus('downloaded');
      setUpdateInfo(info);
      setIsVisible(true);
    };

    ipcRenderer.on('update-checking', handleUpdateChecking);
    ipcRenderer.on('update-available', handleUpdateAvailable);
    ipcRenderer.on('update-not-available', handleUpdateNotAvailable);
    ipcRenderer.on('update-error', handleUpdateError);
    ipcRenderer.on('update-download-progress', handleDownloadProgress);
    ipcRenderer.on('update-downloaded', handleUpdateDownloaded);

    return () => {
      ipcRenderer.removeListener('update-checking', handleUpdateChecking);
      ipcRenderer.removeListener('update-available', handleUpdateAvailable);
      ipcRenderer.removeListener('update-not-available', handleUpdateNotAvailable);
      ipcRenderer.removeListener('update-error', handleUpdateError);
      ipcRenderer.removeListener('update-download-progress', handleDownloadProgress);
      ipcRenderer.removeListener('update-downloaded', handleUpdateDownloaded);
    };
  }, []);

  const handleCheckForUpdates = () => {
    if (ipcRenderer) {
      ipcRenderer.invoke('check-for-updates');
    }
  };

  const handleInstallUpdate = () => {
    if (ipcRenderer) {
      ipcRenderer.invoke('quit-and-install');
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible || !ipcRenderer) return null;

  const renderContent = () => {
    switch (updateStatus) {
      case 'checking':
        return (
          <div className="flex items-center space-x-3">
            <RefreshCw className="h-5 w-5 animate-spin text-primary-600" />
            <div>
              <h3 className="font-medium text-secondary-800">Checking for updates...</h3>
              <p className="text-sm text-secondary-600">Current version: {currentVersion}</p>
            </div>
          </div>
        );

      case 'available':
        return (
          <div className="flex items-center space-x-3">
            <Download className="h-5 w-5 text-success-600" />
            <div className="flex-1">
              <h3 className="font-medium text-secondary-800">Update Available</h3>
              <p className="text-sm text-secondary-600">
                Version {updateInfo?.version} is available. The update will download automatically.
              </p>
            </div>
          </div>
        );

      case 'downloading':
        return (
          <div className="flex items-center space-x-3">
            <Download className="h-5 w-5 text-primary-600" />
            <div className="flex-1">
              <h3 className="font-medium text-secondary-800">Downloading Update</h3>
              <p className="text-sm text-secondary-600 mb-2">
                Progress: {Math.round(downloadProgress)}%
              </p>
              <div className="w-full bg-secondary-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>
          </div>
        );

      case 'downloaded':
        return (
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-success-600" />
            <div className="flex-1">
              <h3 className="font-medium text-secondary-800">Update Ready</h3>
              <p className="text-sm text-secondary-600 mb-3">
                Version {updateInfo?.version} has been downloaded and is ready to install.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleInstallUpdate}
                  className="px-3 py-1.5 bg-success-600 text-white text-sm rounded-lg hover:bg-success-700 transition-colors"
                >
                  Restart & Install
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-3 py-1.5 bg-secondary-200 text-secondary-700 text-sm rounded-lg hover:bg-secondary-300 transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        );

      case 'not-available':
        return (
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-success-600" />
            <div>
              <h3 className="font-medium text-secondary-800">You're up to date</h3>
              <p className="text-sm text-secondary-600">Version {currentVersion} is the latest version.</p>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="flex items-center space-x-3">
            <X className="h-5 w-5 text-error-600" />
            <div className="flex-1">
              <h3 className="font-medium text-secondary-800">Update Error</h3>
              <p className="text-sm text-secondary-600 mb-2">
                There was an error checking for updates.
              </p>
              <button
                onClick={handleCheckForUpdates}
                className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-white rounded-lg shadow-lg border border-secondary-200 p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {renderContent()}
          </div>
          {updateStatus !== 'downloading' && updateStatus !== 'downloaded' && (
            <button
              onClick={handleDismiss}
              className="ml-2 p-1 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-secondary-500" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default UpdateNotification; 