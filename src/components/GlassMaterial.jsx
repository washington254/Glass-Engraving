

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
        color="#232323"
        {...props}
      />
    )
  }

  if (mode === 'quality') {
    // Physical material - best quality, matches legacy project
    return (
      <meshPhysicalMaterial
        color={0xffffff}
        metalness={0}
        roughness={0.2}
        transmission={1}
        ior={1.5}
        reflectivity={0.5}
        thickness={2.5}
        envMapIntensity={1.5}
        clearcoat={1}
        clearcoatRoughness={0.1}
        opacity={0.48}
        transparent={true}
        {...props}
      />
    )
  }

  return null
}
