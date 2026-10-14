# RentX

Plataforma web de renta de carros: catálogo con disponibilidad por fechas, reserva con pago y un panel de administración para operar el negocio. Proyecto de portafolio full-stack.

**Demo:** [COMPLETAR: enlace al despliegue, o borrar esta línea]

## Funcionalidades

**Clientes**

- Catálogo con filtros y disponibilidad según el rango de fechas elegido
- Detalle del vehículo y reserva
- Mis rentas: consultar el estado y cancelar mientras la renta está pendiente
- Registro e inicio de sesión

**Administrador**

- **Dashboard:** KPIs, ingresos de los últimos meses y estado de la flota
- **Rentas:** cola de trabajo "Requieren acción", confirmación de pagos y cambio de estado de cada renta
- **Vehículos, Clientes, Catálogo** (marcas y categorías) **y Usuarios** (cuentas de administrador)
- **Reportes:** análisis por periodo con comparación frente al periodo anterior y exportación a CSV

## Reglas de negocio

- Una renta pasa por los estados `pendiente → confirmada → en curso → finalizada`, o `cancelada`.
- La disponibilidad de un vehículo se calcula por solapamiento de fechas; no se guarda como un campo del vehículo.
- Los montos se manejan en pesos colombianos (COP).
- Hay dos roles: `admin` (personal interno) y `client` (quien renta). La sesión usa JWT.

## Tecnologías

| Capa                     | Tecnología                                       |
| ------------------------ | ------------------------------------------------ |
| Frontend                 | React, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| Backend                  | Node.js                                          |
| Base de datos y archivos | Supabase (PostgreSQL y Storage)                  |

## Cómo ejecutarlo

Requisitos: Node.js [COMPLETAR: versión] y un proyecto de Supabase.

```bash
git clone [COMPLETAR: URL del repositorio]
cd [COMPLETAR: carpeta del proyecto]

# Backend
cd [COMPLETAR: carpeta del backend]
npm install
cp .env.example .env
npm run dev

# Frontend (en otra terminal)
cd [COMPLETAR: carpeta del frontend]
pnpm install
cp .env.example .env
pnpm run dev              # http://localhost:5173
```

## Autor

juan hoyos · www.linkedin.com/in/juan-esteban-hoyos
