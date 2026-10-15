import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle, Mail } from 'lucide-react';
import { api } from '../../lib/api';
import { FormError, Spinner } from '../../components/ui';
import { AuthShell } from './AuthShell';

export function ForgotPasswordPage() {
  const [correo, setCorreo] = useState('');
  const request = useMutation({
    mutationFn: () => api<{ message: string }>('/auth/forgot-password', { method: 'POST', body: { correo } }),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    request.mutate();
  };

  return (
    <AuthShell title="¿Olvidaste tu contraseña?" subtitle="Te enviaremos un enlace para restablecerla.">
      {request.isSuccess ? (
        <div className="rounded-xl bg-green-50 p-6 text-center text-green-800" role="status">
          <CheckCircle className="mx-auto mb-2 h-10 w-10" />
          <p className="font-bold">¡Solicitud enviada!</p>
          <p className="mt-2 text-sm">{request.data.message}</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label htmlFor="correo" className="label">Correo electrónico</label>
            <input id="correo" type="email" className="input" required autoComplete="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />
          </div>
          <FormError message={request.error?.message ?? null} />
          <button type="submit" disabled={request.isPending} className="btn-primary w-full py-3">
            {request.isPending ? <Spinner /> : <Mail className="h-5 w-5" />} Enviar enlace
          </button>
        </form>
      )}
      <Link to="/login" className="mt-6 block text-center text-sm text-lib-blue hover:underline">
        Volver a iniciar sesión
      </Link>
    </AuthShell>
  );
}
