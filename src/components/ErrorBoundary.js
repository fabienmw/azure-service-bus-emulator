import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-error-50 to-error-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-8 w-8 text-error-500" />
              <h1 className="text-2xl font-bold text-error-700">Something went wrong</h1>
            </div>
            
            <p className="text-secondary-600 mb-6">
              An unexpected error occurred in the application. Please try refreshing the page.
            </p>
            
            {this.state.error && (
              <div className="bg-error-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-error-700 mb-2">Error Details:</h3>
                <pre className="text-sm text-error-600 overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}
            
            <div className="flex space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Refresh Page
              </button>
              
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 