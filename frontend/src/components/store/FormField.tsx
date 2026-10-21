import { useState, type ReactNode } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

/** Campo con etiqueta, ícono a la izquierda y mensaje de ayuda o de error. */
export function Field({
  id,
  label,
  hint,
  error,
  icon,
  action,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  icon: ReactNode;
  /** Enlace o botón a la derecha de la etiqueta (p. ej. "¿La olvidaste?"). */
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor={id} className="block text-sm font-semibold text-slate-800">
          {label}
        </label>
        {action}
      </div>
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400">{icon}</span>
        {children}
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-cherry-600">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

export const fieldInput = (hasError = false) =>
  `h-12 w-full rounded-2xl border bg-white pr-4 pl-11 text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:bg-slate-50 disabled:text-slate-500 ${
    hasError ? 'border-cherry-500 focus:ring-cherry-500/15' : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/15'
  }`;

/** Contraseña con botón para mostrarla u ocultarla. */
export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  error,
  action,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  error?: string;
  action?: ReactNode;
  /** Contenido bajo el campo, como el medidor de seguridad. */
  children?: ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <Field id={id} label={label} error={error} icon={<Lock className="h-5 w-5" />} action={action}>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={`${fieldInput(!!error)} pr-12`}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder="••••••••"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-brand-700"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </Field>
      {children}
    </div>
  );
}

const LEVELS = [
  { text: 'Muy débil', bar: 'bg-cherry-500', textColor: 'text-cherry-600' },
  { text: 'Débil', bar: 'bg-sun-500', textColor: 'text-amber-700' },
  { text: 'Media', bar: 'bg-brand-500', textColor: 'text-brand-700' },
  { text: 'Fuerte', bar: 'bg-emerald-500', textColor: 'text-emerald-700' },
];

const RULES: { label: string; test: (p: string) => boolean }[] = [
  { label: '8 caracteres', test: (p) => p.length >= 8 },
  { label: 'Mayúscula y minúscula', test: (p) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { label: 'Un número', test: (p) => /\d/.test(p) },
  { label: 'Un símbolo', test: (p) => /[^\w]/.test(p) },
];

/** Medidor de seguridad con la lista de requisitos que se van cumpliendo. */
export function PasswordStrength({ password }: { password: string }) {
  const score = RULES.filter((r) => r.test(password)).length;
  const level = LEVELS[Math.max(score - 1, 0)];

  return (
    <div className="mt-2.5" aria-live="polite">
      <div className="flex gap-1.5">
        {LEVELS.map((_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${password && i < score ? level.bar : 'bg-slate-200'}`} />
        ))}
      </div>
      <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        {RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <li key={rule.label} className={`flex items-center gap-1.5 ${ok ? 'text-emerald-700' : 'text-slate-500'}`}>
              <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold ${ok ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`}>
                {ok ? '✓' : ''}
              </span>
              {rule.label}
            </li>
          );
        })}
      </ul>
      {password && <p className={`mt-1.5 text-xs font-semibold ${level.textColor}`}>Seguridad: {level.text}</p>}
    </div>
  );
}
