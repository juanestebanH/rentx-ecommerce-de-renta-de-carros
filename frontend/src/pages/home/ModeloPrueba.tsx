import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';

interface ModeloProps {
  scale?: number;
  position?: [number, number, number];
}

/**
 * Carga el modelo GLB "prueba.glb".
 * Colócalo en la carpeta /public de tu proyecto, así:
 *   public/models/prueba.glb
 */
function Modelo({ scale = 1, position = [0, 0, 0] }: ModeloProps) {
  // Dejamos que TS infiera el tipo de "scene" desde useGLTF, sin castear
  const { scene } = useGLTF('/models/2022_toyota_hilux.glb');
  return <primitive object={scene} scale={scale} position={position} />;
}

// Precarga el modelo para evitar el "pop-in" al montar el componente
useGLTF.preload('/models/2022_toyota_hilux.glb');

// Sin anotar el tipo de retorno: TS lo infiere solo y evitamos
// problemas con el namespace JSX entre versiones de React.
export default function ModeloPrueba() {
  return (
    <Canvas
      camera={{ position: [3, 3, 5], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Luces */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1} />

      <Suspense fallback={null}>
        <Modelo scale={1} position={[0, 0, 0]} />
        <Environment preset="city" />
      </Suspense>

      <OrbitControls enableDamping />
    </Canvas>
  );
}
