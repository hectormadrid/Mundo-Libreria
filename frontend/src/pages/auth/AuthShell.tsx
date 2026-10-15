import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import { LOGO_URL } from '../../lib/assets';

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-lib-blue via-blue-600 to-lib-red px-4 py-10">
      <div className="w-full max-w-md animate-fade-in">
        <Link to="/" className="mb-6 flex items-center justify-center gap-3 text-white">
          <span className="rounded-full bg-white p-2 shadow-lg">
            <img src={LOGO_URL} alt="" className="h-8 w-8" />
          </span>
          <span className="text-2xl font-bold">
            Mundo <span className="text-lib-yellow">Librería</span>
          </span>
        </Link>
        <div className="rounded-3xl bg-white p-8 shadow-2xl">
          <h1 className="mb-1 text-center text-2xl font-bold text-gray-800">{title}</h1>
          {subtitle && <p className="mb-6 text-center text-gray-500">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}

export function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  placeholder = '••••••••',
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        className="input pr-11"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-lib-blue"
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}

const LEVELS = [
  { text: 'Muy débil', color: 'bg-lib-red', textColor: 'text-lib-red' },
  { text: 'Débil', color: 'bg-yellow-400', textColor: 'text-yellow-600' },
  { text: 'Media', color: 'bg-lib-blue', textColor: 'text-lib-blue' },
  { text: 'Fuerte', color: 'bg-emerald-500', textColor: 'text-emerald-600' },
];

export function PasswordStrength({ password }: { password: string }) {
  const score =
    (password.length >= 8 ? 1 : 0) +
    (/[a-z]/.test(password) && /[A-Z]/.test(password) ? 1 : 0) +
    (/\d/.test(password) ? 1 : 0) +
    (/[^\w]/.test(password) ? 1 : 0);
  const level = LEVELS[Math.max(score - 1, 0)];

  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1">
        {LEVELS.map((_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i < score ? level.color : 'bg-gray-200'}`} />
        ))}
      </div>
      <p className={`mt-1 text-xs ${password ? level.textColor : 'text-gray-500'}`}>
        {password ? `Contraseña: ${level.text}` : 'Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo.'}
      </p>
    </div>
  );
}
