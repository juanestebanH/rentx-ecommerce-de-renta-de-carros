import * as THREE from 'three';

export interface GeometryFit {
  scale: number;
  offset: THREE.Vector3;
  bottom: number;
  shadow: [number, number];
}

export function computeGeometryFit(
  scene: THREE.Object3D,
  fitSize: number,
): GeometryFit {
  const box = new THREE.Box3().setFromObject(scene);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const scale = fitSize / maxDim;
  const worldSize = size.clone().multiplyScalar(scale);
  return {
    scale,
    offset: center.clone().multiplyScalar(-scale),
    bottom: -worldSize.y / 2,
    shadow: [worldSize.z * 0.95, worldSize.x * 1.35],
  };
}