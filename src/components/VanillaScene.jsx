import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import GUI from 'lil-gui';

// Shaders from StickerPlane
const vertexShader = `
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
`;

const fragmentShader = `
    uniform sampler2D map;
    uniform float glowIntensity;
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
        vec4 texColor = texture2D(map, vUv);
        
        // Convert to grayscale using luminance formula
        float gray = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
        
        // Invert the grayscale
        float inverted = 1.0 - gray;
        
        // Apply inverted black and white effect
        vec3 bw = vec3(inverted);
        
        // Add glow effect when hovering
        vec3 glowColor = vec3(0.3, 0.6, 1.0); // Cyan/blue glow
        vec3 finalColor = mix(bw, bw + glowColor * 0.5, glowIntensity);
        
        // Keep the original alpha channel for transparency
        gl_FragColor = vec4(finalColor, texColor.a);
    }
`;

export function VanillaScene({
    stickerUrl,
    textSticker,
    bottomLogoUrl,
    bottomText,
    onFrontStickerDrop,
    onBottomLogoDrop
}) {
    const mountRef = useRef(null);
    const frontStickerMatRef = useRef(null);
    const bottomStickerMatRef = useRef(null);

    // Keep refs to latest props for event handlers
    const propsRef = useRef({ onFrontStickerDrop, onBottomLogoDrop });
    useEffect(() => {
        propsRef.current = { onFrontStickerDrop, onBottomLogoDrop };
    }, [onFrontStickerDrop, onBottomLogoDrop]);

    useEffect(() => {
        // Container
        const canvas = mountRef.current;

        // Base
        const gui = new GUI();
        gui.hide(); // user wants to see controls now
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        const options = {
            enableSwoopingCamera: false,
            enableRotation: false,
            color: 0xffffff,
            metalness: 0,
            roughness: 0.41,
            transmission: 1,
            ior: 1.5,
            reflectivity: 0.5,
            thickness: 2.5,
            envMapIntensity: 1.5,
            clearcoat: 1,
            clearcoatRoughness: 0.1,
            normalScale: 0,
            clearcoatNormalScale: 0.2,
            normalRepeat: 4,
            bloomThreshold: 0.85,
            bloomStrength: 0.35,
            bloomRadius: 0.33,
            opacity: .44,
        };

        const hdrEquirect = new RGBELoader().load(
            "/sky.hdr",
            () => {
                hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
            }
        );

        const textureLoader = new THREE.TextureLoader();
        const normalMapTexture = textureLoader.load("/normal.jpg");
        normalMapTexture.wrapS = THREE.RepeatWrapping;
        normalMapTexture.wrapT = THREE.RepeatWrapping;
        normalMapTexture.repeat.set(options.normalRepeat, options.normalRepeat);

        function isMobileDevice() {
            return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
        }

        const material = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
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

        material.transparent = true;

        // Load Glass Model
        function findGeometry(model) {
            let foundGeometry = null;
            model.traverse((node) => {
                if (node.isMesh && node.geometry) {
                    foundGeometry = node.geometry.clone();
                    return;
                }
            });
            return foundGeometry;
        }

        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
        dracoLoader.setDecoderConfig({ type: 'js' });

        const gltfLoader = new GLTFLoader();
        gltfLoader.setDRACOLoader(dracoLoader);

        gltfLoader.load("/glass3.glb", (gltf) => {
            const model = gltf.scene;
            model.traverse((child) => {
                if (child.isMesh && child.geometry) {
                    child.geometry.computeVertexNormals(); // recalculates normals for Three.js
                }
            });

            const glassGeometry = findGeometry(model);
            if (glassGeometry) {
                glassGeometry.rotateX(Math.PI / -2);
                glassGeometry.translate(0, -1, 0);

                const glassMesh = new THREE.Mesh(glassGeometry, material);
                glassMesh.rotation.set(0, 1.85, 0);
                if (isMobileDevice()) {
                    glassMesh.scale.set(0.0015, 0.0015, 0.0015);
                    glassMesh.position.set(0, -.7, 0);
                } else {
                    glassMesh.scale.set(0.0023, 0.0023, 0.0023);
                    glassMesh.position.set(0, -1, 0);
                }
                scene.add(glassMesh);
            }

            model.traverse((node) => {
                if (node.isMesh) {
                    node.geometry.dispose();
                    node.material.dispose();
                }
            });
        }, undefined, (error) => console.error(error));

        // STICKERS & PLANES SETUP
        // Recalculated Scale: 0.023 (Vanilla) / 0.0416 (R3F) = ~0.5528
        // R3F Root was 0.08. New Root should be 0.04423 to match Vanilla visual size.
        const stickerGroup = new THREE.Group();
        stickerGroup.position.set(0, -3, 0);
        stickerGroup.rotation.set(0, 1.55, 0);

        const SCALE_FACTOR = 0.04423;
        stickerGroup.scale.set(SCALE_FACTOR, SCALE_FACTOR, SCALE_FACTOR);
        scene.add(stickerGroup);

        // 1. Front Sticker
        const frontCurveSettings = {
            radius: 28, strength: 0.85, enabled: 1.0, yRadius: 450, yStrength: 2.3, segments: 24
        };
        const frontGeom = new THREE.PlaneGeometry(30, 30, frontCurveSettings.segments, frontCurveSettings.segments);
        const frontMat = new THREE.ShaderMaterial({
            uniforms: {
                map: { value: null },
                radius: { value: frontCurveSettings.radius },
                strength: { value: frontCurveSettings.strength },
                enabled: { value: frontCurveSettings.enabled },
                yRadius: { value: frontCurveSettings.yRadius },
                yStrength: { value: frontCurveSettings.yStrength },
                glowIntensity: { value: 0.0 }
            },
            vertexShader,
            fragmentShader,
            transparent: true,
            side: THREE.DoubleSide,
            depthTest: true,
            depthWrite: false
        });
        frontStickerMatRef.current = frontMat;
        const frontMesh = new THREE.Mesh(frontGeom, frontMat);
        frontMesh.position.set(-0.056, 75.985, 20.9);
        frontMesh.scale.set(0.7, 0.6, 0.7);
        // frontMesh.rotation.set(0, 0, 0);
        frontMesh.name = "front_sticker";
        stickerGroup.add(frontMesh);




        // 3. Bottom Sticker
        const bottomGeom = new THREE.CircleGeometry(15, 64);
        const bottomMat = new THREE.ShaderMaterial({
            uniforms: {
                map: { value: null },
                radius: { value: 28 }, strength: { value: 0.85 }, enabled: { value: 0.0 }, // Disabled curve
                yRadius: { value: 423 }, yStrength: { value: 2 },
                glowIntensity: { value: 0.0 }
            },
            vertexShader,
            fragmentShader,
            transparent: true,
            side: THREE.DoubleSide,
            depthTest: true,
            depthWrite: false
        });
        bottomStickerMatRef.current = bottomMat;
        const bottomMesh = new THREE.Mesh(bottomGeom, bottomMat);
        bottomMesh.position.set(0, 45.1, 0);
        bottomMesh.rotation.set(Math.PI / 2, 0, 0);
        bottomMesh.scale.set(0.5, 0.5, 0.5);
        bottomMesh.name = "bottom_sticker";
        stickerGroup.add(bottomMesh);


        // Camera
        const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 15);
        camera.position.set(5, 0, 0.0);
        scene.add(camera);

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
        });
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowMap;
        renderer.useLegacyLights = false;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ReinhardToneMapping;
        renderer.toneMappingExposure = 1.5;
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Controls
        const controls = new TrackballControls(camera, canvas);
        controls.enableDamping = true;
        controls.noZoom = true;
        controls.noPan = true;
        controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.ROTATE,
            RIGHT: THREE.MOUSE.ROTATE,
        };
        controls.rotateSpeed = 0.8;

        // Raycaster Interactions
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const handleDragOver = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer.types.includes('Files')) {
                const rect = canvas.getBoundingClientRect();
                mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObjects([frontMesh, bottomMesh]);

                // Reset glows
                frontMesh.material.uniforms.glowIntensity.value = 0.0;
                bottomMesh.material.uniforms.glowIntensity.value = 0.0;

                if (intersects.length > 0) {
                    const hit = intersects[0].object;
                    hit.material.uniforms.glowIntensity.value = 1.0;
                }
            }
        };

        const handleDrop = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const rect = canvas.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects([frontMesh, bottomMesh]);

            frontMesh.material.uniforms.glowIntensity.value = 0.0;
            bottomMesh.material.uniforms.glowIntensity.value = 0.0;

            if (intersects.length > 0) {
                const hit = intersects[0].object;
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    const file = files[0];
                    const validTypes = ['image/png', 'image/svg+xml', 'image/webp'];
                    if (validTypes.includes(file.type)) {
                        const url = URL.createObjectURL(file);
                        if (hit.name === "front_sticker" && propsRef.current.onFrontStickerDrop) {
                            propsRef.current.onFrontStickerDrop(url, file.type);
                        } else if (hit.name === "bottom_sticker" && propsRef.current.onBottomLogoDrop) {
                            propsRef.current.onBottomLogoDrop(url, file.type);
                        }
                    } else {
                        alert('Please upload only PNG, SVG, or WebP images.');
                    }
                }
            }
        };

        canvas.addEventListener('dragover', handleDragOver);
        canvas.addEventListener('drop', handleDrop);

        // Resize
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        };
        window.addEventListener('resize', handleResize);

        // GUI
        gui.addColor(options, "color").onChange((val) => material.color.set(val));
        gui.add(options, "roughness", 0, 1, 0.01).onChange((val) => material.roughness = val);
        gui.add(options, "opacity", 0, 1, 0.01).onChange((val) => material.opacity = val);
        gui.add(options, "metalness", 0, 1, 0.01).onChange((val) => material.metalness = val);
        gui.add(options, "transmission", 0, 1, 0.01).onChange((val) => material.transmission = val);
        gui.add(options, "ior", 1, 2.33, 0.01).onChange((val) => material.ior = val);
        gui.add(options, "reflectivity", 0, 4, 0.01).onChange((val) => material.reflectivity = val);
        gui.add(options, "thickness", 0, 5, 0.1).onChange((val) => material.thickness = val);
        gui.add(options, "clearcoat", 0, 1, 0.01).onChange((val) => material.clearcoat = val);
        gui.add(options, "envMapIntensity", 0, 20, 0.1).onChange((val) => material.envMapIntensity = val);
        gui.add(options, "clearcoatRoughness", 0, 1, 0.01).onChange((val) => material.clearcoatRoughness = val);

        // STICKER GUI CONTROLS
        const stickersFolder = gui.addFolder('Stickers');

        // Group Controls
        const groupFolder = stickersFolder.addFolder('Group');
        groupFolder.add(stickerGroup.position, 'x', -100, 100, 0.01).name('Pos X');
        groupFolder.add(stickerGroup.position, 'y', -100, 100, 0.01).name('Pos Y');
        groupFolder.add(stickerGroup.position, 'z', -100, 100, 0.01).name('Pos Z');
        groupFolder.add(stickerGroup.rotation, 'x', -Math.PI * 2, Math.PI * 2, 0.01).name('Rot X');
        groupFolder.add(stickerGroup.rotation, 'y', -Math.PI * 2, Math.PI * 2, 0.01).name('Rot Y');//1.5 is the best
        groupFolder.add(stickerGroup.rotation, 'z', -Math.PI * 2, Math.PI * 2, 0.01).name('Rot Z');
        groupFolder.add(stickerGroup.scale, 'x', 0, 100, 0.001).name('Scale X');
        groupFolder.add(stickerGroup.scale, 'y', 0, 100, 0.001).name('Scale Y');
        groupFolder.add(stickerGroup.scale, 'z', 0, 100, 0.001).name('Scale Z');

        // Front Sticker Controls
        const frontFolder = stickersFolder.addFolder('Front Sticker');
        frontFolder.add(frontMesh.position, 'x', -100, 100, 0.01).name('Pos X');
        frontFolder.add(frontMesh.position, 'y', -100, 100, 0.01).name('Pos Y');
        frontFolder.add(frontMesh.position, 'z', -100, 100, 0.01).name('Pos Z');
        frontFolder.add(frontMesh.rotation, 'x', -Math.PI * 2, Math.PI * 2, 0.01).name('Rot X');
        frontFolder.add(frontMesh.rotation, 'y', -Math.PI * 2, Math.PI * 2, 0.01).name('Rot Y');
        frontFolder.add(frontMesh.rotation, 'z', -Math.PI * 2, Math.PI * 2, 0.01).name('Rot Z');
        frontFolder.add(frontMesh.scale, 'x', 0, 100, 0.01).name('Scale X');
        frontFolder.add(frontMesh.scale, 'y', 0, 100, 0.01).name('Scale Y');
        frontFolder.add(frontMesh.scale, 'z', 0, 100, 0.01).name('Scale Z');

        const curveFolder = frontFolder.addFolder('Curvature');
        curveFolder.add(frontMat.uniforms.radius, 'value', 0, 1000, 0.1).name('Radius');
        curveFolder.add(frontMat.uniforms.strength, 'value', 0, 10, 0.01).name('Strength');
        curveFolder.add(frontMat.uniforms.yRadius, 'value', 0, 1000, 0.1).name('Y Radius');
        curveFolder.add(frontMat.uniforms.yStrength, 'value', 0, 10, 0.01).name('Y Strength');


        // Bottom Sticker Controls
        const bottomFolder = stickersFolder.addFolder('Bottom Sticker');
        bottomFolder.add(bottomMesh.position, 'x', -100, 100, 0.01).name('Pos X');
        bottomFolder.add(bottomMesh.position, 'y', -100, 100, 0.01).name('Pos Y');
        bottomFolder.add(bottomMesh.position, 'z', -100, 100, 0.01).name('Pos Z');
        bottomFolder.add(bottomMesh.rotation, 'x', -Math.PI * 2, Math.PI * 2, 0.01).name('Rot X');
        bottomFolder.add(bottomMesh.rotation, 'y', -Math.PI * 2, Math.PI * 2, 0.01).name('Rot Y');
        bottomFolder.add(bottomMesh.rotation, 'z', -Math.PI * 2, Math.PI * 2, 0.01).name('Rot Z');
        bottomFolder.add(bottomMesh.scale, 'x', 0, 100, 0.01).name('Scale X');
        bottomFolder.add(bottomMesh.scale, 'y', 0, 100, 0.01).name('Scale Y');
        bottomFolder.add(bottomMesh.scale, 'z', 0, 100, 0.01).name('Scale Z');

        // Animation Loop
        const clock = new THREE.Clock();
        let animationId;
        const tick = () => {
            controls.update();
            renderer.render(scene, camera);
            animationId = window.requestAnimationFrame(tick);
        };
        tick();

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            window.cancelAnimationFrame(animationId);
            canvas.removeEventListener('dragover', handleDragOver);
            canvas.removeEventListener('drop', handleDrop);
            renderer.dispose();
            gui.destroy();
            scene.traverse((obj) => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material && !Array.isArray(obj.material)) obj.material.dispose();
            });
        };
    }, []);

    // Texture Updates
    useEffect(() => {
        if (!frontStickerMatRef.current) return;
        if (textSticker) {
            const canvas = document.createElement('canvas');
            canvas.width = 512; canvas.height = 512;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, 512, 512);
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 80px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(textSticker, 256, 256);
            const tex = new THREE.CanvasTexture(canvas);
            frontStickerMatRef.current.uniforms.map.value = tex;
        } else if (stickerUrl) {
            new THREE.TextureLoader().load(stickerUrl, (tex) => {
                frontStickerMatRef.current.uniforms.map.value = tex;
                frontStickerMatRef.current.needsUpdate = true;
            });
        } else {
            frontStickerMatRef.current.uniforms.map.value = null;
        }
    }, [stickerUrl, textSticker]);

    useEffect(() => {
        if (!bottomStickerMatRef.current) return;
        if (bottomText) {
            const canvas = document.createElement('canvas');
            canvas.width = 512; canvas.height = 512;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, 512, 512);
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 80px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(bottomText, 256, 256);
            const tex = new THREE.CanvasTexture(canvas);
            bottomStickerMatRef.current.uniforms.map.value = tex;
        } else if (bottomLogoUrl) {
            new THREE.TextureLoader().load(bottomLogoUrl, (tex) => {
                bottomStickerMatRef.current.uniforms.map.value = tex;
                bottomStickerMatRef.current.needsUpdate = true;
            });
        } else {
            bottomStickerMatRef.current.uniforms.map.value = null;
        }
    }, [bottomLogoUrl, bottomText]);

    return <canvas ref={mountRef} className="webgl outline-none" />;
}
