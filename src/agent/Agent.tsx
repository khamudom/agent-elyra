import React, { Suspense, useCallback, useState } from "react";
import { Canvas } from "@react-three/fiber";
import type { AgentProps, AgentState } from "./types";
import { AGENT_CONFIG } from "./config";
import { Camera, Scene } from "./components";

// Error boundary for the entire 3D scene
class AgentErrorBoundary extends React.Component<
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
    console.error("Agent error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <>{this.props.fallback}</>;
    }

    return <>{this.props.children}</>;
  }
}

// Error fallback component (HTML - outside Canvas)
const ErrorFallback: React.FC = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      color: "#ff6b6b",
      fontSize: "14px",
      textAlign: "center",
      padding: "20px",
    }}
  >
    Failed to load 3D Agent.
    <br />
    Please refresh the page.
  </div>
);

// Three.js loading fallback (inside Canvas)
const ThreeJSLoadingFallback: React.FC = () => (
  <mesh position={[0, 0, 0]}>
    <boxGeometry args={[0.5, 0.5, 0.5]} />
    <meshStandardMaterial color="#666" />
  </mesh>
);

// Main Agent component
export const Agent: React.FC<AgentProps> = ({
  className,
  style,
  onLoad,
  onError,
  onStateChange,
  children,
}) => {
  const [agentState, setAgentState] = useState<AgentState>({
    isLoaded: false,
    hasError: false,
    isAnimating: false,
  });

  const handleStateChange = useCallback(
    (state: AgentState) => {
      setAgentState(state);
      onStateChange?.(state);

      // Trigger callbacks based on state
      if (state.isLoaded && !state.hasError) {
        onLoad?.();
      } else if (state.hasError) {
        onError?.(new Error(state.errorMessage || "Unknown error occurred"));
      }
    },
    [onLoad, onError, onStateChange]
  );

  // Handle WebGL context loss
  const handleContextLost = useCallback(() => {
    console.warn("WebGL context lost");
    handleStateChange({
      ...agentState,
      hasError: true,
      errorMessage: "WebGL context lost",
    });
  }, [agentState, handleStateChange]);

  return (
    <AgentErrorBoundary fallback={<ErrorFallback />}>
      <Canvas
        className={className}
        style={style}
        camera={{
          fov: AGENT_CONFIG.camera.fov,
          near: AGENT_CONFIG.camera.near,
          far: AGENT_CONFIG.camera.far,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={Math.min(
          window.devicePixelRatio,
          AGENT_CONFIG.renderer.pixelRatioLimit
        )}
        onCreated={({ gl, scene, camera }) => {
          console.log("Canvas created successfully", { gl, scene, camera });
          // Handle context loss - cast to access canvas property
          const canvas = (gl as any).canvas;
          if (canvas) {
            canvas.addEventListener(
              "webglcontextlost",
              handleContextLost,
              false
            );
          }
        }}
        onError={(error: any) => {
          console.error("Canvas error:", error);
          handleStateChange({
            ...agentState,
            hasError: true,
            errorMessage: error?.message || "Canvas initialization failed",
          });
        }}
      >
        <Suspense fallback={<ThreeJSLoadingFallback />}>
          <Camera config={AGENT_CONFIG} />
          <Scene config={AGENT_CONFIG} onStateChange={handleStateChange} />
          {children}
        </Suspense>
      </Canvas>
    </AgentErrorBoundary>
  );
};

export default Agent;
