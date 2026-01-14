import React, { useState, useRef } from 'react';
import { useUIStore } from '../store';

export function StickerUI({ onImageUpload, onTextAdd }) {
  const [isDragging, setIsDragging] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(true); // Default collapsed on mobile
  const fileInputRef = useRef(null);

  const { activePanel, setActivePanel } = useUIStore();
  const isMobile = window.innerWidth < 768;

  // Auto-expand on desktop, handle resize
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsCollapsed(false);
        setActivePanel(null); // Reset on desktop
      } else {
        setIsCollapsed(true);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setActivePanel]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file) => {
    const allowedTypes = ['image/png', 'image/svg+xml', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload only PNG, SVG, or WebP images with transparent backgrounds.');
      return;
    }

    const url = URL.createObjectURL(file);
    onImageUpload(url, file.type);

    // Auto-collapse on mobile after successful upload
    if (isMobile) {
      setIsCollapsed(true);
      setActivePanel(null);
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      onTextAdd(textInput);
    }
  };

  const handleContainerClick = () => {
    // Only expand if currently collapsed. Do not collapse if expanded (require arrow click).
    if (isCollapsed) {
      setIsCollapsed(false);
      setActivePanel('sticker');
    }
  };

  const handleToggleClick = (e) => {
    e.stopPropagation(); // Prevent container click
    if (isCollapsed) {
      setIsCollapsed(false);
      setActivePanel('sticker');
    } else {
      setIsCollapsed(true);
      setActivePanel(null);
    }
  };

  // Determine visibility classes based on active panel
  // If we are mobile AND another panel is active, we hide this one visually but keep it mounted
  const visibilityClass = (isMobile && activePanel === 'bottom')
    ? 'opacity-0 pointer-events-none -z-10'
    : 'opacity-100 pointer-events-auto z-10';

  return (
    <div
      onClick={handleContainerClick}
      className={`absolute top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 w-auto ${isCollapsed ? 'bg-primary-700' : 'bg-gray-900/90'} backdrop-blur-sm rounded-lg shadow-xl border border-gray-700 transition-all duration-500 ease-in-out ${isCollapsed ? 'p-4' : 'p-6'} cursor-pointer md:cursor-default ${visibilityClass}`}
    >
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-bold text-white transition-all duration-300 ${isCollapsed ? 'm-0' : 'mb-4'}`}>Front Logo</h2>

        {/* Toggle Button - Only visible on mobile */}
        <button
          onClick={handleToggleClick}
          className="md:hidden p-2 text-gray-400 hover:text-white transition-colors z-20"
        >
          {isCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          )}
        </button>
      </div>

      <div className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'}`}>
        <div className="overflow-hidden min-h-0">
          <div className="pt-4 md:pt-0"> {/* Add padding to top of content when expanded to separate from header */}
            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 mb-4 transition-all ${isDragging
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-gray-600 bg-gray-800/50'
                }`}
            >
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-2"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-sm text-gray-300 mb-2">
                  Drag & drop image here
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  PNG, SVG, WebP (with transparency)
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-md text-sm transition-colors"
                >
                  Browse Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/svg+xml,image/webp"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>
            </div>

            {/* Clear Button */}
            <button
              onClick={() => onImageUpload(null, null)}
              className="w-full px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-md text-sm transition-colors mb-4"
            >
              Clear Logo
            </button>

            {/* Text Input */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Or Add Text
              </label>
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
                placeholder="Enter text..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={handleTextSubmit}
                className="w-full px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-md text-sm transition-colors"
              >
                Add Text
              </button>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}
