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
  const [stickerUrl, setStickerUrl] = useState('/roses.png');
  const [stickerType, setStickerType] = useState(null);
  const [textSticker, setTextSticker] = useState('');
  const [bottomLogoUrl, setBottomLogoUrl] = useState('/rose.svg');
  const [bottomText, setBottomText] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <>
      <Leva hidden />
      <div className="relative w-full h-dvh bg-dark">


        <BottomLogoUI
          onLogoUpload={handleBottomLogoUpload}
          onTextChange={handleBottomTextChange}
          currentText={bottomText}
        />

        <StickerUI
          onImageUpload={handleImageUpload}
          onTextAdd={handleTextAdd}
        />

        <LoadingScreen isLoading={isLoading} />

        <div className="hidden md:block absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-gray-900/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700">
          <p className="text-sm text-gray-300 text-center">
            💡 <span className="font-semibold">Tip:</span> Drag Image directly onto the bottom Logo to apply it!
          </p>
        </div>

        <VanillaScene
          stickerUrl={stickerUrl}
          textSticker={textSticker}
          bottomLogoUrl={bottomLogoUrl}
          bottomText={bottomText}
          onFrontStickerDrop={handleFrontStickerDrop}
          onBottomLogoDrop={handleBottomLogoDrop}
          onLoaded={handleLoaded}
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
