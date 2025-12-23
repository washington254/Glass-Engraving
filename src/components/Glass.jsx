

import { useEffect, useState, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useControls } from 'leva'
import { useMaterialStore } from '../store'
import { GlassMaterial } from './GlassMaterial'

function StickerPlane({ stickerUrl, textSticker, position, rotation, scale, curveSettings = null }) {
    const [texture, setTexture] = useState(null)
    
    // Use provided curve settings or defaults (no curve)
    const curveParams = curveSettings || {
        enabled: false,
        radius: 28,
        strength: 0.85,
        segments: 24,
        yRadius: 423,
        yStrength: 2
    }
    
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
        
        // Cleanup old texture
        return () => {
            if (texture) {
                texture.dispose()
            }
        }
    }, [stickerUrl, textSticker])
    
    // Create shader material only once, update uniforms separately
    const curvedMaterial = useMemo(() => {
        if (!texture) return null
        
        return new THREE.ShaderMaterial({
            uniforms: {
                map: { value: texture },
                radius: { value: curveParams.radius },
                strength: { value: curveParams.strength },
                enabled: { value: curveParams.enabled ? 1.0 : 0.0 },
                yRadius: { value: curveParams.yRadius },
                yStrength: { value: curveParams.yStrength }
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
    }, [texture, curveParams]) // Recreate when texture or curve params change
    
    // Memoize geometry to prevent recreation on every render
    const planeGeom = useMemo(() => {
        return new THREE.PlaneGeometry(30, 30, curveParams.segments, curveParams.segments)
    }, [curveParams.segments])
    
    // Cleanup
    useEffect(() => {
        return () => {
            if (curvedMaterial) {
                curvedMaterial.dispose()
            }
            if (planeGeom) {
                planeGeom.dispose()
            }
        }
    }, [curvedMaterial, planeGeom])
    
    if (!texture || !curvedMaterial) return null
    
    return (
        <mesh position={position} rotation={rotation} scale={scale} geometry={planeGeom}>
            <primitive object={curvedMaterial} attach="material" />
        </mesh>
    )
}

function PentagonalPlane({ position, rotation, scale }) {
    const performanceMode = useMaterialStore((state) => state.performanceMode)
    
    const pentagonGeometry = useMemo(() => {
        const shape = new THREE.Shape()
        const sides = 5
        const radius = 1
        
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2 - Math.PI / 2
            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius
            
            if (i === 0) {
                shape.moveTo(x, y)
            } else {
                shape.lineTo(x, y)
            }
        }
        shape.closePath()
        
        return new THREE.ShapeGeometry(shape)
    }, [])
    
    useEffect(() => {
        return () => {
            pentagonGeometry.dispose()
        }
    }, [pentagonGeometry])
    
    return (
        <mesh
            castShadow
            receiveShadow
            geometry={pentagonGeometry}
            position={position}
            rotation={rotation}
            scale={scale}
        >
            <GlassMaterial mode={performanceMode} />
        </mesh>
    )
}

export function Glass({ stickerUrl = '/tux.png', stickerType, textSticker, bottomLogoUrl, ...props }) {
    const { nodes } = useGLTF('/cup2.glb')
    const performanceMode = useMaterialStore((state) => state.performanceMode)
    
    // Leva controls for bottom sticker plane
    const bottomStickerControls = useControls('Bottom Sticker', {
        positionX: { value: 0, min: -10, max: 100, step: 0.01, label: 'Position X' },
        positionY: { value: 0, min: -10, max: 100, step: 0.01, label: 'Position Y' },
        positionZ: { value: 0, min: -10, max: 100, step: 0.01, label: 'Position Z' },
        rotationX: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01, label: 'Rotation X' },
        rotationY: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01, label: 'Rotation Y' },
        rotationZ: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01, label: 'Rotation Z' },
        scale: { value: 1, min: 0.1, max: 50, step: 0.1, label: 'Scale ' },
    })
    
    // Curve settings for front sticker (hardcoded values from your alignment)
    const frontCurveSettings = {
        enabled: true,
        radius: 28,
        strength: 0.85,
        segments: 24,
        yRadius: 423,
        yStrength: 2
    }
    
    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.front.geometry}
                position={[0.056, 3.985, -4.559]}
                rotation={[0, 0.424, 0]}
                scale={0.064}
            >
              <GlassMaterial mode={performanceMode} />
            </mesh>
       
            {/* Front sticker overlay plane - curved to match glass */}
            <StickerPlane 
                stickerUrl={stickerUrl} 
                textSticker={textSticker}
                position={[-0.056, 76.985, 21.3]}
                rotation={[0.0, -0., 0.]}
                scale={[.9, 0.7, 0.9]}
                curveSettings={frontCurveSettings}
            />
            
            {/* Pentagonal plane with glass material - using your aligned values */}
            <PentagonalPlane 
                position={[-0.5, 39.5, -4.1]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={12.9}
            />
            
            {/* Bottom sticker plane - flat, positioned on pentagon */}
            <StickerPlane 
                stickerUrl={stickerUrl} 
                textSticker={null}
                position={[
                    0,
                    39.4,
                    -4.1
                ]}
                rotation={[
                    Math.PI / 2,
                   0,
                  0
                ]}
                scale={.6}
                curveSettings={null}
            />
        </group>
    )
}

useGLTF.preload('/cup2.glb')
