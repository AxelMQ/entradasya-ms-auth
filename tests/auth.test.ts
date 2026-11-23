import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { app } from '../src/app';
import { userRepository, User } from '../src/models/user.model';
import { authService } from '../src/services/auth.service';

describe('Auth Service & Endpoints', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('debe registrar un nuevo cliente exitosamente y retornar token JWT y datos de usuario', async () => {
      vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
      vi.spyOn(userRepository, 'create').mockResolvedValue({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Carlos Gomez',
        email: 'carlos@example.com',
        role: 'cliente',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Carlos Gomez',
          email: 'carlos@example.com',
          password: 'Password123!'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Carlos Gomez',
        email: 'carlos@example.com',
        role: 'cliente'
      });

      // Validar claims del token JWT emitido
      const decoded = authService.verifyToken(res.body.token);
      expect(decoded.sub).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(decoded.email).toBe('carlos@example.com');
      expect(decoded.role).toBe('cliente');
      expect(decoded.iss).toBe('entradasya-auth');
    });

    it('debe retornar 409 Conflict si el correo ya está registrado', async () => {
      vi.spyOn(userRepository, 'findByEmail').mockResolvedValue({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Existente',
        email: 'carlos@example.com',
        password_hash: 'hash',
        role: 'cliente',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Carlos Gomez',
          email: 'carlos@example.com',
          password: 'Password123!'
        });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('AUTH_EMAIL_ALREADY_EXISTS');
    });

    it('debe retornar 400 Bad Request si la contraseña no cumple requisitos de seguridad', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Carlos Gomez',
          email: 'carlos@example.com',
          password: 'debil' // menor a 8 caracteres, sin mayúscula ni número
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('debe retornar 400 Bad Request si el formato de email es inválido', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Carlos Gomez',
          email: 'correo-no-valido',
          password: 'Password123!'
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    const passwordHash = bcrypt.hashSync('Password123!', 10);
    const mockUser: User = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Carlos Gomez',
      email: 'carlos@example.com',
      password_hash: passwordHash,
      role: 'cliente',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    it('debe autenticar credenciales válidas y retornar JWT y usuario', async () => {
      vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'carlos@example.com',
          password: 'Password123!'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role
      });

      const decoded = authService.verifyToken(res.body.token);
      expect(decoded.sub).toBe(mockUser.id);
      expect(decoded.role).toBe('cliente');
    });

    it('debe retornar 401 Unauthorized si la contraseña es incorrecta', async () => {
      vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'carlos@example.com',
          password: 'PasswordErroneo!'
        });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('AUTH_INVALID_CREDENTIALS');
    });

    it('debe retornar 401 Unauthorized si el correo no existe', async () => {
      vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'inexistente@example.com',
          password: 'Password123!'
        });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('AUTH_INVALID_CREDENTIALS');
    });

    it('debe retornar 401 Unauthorized si el usuario está inactivo', async () => {
      vi.spyOn(userRepository, 'findByEmail').mockResolvedValue({
        ...mockUser,
        is_active: false
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'carlos@example.com',
          password: 'Password123!'
        });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('AUTH_INVALID_CREDENTIALS');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('debe retornar el perfil del usuario cuando se presenta un token JWT válido', async () => {
      const mockProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Carlos Gomez',
        email: 'carlos@example.com',
        role: 'cliente' as const,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      vi.spyOn(userRepository, 'findById').mockResolvedValue(mockProfile);

      const token = authService.generateToken({
        id: mockProfile.id,
        name: mockProfile.name,
        email: mockProfile.email,
        role: mockProfile.role
      });

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(mockProfile.id);
      expect(res.body.email).toBe(mockProfile.email);
    });

    it('debe retornar 401 Unauthorized si no se envía la cabecera Authorization', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('AUTH_TOKEN_MISSING');
    });

    it('debe retornar 401 Unauthorized si el token es inválido o corrupto', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer token_invalido_12345');

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('AUTH_INVALID_TOKEN');
    });
  });
});
