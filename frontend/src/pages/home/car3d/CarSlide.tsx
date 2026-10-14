import { useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { FeaturedModel } from '../featuredModels';
import { computeGeometryFit, getShadowTexture } from '@/shared/components/viewer3d';
import { DRAG_LAMBDA, EXIT_LIFT, EXIT_ROLL, EXIT_YAW, FIT_SIZE, SPACING } from './config';

interface CarSlideProps {
  model: FeaturedModel;
  index: number;
  count: number;
  progressRef: RefObject<number>;
  dragRef: RefObject<number>;
}

export function CarSlide({ model, index, count, progressRef, dragRef }: CarSlideProps) {
  const { scene } = useGLTF(model.url, false, true);
  const slideRef = useRef<THREE.Group>(null);
  const pivotRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.MeshBasicMaterial>(null);
  const dragYaw = useRef(0);

  const geometry = useMemo(() => computeGeometryFit(scene, FIT_SIZE), [scene]);

  useFrame((_, delta) => {
    const slide = slideRef.current;
    const pivot = pivotRef.current;
    if (!slide || !pivot) return;

    let off = index - progressRef.current;
    off = ((off % count) + count) % count;
    if (off > count / 2) off -= count;

    const t = THREE.MathUtils.clamp(off, -1, 1);
    const focused = Math.abs(off) < 0.5;

    slide.position.x = off * SPACING;

    const targetYaw = focused ? dragRef.current : 0;
    dragYaw.current = THREE.MathUtils.damp(
      dragYaw.current,
      targetYaw,
      DRAG_LAMBDA,
      delta,
    );

    pivot.rotation.y = model.rotationY + t * EXIT_YAW + dragYaw.current;
    pivot.rotation.z = t * EXIT_ROLL;
    pivot.position.y = Math.abs(t) * EXIT_LIFT;
    pivot.scale.setScalar(1 - Math.abs(t) * 0.08);

    if (shadowRef.current) {
      shadowRef.current.opacity = (1 - Math.abs(t) * 0.7) * 0.95;
    }
  });

  return (
    <group ref={slideRef}>
      <group ref={pivotRef} rotation-y={model.rotationY}>
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