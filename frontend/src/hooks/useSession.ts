import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, fetchSession, setCsrfToken } from '../lib/api';
import type { Session } from '../lib/types';

export const sessionKey = ['session'] as const;

export function useSession() {
  return useQuery({ queryKey: sessionKey, queryFn: fetchSession, staleTime: 5 * 60 * 1000 });
}

/** Tras iniciar o cerrar sesión, los datos cacheados de otra identidad dejan de ser válidos. */
function useApplySession() {
  const queryClient = useQueryClient();
  return (session: Session) => {
    setCsrfToken(session.csrfToken);
    queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== 'session' });
    queryClient.setQueryData(sessionKey, session);
  };
}

export function useLogin() {
  const apply = useApplySession();
  return useMutation({
    mutationFn: (data: { correo: string; password: string }) => api<Session>('/auth/login', { method: 'POST', body: data }),
    onSuccess: apply,
  });
}

export function useLogout() {
  const apply = useApplySession();
  return useMutation({
    mutationFn: () => api<Session>('/auth/logout', { method: 'POST' }),
    onSuccess: apply,
  });
}
