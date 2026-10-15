import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { api } from '../../lib/api';
import { formatRut, isStrongPassword, passwordRule } from '../../lib/format';
import { alertSuccess } from '../../lib/alerts';
import { FormError, Spinner } from '../../components/ui';
import { AuthShell, PasswordInput, PasswordStrength } from './AuthShell';

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', rut: '', correo: '', telefono: '', password: '', confirmar: '' });
  const [formError, setFormError] = useState<string | null>(null);

  const register = useMutation({
    mutationFn: () =>
      api<{ message: string }>('/auth/register', {
        method: 'POST',
        body: { nombre: form.nombre, rut: form.rut, correo: form.correo, telefono: form.telefono, password: form.password },
      }),
    onSuccess: async ({ message }) => {
      await alertSuccess('¡Cuenta creada!', message, 'Iniciar sesión');
      navigate('/login');
    },
    onError: (error) => setFormError(error.message),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!isStrongPassword(form.password)) return setFormError(passwordRule);
    if (form.password !== form.confirmar) return setFormError('Las contraseñas no coinciden.');
    register.mutate();
  };

  return (
    <AuthShell title="Crear cuenta" subtitle="Únete a Mundo Librería">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="nombre" className="label">Nombre completo</label>
          <input id="nombre" className="input" required autoComplete="name" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="rut" className="label">RUT</label>
            <input
              id="rut"
              className="input"
              required
              placeholder="12.345.678-9"
              value={form.rut}
              onChange={(e) => setForm({ ...form, rut: formatRut(e.target.value) })}
            />
          </div>
          <div>
            <label htmlFor="telefono" className="label">Teléfono</label>
            <input
              id="telefono"
              type="tel"
              className="input"
              required
              autoComplete="tel"
              placeholder="+56912345678"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label htmlFor="correo" className="label">Correo electrónico</label>
          <input id="correo" type="email" className="input" required autoComplete="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} />
        </div>
        <div>
          <label htmlFor="password" className="label">Contraseña</label>
          <PasswordInput id="password" value={form.password} onChange={(password) => setForm({ ...form, password })} autoComplete="new-password" />
          <PasswordStrength password={form.password} />
        </div>
        <div>
          <label htmlFor="confirmar" className="label">Confirmar contraseña</label>
          <PasswordInput id="confirmar" value={form.confirmar} onChange={(confirmar) => setForm({ ...form, confirmar })} autoComplete="new-password" />
        </div>
        <FormError message={formError} />
        <button type="submit" disabled={register.isPending} className="btn-primary w-full py-3">
          {register.isPending ? <Spinner /> : <UserPlus className="h-5 w-5" />} Crear cuenta
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-semibold text-lib-blue hover:underline">
          Inicia sesión
        </Link>
      </p>
    </AuthShell>
  );
}
