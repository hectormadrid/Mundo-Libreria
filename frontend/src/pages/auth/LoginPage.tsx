import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router';
import { ArrowRight, CheckCircle2, Mail } from 'lucide-react';
import { useLogin, useSession } from '../../hooks/useSession';
import { safeRedirect } from '../../components/guards';
import { FormError, Spinner } from '../../components/ui';
import { Field, PasswordField, fieldInput } from '../../components/store/FormField';
import { AuthShell, Notice } from './AuthShell';

export function LoginPage() {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: session } = useSession();
  const login = useLogin();
  // Al venir del registro se muestra un aviso y se completa el correo.
  const registered = (location.state as { registrado?: boolean; correo?: string } | null) ?? null;
  const [correo, setCorreo] = useState(registered?.correo ?? '');
  const [password, setPassword] = useState('');
  const redirect = safeRedirect(params.get('redirect'));
  // Los administradores entran por este mismo formulario y van al panel.
  const adminRedirect = redirect.startsWith('/admin') ? redirect : '/admin';
  const redirectQuery = redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : '';

  if (session?.admin && !login.isPending) return <Navigate to={adminRedirect} replace />;
  if (session?.user && !login.isPending) return <Navigate to={redirect} replace />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    login.mutate({ correo, password }, { onSuccess: (s) => navigate(s.admin ? adminRedirect : redirect, { replace: true }) });
  };

  return (
    <AuthShell title="¡Hola de nuevo!" subtitle="Ingresa para seguir tus pedidos y comprar más rápido.">
      {registered?.registrado && (
        <div className="mb-6">
          <Notice tone="success" icon={<CheckCircle2 className="h-6 w-6" />} title="¡Tu cuenta está lista!">
            Ingresa con tu correo y la contraseña que acabas de crear.
          </Notice>
        </div>
      )}
      <form onSubmit={submit} className="space-y-5">
        <Field id="correo" label="Correo electrónico" icon={<Mail className="h-5 w-5" />}>
          {/* type="text" (no "email") para que también acepte el usuario de un administrador. */}
          <input
            id="correo"
            type="text"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            className={fieldInput()}
            required
            autoComplete="username"
            placeholder="tu@correo.cl"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
        </Field>
        <PasswordField
          id="password"
          label="Contraseña"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          action={
            <Link to="/recuperar" className="text-sm font-semibold text-brand-700 hover:text-brand-900">
              ¿La olvidaste?
            </Link>
          }
        />
        <FormError message={login.error?.message ?? null} />
        <button type="submit" disabled={login.isPending} className="btn-brand h-14 w-full text-base">
          {login.isPending && <Spinner />} Ingresar {!login.isPending && <ArrowRight className="h-5 w-5" />}
        </button>
      </form>

      <div className="mt-8 rounded-3xl bg-slate-50 p-5 text-center ring-1 ring-slate-200/70">
        <p className="text-slate-600">¿Primera vez en Mundo Librería?</p>
        <Link to={`/registro${redirectQuery}`} className="mt-1 inline-flex items-center gap-1 font-bold text-brand-700 hover:text-brand-900">
          Crea tu cuenta gratis <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </AuthShell>
  );
}
