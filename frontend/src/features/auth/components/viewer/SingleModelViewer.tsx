import {
  Suspense,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { cn } from 'cn';
import type { FeaturedModel } from '@/pages/home/featuredModels';
import { CameraRig, LoadingPoster, ModelBoundary } from '@/shared/components/viewer3d';
import { CAM_Y, DRAG_SPEED, FIT_SIZE, FOV, KEY_STEP, LOOK_Y } from './config';
import { CarModel } from './CarModel';

interface SingleModelViewerProps {
  model: FeaturedModel;
  autoRotate: boolean;
  onInteract?: () => void;
  onInteractEnd?: () => void;
  className?: string;
}

export function SingleModelViewer({
  model,
  autoRotate,
  onInteract,
  onInteractEnd,
  className,
}: SingleModelViewerProps) {
  const dragging = useRef(false);
  const lastX = useRef(0);
  const dragYaw = useRef(0);
  const idleYaw = useRef(0);
  const currentYaw = useRef(0);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    lastX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
    onInteract?.();
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragYaw.current += (event.clientX - lastX.current) * DRAG_SPEED;
    lastX.current = event.clientX;
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    onInteractEnd?.();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      dragYaw.current -= KEY_STEP;
      event.preventDefault();
    } else if (event.key === 'ArrowRight') {
      dragYaw.current += KEY_STEP;
      event.preventDefault();
    }
  };

  return (
    <div
      className={cn(
        'touch-none select-none outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
        className,
      )}
      tabIndex={0}
      aria-label={`${model.nombre}. Arrastra para girar el modelo en 360 grados.`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onKeyDown={handleKeyDown}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, CAM_Y, 8], fov: FOV }}
        gl={{ antialias: true, alpha: true }}
        className="!h-full !w-full"
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 8, 6]} intensity={1.1} />
        <directionalLight position={[-6, 4, -4]} intensity={0.35} />

        <CameraRig fit={FIT_SIZE} camY={CAM_Y} lookY={LOOK_Y} />

        <Suspense fallback={<LoadingPoster />}>
          <ModelBoundary>
            <CarModel
              model={model}
              autoRotate={autoRotate}
              dragYawRef={dragYaw}
              idleYawRef={idleYaw}
              currentYawRef={currentYaw}
            />
          </ModelBoundary>
        </Suspense>

        <Suspense fallback={null}>
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}