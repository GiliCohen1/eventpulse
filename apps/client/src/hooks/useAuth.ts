import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store.js';
import { authService } from '@/services/auth.service.js';
import { QUERY_KEYS, ROUTES } from '@/lib/constants.js';
import type { LoginCredentials, RegisterCredentials } from '@/types/auth.types.js';

export function useAuth() {
  const { user, isAuthenticated, isLoading, setAuth, clearAuth, initialize } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useQuery({
    queryKey: QUERY_KEYS.AUTH_ME,
    queryFn: () => authService.getMe(),
    enabled: isAuthenticated,
    retry: false,
    staleTime: 1000 * 60 * 10,
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      setAuth(data.user, data.tokens);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH_ME });
      navigate(ROUTES.HOME);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (credentials: RegisterCredentials) => authService.register(credentials),
    onSuccess: (data) => {
      setAuth(data.user, data.tokens);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH_ME });
      navigate(ROUTES.HOME);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      navigate(ROUTES.LOGIN);
    },
  });

  return {
    user,
    isAuthenticated,
    isLoading,
    initialize,
    login: loginMutation.mutate,
    loginError: loginMutation.error,
    isLoginPending: loginMutation.isPending,
    register: registerMutation.mutate,
    registerError: registerMutation.error,
    isRegisterPending: registerMutation.isPending,
    logout: logoutMutation.mutate,
  };
}
