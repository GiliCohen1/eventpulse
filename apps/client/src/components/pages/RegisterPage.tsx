import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.js';
import { Input } from '@/components/atoms/Input.js';
import { Button } from '@/components/atoms/Button.js';
import { ROUTES } from '@/lib/constants.js';
import { classNames } from '@/lib/utils.js';
import { t } from '@/lib/i18n.js';

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[0-9]/, 'Password must contain a number'),
    confirmPassword: z.string(),
    role: z.enum(['attendee', 'organizer']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage(): JSX.Element {
  const { register: registerUser, registerError, isRegisterPending } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'attendee' },
  });

  const selectedRole = watch('role');

  function onSubmit(data: RegisterFormData): void {
    registerUser({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      role: data.role,
    });
  }

  return (
    <div>
      <h2 className="mb-6 text-center text-xl font-bold text-secondary-900">
        {t('register.title')}
      </h2>

      {registerError && (
        <div className="mb-4 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-700">
          {registerError.message === 'Request failed with status code 409'
            ? t('register.emailExists')
            : t('register.genericError')}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('register.firstName')}
            placeholder={t('register.firstNamePlaceholder')}
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label={t('register.lastName')}
            placeholder={t('register.lastNamePlaceholder')}
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>
        <Input
          label={t('register.email')}
          type="email"
          placeholder={t('register.emailPlaceholder')}
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label={t('register.password')}
          type="password"
          placeholder={t('register.passwordPlaceholder')}
          error={errors.password?.message}
          helperText={t('register.passwordHint')}
          {...register('password')}
        />
        <Input
          label={t('register.confirmPassword')}
          type="password"
          placeholder={t('register.passwordPlaceholder')}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <div>
          <label className="label">{t('register.roleLabel')}</label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={classNames(
                'role-option',
                selectedRole === 'attendee' && 'role-option--selected',
              )}
            >
              <input type="radio" value="attendee" className="sr-only" {...register('role')} />
              {t('register.attendEvents')}
            </label>
            <label
              className={classNames(
                'role-option',
                selectedRole === 'organizer' && 'role-option--selected',
              )}
            >
              <input type="radio" value="organizer" className="sr-only" {...register('role')} />
              {t('register.organizeEvents')}
            </label>
          </div>
        </div>

        <Button type="submit" variant="primary" isLoading={isRegisterPending} className="w-full">
          {t('register.submit')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-secondary-500">
        {t('register.hasAccount')}{' '}
        <Link to={ROUTES.LOGIN} className="font-medium text-primary-600 hover:text-primary-700">
          {t('register.signInLink')}
        </Link>
      </p>
    </div>
  );
}
