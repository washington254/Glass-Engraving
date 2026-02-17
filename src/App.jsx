import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Environment } from '@react-three/drei';
import { VanillaScene } from './components/VanillaScene';
// import { VanillaGlass } from './components/VanillaGlass';
// import { Glass } from './components/Glass';
import { StickerUI } from './components/StickerUI';
import { BottomLogoUI } from './components/BottomLogoUI';
import { LoadingScreen } from './components/LoadingScreen';

import { Leva } from 'leva';

function App() {
  const [stickerUrl, setStickerUrl] = useState('/logo.webp');
  const [stickerType, setStickerType] = useState(null);
  const [textSticker, setTextSticker] = useState('');
  const [bottomLogoUrl, setBottomLogoUrl] = useState('/4B.webp');
  const [bottomText, setBottomText] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cameraControls, setCameraControls] = useState(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Listener
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleImageUpload = (url, type) => {
    setStickerUrl(url);
    setStickerType(type);
    setTextSticker(''); // Clear text when image is uploaded
  };

  const handleTextAdd = (text) => {
    setTextSticker(text);
    setStickerUrl(null); // Clear image when text is added
  };

  const handleBottomLogoUpload = (url) => {
    setBottomLogoUrl(url);
  };

  const handleBottomTextChange = (text) => {
    setBottomText(text);
  };

  // Handle drag and drop directly on 3D planes
  const handleFrontStickerDrop = (url, type) => {
    setStickerUrl(url);
    setStickerType(type);
    setTextSticker(''); // Clear text when image is dropped
  };

  const handleBottomLogoDrop = (url, type) => {
    setBottomLogoUrl(url);
    setBottomText(''); // Clear text when image is dropped
  };

  const handleLoaded = () => {
    // Add a small delay for smoother transition
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const handleCameraReady = (controls) => {
    setCameraControls(controls);
  };

  return (
    <>
      <Leva hidden />
      <div className="relative w-full h-dvh overflow-hidden bg-dark">

        {/* Title */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20">
          <h1 className="text-xl md:text-2xl no-wrap font-bold text-white">
            Flagship Tumbler
          </h1>
        </div>

        <BottomLogoUI
          onLogoUpload={handleBottomLogoUpload}
          onTextChange={handleBottomTextChange}
          currentText={bottomText}
          cameraControls={cameraControls}
        />

        <StickerUI
          onImageUpload={handleImageUpload}
          onTextAdd={handleTextAdd}
          cameraControls={cameraControls}
        />

        <LoadingScreen isLoading={isLoading} />

        <div className="hidden md:block absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-gray-900/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700">
          <p className="text-sm text-gray-300 text-center">
            💡 <span className="font-semibold">Tip:</span> Drag Image directly onto the bottom Logo to apply it!
          </p>
        </div>

        {/* Mobile Scroll Zones - Block touch events to allow parent iframe scrolling */}
        {isMobile && (
          <>
            {/* Top zone - 0-20% height */}
            <div 
              className="md:hidden absolute top-0 left-0 right-0 pointer-events-auto"
              style={{ 
                height: '20vh',
                zIndex: 9999,
                backgroundColor: 'rgba(255, 0, 0, 0.5)',
                touchAction: 'auto'
              }}
            />
            
            {/* Bottom zone - 80-100% height */}
            <div 
              className="md:hidden absolute bottom-0 left-0 right-0 pointer-events-auto"
              style={{ 
                height: '20vh',
                zIndex: 9999,
                backgroundColor: 'rgba(255, 0, 0, 0.5)',
                touchAction: 'auto'
              }}
            />
            
            {/* Left zone - 0-15% width, middle 60% height */}
            <div 
              className="md:hidden absolute left-0 pointer-events-auto"
              style={{ 
                top: '20vh',
                height: '60vh',
                width: '15vw',
                zIndex: 9999,
                backgroundColor: 'rgba(255, 0, 0, 0.5)',
                touchAction: 'auto'
              }}
            />
            
            {/* Right zone - 85-100% width, middle 60% height */}
            <div 
              className="md:hidden absolute right-0 pointer-events-auto"
              style={{ 
                top: '20vh',
                height: '60vh',
                width: '15vw',
                zIndex: 9999,
                backgroundColor: 'rgba(255, 0, 0, 0.5)',
                touchAction: 'auto'
              }}
            />
          </>
        )}

        <VanillaScene
          stickerUrl={stickerUrl}
          textSticker={textSticker}
          bottomLogoUrl={bottomLogoUrl}
          bottomText={bottomText}
          onFrontStickerDrop={handleFrontStickerDrop}
          onBottomLogoDrop={handleBottomLogoDrop}
          onLoaded={handleLoaded}
          onCameraReady={handleCameraReady}
        />
        {/* <Canvas
          shadows
          dpr={[1, 2]}
          gl={{
            shadowMap: { enabled: true, type: THREE.PCFShadowMap },
            toneMapping: THREE.ReinhardToneMapping,
            toneMappingExposure: 1.5,
            outputColorSpace: THREE.SRGBColorSpace,
          }}
          camera={{ position: [5, 0, -0.05], fov: 35 }}
        >
          <OrbitControls 
            enableDamping 
            dampingFactor={0.05} 
            enableZoom={false}
            enablePan={false}
            rotateSpeed={0.8}
            mouseButtons={{
                LEFT: THREE.MOUSE.ROTATE,
                MIDDLE: THREE.MOUSE.ROTATE,
                RIGHT: THREE.MOUSE.ROTATE
            }}
          />



          // Environment for reflections - using HDR
          <Environment files="/sky.hdr" />

          // <Glass
          //   scale={0.08}
          //   position={[0, -5, 0]}
          //   stickerUrl={stickerUrl}
          //   stickerType={stickerType}
          //   textSticker={textSticker}
          //   bottomLogoUrl={bottomLogoUrl}
          //   bottomText={bottomText}
          //   onFrontStickerDrop={handleFrontStickerDrop}
          //   onBottomLogoDrop={handleBottomLogoDrop}
          // />
          <VanillaGlass isMobile={isMobile} />
        </Canvas> */}
      </div>
    </>
  );
}

export default App;
