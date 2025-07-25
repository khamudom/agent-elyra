import { Vector3 } from "three";
import type { AgentConfig } from "./types";

export const AGENT_CONFIG: AgentConfig = {
  camera: {
    fov: 75,
    near: 0.1,
    far: 1000,
    initialPosition: new Vector3(0, 0, 3),
    target: new Vector3(0, 0, 0),
  },
  controls: {
    rotateSpeed: 0.5,
    dampingFactor: 0.05,
    maxPolarAngle: Math.PI * 0.8,
    minPolarAngle: Math.PI * 0.2,
  },
  lighting: {
    ambient: {
      color: 0x404040,
      intensity: 0.4,
    },
    keyLight: {
      color: 0xffffff,
      intensity: 3.0,
      position: new Vector3(5, 5, 5),
    },
    fillLight: {
      color: 0xffffff,
      intensity: 1.0,
      position: new Vector3(-5, 3, 5),
    },
    rimLight: {
      color: 0xffffff,
      intensity: 0.5,
      position: new Vector3(0, 5, -5),
    },
  },
  avatar: {
    modelPath: "./models/characters/fox_character.glb",
    position: new Vector3(0, -1.8, 0),
    scale: new Vector3(4, 4, 4),
  },
  renderer: {
    pixelRatioLimit: 2,
  },
} as const;
