import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z
  .object({
    first_name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must not exceed 50 characters'),
    last_name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must not exceed 50 characters'),

    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),

    password1: z
      .string()
      .min(8, 'Password must be at least 8 characters'),

    password2: z.string(),
  })
  .refine((data) => data.password1 === data.password2, {
    path: ['password2'],
    message: 'Passwords do not match',
  });

export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
