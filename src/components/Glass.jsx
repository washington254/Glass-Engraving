

import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export function Glass(props) {
    const { nodes, materials } = useGLTF('/cup.glb')
    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.body.geometry}
                position={[0.056, 3.985, -4.559]}
                rotation={[0, 0.424, 0]}
                scale={0.064}
            >
                <meshPhysicalMaterial
                    transmission={1}
                    roughness={0}
                    thickness={0.5}
                    ior={1.5}
                    clearcoat={1}
                    color="#ffffff"
                />
            </mesh>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.bottom.geometry}
                position={[0.056, 3.985, -4.559]}
                rotation={[0, 0.294, 0]}
                scale={0.064}
            >
                <meshStandardMaterial color="#ff6b6b" />
            </mesh>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.front.geometry}
                position={[0.056, 3.985, -4.559]}
                rotation={[0, 0.424, 0]}
                scale={0.064}
            >
                <meshStandardMaterial color="#4ecdc4" />
            </mesh>
        </group>
    )
}

useGLTF.preload('/cup.glb')
