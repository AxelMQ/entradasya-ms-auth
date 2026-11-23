import express, { Application } from 'express';
import cors from 'cors';
import { loggerMiddleware } from './middleware/logger.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import { authenticateJwt } from './middleware/auth.middleware';
import { authController } from './controllers/auth.controller';
import { healthController } from './controllers/health.controller';

export const createApp = (): Application => {
  const app = express();

  // Middlewares globales
  app.use(cors());
  app.use(express.json());
  app.use(loggerMiddleware);

  // Chequeos de Salud (Health Checks)
  app.get('/health/live', healthController.live);
  app.get('/health/ready', healthController.ready);
  app.get('/health', healthController.live);

  // Rutas de Autenticación API v1
  const authRouter = express.Router();
  authRouter.post('/register', authController.register);
  authRouter.post('/login', authController.login);
  authRouter.get('/me', authenticateJwt, authController.me);

  app.use('/api/v1/auth', authRouter);

  // Alias compatible para /api/auth
  app.use('/api/auth', authRouter);

  // Middleware centralizado de errores
  app.use(errorMiddleware);

  return app;
};

export const app = createApp();
