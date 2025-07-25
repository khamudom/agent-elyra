import React, { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import type { CameraProps } from "../types";

export const Camera: React.FC<CameraProps> = ({ config }) => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.copy(config.camera.initialPosition);
    camera.lookAt(config.camera.target);
  }, [camera, config.camera.initialPosition, config.camera.target]);

  return null;
};

export default Camera;
