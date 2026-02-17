import React, { useState, useRef } from 'react';
import { useUIStore } from '../store';

export function BottomLogoUI({ onLogoUpload, onTextChange, currentText = '', cameraControls }) {
  const [isDragging, setIsDragging] = useState(false);
  const [textInput, setTextInput] = useState(currentText);
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
    onLogoUpload(url);
    // Clear text when logo is uploaded
    setTextInput('');
    onTextChange('');

    // Auto-collapse on mobile after successful upload
    if (isMobile) {
      setIsCollapsed(true);
      setActivePanel(null);
    }
  };

  const handleClear = () => {
    onLogoUpload(null);
    // Reset to empty text when clearing
    setTextInput('');
    onTextChange('');

    if (isMobile) {
      setIsCollapsed(true);
      setActivePanel(null);
    }
  };

  const handleAddText = () => {
    if (textInput.trim()) {
      onTextChange(textInput);
      // Clear logo when text is added
      onLogoUpload(null);

      if (isMobile) {
        setIsCollapsed(true);
        setActivePanel(null);
      }
    }
  };

  const handleContainerClick = () => {
    // Only expand if currently collapsed. Do not collapse if expanded (require arrow click).
    if (isCollapsed) {
      setIsCollapsed(false);
      setActivePanel('bottom');
    }
  };

  const handleToggleClick = (e) => {
    e.stopPropagation(); // Prevent container click
    if (isCollapsed) {
      setIsCollapsed(false);
      setActivePanel('bottom');
    } else {
      setIsCollapsed(true);
      setActivePanel(null);
    }
  };

  // Determine visibility classes based on active panel
  // If we are mobile AND another panel is active, we hide this one visually but keep it mounted
  const visibilityClass = (isMobile && activePanel === 'sticker')
    ? 'opacity-0 pointer-events-none -z-10'
    : 'opacity-100 pointer-events-auto z-40';

  return (
    <div
      onClick={handleContainerClick}
      style={{padding: '12px 16px'}}
      className={`absolute bottom-4 left-4 right-4 md:top-4 md:left-4 md:bottom-auto md:w-80 md:translate-x-0 w-auto max-h-[100dvh] md:max-h-[94dvh] overflow-hidden ${isCollapsed ? 'bg-primary-700' : 'bg-gray-900/90'} backdrop-blur-sm ${isCollapsed ? 'rounded-2xl' : 'rounded-lg'} shadow-xl border border-gray-700 transition-all duration-500 ease-in-out  cursor-pointer md:cursor-default ${visibilityClass}`}
    >
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-bold text-white transition-all duration-300 ${isCollapsed ? 'm-0' : 'mb-4'}`}>Debossed Base Logo</h2>

        {/* Toggle Button - Only visible on mobile */}
        <button
          onClick={handleToggleClick}
          className="md:hidden p-2 text-gray-400 hover:text-white transition-colors z-20"
        >
          {isCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
              className={`rounded-lg mb-4 transition-all ${isDragging
                ? 'border-2 border-dashed border-primary-500 bg-primary-500/10 p-8'
                : 'md:border-2 md:border-dashed border-transparent md:border-gray-600 bg-transparent md:bg-gray-800/50 p-0 md:p-8'
                }`}
            >
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-2 hidden md:block"
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
                <p className="text-sm text-gray-300 mb-2 hidden md:block">
                  Drag & drop logo here
                </p>
                <p className="text-xs text-gray-500 mb-3 hidden md:block">
                  Optimize logo with logo optimizer
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full md:w-auto px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-md text-sm transition-colors"
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
              onClick={handleClear}
              className="w-full px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-md text-sm transition-colors"
            >
              Clear Logo
            </button>

            {/* View Button */}
            <button
              onClick={() => {
                if (cameraControls && cameraControls.animateCamera) {
                  const isMobile = cameraControls.isMobileDevice();

                  const desktopPos = { x: 1.5728234078313186e-9, y: -4.999999999999391, z: -0.0000024799674587004305 };
                  const desktopRot = { x: 1.5707968227671396, y: 3.1455138493896584e-10, z: -1.5701755915298454 };

                  const mobilePos = { x: -1.991051796165045e-8, y: -6, z: -5.908035291009069e-10 };
                  const mobileRot = { x: 1.5707963268933638, y: -3.3184195391555704e-9, z: -1.551086097017832 };

                  if (isMobile) {
                    cameraControls.animateCamera(mobilePos, mobileRot);
                    setIsCollapsed(true);
                    setActivePanel(null);
                  } else {
                    cameraControls.animateCamera(desktopPos, desktopRot);
                  }
                }
              }}
              className="w-full px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-md text-sm transition-colors mt-4"
            >
              View Point
            </button>



            {/* Text Input Section */}
            <div className="mt-4 pb-2">
              <label className="block text-sm text-gray-300 mb-2">
                Or Add Text
              </label>
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddText()}
                placeholder="Enter text..."
                className="w-full px-3 py-2 mb-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm mb-2"
              />
              <button
                onClick={handleAddText}
                className="w-full px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-md text-sm transition-colors"
              >
                Add Text
              </button>
            </div>

            {/* Preset Images */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Or Choose a Preset
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['1B.webp', '2B.webp', '3B.webp', '4B.webp'].map((preset, index) => (
                  <button
                    key={preset}
                    onClick={() => {
                      onLogoUpload(`/${preset}`);
                      // Clear text when preset is selected
                      setTextInput('');
                      onTextChange('');
                      // Auto-collapse on mobile after preset selection
                      if (isMobile) {
                        setIsCollapsed(true);
                        setActivePanel(null);
                      }
                    }}
                    className={`aspect-square rounded-lg overflow-hidden border-2 border-gray-600 hover:border-primary-500 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 ${index === 0 ? 'bg-white' : ''}`}
                  >
                    <img
                      src={`/${preset}`}
                      alt={`Preset ${preset.replace('.webp', '')}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
