import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Save } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store.js';
import { userService } from '@/services/user.service.js';
import { Input } from '@/components/atoms/Input.js';
import { Textarea } from '@/components/atoms/Textarea.js';
import { Button } from '@/components/atoms/Button.js';
import { Avatar } from '@/components/atoms/Avatar.js';
import { QUERY_KEYS } from '@/lib/constants.js';
import { t } from '@/lib/i18n.js';
import type { IUser } from '@/types';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfilePage(): JSX.Element {
  const user = useAuthStore((s: { user: IUser | null }) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    user?.avatarUrl ?? undefined,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      bio: user?.bio ?? '',
    },
  });

  const updateProfile = useMutation({
    mutationFn: (data: ProfileFormData) => userService.updateProfile(data),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH_ME });
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: (file: File) => userService.uploadAvatar(file),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH_ME });
    },
  });

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function onSubmit(data: ProfileFormData): Promise<void> {
    if (avatarFile) {
      await uploadAvatar.mutateAsync(avatarFile);
    }
    updateProfile.mutate(data);
  }

  return (
    <div className="container-app max-w-2xl py-8">
      <h1 className="mb-8 text-2xl font-bold text-secondary-900">{t('profile.title')}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Avatar Section */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar
              src={avatarPreview}
              firstName={user?.firstName ?? ''}
              lastName={user?.lastName ?? ''}
              size="lg"
            />
            <label
              title={t('profile.photo')}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary-600 text-white shadow-md hover:bg-primary-700"
            >
              <Camera className="h-4 w-4" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>
          <div>
            <p className="text-sm font-medium text-secondary-900">{t('profile.photo')}</p>
            <p className="text-xs text-secondary-500">{t('profile.photoHint')}</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('profile.firstName')}
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label={t('profile.lastName')}
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <Input
          label={t('profile.email')}
          type="email"
          value={user?.email ?? ''}
          disabled
          helperText={t('profile.emailHint')}
        />

        <Textarea
          label={t('profile.bio')}
          rows={4}
          placeholder={t('profile.bioPlaceholder')}
          error={errors.bio?.message}
          {...register('bio')}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={updateProfile.isPending || uploadAvatar.isPending}
            disabled={!isDirty && !avatarFile}
            leftIcon={<Save className="h-4 w-4" />}
          >
            {t('common.save')}
          </Button>
        </div>
      </form>
    </div>
  );
}
