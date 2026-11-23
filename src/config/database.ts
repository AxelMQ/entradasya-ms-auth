import { Pool, PoolConfig } from 'pg';
import { env } from './env';
import { logger } from '../utils/logger';

const poolConfig: PoolConfig = env.DATABASE_URL
  ? { connectionString: env.DATABASE_URL }
  : {
      host: env.DB_HOST,
      port: env.DB_PORT,
      database: env.DB_NAME,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    };

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  logger.error('Error inesperado en el pool de PostgreSQL', { error: err.message });
});

export const query = (text: string, params?: unknown[]) => {
  return pool.query(text, params);
};

export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    const res = await pool.query('SELECT 1 AS ready');
    return res.rows.length > 0 && res.rows[0].ready === 1;
  } catch (err: unknown) {
    const error = err as Error;
    logger.warn('Fallo en verificación de conexión a auth_db', { error: error.message });
    return false;
  }
};
