import { useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { computeGeometryFit, getShadowTexture } from '@/shared/components/viewer3d';
import type { FeaturedModel } from '@/pages/home/featuredModels';
import { FIT_SIZE, IDLE_SPEED, ROTATION_LAMBDA } from './config';

interface CarModelProps {
  model: FeaturedModel;
  autoRotate: boolean;
  dragYawRef: RefObject<number>;
  idleYawRef: RefObject<number>;
  currentYawRef: RefObject<number>;
}

export function CarModel({
  model,
  autoRotate,
  dragYawRef,
  idleYawRef,
  currentYawRef,
}: CarModelProps) {
  const { scene } = useGLTF(model.url, false, true);
  const pivotRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.MeshBasicMaterial>(null);

  const geometry = useMemo(() => computeGeometryFit(scene, FIT_SIZE), [scene]);

  useFrame((_, delta) => {
    const pivot = pivotRef.current;
    if (!pivot) return;

    if (autoRotate) idleYawRef.current += delta * IDLE_SPEED;
    const target = dragYawRef.current + idleYawRef.current;
    currentYawRef.current = THREE.MathUtils.damp(
      currentYawRef.current,
      target,
      ROTATION_LAMBDA,
      delta,
    );
    pivot.rotation.y = model.rotationY + currentYawRef.current;

    if (shadowRef.current) {
      shadowRef.current.opacity = 0.95;
    }
  });

  return (
    <group>
      <group ref={pivotRef}>
        <group scale={geometry.scale} position={geometry.offset}>
          <primitive object={scene} />
        </group>
      </group>
      <mesh
        rotation-x={-Math.PI / 2}
        position-y={geometry.bottom + 0.02}
        scale={[geometry.shadow[0], geometry.shadow[1], 1]}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          ref={shadowRef}
          map={getShadowTexture()}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}