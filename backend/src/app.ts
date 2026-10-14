import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { generalRateLimiter } from './shared/middlewares/rateLimit.js';
import authRoutes from './modules/auth/auth.routes.js';
import vehiclesRoutes from './modules/vehicles/vehicles.routes.js';
import rentalsRoutes from './modules/rentals/rentals.routes.js';
import paymentsRoutes from './modules/payments/payments.routes.js';
import clientsRoutes from './modules/clients/clients.routes.js';
import catalogRoutes from './modules/catalog/catalog.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';
import { errorHandler } from './shared/middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin: env.nodeEnv === 'production' ? process.env.FRONTEND_URL : true,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(generalRateLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/rentals', rentalsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/reports', reportsRoutes);

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`🚀 Server running on port ${env.port} (${env.nodeEnv})`);
});

export default app;
