import React, { useCallback, useEffect, useState } from "react";
import { OrbitControls } from "@react-three/drei";
import type { SceneProps, AgentState } from "../types";
import Avatar from "./Avatar";
import Lighting from "./Lighting";

export const Scene: React.FC<SceneProps> = ({ config, onStateChange }) => {
  const [state, setState] = useState<AgentState>({
    isLoaded: false,
    hasError: false,
    isAnimating: false,
  });

  const handleStateChange = useCallback(
    (updates: Partial<AgentState>) => {
      const newState = { ...state, ...updates };
      setState(newState);
      onStateChange?.(newState);
    },
    [state, onStateChange]
  );

  const handleAvatarLoad = useCallback(() => {
    handleStateChange({ isLoaded: true, hasError: false });
  }, [handleStateChange]);

  const handleAvatarError = useCallback(
    (error: Error) => {
      console.error("Avatar loading error:", error);
      handleStateChange({
        hasError: true,
        errorMessage: error.message,
        isLoaded: false,
      });
    },
    [handleStateChange]
  );

  // Initialize state
  useEffect(() => {
    handleStateChange({ isLoaded: false, hasError: false, isAnimating: false });
  }, [handleStateChange]);

  return (
    <>
      {/* Lighting */}
      <Lighting config={config} />

      {/* Avatar */}
      <Avatar
        modelPath={config.avatar.modelPath}
        position={config.avatar.position}
        scale={config.avatar.scale}
        onLoad={handleAvatarLoad}
        onError={handleAvatarError}
      />

      {/* Controls */}
      <OrbitControls
        enableDamping
        dampingFactor={config.controls.dampingFactor}
        enableZoom
        enablePan={false}
        autoRotate={false}
        rotateSpeed={config.controls.rotateSpeed}
        maxPolarAngle={config.controls.maxPolarAngle}
        minPolarAngle={config.controls.minPolarAngle}
        target={[
          config.camera.target.x,
          config.camera.target.y,
          config.camera.target.z,
        ]}
      />
    </>
  );
};

export default Scene;
