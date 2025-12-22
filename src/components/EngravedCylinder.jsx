import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import { Html, MeshTransmissionMaterial } from '@react-three/drei';
import Potrace from 'potrace';

const EngravedCylinder = ({ text = 'HELLO', logoUrl = null, position = [0, 0, 0] }) => {
  const meshRef = useRef();
  const [font, setFont] = useState(null);
  const [geometry, setGeometry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load font on mount
  useEffect(() => {
    const loader = new FontLoader();
    loader.load(
      'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
      (loadedFont) => {
        setFont(loadedFont);
        setIsLoading(false);
      },
      undefined,
      (error) => {
        console.error('Font loading error:', error);
        setIsLoading(false);
      }
    );
  }, []);

  // Create geometry from SVG or image
  const createLogoGeometry = async (url) => {
    if (!url) return null;

    try {
      // Check if SVG
      if (url.toLowerCase().endsWith('.svg')) {
        const loader = new SVGLoader();
        return new Promise((resolve, reject) => {
          loader.load(
            url,
            (data) => {
              const paths = data.paths;
              const group = new THREE.Group();

              paths.forEach((path) => {
                const shapes = SVGLoader.createShapes(path);
                shapes.forEach((shape) => {
                  const geometry = new THREE.ExtrudeGeometry(shape, {
                    depth: 0.3,
                    bevelEnabled: true,
                  });
                  group.add(new THREE.Mesh(geometry));
                });
              });

              // Merge all geometries
              const geometries = [];
              group.children.forEach((child) => {
                geometries.push(child.geometry);
              });

              if (geometries.length > 0) {
                const merged = BufferGeometryUtils.mergeGeometries(geometries);
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
        // Handle PNG/JPG - convert to SVG using Potrace, then process as SVG
        return new Promise((resolve, reject) => {
          // Fetch the image as a blob
          fetch(url)
            .then(response => response.blob())
            .then(blob => {
              // Convert blob to buffer for Potrace
              const reader = new FileReader();
              reader.onload = () => {
                const buffer = Buffer.from(reader.result);
                
                // Trace the image to SVG
                Potrace.trace(buffer, {
                  threshold: 128,
                  optTolerance: 0.2,
                  turdSize: 2,
                  turnPolicy: Potrace.TURNPOLICY_MINORITY,
                  color: 'black',
                  background: 'transparent'
                }, (err, svg) => {
                  if (err) {
                    reject(err);
                    return;
                  }

                  console.log('PNG converted to SVG using Potrace');

                  // Parse the SVG string using SVGLoader
                  const loader = new SVGLoader();
                  const svgData = loader.parse(svg);
                  const paths = svgData.paths;
                  const group = new THREE.Group();

                  paths.forEach((path) => {
                    const shapes = SVGLoader.createShapes(path);
                    shapes.forEach((shape) => {
                      const geometry = new THREE.ExtrudeGeometry(shape, {
                        depth: 0.3,
                        bevelEnabled: true,
                      });
                      group.add(new THREE.Mesh(geometry));
                    });
                  });

                  // Merge all geometries
                  const geometries = [];
                  group.children.forEach((child) => {
                    geometries.push(child.geometry);
                  });

                  if (geometries.length > 0) {
                    const merged = BufferGeometryUtils.mergeGeometries(geometries);
                    resolve(merged);
                  } else {
                    reject(new Error('No geometries found in traced SVG'));
                  }
                });
              };
              reader.onerror = reject;
              reader.readAsArrayBuffer(blob);
            })
            .catch(reject);
        });
      }
    } catch (error) {
      console.error('Logo loading error:', error);
      return null;
    }
  };

  // Create engraved geometry when font, text, or logo changes
  useEffect(() => {
    const generateGeometry = async () => {
      if (!font && !logoUrl) return;

      try {
        // Create hexagonal prism (6 sides instead of 128 for cylinder)
        // Scaled down to 0.7 of original size
        const hexagonGeometry = new THREE.CylinderGeometry(2.1, 2.1, 1.4, 6);
        const hexagonBrush = new Brush(hexagonGeometry);
        hexagonBrush.updateMatrixWorld();

        let engravingGeometry = null;

        // Use logo if provided, otherwise use text
        if (logoUrl) {
          engravingGeometry = await createLogoGeometry(logoUrl);
        } else if (font && text) {
          // Create text geometry
          engravingGeometry = new TextGeometry(text, {
            font: font,
            size: 0.5,
            height: 0.4,
            curveSegments: 12,
            bevelEnabled: false,
          });
        }

        if (!engravingGeometry) {
          setGeometry(hexagonGeometry);
          return;
        }

        // Center and position engraving on bottom face of hexagon
        engravingGeometry.computeBoundingBox();
        const box = engravingGeometry.boundingBox;
        const centerX = (box.max.x + box.min.x) / 2;
        const centerY = (box.max.y + box.min.y) / 2;
        
        // Scale down logo (smaller size for better appearance)
        const width = box.max.x - box.min.x;
        const height = box.max.y - box.min.y;
        const maxSize = logoUrl ? 1.5 : 3; // Smaller for logos, larger for text
        const scale = Math.min(maxSize / width, maxSize / height, 1);
        
        // Center the geometry
        engravingGeometry.translate(-centerX, -centerY, 0);
        // Flip Y-axis for logos
        engravingGeometry.scale(scale, -scale, 1);
        
        // Rotate 90 degrees to lay flat on bottom face
        engravingGeometry.rotateX(Math.PI / 2);
        
        // Position at bottom of hexagon (y = -0.7 since height is 1.4)
        engravingGeometry.translate(0, -0.7, 0);

        const engravingBrush = new Brush(engravingGeometry);
        engravingBrush.updateMatrixWorld();

        // Perform CSG subtraction
        const evaluator = new Evaluator();
        const result = evaluator.evaluate(hexagonBrush, engravingBrush, SUBTRACTION);

        // Clean up old geometry
        if (geometry) {
          geometry.dispose();
        }

        setGeometry(result.geometry);
      } catch (error) {
        console.error('CSG operation failed:', error);
        // Fallback to plain hexagon
        setGeometry(new THREE.CylinderGeometry(2.1, 2.1, 1.4, 6));
      }
    };

    generateGeometry();
  }, [font, text, logoUrl]);



  if (isLoading) {
    return (
      <Html center>
        <div style={{ color: 'white', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '5px' }}>
          Loading font...
        </div>
      </Html>
    );
  }

  if (!geometry) {
    return null;
  }

  return (
    <mesh ref={meshRef} position={position} geometry={geometry} castShadow>
      <MeshTransmissionMaterial
        backside
        samples={16}
        resolution={512}
        transmission={0.95}
        roughness={0.1}
        thickness={0.5}
        ior={1.5}
        chromaticAberration={0.05}
        anisotropy={0.3}
        distortion={0.1}
        distortionScale={0.2}
        temporalDistortion={0.1}
        clearcoat={1}
        attenuationDistance={0.5}
        attenuationColor="#ffffff"
        color="#ffffff"
      />
    </mesh>
  );
};

export default EngravedCylinder;
