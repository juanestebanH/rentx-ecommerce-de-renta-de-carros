import { useEffect, type RefObject } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraRigProps {
  fit: number;
  camY: number;
  lookY?: number;
  cameraZRef?: RefObject<number>;
}

export function CameraRig({ fit, camY, lookY = 0, cameraZRef }: CameraRigProps) {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const size = useThree((state) => state.size);

  useEffect(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const vHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const zForWidth = ((fit / 2) * 1.28) / (vHalf * aspect);
    const zForHeight = ((fit * 0.36) / 2) / vHalf;
    const z = Math.max(zForWidth, zForHeight, 4.5);
    camera.position.set(0, camY, z);
    camera.lookAt(0, lookY, 0);
    camera.updateProjectionMatrix();
    if (cameraZRef) cameraZRef.current = z;
  }, [camera, size, fit, camY, lookY, cameraZRef]);

  return null;
}