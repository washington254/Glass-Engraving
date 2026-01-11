import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { RGBELoader } from 'three-stdlib';

export function VanillaGlass({ isMobile }) {
    const { scene } = useGLTF('/glass1.glb');

    // Load HDR Equirect (using useLoader for React)
    const hdrEquirect = useLoader(RGBELoader, '/sky.hdr');
    hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;

    const options = {
        color: 0xffffff,
        metalness: 0,
        roughness: 0.2,
        transmission: 1,
        ior: 1.5,
        reflectivity: 0.5,
        thickness: 2.5,
        envMapIntensity: 1.5,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        opacity: 0.48,
    };

    const material = useMemo(() => {
        const mat = new THREE.MeshPhysicalMaterial({
            color: options.color,
            metalness: options.metalness,
            roughness: options.roughness,
            transmission: options.transmission,
            ior: options.ior,
            reflectivity: options.reflectivity,
            thickness: options.thickness,
            envMap: hdrEquirect,
            envMapIntensity: options.envMapIntensity,
            clearcoat: options.clearcoat,
            clearcoatRoughness: options.clearcoatRoughness,
            opacity: options.opacity,
            transparent: true,
        });
        return mat;
    }, [hdrEquirect]);

    const glassMesh = useMemo(() => {
        let foundGeometry = null;

        scene.traverse((node) => {
            if (foundGeometry) return;
            if (node.isMesh && node.geometry) {
                foundGeometry = node.geometry.clone();
            }
        });

        if (foundGeometry) {
            foundGeometry.rotateX(Math.PI / -2);
            foundGeometry.translate(0, -1, 0);

            const mesh = new THREE.Mesh(foundGeometry, material);

            if (isMobile) {
                mesh.scale.set(0.015, 0.015, 0.015);
                mesh.position.set(0, -0.7, 0);
            } else {
                mesh.scale.set(0.023, 0.023, 0.023);
                mesh.position.set(0, -1, 0);
            }

            return mesh;
        }
        return null;
    }, [scene, material, isMobile]);

    return (
        <>
            {glassMesh && <primitive object={glassMesh} />}
        </>
    );
}
