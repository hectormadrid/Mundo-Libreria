import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle2, KeyRound, XCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { isStrongPassword, passwordRule } from '../../lib/format';
import { FormError, PageLoader, Spinner } from '../../components/ui';
import { PasswordField, PasswordStrength } from '../../components/store/FormField';
import { AuthShell, Notice } from './AuthShell';

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
      <>
        <Notice tone="error" icon={<XCircle className="h-6 w-6" />} title="El enlace no sirve">
          {validation.error.message}
        </Notice>
        <Link to="/recuperar" className="btn-brand mt-6 h-14 w-full text-base">
          Pedir un enlace nuevo
        </Link>
      </>
    );
  } else if (reset.isSuccess) {
    content = (
      <>
        <Notice tone="success" icon={<CheckCircle2 className="h-6 w-6" />} title="¡Contraseña actualizada!">
          {reset.data.message}
        </Notice>
        <Link to="/login" className="btn-brand mt-6 h-14 w-full text-base">
          Iniciar sesión
        </Link>
      </>
    );
  } else {
    const mismatch = confirmar.length > 0 && confirmar !== password;
    content = (
      <form onSubmit={submit} className="space-y-5">
        <PasswordField id="password" label="Nueva contraseña" value={password} onChange={setPassword} autoComplete="new-password">
          <PasswordStrength password={password} />
        </PasswordField>
        <PasswordField
          id="confirmar"
          label="Repite la contraseña"
          value={confirmar}
          onChange={setConfirmar}
          autoComplete="new-password"
          error={mismatch ? 'Las contraseñas no coinciden.' : undefined}
        />
        <FormError message={formError} />
        <button type="submit" disabled={reset.isPending} className="btn-brand h-14 w-full text-base">
          {reset.isPending ? <Spinner /> : <KeyRound className="h-5 w-5" />} Guardar nueva contraseña
        </button>
      </form>
    );
  }

  return (
    <AuthShell title="Crea una nueva contraseña" subtitle="Elige una contraseña segura que no uses en otros sitios.">
      {content}
    </AuthShell>
  );
}
