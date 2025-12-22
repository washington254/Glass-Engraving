import { MeshTransmissionMaterial } from '@react-three/drei'

/**
 * Glass material component with multiple performance modes
 * @param {string} mode - 'fast' | 'balanced' | 'quality'
 * @param {object} props - Additional material properties
 */
export function GlassMaterial({ mode = 'fast', ...props }) {
  
  if (mode === 'fast') {
    // Standard material - best performance
    return (
      <meshStandardMaterial
        color="#ffffff"
        {...props}
      />
    )
  }
  
  if (mode === 'balanced') {
    // Physical material - good balance of quality and performance
    return (
       <meshStandardMaterial
        color="#ffffff"
        {...props}
      />
    )
  }
  
  if (mode === 'quality') {
    // Transmission material - best quality, worst performance
    return (
      <MeshTransmissionMaterial
        samples={3}
        resolution={256}
        transmission={0.9}
        roughness={0.1}
        thickness={0.5}
        ior={1.5}
        chromaticAberration={0.02}
        anisotropy={0.1}
        distortion={0}
        distortionScale={0}
        temporalDistortion={0}
        clearcoat={0}
        attenuationDistance={0.5}
        attenuationColor="#ffffff"
        color="#ffffff"
        backside={false}
        {...props}
      />
    )
  }
  
  return null
}
