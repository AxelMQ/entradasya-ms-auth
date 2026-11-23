import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { userRepository, UserWithoutPassword } from '../models/user.model';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';
import { AppError } from '../middleware/error.middleware';

export interface JwtTokenPayload {
  sub: string;
  name: string;
  email: string;
  role: string;
  iss: string;
  iat?: number;
  exp?: number;
}

export const authService = {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  },

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  generateToken(user: { id: string; name: string; email: string; role: string }): string {
    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    const options: SignOptions = {
      algorithm: 'HS256',
      expiresIn: env.JWT_EXPIRES_IN as any,
      issuer: 'entradasya-auth'
    };

    return jwt.sign(payload, env.JWT_SECRET, options);
  },

  verifyToken(token: string): JwtTokenPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET, {
        algorithms: ['HS256'],
        issuer: 'entradasya-auth'
      });
      return decoded as JwtTokenPayload;
    } catch (_err) {
      throw new AppError('Token de acceso inválido o expirado', 401, 'AUTH_INVALID_TOKEN');
    }
  },

  async register(input: RegisterInput): Promise<{ user: UserWithoutPassword; token: string }> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError('El correo electrónico ya se encuentra registrado', 409, 'AUTH_EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await this.hashPassword(input.password);

    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      password_hash: passwordHash,
      role: 'cliente'
    });

    const token = this.generateToken(user);

    return { user, token };
  },

  async login(input: LoginInput): Promise<{
    user: { id: string; name: string; email: string; role: string };
    token: string;
  }> {
    const user = await userRepository.findByEmail(input.email);
    if (!user || !user.is_active) {
      throw new AppError('Credenciales inválidas', 401, 'AUTH_INVALID_CREDENTIALS');
    }

    const isMatch = await this.comparePassword(input.password, user.password_hash);
    if (!isMatch) {
      throw new AppError('Credenciales inválidas', 401, 'AUTH_INVALID_CREDENTIALS');
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  },

  async getProfile(userId: string): Promise<UserWithoutPassword> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404, 'AUTH_USER_NOT_FOUND');
    }
    return user;
  }
};
