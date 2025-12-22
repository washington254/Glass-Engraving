import { create } from 'zustand';

export const useMaterialStore = create((set) => ({
  // Performance mode: 'fast' | 'balanced' | 'quality'
  performanceMode: 'balanced',
  
  // MeshTransmissionMaterial properties (optimized for performance)
  materialProps: {
    backside: true,
    samples: 16, // Reduced from 16 for better performance
    resolution:512, // Reduced from 512 for better performance
    transmission: 0.95,
    roughness: 0.1,
    thickness: 0.5,
    ior: 1.5,
    chromaticAberration: 0.05,
    anisotropy: 0.3,
    distortion: 0.1,
    distortionScale: 0.2,
    temporalDistortion: 0.1,
    clearcoat: 1,
    attenuationDistance: 0.5,
    attenuationColor: '#ffffff',
    color: '#ffffff',
  },
  
  // Set performance mode
  setPerformanceMode: (mode) => set({ performanceMode: mode }),
  
  // Update individual property
  updateMaterialProp: (key, value) =>
    set((state) => ({
      materialProps: {
        ...state.materialProps,
        [key]: value,
      },
    })),
  
  // Update multiple properties at once
  updateMaterialProps: (props) =>
    set((state) => ({
      materialProps: {
        ...state.materialProps,
        ...props,
      },
    })),
  
  // Reset to defaults
  resetMaterialProps: () =>
    set({
      materialProps: {
        backside: true,
        samples: 4,
        resolution: 256,
        transmission: 0.95,
        roughness: 0.1,
        thickness: 0.5,
        ior: 1.5,
        chromaticAberration: 0.05,
        anisotropy: 0.3,
        distortion: 0.1,
        distortionScale: 0.2,
        temporalDistortion: 0.1,
        clearcoat: 1,
        attenuationDistance: 0.5,
        attenuationColor: '#ffffff',
        color: '#ffffff',
      },
    }),
}));
