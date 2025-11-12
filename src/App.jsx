import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { useControls, button } from 'leva';

import EngravedCylinder from './components/EngravedCylinder';

function App() {
  const [logoUrl, setLogoUrl] = useState(null);

  const { text, mode } = useControls('Engraving', {
    mode: {
      value: 'logo',
      options: ['text', 'logo'],
      label: 'Engraving Mode',
    },
    text: {
      value: 'HELLO',
      label: 'Text to Engrave',
      render: (get) => get('Engraving.mode') === 'text',
    },
    'Heart Logo': button(() => {
      setLogoUrl('/heart-logo.svg');
    }),
    'Star Logo': button(() => {
      setLogoUrl('/star-logo.svg');
    }),
    'Sample Logo': button(() => {
      setLogoUrl('/sample-logo.svg');
    }),
    'Tux PNG': button(() => {
      setLogoUrl('/tux.png');
    }),
    'Upload Custom': button(() => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.svg,.png,.jpg,.jpeg';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const url = URL.createObjectURL(file);
          setLogoUrl(url);
        }
      };
      input.click();
    }),
    'Clear Logo': button(() => {
      setLogoUrl(null);
    }),
  });

  return (
    <>
      <div className="relative w-full h-screen">
        <h1 className="absolute top-10 left-1/2 transform -translate-x-1/2 text-2xl z-10 font-bold text-gray-100">
          3D Glass Engraving Demo
        </h1>

        <p className="absolute top-20 left-1/2 -translate-x-1/2 text-lg text-gray-400 max-w-md text-center">
          CSG-based text & logo engraving on glass cylinder using React Three Fiber
        </p>

        {logoUrl && (
          <div className="absolute top-36 left-1/2 -translate-x-1/2 text-sm text-green-400">
            Logo loaded ✓
          </div>
        )}

        <Canvas shadows camera={{ position: [0, 2, 8], fov: 50 }}>
          <OrbitControls enableDamping dampingFactor={0.05} />

          {/* Lighting */}
          <ambientLight intensity={0.8} />
          <spotLight position={[5, 5, 5]} intensity={1} castShadow />
          <spotLight position={[-5, 5, 5]} intensity={0.5} />

          {/* Environment for reflections */}
          <Environment preset="city" />

          {/* Engraved Cylinder */}
          <EngravedCylinder
            text={mode === 'text' ? text : ''}
            logoUrl={mode === 'logo' ? logoUrl : null}
            position={[0, 0, 0]}
          />
        </Canvas>
      </div>
    </>
  );
}

export default App;
