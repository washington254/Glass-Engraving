import React, { useState, useRef } from 'react';

export function StickerUI({ onImageUpload, onTextAdd }) {
  const [isDragging, setIsDragging] = useState(false);
  const [textInput, setTextInput] = useState('');
  const fileInputRef = useRef(null);

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
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      onTextAdd(textInput);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-10 bg-gray-900/90 backdrop-blur-sm p-6 rounded-lg shadow-xl border border-gray-700 w-80">
      <h2 className="text-xl font-bold text-white mb-4">Add Stickers</h2>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 mb-4 transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10'
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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
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
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleTextSubmit}
          className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition-colors"
        >
          Add Text Sticker
        </button>
      </div>

      {/* Quick Presets */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 mb-2">Quick Presets:</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onImageUpload('/heart-logo.svg', 'image/svg+xml')}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs transition-colors"
          >
            ❤️ Heart
          </button>
          <button
            onClick={() => onImageUpload('/star-logo.svg', 'image/svg+xml')}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs transition-colors"
          >
            ⭐ Star
          </button>
          <button
            onClick={() => onImageUpload('/roses.png', 'image/png')}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs transition-colors"
          >
            🐧 Tux
          </button>
          <button
            onClick={() => onImageUpload('/sample-logo.svg', 'image/svg+xml')}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs transition-colors"
          >
            📦 Sample
          </button>
        </div>
      </div>
    </div>
  );
}
