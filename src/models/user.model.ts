import { query } from '../config/database';

export type UserRole = 'cliente' | 'organizador' | 'portero';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export type UserWithoutPassword = Omit<User, 'password_hash'>;

export interface CreateUserData {
  name: string;
  email: string;
  password_hash: string;
  role?: UserRole;
}

export const userRepository = {
  async findByEmail(email: string): Promise<User | null> {
    const res = await query(
      'SELECT id, name, email, password_hash, role, is_active, created_at, updated_at FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
      [email]
    );
    if (res.rows.length === 0) return null;
    return res.rows[0] as User;
  },

  async findById(id: string): Promise<UserWithoutPassword | null> {
    const res = await query(
      'SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE id = $1 LIMIT 1',
      [id]
    );
    if (res.rows.length === 0) return null;
    return res.rows[0] as UserWithoutPassword;
  },

  async create(data: CreateUserData): Promise<UserWithoutPassword> {
    const role = data.role || 'cliente';
    const res = await query(
      `INSERT INTO users (name, email, password_hash, role, is_active)
       VALUES ($1, LOWER($2), $3, $4, TRUE)
       RETURNING id, name, email, role, is_active, created_at, updated_at`,
      [data.name, data.email, data.password_hash, role]
    );
    return res.rows[0] as UserWithoutPassword;
  }
};
