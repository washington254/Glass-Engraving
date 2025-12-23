import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Glass } from './components/Glass';
import { StickerUI } from './components/StickerUI';
import { BottomLogoUI } from './components/BottomLogoUI';
import EngravedCylinder from './components/EngravedCylinder';

function App() {
  const [stickerUrl, setStickerUrl] = useState('/tux.png');
  const [stickerType, setStickerType] = useState(null);
  const [textSticker, setTextSticker] = useState('');
  const [bottomLogoUrl, setBottomLogoUrl] = useState(null);
  const [cylinderLogoUrl, setCylinderLogoUrl] = useState('/star-logo.svg');
  const [cylinderText, setCylinderText] = useState('HELLO');

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

  const handleCylinderLogoUpload = (url) => {
    setCylinderLogoUrl(url);
  };

  return (
    <>
      <div className="relative w-full h-screen bg-dark">
   
        
        <BottomLogoUI 
          onLogoUpload={handleCylinderLogoUpload}
          onTextChange={setCylinderText}
          currentText={cylinderText}
        />

        <StickerUI 
          onImageUpload={handleImageUpload}
          onTextAdd={handleTextAdd}
        />

        <Canvas shadows camera={{ position: [0, 2, 8], fov: 50 }}>
          <OrbitControls enableDamping dampingFactor={0.05} />

          {/* Lighting */}
          <ambientLight intensity={0.8} />
          <spotLight position={[5, 5, 5]} intensity={1} castShadow />
          <spotLight position={[-5, 5, 5]} intensity={0.5} />

          {/* Environment for reflections - using HDR */}
          <Environment files="/sky.hdr" />
          
          {/* <EngravedCylinder 
            text={cylinderText}
            logoUrl={cylinderLogoUrl}
            position={[0, 0, 0]}
          /> */}

          <Glass 
            scale={0.08} 
            position={[0, -5, 0]}
            stickerUrl={stickerUrl}
            stickerType={stickerType}
            textSticker={textSticker}
            bottomLogoUrl={bottomLogoUrl}
          />
        </Canvas>
      </div>
    </>
  );
}

export default App;
