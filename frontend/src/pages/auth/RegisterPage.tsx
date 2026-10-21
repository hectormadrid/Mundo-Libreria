import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { ArrowRight, IdCard, Mail, Phone, User } from 'lucide-react';
import { api } from '../../lib/api';
import { formatRut, isStrongPassword, passwordRule } from '../../lib/format';
import { safeRedirect } from '../../components/guards';
import { FormError, Spinner } from '../../components/ui';
import { Field, PasswordField, PasswordStrength, fieldInput } from '../../components/store/FormField';
import { AuthShell } from './AuthShell';

export function RegisterPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = safeRedirect(params.get('redirect'));
  const redirectQuery = redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : '';
  const [form, setForm] = useState({ nombre: '', rut: '', correo: '', telefono: '', password: '', confirmar: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value });

  const register = useMutation({
    mutationFn: () =>
      api<{ message: string }>('/auth/register', {
        method: 'POST',
        body: { nombre: form.nombre, rut: form.rut, correo: form.correo, telefono: form.telefono, password: form.password },
      }),
    // El correo viaja en el estado de la navegación, nunca en la URL.
    onSuccess: () => navigate(`/login${redirectQuery}`, { state: { registrado: true, correo: form.correo } }),
    onError: (error) => setFormError(error.message),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!isStrongPassword(form.password)) return setFormError(passwordRule);
    if (form.password !== form.confirmar) return setFormError('Las contraseñas no coinciden.');
    register.mutate();
  };

  const mismatch = form.confirmar.length > 0 && form.confirmar !== form.password;

  return (
    <AuthShell title="Crea tu cuenta" subtitle="Toma menos de un minuto y podrás comprar y seguir tus pedidos.">
      <form onSubmit={submit} className="space-y-5">
        <Field id="nombre" label="Nombre completo" icon={<User className="h-5 w-5" />}>
          <input id="nombre" className={fieldInput()} required autoComplete="name" maxLength={100} placeholder="Ej: Camila Rojas" value={form.nombre} onChange={set('nombre')} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="rut" label="RUT" icon={<IdCard className="h-5 w-5" />}>
            <input id="rut" className={fieldInput()} required placeholder="12.345.678-9" value={form.rut} onChange={(e) => setForm({ ...form, rut: formatRut(e.target.value) })} />
          </Field>
          <Field id="telefono" label="Teléfono" icon={<Phone className="h-5 w-5" />}>
            <input id="telefono" type="tel" className={fieldInput()} required autoComplete="tel" placeholder="+56912345678" value={form.telefono} onChange={set('telefono')} />
          </Field>
        </div>
        <Field id="correo" label="Correo electrónico" icon={<Mail className="h-5 w-5" />}>
          <input id="correo" type="email" className={fieldInput()} required autoComplete="email" placeholder="tu@correo.cl" value={form.correo} onChange={set('correo')} />
        </Field>
        <PasswordField id="password" label="Contraseña" value={form.password} onChange={(password) => setForm({ ...form, password })} autoComplete="new-password">
          <PasswordStrength password={form.password} />
        </PasswordField>
        <PasswordField
          id="confirmar"
          label="Repite la contraseña"
          value={form.confirmar}
          onChange={(confirmar) => setForm({ ...form, confirmar })}
          autoComplete="new-password"
          error={mismatch ? 'Las contraseñas no coinciden.' : undefined}
        />
        <FormError message={formError} />
        <button type="submit" disabled={register.isPending} className="btn-brand h-14 w-full text-base">
          {register.isPending && <Spinner />} Crear cuenta {!register.isPending && <ArrowRight className="h-5 w-5" />}
        </button>
      </form>
      <p className="mt-8 text-center text-slate-600">
        ¿Ya tienes cuenta?{' '}
        <Link to={`/login${redirectQuery}`} className="font-bold text-brand-700 hover:text-brand-900">
          Inicia sesión
        </Link>
      </p>
    </AuthShell>
  );
}
