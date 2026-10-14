import { Suspense, type Ref } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import type { FeaturedModel } from '../featuredModels';
import { CameraRig, LoadingPoster, ModelBoundary } from '@/shared/components/viewer3d';
import { CAM_Y, FIT_SIZE, FOV } from './config';
import { CarSlide } from './CarSlide';
import { ProgressRig } from './ProgressRig';
import { useCarouselGestures, type Car3DViewerHandle } from './useCarouselGestures';

export type { Car3DViewerHandle } from './useCarouselGestures';

interface Car3DViewerProps {
  models: FeaturedModel[];
  index: number;
  className?: string;
  onInteract?: () => void;
  onSwipe?: (delta: number) => void;
  ref?: Ref<Car3DViewerHandle>;
}

export function Car3DViewer({
  models,
  index,
  className,
  onInteract,
  onSwipe,
  ref,
}: Car3DViewerProps) {
  const { cameraZRef, progressRef, targetRef, dragRef, pointerHandlers } =
    useCarouselGestures({ index, models, onInteract, onSwipe, ref });

  return (
    <div
      className={className}
      onPointerDown={pointerHandlers.onPointerDown}
      onPointerMove={pointerHandlers.onPointerMove}
      onPointerUp={(event) => pointerHandlers.onPointerEnd(event, true)}
      onPointerCancel={(event) => pointerHandlers.onPointerEnd(event, false)}
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

        <CameraRig fit={FIT_SIZE} camY={CAM_Y} cameraZRef={cameraZRef} />
        <ProgressRig targetRef={targetRef} progressRef={progressRef} />

        {models.map((model, modelIndex) => (
          <Suspense key={model.id} fallback={<LoadingPoster />}>
            <ModelBoundary>
              <CarSlide
                model={model}
                index={modelIndex}
                count={models.length}
                progressRef={progressRef}
                dragRef={dragRef}
              />
            </ModelBoundary>
          </Suspense>
        ))}

        <Suspense fallback={null}>
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}