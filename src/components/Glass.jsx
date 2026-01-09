

import { useEffect, useState, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useControls } from 'leva'
import { useMaterialStore } from '../store'
import { GlassMaterial } from './GlassMaterial'
import { useThree } from '@react-three/fiber'

function StickerPlane({
    stickerUrl,
    textSticker,
    position,
    rotation,
    scale,
    curveSettings = null,
    onDrop = null,
    planeId = 'sticker',
    isCircle = false
}) {
    const [texture, setTexture] = useState(null)
    const [isHovering, setIsHovering] = useState(false)
    const meshRef = useRef()
    const { camera, gl } = useThree()

    // Use provided curve settings or defaults (no curve)
    const curveParams = curveSettings || {
        enabled: false,
        radius: 28,
        strength: 0.85,
        segments: 24,
        yRadius: 423,
        yStrength: 2
    }

    // Validate file type
    const isValidImageFile = (file) => {
        const allowedTypes = ['image/png', 'image/svg+xml', 'image/webp']
        return allowedTypes.includes(file.type)
    }

    // Handle drag and drop on the 3D plane
    useEffect(() => {
        if (!onDrop) return

        const canvas = gl.domElement
        const raycaster = new THREE.Raycaster()
        const mouse = new THREE.Vector2()

        const handleDragOver = (e) => {
            e.preventDefault()
            e.stopPropagation()

            // Check if dragging files
            if (e.dataTransfer.types.includes('Files')) {
                // Update mouse position for raycasting
                const rect = canvas.getBoundingClientRect()
                mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
                mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

                // Raycast to check if hovering over this plane
                raycaster.setFromCamera(mouse, camera)
                if (meshRef.current) {
                    const intersects = raycaster.intersectObject(meshRef.current)
                    setIsHovering(intersects.length > 0)
                }
            }
        }

        const handleDragLeave = (e) => {
            e.preventDefault()
            setIsHovering(false)
        }

        const handleDrop = (e) => {
            e.preventDefault()
            e.stopPropagation()

            // Update mouse position for final check
            const rect = canvas.getBoundingClientRect()
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

            // Raycast to check if dropped on this plane
            raycaster.setFromCamera(mouse, camera)
            if (meshRef.current) {
                const intersects = raycaster.intersectObject(meshRef.current)

                if (intersects.length > 0) {
                    const files = e.dataTransfer.files
                    if (files.length > 0) {
                        const file = files[0]

                        // Validate file type
                        if (isValidImageFile(file)) {
                            const url = URL.createObjectURL(file)
                            onDrop(url, file.type)
                        } else {
                            alert('Please upload only PNG, SVG, or WebP images with transparent backgrounds.')
                        }
                    }
                }
            }

            setIsHovering(false)
        }

        canvas.addEventListener('dragover', handleDragOver)
        canvas.addEventListener('dragleave', handleDragLeave)
        canvas.addEventListener('drop', handleDrop)

        return () => {
            canvas.removeEventListener('dragover', handleDragOver)
            canvas.removeEventListener('dragleave', handleDragLeave)
            canvas.removeEventListener('drop', handleDrop)
        }
    }, [camera, gl, onDrop])

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
                yStrength: { value: curveParams.yStrength },
                glowIntensity: { value: 0.0 }
            },
            vertexShader: `
                uniform float radius;
                uniform float strength;
                uniform float enabled;
                uniform float yRadius;
                uniform float yStrength;
                
                varying vec2 vUv;
                varying vec3 vPosition;
                
                void main() {
                    vUv = uv;
                    vPosition = position;
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
                uniform float glowIntensity;
                varying vec2 vUv;
                varying vec3 vPosition;
                
                void main() {
                    vec4 texColor = texture2D(map, vUv);
                    
                    // Convert to grayscale using luminance formula
                    // This is the standard formula for perceived brightness
                    float gray = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
                    
                    // Invert the grayscale so dark becomes white and light becomes black
                    // This ensures dark text/logos appear as white engravings
                    float inverted = 1.0 - gray;
                    
                    // Apply inverted black and white effect
                    vec3 bw = vec3(inverted);
                    
                    // Add glow effect when hovering
                    vec3 glowColor = vec3(0.3, 0.6, 1.0); // Cyan/blue glow
                    vec3 finalColor = mix(bw, bw + glowColor * 0.5, glowIntensity);
                    
                    // Keep the original alpha channel for transparency
                    gl_FragColor = vec4(finalColor, texColor.a);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthTest: true,
            depthWrite: false
        })
    }, [texture, curveParams]) // Recreate when texture or curve params change

    // Update glow intensity based on hover state
    useEffect(() => {
        if (curvedMaterial && curvedMaterial.uniforms.glowIntensity) {
            curvedMaterial.uniforms.glowIntensity.value = isHovering ? 1.0 : 0.0
        }
    }, [isHovering, curvedMaterial])

    // Memoize geometry to prevent recreation on every render
    const planeGeom = useMemo(() => {
        if (isCircle) {
            // Use CircleGeometry for circular stickers (bottom logo)
            // radius, segments (more segments = smoother circle)
            return new THREE.CircleGeometry(15, 64)
        } else {
            // Use PlaneGeometry for rectangular stickers (front sticker)
            return new THREE.PlaneGeometry(30, 30, curveParams.segments, curveParams.segments)
        }
    }, [isCircle, curveParams.segments])

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
        <mesh
            ref={meshRef}
            position={position}
            rotation={rotation}
            scale={scale}
            geometry={planeGeom}
        >
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

export function Glass({
    stickerUrl = '/roses.png',
    stickerType,
    textSticker,
    bottomLogoUrl = '/roses.png',
    bottomText,
    onFrontStickerDrop,
    onBottomLogoDrop,
    ...props
}) {
    const { nodes } = useGLTF('/cup2.glb')
    const performanceMode = useMaterialStore((state) => state.performanceMode)

    // Leva controls for bottom sticker plane
    // const bottomStickerControls = useControls('Bottom Sticker', {
    //     positionX: { value: 0, min: -10, max: 100, step: 0.01, label: 'Position X' },
    //     positionY: { value: 0, min: -10, max: 100, step: 0.01, label: 'Position Y' },
    //     positionZ: { value: 0, min: -10, max: 100, step: 0.01, label: 'Position Z' },
    //     rotationX: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01, label: 'Rotation X' },
    //     rotationY: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01, label: 'Rotation Y' },
    //     rotationZ: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01, label: 'Rotation Z' },
    //     scale: { value: 1, min: 0.1, max: 50, step: 0.1, label: 'Scale ' },
    // })

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
                onDrop={onFrontStickerDrop}
                planeId="front-sticker"
            />

            {/* Pentagonal plane with glass material - using your aligned values */}
            <PentagonalPlane
                position={[-0.5, 39.5, -4.1]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={12.9}
            />

            {/* Bottom sticker plane - flat, positioned on pentagon */}
            <StickerPlane
                stickerUrl={bottomLogoUrl}
                textSticker={bottomText}
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
                onDrop={onBottomLogoDrop}
                planeId="bottom-logo"
                isCircle={true}
            />
        </group>
    )
}

useGLTF.preload('/cup2.glb')
