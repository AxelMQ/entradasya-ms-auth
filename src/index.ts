import { app } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { pool } from './config/database';

const server = app.listen(env.PORT, () => {
  logger.info(`[ms-auth] Servidor ejecutándose en http://localhost:${env.PORT}`, {
    port: env.PORT,
    nodeEnv: env.NODE_ENV
  });
});

const gracefulShutdown = (signal: string) => {
  logger.info(`Señal ${signal} recibida. Cerrando ms-auth de manera segura...`);
  server.close(async () => {
    logger.info('Servidor HTTP cerrado.');
    try {
      await pool.end();
      logger.info('Pool de conexiones de PostgreSQL cerrado.');
      process.exit(0);
    } catch (err) {
      logger.error('Error al cerrar el pool de PostgreSQL:', { error: (err as Error).message });
      process.exit(1);
    }
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export default server;
