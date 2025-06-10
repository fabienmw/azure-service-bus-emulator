import React, { useState, useRef, useCallback, useEffect } from 'react';

function ResizableLayout({ 
  leftPanel, 
  rightPanel, 
  initialWidth = 320, 
  minWidth = 200, 
  maxWidth = 600 
}) {
  const [sidebarWidth, setSidebarWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);

  const handleMouseDown = useCallback((e) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = e.clientX - containerRect.left;
    
    // Constrain the width within min and max bounds
    const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    setSidebarWidth(constrainedWidth);
  }, [isResizing, minWidth, maxWidth]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div ref={containerRef} className="flex h-full">
      {/* Left Panel */}
      <div 
        style={{ width: `${sidebarWidth}px` }}
        className="flex-shrink-0 h-full"
      >
        {leftPanel}
      </div>

      {/* Resizer */}
      <div
        className={`w-1 h-full bg-secondary-200 hover:bg-primary-400 cursor-col-resize transition-colors duration-150 relative group ${
          isResizing ? 'bg-primary-500' : ''
        }`}
        onMouseDown={handleMouseDown}
      >
        {/* Visual indicator for the resizer */}
        <div className="absolute inset-y-0 left-0 w-1 group-hover:w-1 transition-all duration-150">
          <div className="h-full w-full bg-gradient-to-b from-transparent via-primary-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        {/* Drag handle dots */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex flex-col space-y-1">
            <div className="w-1 h-1 bg-secondary-400 rounded-full"></div>
            <div className="w-1 h-1 bg-secondary-400 rounded-full"></div>
            <div className="w-1 h-1 bg-secondary-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 h-full overflow-hidden">
        {rightPanel}
      </div>
    </div>
  );
}

export default ResizableLayout; 