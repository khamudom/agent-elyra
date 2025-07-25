import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { AGENT_CONFIG } from "../agent/config";

interface ThreeJSExtensionRendererProps {
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  onStateChange?: (state: any) => void;
}

export const ThreeJSExtensionRenderer: React.FC<
  ThreeJSExtensionRendererProps
> = ({ className, style, onLoad, onError, onStateChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const avatarRef = useRef<THREE.Group | null>(null);
  const animationIdRef = useRef<number | null>(null);

  const [, setIsLoaded] = useState(false);
  const [, setHasError] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      AGENT_CONFIG.camera.fov,
      canvas.clientWidth / canvas.clientHeight,
      AGENT_CONFIG.camera.near,
      AGENT_CONFIG.camera.far
    );
    camera.position.copy(AGENT_CONFIG.camera.initialPosition);
    camera.lookAt(AGENT_CONFIG.camera.target);
    cameraRef.current = camera;

    // Setup OrbitControls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = AGENT_CONFIG.controls.dampingFactor;
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.autoRotate = false;
    controls.rotateSpeed = AGENT_CONFIG.controls.rotateSpeed;
    controls.maxPolarAngle = AGENT_CONFIG.controls.maxPolarAngle;
    controls.minPolarAngle = AGENT_CONFIG.controls.minPolarAngle;
    controls.target.copy(AGENT_CONFIG.camera.target);
    controlsRef.current = controls;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, AGENT_CONFIG.renderer.pixelRatioLimit)
    );
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(
      AGENT_CONFIG.lighting.ambient.color,
      AGENT_CONFIG.lighting.ambient.intensity
    );
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(
      AGENT_CONFIG.lighting.keyLight.color,
      AGENT_CONFIG.lighting.keyLight.intensity
    );
    keyLight.position.copy(AGENT_CONFIG.lighting.keyLight.position);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(
      AGENT_CONFIG.lighting.fillLight.color,
      AGENT_CONFIG.lighting.fillLight.intensity
    );
    fillLight.position.copy(AGENT_CONFIG.lighting.fillLight.position);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(
      AGENT_CONFIG.lighting.rimLight.color,
      AGENT_CONFIG.lighting.rimLight.intensity
    );
    rimLight.position.copy(AGENT_CONFIG.lighting.rimLight.position);
    scene.add(rimLight);

    // Load 3D model
    const loader = new GLTFLoader();
    loader.load(
      AGENT_CONFIG.avatar.modelPath,
      (gltf) => {
        try {
          const model = gltf.scene;
          model.position.copy(AGENT_CONFIG.avatar.position);
          model.scale.copy(AGENT_CONFIG.avatar.scale);
          scene.add(model);
          avatarRef.current = model;

          // Setup animations
          if (gltf.animations && gltf.animations.length > 0) {
            mixerRef.current = new THREE.AnimationMixer(model);
            const action = mixerRef.current.clipAction(gltf.animations[0]);
            action.play();
          }

          setIsLoaded(true);
          onLoad?.();
          onStateChange?.({
            isLoaded: true,
            hasError: false,
            isAnimating: false,
          });
        } catch (error) {
          console.error("Failed to setup avatar:", error);
          setHasError(true);
          const errorObj =
            error instanceof Error ? error : new Error(String(error));
          onError?.(errorObj);
          onStateChange?.({
            isLoaded: false,
            hasError: true,
            errorMessage: errorObj.message,
          });
        }
      },
      undefined,
      (error) => {
        console.error("Failed to load avatar model:", error);
        setHasError(true);
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        onError?.(errorObj);
        onStateChange?.({
          isLoaded: false,
          hasError: true,
          errorMessage: errorObj.message,
        });
      }
    );

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      if (mixerRef.current) {
        mixerRef.current.update(0.016); // ~60fps
      }

      if (controls) {
        controls.update();
      }

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (canvas && camera && renderer) {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        if (controls) {
          controls.update();
        }
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (controls) {
        controls.dispose();
      }
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [onLoad, onError, onStateChange]);

  return <canvas ref={canvasRef} className={className} style={style} />;
};

export default ThreeJSExtensionRenderer;
