import { Request, Response, NextFunction } from 'express';
import { authService, JwtTokenPayload } from '../services/auth.service';
import { AppError } from './error.middleware';

declare global {
  namespace Express {
    interface Request {
      user?: JwtTokenPayload;
    }
  }
}

export const authenticateJwt = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new AppError('Cabecera Authorization no proporcionada', 401, 'AUTH_TOKEN_MISSING'));
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next(
      new AppError('Formato de autorización inválido. Debe ser Bearer <token>', 401, 'AUTH_TOKEN_MALFORMED')
    );
  }

  const token = parts[1];

  try {
    const payload = authService.verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    next(err);
  }
};
