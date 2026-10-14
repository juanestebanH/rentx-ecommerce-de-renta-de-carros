import { Html } from '@react-three/drei';

export function LoadingPoster() {
  return (
    <Html center style={{ pointerEvents: 'none' }}>
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-card/90 px-5 py-4 shadow-md backdrop-blur-md">
        <span
          aria-hidden="true"
          className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent"
        />
        <p className="my-0 text-xs font-medium text-foreground">
          Cargando modelo 3D…
        </p>
      </div>
    </Html>
  );
}