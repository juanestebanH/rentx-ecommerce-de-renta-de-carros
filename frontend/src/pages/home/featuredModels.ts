export type FeaturedModel = {
  id: string;
  nombre: string;
  detalle: string;
  url: string;
  /** Rotación base en Y para dejar el frente mirando a la izquierda de pantalla. */
  rotationY: number;
};

/**
 * Con la cámara sobre +Z, para dejar el frente hacia -X (izquierda de
 * pantalla) hay que girar +90° cuando el frente del modelo apunta a -Z
 * (Hilux, Tesla) y -90° cuando apunta a +Z (Fortuner, Kia, G-Class).
 */
const FACE_LEFT_FROM_NEG_Z = Math.PI / 2;
const FACE_LEFT_FROM_POS_Z = -Math.PI / 2;

export const FEATURED_MODELS: FeaturedModel[] = [
  {
    id: 'hilux',
    nombre: 'Toyota Hilux',
    detalle: '2022 · Pickup',
    url: '/models/2022_toyota_hilux.glb',
    rotationY: FACE_LEFT_FROM_NEG_Z,
  },
  {
    id: 'tesla',
    nombre: 'Tesla Model 3',
    detalle: '2018 · Sedán eléctrico',
    url: '/models/tesla_2018_model_3.glb',
    rotationY: FACE_LEFT_FROM_NEG_Z,
  },
  {
    id: 'fortuner',
    nombre: 'Toyota Fortuner',
    detalle: '2021 · SUV',
    url: '/models/toyota_fortuner_2021.glb',
    rotationY: FACE_LEFT_FROM_POS_Z,
  },
  {
    id: 'kia',
    nombre: 'Kia Sportage',
    detalle: 'SUV',
    url: '/models/kia_sportage.glb',
    rotationY: FACE_LEFT_FROM_POS_Z,
  },
  {
    id: 'gclass',
    nombre: 'Mercedes-Benz G-Class',
    detalle: 'Brabus · SUV',
    url: '/models/mercedes_g-class_brabus.glb',
    rotationY: FACE_LEFT_FROM_POS_Z,
  },
];
