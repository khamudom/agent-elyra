// Main agent exports
export { default as Agent } from "./Agent";
export { AGENT_CONFIG } from "./config";
export type {
  AgentProps,
  AgentState,
  AgentConfig,
  AvatarProps,
  SceneProps,
  CameraProps,
} from "./types";

// Component exports
export { Avatar, Camera, Lighting, Scene } from "./components";
