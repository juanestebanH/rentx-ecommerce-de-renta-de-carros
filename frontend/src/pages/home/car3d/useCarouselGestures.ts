import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type Ref,
} from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { FeaturedModel } from '../featuredModels';
import {
  DRAG_SPEED,
  FLICK_PX_MS,
  FOV,
  GESTURE_LOCK_PX,
  HORIZONTAL_RATIO,
  PREVIEW_BOOST,
  PREVIEW_CLAMP,
  SPACING,
  SWIPE_COMMIT,
  SWIPE_MODE,
} from './config';

export type Car3DViewerHandle = {
  advance: (delta: number) => void;
};

type GestureMode = 'pending' | 'swipe' | 'rotate';

interface CarouselGestureOptions {
  index: number;
  models: FeaturedModel[];
  onInteract?: () => void;
  onSwipe?: (delta: number) => void;
  ref?: Ref<Car3DViewerHandle>;
}

export function useCarouselGestures({
  index,
  models,
  onInteract,
  onSwipe,
  ref,
}: CarouselGestureOptions) {
  const progressRef = useRef(index);
  const dragRef = useRef(0);
  const targetRef = useRef(index);
  const indexRef = useRef(index);
  const previewRef = useRef(0);
  const cameraZRef = useRef(8);
  const dragging = useRef(false);
  const gesture = useRef<GestureMode>('pending');
  const startX = useRef(0);
  const startY = useRef(0);
  const lastX = useRef(0);
  const lastMoveX = useRef(0);
  const lastMoveT = useRef(0);
  const lastVelocity = useRef(0);

  const advance = useCallback(
    (delta: number) => {
      onSwipe?.(delta);
      targetRef.current = indexRef.current + delta;
    },
    [onSwipe],
  );

  useImperativeHandle(ref, () => ({ advance }), [advance]);

  useEffect(() => {
    models.forEach((model) => useGLTF.preload(model.url, false, true));
  }, [models]);

  useEffect(() => {
    dragRef.current = 0;
  }, [index]);

  useEffect(() => {
    indexRef.current = index;
    targetRef.current = index;
  }, [index]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    gesture.current = 'pending';
    startX.current = event.clientX;
    startY.current = event.clientY;
    lastX.current = event.clientX;
    lastMoveX.current = event.clientX;
    lastMoveT.current = performance.now();
    lastVelocity.current = 0;
    previewRef.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
    onInteract?.();
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const now = performance.now();
    const totalDx = event.clientX - startX.current;
    const totalDy = event.clientY - startY.current;

    if (gesture.current === 'pending') {
      if (
        Math.abs(totalDx) > GESTURE_LOCK_PX ||
        Math.abs(totalDy) > GESTURE_LOCK_PX
      ) {
        gesture.current =
          SWIPE_MODE && Math.abs(totalDx) > Math.abs(totalDy) * HORIZONTAL_RATIO
            ? 'swipe'
            : 'rotate';
      }
    }

    if (gesture.current === 'swipe') {
      const el = event.currentTarget;
      const aspect = el.clientWidth / Math.max(el.clientHeight, 1);
      const vHalf = Math.tan(THREE.MathUtils.degToRad(FOV) / 2);
      const visibleHalfWorld = vHalf * cameraZRef.current * aspect;
      const worldPerPx = (2 * visibleHalfWorld) / Math.max(el.clientWidth, 1);
      const slides = (totalDx * worldPerPx * PREVIEW_BOOST) / SPACING;
      previewRef.current = THREE.MathUtils.clamp(
        slides,
        -PREVIEW_CLAMP,
        PREVIEW_CLAMP,
      );
      targetRef.current = index + previewRef.current;
    } else if (gesture.current === 'rotate') {
      dragRef.current += (event.clientX - lastX.current) * DRAG_SPEED;
      lastX.current = event.clientX;
    }

    if (now - lastMoveT.current > 0) {
      lastVelocity.current =
        (event.clientX - lastMoveX.current) / (now - lastMoveT.current);
    }
    lastMoveX.current = event.clientX;
    lastMoveT.current = now;
  };

  const onPointerEnd = (
    event: ReactPointerEvent<HTMLDivElement>,
    allowAdvance: boolean,
  ) => {
    if (!dragging.current) return;

    if (gesture.current === 'swipe') {
      if (allowAdvance) {
        const flick = Math.abs(lastVelocity.current) > FLICK_PX_MS;
        if (flick) {
          advance(lastVelocity.current < 0 ? -1 : 1);
        } else {
          const rounded = Math.round(index + previewRef.current);
          const delta = rounded - index;
          if (Math.abs(previewRef.current) >= SWIPE_COMMIT && delta !== 0) {
            advance(delta);
          } else {
            targetRef.current = index;
          }
        }
      } else {
        targetRef.current = index;
      }
    }

    previewRef.current = 0;
    gesture.current = 'pending';
    dragging.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return {
    cameraZRef,
    progressRef,
    targetRef,
    dragRef,
    advance,
    pointerHandlers: { onPointerDown, onPointerMove, onPointerEnd },
  };
}