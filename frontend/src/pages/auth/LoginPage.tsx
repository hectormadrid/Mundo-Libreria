import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { LogIn } from 'lucide-react';
import { useLogin, useSession } from '../../hooks/useSession';
import { safeRedirect } from '../../components/guards';
import { FormError, Spinner } from '../../components/ui';
import { AuthShell, PasswordInput } from './AuthShell';

export function LoginPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { data: session } = useSession();
  const login = useLogin();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const redirect = safeRedirect(params.get('redirect'));
  // Los administradores entran por este mismo formulario y van al panel.
  const adminRedirect = redirect.startsWith('/admin') ? redirect : '/admin';

  if (session?.admin && !login.isPending) return <Navigate to={adminRedirect} replace />;
  if (session?.user && !login.isPending) return <Navigate to={redirect} replace />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    login.mutate(
      { correo, password },
      { onSuccess: (s) => navigate(s.admin ? adminRedirect : redirect, { replace: true }) },
    );
  };

  return (
    <AuthShell title="Iniciar sesión" subtitle="Bienvenido de vuelta">
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label htmlFor="correo" className="label">Correo electrónico</label>
          {/* type="text" (no "email") para que también acepte el usuario de un administrador. */}
          <input
            id="correo"
            type="text"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            className="input"
            required
            autoComplete="username"
            placeholder="tu@correo.cl"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="label">Contraseña</label>
            <Link to="/recuperar" className="mb-1.5 text-sm font-semibold text-lib-red hover:underline">
              ¿La olvidaste?
            </Link>
          </div>
          <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="current-password" />
        </div>
        <FormError message={login.error?.message ?? null} />
        <button type="submit" disabled={login.isPending} className="btn-primary w-full py-3">
          {login.isPending ? <Spinner /> : <LogIn className="h-5 w-5" />} Ingresar
        </button>
      </form>

      <div className="mt-6 space-y-3 text-center text-sm">
        <p className="text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="font-semibold text-lib-blue hover:underline">
            Regístrate
          </Link>
        </p>
        <Link to="/" className="block text-gray-500 hover:text-gray-700">
          ← Volver a la tienda
        </Link>
      </div>
    </AuthShell>
  );
}
