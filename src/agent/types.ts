import { ReactNode } from "react";
import { Vector3 } from "three";

// Agent configuration types
export interface AgentConfig {
  camera: {
    fov: number;
    near: number;
    far: number;
    initialPosition: Vector3;
    target: Vector3;
  };
  controls: {
    rotateSpeed: number;
    dampingFactor: number;
    maxPolarAngle: number;
    minPolarAngle: number;
  };
  lighting: {
    ambient: {
      color: number;
      intensity: number;
    };
    keyLight: {
      color: number;
      intensity: number;
      position: Vector3;
    };
    fillLight: {
      color: number;
      intensity: number;
      position: Vector3;
    };
    rimLight: {
      color: number;
      intensity: number;
      position: Vector3;
    };
  };
  avatar: {
    modelPath: string;
    position: Vector3;
    scale: Vector3;
  };
  renderer: {
    pixelRatioLimit: number;
  };
}

// Agent state types
export interface AgentState {
  isLoaded: boolean;
  hasError: boolean;
  errorMessage?: string;
  isAnimating: boolean;
}

// Agent props
export interface AgentProps {
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  onStateChange?: (state: AgentState) => void;
  children?: ReactNode;
}

// Avatar component props
export interface AvatarProps {
  modelPath: string;
  position: Vector3;
  scale: Vector3;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

// Scene component props
export interface SceneProps {
  config: AgentConfig;
  onStateChange?: (state: AgentState) => void;
}

// Camera component props
export interface CameraProps {
  config: AgentConfig;
}
