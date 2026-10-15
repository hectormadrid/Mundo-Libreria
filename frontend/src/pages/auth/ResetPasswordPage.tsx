import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle, KeyRound, XCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { isStrongPassword, passwordRule } from '../../lib/format';
import { FormError, PageLoader, Spinner } from '../../components/ui';
import { AuthShell, PasswordInput, PasswordStrength } from './AuthShell';

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const validation = useQuery({
    queryKey: ['reset-token', token],
    queryFn: () => api<{ valid: boolean }>('/auth/reset-password/validate', { method: 'POST', body: { token } }),
    retry: false,
    staleTime: Infinity,
  });

  const reset = useMutation({
    mutationFn: () => api<{ message: string }>('/auth/reset-password', { method: 'POST', body: { token, password } }),
    onError: (error) => setFormError(error.message),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!isStrongPassword(password)) return setFormError(passwordRule);
    if (password !== confirmar) return setFormError('Las contraseñas no coinciden.');
    reset.mutate();
  };

  let content;
  if (validation.isPending) {
    content = <PageLoader label="Verificando enlace..." />;
  } else if (validation.error) {
    content = (
      <div className="text-center">
        <XCircle className="mx-auto mb-3 h-12 w-12 text-lib-red" />
        <p className="mb-6 text-gray-700">{validation.error.message}</p>
        <Link to="/recuperar" className="btn-primary">
          Solicitar un nuevo enlace
        </Link>
      </div>
    );
  } else if (reset.isSuccess) {
    content = (
      <div className="text-center">
        <CheckCircle className="mx-auto mb-3 h-12 w-12 text-green-600" />
        <p className="mb-6 text-gray-700">{reset.data.message}</p>
        <Link to="/login" className="btn-primary">
          Iniciar sesión
        </Link>
      </div>
    );
  } else {
    content = (
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label htmlFor="password" className="label">Nueva contraseña</label>
          <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="new-password" />
          <PasswordStrength password={password} />
        </div>
        <div>
          <label htmlFor="confirmar" className="label">Confirmar contraseña</label>
          <PasswordInput id="confirmar" value={confirmar} onChange={setConfirmar} autoComplete="new-password" />
        </div>
        <FormError message={formError} />
        <button type="submit" disabled={reset.isPending} className="btn-primary w-full py-3">
          {reset.isPending ? <Spinner /> : <KeyRound className="h-5 w-5" />} Guardar nueva contraseña
        </button>
      </form>
    );
  }

  return <AuthShell title="Restablecer contraseña">{content}</AuthShell>;
}
