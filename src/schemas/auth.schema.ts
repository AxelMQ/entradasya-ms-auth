import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'El nombre es obligatorio' })
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  email: z
    .string({ required_error: 'El correo electrónico es obligatorio' })
    .trim()
    .email('Formato de correo electrónico inválido')
    .toLowerCase(),
  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'El correo electrónico es obligatorio' })
    .trim()
    .email('Formato de correo electrónico inválido')
    .toLowerCase(),
  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(1, 'La contraseña es obligatoria')
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
