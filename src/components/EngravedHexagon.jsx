import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import { Html } from '@react-three/drei';
import { useControls } from 'leva';

const EngravedHexagon = ({ logoUrl = null, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) => {
  const meshRef = useRef();
  const logoMeshRef = useRef();
  const [logoGeometry, setLogoGeometry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Leva controls for logo adjustment
  const logoControls = useControls('Hexagon Logo', {
    logoScale: { value: 0.015, min: 0.001, max: 0.05, step: 0.001, label: 'Logo Scale' },
    logoDepth: { value: 0.01, min: -0.1, max: 0.1, step: 0.001, label: 'Logo Depth' },
    logoRotation: { value: 0, min: -Math.PI, max: Math.PI, step: 0.1, label: 'Logo Rotation' }
  });

  // Create hexagon geometry
  const createHexagonGeometry = () => {
    const shape = new THREE.Shape();
    const radius = 3;
    
    // Create hexagon shape
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      
      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }
    shape.closePath();

    // Extrude the hexagon to give it thickness
    const extrudeSettings = {
      depth: 0.5,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 3
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  };

  // Load SVG logo geometry
  const loadLogoGeometry = async (url) => {
    if (!url) return null;

    try {
      if (url.toLowerCase().endsWith('.svg')) {
        const loader = new SVGLoader();
        return new Promise((resolve, reject) => {
          loader.load(
            url,
            (data) => {
              const paths = data.paths;
              const geometries = [];

              paths.forEach((path) => {
                const shapes = SVGLoader.createShapes(path);
                shapes.forEach((shape) => {
                  const geometry = new THREE.ExtrudeGeometry(shape, {
                    depth: 2,
                    bevelEnabled: false,
                  });
                  geometries.push(geometry);
                });
              });

              if (geometries.length > 0) {
                const merged = BufferGeometryUtils.mergeGeometries(geometries);
                
                // Center the geometry
                merged.computeBoundingBox();
                const box = merged.boundingBox;
                const centerX = (box.max.x + box.min.x) / 2;
                const centerY = (box.max.y + box.min.y) / 2;
                merged.translate(-centerX, -centerY, 0);
                
                resolve(merged);
              } else {
                reject(new Error('No geometries found in SVG'));
              }
            },
            undefined,
            reject
          );
        });
      } else {
        // For PNG/JPG, use a texture instead
        return null;
      }
    } catch (error) {
      console.error('Logo loading error:', error);
      return null;
    }
  };

  // Load logo when URL changes
  useEffect(() => {
    const loadLogo = async () => {
      if (!logoUrl) {
        setLogoGeometry(null);
        return;
      }

      setIsLoading(true);
      try {
        const geometry = await loadLogoGeometry(logoUrl);
        setLogoGeometry(geometry);
      } catch (error) {
        console.error('Failed to load logo:', error);
        setLogoGeometry(null);
      }
      setIsLoading(false);
    };

    loadLogo();
  }, [logoUrl]);

  // Create hexagon geometry
  const hexagonGeometry = createHexagonGeometry();

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Base hexagon */}
      <mesh ref={meshRef} geometry={hexagonGeometry} castShadow receiveShadow>
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>
      
      {/* Logo on top of hexagon */}
      {logoGeometry && (
        <mesh 
          ref={logoMeshRef}
          geometry={logoGeometry}
          position={[0, 0, 0.25 + logoControls.logoDepth]}
          rotation={[0, 0, logoControls.logoRotation]}
          scale={[logoControls.logoScale, -logoControls.logoScale, 1]}
        >
          <meshStandardMaterial 
            color="#ffffff" 
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      )}
      
      {isLoading && (
        <Html center>
          <div style={{ color: 'white', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '5px' }}>
            Loading logo...
          </div>
        </Html>
      )}
    </group>
  );
};

export default EngravedHexagon;
