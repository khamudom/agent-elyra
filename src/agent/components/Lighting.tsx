import React from "react";
import { Environment } from "@react-three/drei";
import type { AgentConfig } from "../types";

interface LightingProps {
  config: AgentConfig;
}

export const Lighting: React.FC<LightingProps> = ({ config }) => {
  const { lighting } = config;

  return (
    <>
      {/* Ambient light */}
      <ambientLight
        color={lighting.ambient.color}
        intensity={lighting.ambient.intensity}
      />

      {/* Key light */}
      <directionalLight
        color={lighting.keyLight.color}
        intensity={lighting.keyLight.intensity}
        position={[
          lighting.keyLight.position.x,
          lighting.keyLight.position.y,
          lighting.keyLight.position.z,
        ]}
      />

      {/* Fill light */}
      <directionalLight
        color={lighting.fillLight.color}
        intensity={lighting.fillLight.intensity}
        position={[
          lighting.fillLight.position.x,
          lighting.fillLight.position.y,
          lighting.fillLight.position.z,
        ]}
      />

      {/* Rim light */}
      <directionalLight
        color={lighting.rimLight.color}
        intensity={lighting.rimLight.intensity}
        position={[
          lighting.rimLight.position.x,
          lighting.rimLight.position.y,
          lighting.rimLight.position.z,
        ]}
      />

      {/* Environment for better lighting */}
      <Environment preset="city" />
    </>
  );
};

export default Lighting;
