import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Mail, MailCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { FormError, Spinner } from '../../components/ui';
import { Field, fieldInput } from '../../components/store/FormField';
import { AuthShell, Notice } from './AuthShell';

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
    <AuthShell title="¿Olvidaste tu contraseña?" subtitle="No te preocupes. Escribe tu correo y te enviaremos un enlace para crear una nueva.">
      {request.isSuccess ? (
        <Notice tone="success" icon={<MailCheck className="h-6 w-6" />} title="Revisa tu correo">
          <p>{request.data.message}</p>
          <p className="mt-2">El enlace dura 1 hora. Si no lo ves, revisa la carpeta de spam.</p>
        </Notice>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <Field id="correo" label="Correo electrónico" icon={<Mail className="h-5 w-5" />}>
            <input id="correo" type="email" className={fieldInput()} required autoComplete="email" placeholder="tu@correo.cl" value={correo} onChange={(e) => setCorreo(e.target.value)} />
          </Field>
          <FormError message={request.error?.message ?? null} />
          <button type="submit" disabled={request.isPending} className="btn-brand h-14 w-full text-base">
            {request.isPending ? <Spinner /> : <Mail className="h-5 w-5" />} Enviar enlace
          </button>
        </form>
      )}
      <Link to="/login" className="mt-8 flex items-center justify-center gap-2 text-sm font-bold text-brand-700 hover:text-brand-900">
        <ArrowLeft className="h-4 w-4" /> Volver a iniciar sesión
      </Link>
    </AuthShell>
  );
}
