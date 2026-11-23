import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('8001'),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  DATABASE_URL: z.string().optional(),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('5432'),
  DB_NAME: z.string().default('auth_db'),
  DB_USER: z.string().default('auth_user'),
  DB_PASSWORD: z.string().default('auth_pass'),
  JWT_SECRET: z.string().min(8).default('super-secure-shared-secret-entradasya-2026'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info')
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('[ms-auth] Error al validar variables de entorno:', parsedEnv.error.format());
  throw new Error('Configuración inválida en variables de entorno');
}

export const env = parsedEnv.data;
