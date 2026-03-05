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

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
  phoneNumber: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfilePage(): JSX.Element {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatarUrl);

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
      phoneNumber: user?.phoneNumber ?? '',
    },
  });

  const updateProfile = useMutation({
    mutationFn: (data: ProfileFormData) => userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.me() });
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: (file: File) => userService.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.me() });
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
      <h1 className="mb-8 text-2xl font-bold text-secondary-900">Profile Settings</h1>

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
            <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary-600 text-white shadow-md hover:bg-primary-700">
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
            <p className="text-sm font-medium text-secondary-900">Profile Photo</p>
            <p className="text-xs text-secondary-500">JPG, PNG or WebP. Max 2MB.</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="First Name"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Last Name"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <Input
          label="Email"
          type="email"
          value={user?.email ?? ''}
          disabled
          helperText="Email cannot be changed"
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="+1 (555) 000-0000"
          error={errors.phoneNumber?.message}
          {...register('phoneNumber')}
        />

        <Textarea
          label="Bio"
          rows={4}
          placeholder="Tell us about yourself..."
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
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
