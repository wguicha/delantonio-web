import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Logo } from '../components/layout/Logo';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import type { LoginFormData } from '../types';

const loginSchema = z.object({
  username: z.string().min(1, 'Usuario requerido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      setError(null);
      const token = await authService.login(data);
      login(token);
      navigate('/admin');
    } catch {
      setError('Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-rock-black px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="md" />
        </div>

        <div className="bg-rock-card border border-rock-border p-8">
          <h1
            className="text-rock-white text-center mb-6"
            style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: '2rem',
              letterSpacing: '0.1em',
            }}
          >
            PANEL ADMIN
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-rock-metal-light text-sm mb-1">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                className="w-full bg-rock-dark border border-rock-border text-rock-white px-4 py-3 focus:outline-none focus:border-rock-red transition-colors"
                {...register('username')}
              />
              {errors.username && (
                <p className="text-rock-red text-xs mt-1">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-rock-metal-light text-sm mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="w-full bg-rock-dark border border-rock-border text-rock-white px-4 py-3 focus:outline-none focus:border-rock-red transition-colors"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-rock-red text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div role="alert" className="bg-rock-red/10 border border-rock-red/50 text-rock-red px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rock-red hover:bg-rock-red-bright disabled:opacity-50 text-white font-rock text-xl py-3 transition-colors"
              style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.1em' }}
            >
              {loading ? 'ENTRANDO...' : 'ENTRAR'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
