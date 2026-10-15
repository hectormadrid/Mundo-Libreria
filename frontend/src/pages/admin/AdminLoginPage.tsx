import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { Crown, LogIn } from 'lucide-react';
import { useAdminLogin, useSession } from '../../hooks/useSession';
import { FormError, Spinner } from '../../components/ui';
import { PasswordInput } from '../auth/AuthShell';

export function AdminLoginPage() {
  const { data: session } = useSession();
  const login = useAdminLogin();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');

  if (session?.admin && !login.isPending) return <Navigate to="/admin" replace />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    login.mutate({ nombre, password }, { onSuccess: () => navigate('/admin', { replace: true }) });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-lib-blue px-4">
      <div className="w-full max-w-md animate-fade-in overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-gray-800 via-lib-blue to-gray-900 p-8 text-center text-white">
          <span className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-lib-yellow to-lib-red shadow-lg">
            <Crown className="h-10 w-10" />
          </span>
          <h1 className="text-3xl font-bold">Panel administrativo</h1>
          <p className="mt-1 text-sm text-white/70">Acceso solo para personal autorizado</p>
        </div>
        <form onSubmit={submit} className="space-y-5 p-8">
          <div>
            <label htmlFor="nombre" className="label">Usuario</label>
            <input id="nombre" className="input" required autoComplete="username" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div>
            <label htmlFor="password" className="label">Contraseña</label>
            <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="current-password" />
          </div>
          <FormError message={login.error?.message ?? null} />
          <button type="submit" disabled={login.isPending} className="btn-primary w-full py-3">
            {login.isPending ? <Spinner /> : <LogIn className="h-5 w-5" />} Acceder al panel
          </button>
          <Link to="/" className="block text-center text-sm text-gray-500 hover:text-gray-700">
            ← Volver al sitio principal
          </Link>
        </form>
      </div>
    </div>
  );
}
