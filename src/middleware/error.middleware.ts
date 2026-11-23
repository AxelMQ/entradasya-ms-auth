import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export class AppError extends Error {
  public statusCode: number;
  public code?: string;

  constructor(message: string, statusCode = 500, code?: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ZodError) {
    logger.warn('Error de validación de entrada', { issues: err.issues });
    res.status(400).json({
      error: 'Error de validación',
      code: 'VALIDATION_ERROR',
      details: err.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message
      }))
    });
    return;
  }

  if (err instanceof AppError) {
    logger.warn(`AppError [${err.statusCode}]: ${err.message}`, { code: err.code });
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code
    });
    return;
  }

  logger.error('Error no controlado en el servidor', {
    error: err.message,
    stack: err.stack
  });

  res.status(500).json({
    error: 'Error interno del servidor',
    code: 'INTERNAL_SERVER_ERROR'
  });
};
