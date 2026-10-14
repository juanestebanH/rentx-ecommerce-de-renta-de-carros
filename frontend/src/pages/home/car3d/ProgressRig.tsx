import type { RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PROGRESS_LAMBDA } from './config';

interface ProgressRigProps {
  targetRef: RefObject<number>;
  progressRef: RefObject<number>;
}

export function ProgressRig({ targetRef, progressRef }: ProgressRigProps) {
  useFrame((_, delta) => {
    progressRef.current = THREE.MathUtils.damp(
      progressRef.current,
      targetRef.current,
      PROGRESS_LAMBDA,
      delta,
    );
  });
  return null;
}