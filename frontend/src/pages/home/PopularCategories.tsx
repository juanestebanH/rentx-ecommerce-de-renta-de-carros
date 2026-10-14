import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { ArrowUpRight, CarFront } from 'lucide-react';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { categoriaLabel } from '@/shared/utils/catalogo.format';
import {
  useCategorias,
  useVehicles,
} from '@/features/vehicles/hooks/useVehicles';
import type { Vehicle } from '@/features/vehicles/types/vehicle.types';

const MAX_CATEGORIES = 4;

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

function primeraFoto(vehiculos: Vehicle[]): string | null {
  return vehiculos.find((vehiculo) => vehiculo.foto)?.foto ?? null;
}

function CategoriaCardSkeleton() {
  return (
    <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-accent/50 sm:aspect-[3/2]">
      <Skeleton className="h-full w-full" />
    </div>
  );
}

function CategoriaCard({
  nombre,
  foto,
}: {
  nombre: string;
  foto: string | null;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(foto) && !imgFailed;
  const label = categoriaLabel(nombre);

  return (
    <motion.div
      variants={item}
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="h-full"
    >
      <Link
        to={`/catalogo?id_categoria=${encodeURIComponent(nombre)}`}
        className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-sm transition-shadow duration-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:aspect-[3/2]"
      >
        {showImage ? (
          <img
            src={foto ?? undefined}
            alt={label}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-accent/40 text-accent-foreground">
            <CarFront className="size-12" aria-hidden="true" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
          <span className="text-lg font-semibold text-white sm:text-xl">
            {label}
          </span>
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 translate-y-1 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-sm transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100"
          >
            <ArrowUpRight className="size-4" />
          </span>
        </span>
      </Link>
    </motion.div>
  );
}

export function PopularCategories() {
  const categoriasQuery = useCategorias();
  const vehiclesQuery = useVehicles();

  const isLoading = categoriasQuery.isLoading || vehiclesQuery.isLoading;

  const porCategoria = new Map<string, Vehicle[]>();
  for (const vehiculo of vehiclesQuery.data ?? []) {
    const lista = porCategoria.get(vehiculo.id_categoria);
    if (lista) lista.push(vehiculo);
    else porCategoria.set(vehiculo.id_categoria, [vehiculo]);
  }

  const categorias = (categoriasQuery.data ?? [])
    .map((categoria) => categoria.nombre)
    .filter((nombre) => porCategoria.has(nombre))
    .slice(0, MAX_CATEGORIES)
    .map((nombre) => ({
      nombre,
      foto: primeraFoto(porCategoria.get(nombre) ?? []),
    }));

  return (
    <section
      aria-labelledby="categorias-titulo"
      className="w-full bg-background py-16 sm:py-20"
    >
      <motion.div
        className="mx-auto w-full max-w-6xl px-4 sm:px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={container}
      >
        <motion.p
          variants={item}
          className="my-0 text-xs font-semibold uppercase tracking-[0.28em] text-accent-foreground"
        >
          Explora por tipo
        </motion.p>
        <motion.h2
          variants={item}
          id="categorias-titulo"
          className="mt-3! text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          Categorías populares
        </motion.h2>
        <motion.p
          variants={item}
          className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base"
        >
          Elige el estilo que se ajuste a tu viaje y empieza a planear.
        </motion.p>
      </motion.div>

      <motion.div
        className="mx-auto mt-10 grid w-full max-w-6xl gap-5 px-4 sm:grid-cols-2 sm:px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={container}
      >
        {isLoading
          ? Array.from({ length: MAX_CATEGORIES }).map((_, index) => (
              <CategoriaCardSkeleton key={index} />
            ))
          : categorias.map((categoria) => (
              <CategoriaCard
                key={categoria.nombre}
                nombre={categoria.nombre}
                foto={categoria.foto}
              />
            ))}
      </motion.div>
    </section>
  );
}
