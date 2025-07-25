import React, { useRef, useEffect, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { AvatarProps } from "../types";

// Error boundary for GLB loading
class AvatarErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Avatar error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <>{this.props.fallback}</>;
    }

    return <>{this.props.children}</>;
  }
}

// GLB Avatar component
function GLBAvatar({
  modelPath,
  position,
  scale,
  onLoad,
  onError,
}: AvatarProps) {
  const avatarRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  // Load GLB model - useGLTF doesn't throw, it returns a result
  const { scene, animations } = useGLTF(modelPath);

  useEffect(() => {
    try {
      if (animations && animations.length > 0 && avatarRef.current) {
        mixerRef.current = new THREE.AnimationMixer(avatarRef.current);
        const action = mixerRef.current.clipAction(animations[0]);
        action.play();
      }
      onLoad?.();
    } catch (error) {
      console.error("Failed to setup avatar animations:", error);
      onError?.(error as Error);
    }
  }, [animations, onLoad, onError]);

  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  return (
    <primitive
      ref={avatarRef}
      object={scene}
      position={[position.x, position.y, position.z]}
      scale={[scale.x, scale.y, scale.z]}
    />
  );
}

// Fallback avatar component
function FallbackAvatar({
  position,
  scale,
}: Pick<AvatarProps, "position" | "scale">) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Add some gentle rotation
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[position.x, position.y, position.z]}
      scale={[scale.x, scale.y, scale.z]}
    >
      {/* Head */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={0x4a90e2} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.3, 1.6, 0.4]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color={0x00ff00} />
      </mesh>
      <mesh position={[0.3, 1.6, 0.4]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color={0x00ff00} />
      </mesh>

      {/* Body */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[1.2, 1.5, 0.6]} />
        <meshStandardMaterial color={0x2c3e50} />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.9, 0.5, 0]}>
        <boxGeometry args={[0.3, 1, 0.3]} />
        <meshStandardMaterial color={0x4a90e2} />
      </mesh>
      <mesh position={[0.9, 0.5, 0]}>
        <boxGeometry args={[0.3, 1, 0.3]} />
        <meshStandardMaterial color={0x4a90e2} />
      </mesh>
    </group>
  );
}

// Main Avatar component with error boundary and Suspense
export const Avatar: React.FC<AvatarProps> = (props) => {
  return (
    <AvatarErrorBoundary
      fallback={
        <FallbackAvatar position={props.position} scale={props.scale} />
      }
    >
      <Suspense
        fallback={
          <FallbackAvatar position={props.position} scale={props.scale} />
        }
      >
        <GLBAvatar {...props} />
      </Suspense>
    </AvatarErrorBoundary>
  );
};

export default Avatar;
