import { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { authService } from '../services/auth.service';
import { AppError } from '../middleware/error.middleware';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await authService.register(validatedData);
      res.status(201).json({
        token: result.token,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.sub) {
        throw new AppError('Usuario no autenticado', 401, 'AUTH_UNAUTHORIZED');
      }
      const profile = await authService.getProfile(req.user.sub);
      res.status(200).json(profile);
    } catch (err) {
      next(err);
    }
  }
};
