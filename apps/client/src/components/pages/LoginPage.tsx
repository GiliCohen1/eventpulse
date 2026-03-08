import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.js';
import { Input } from '@/components/atoms/Input.js';
import { Button } from '@/components/atoms/Button.js';
import { ROUTES } from '@/lib/constants.js';
import { t } from '@/lib/i18n.js';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage(): JSX.Element {
  const { login, loginError, isLoginPending } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  function onSubmit(data: LoginFormData): void {
    login(data);
  }

  return (
    <div>
      <h2 className="mb-6 text-center text-xl font-bold text-secondary-900">{t('login.title')}</h2>

      {loginError && (
        <div className="mb-4 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-700">
          {loginError.message === 'Request failed with status code 401'
            ? t('login.invalidCredentials')
            : t('login.genericError')}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t('login.email')}
          type="email"
          placeholder={t('login.emailPlaceholder')}
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label={t('login.password')}
          type="password"
          placeholder={t('login.passwordPlaceholder')}
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between">
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {t('login.forgotPassword')}
          </Link>
        </div>

        <Button type="submit" variant="primary" isLoading={isLoginPending} className="w-full">
          {t('common.signIn')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-secondary-500">
        {t('login.noAccount')}{' '}
        <Link to={ROUTES.REGISTER} className="font-medium text-primary-600 hover:text-primary-700">
          {t('login.signUpLink')}
        </Link>
      </p>
    </div>
  );
}
