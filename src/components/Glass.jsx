

import { useEffect, useState, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useControls } from 'leva'
import EngravedHexagon from './EngravedHexagon'

function StickerPlane({ stickerUrl, textSticker, position, rotation, scale }) {
    const [texture, setTexture] = useState(null)
    
    // Leva controls for curve parameters
    const curveControls = useControls('Sticker Curve', {
        enabled: { value: true, label: 'Enable Curve' },
        radius: { value: 28, min: 10, max: 200, step: 1, label: 'Cylinder Radius' },
        strength: { value: .85, min: 0, max: 2, step: 0.01, label: 'Curve Strength' },
        segments: { value: 32, min: 8, max: 64, step: 1, label: 'Segments' },
        yRadius: { value: 423, min: 10, max: 500, step: 1, label: 'Y Curve Radius' },
        yStrength: { value: 2, min: 0, max: 2, step: 0.01, label: 'Y Curve Strength' }
    })
    
    useEffect(() => {
        if (textSticker) {
            // Create canvas texture for text
            const canvas = document.createElement('canvas')
            canvas.width = 512
            canvas.height = 512
            const ctx = canvas.getContext('2d')
            
            // Clear canvas with transparent background
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            
            // Draw text with white color
            ctx.fillStyle = '#ffffff'
            ctx.font = 'bold 80px Arial'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(textSticker, canvas.width / 2, canvas.height / 2)
            
            const canvasTexture = new THREE.CanvasTexture(canvas)
            canvasTexture.needsUpdate = true
            setTexture(canvasTexture)
        } else if (stickerUrl) {
            // Load image texture
            const loader = new THREE.TextureLoader()
            loader.load(
                stickerUrl,
                (loadedTexture) => {
                    setTexture(loadedTexture)
                },
                undefined,
                (error) => {
                    console.error('Error loading texture:', error)
                }
            )
        } else {
            setTexture(null)
        }
    }, [stickerUrl, textSticker])
    
    // Custom shader material for cylindrical curve
    const curvedMaterial = useMemo(() => {
        if (!texture) return null
        
        return new THREE.ShaderMaterial({
            uniforms: {
                map: { value: texture },
                radius: { value: curveControls.radius },
                strength: { value: curveControls.strength },
                enabled: { value: curveControls.enabled ? 1.0 : 0.0 },
                yRadius: { value: curveControls.yRadius },
                yStrength: { value: curveControls.yStrength }
            },
            vertexShader: `
                uniform float radius;
                uniform float strength;
                uniform float enabled;
                uniform float yRadius;
                uniform float yStrength;
                
                varying vec2 vUv;
                
                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    
                    if (enabled > 0.5) {
                        // Apply cylindrical curve along X axis
                        float angle = pos.x / radius * strength;
                        float newZ = -radius * (1.0 - cos(angle));
                        float newX = radius * sin(angle);
                        
                        pos.x = newX;
                        pos.z += newZ;
                        
                        // Apply slight curve along Y axis (top/bottom)
                        float yAngle = pos.y / yRadius * yStrength;
                        float yNewZ = -yRadius * (1.0 - cos(yAngle));
                        
                        pos.z += yNewZ;
                    }
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D map;
                varying vec2 vUv;
                
                void main() {
                    vec4 texColor = texture2D(map, vUv);
                    gl_FragColor = texColor;
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthTest: true,
            depthWrite: false
        })
    }, [texture, curveControls.radius, curveControls.strength, curveControls.enabled])
    
    // Update uniforms when controls change
    useEffect(() => {
        if (curvedMaterial) {
            curvedMaterial.uniforms.radius.value = curveControls.radius
            curvedMaterial.uniforms.strength.value = curveControls.strength
            curvedMaterial.uniforms.enabled.value = curveControls.enabled ? 1.0 : 0.0
            curvedMaterial.uniforms.yRadius.value = curveControls.yRadius
            curvedMaterial.uniforms.yStrength.value = curveControls.yStrength
            curvedMaterial.uniforms.map.value = texture
        }
    }, [curvedMaterial, curveControls, texture])
    
    if (!texture || !curvedMaterial) return null
    
    return (
        <mesh position={position} rotation={rotation} scale={scale}>
            {/* Plane with more segments for smooth curve */}
            <planeGeometry args={[30, 30, curveControls.segments, curveControls.segments]} />
            <primitive object={curvedMaterial} attach="material" />
        </mesh>
    )
}

export function Glass({ stickerUrl, stickerType, textSticker, bottomLogoUrl, ...props }) {
    const { nodes } = useGLTF('/cup.glb')

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
            {/* Replaced with EngravedHexagon */}
            <EngravedHexagon 
                logoUrl={bottomLogoUrl}
                position={[0., 40.25, -4.3]}
                rotation={[Math.PI / 2, 0, 0.82]}
                scale={3.1}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.front.geometry}
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
            
            {/* Sticker overlay plane - positioned on the front mesh */}
            <StickerPlane 
                stickerUrl={stickerUrl} 
                textSticker={textSticker}
                position={[-0.056, 76.985, 21.3]}
                rotation={[0.0, -0., 0.]}
                scale={[.9,0.7,0.9]}
            />
        </group>
    )
}

useGLTF.preload('/cup.glb')
