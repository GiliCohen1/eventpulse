import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { useCreateEvent, useCategories } from '@/hooks/useEvents.js';
import { Input } from '@/components/atoms/Input.js';
import { Textarea } from '@/components/atoms/Textarea.js';
import { Button } from '@/components/atoms/Button.js';
import { ROUTES } from '@/lib/constants.js';

const tierSchema = z.object({
  name: z.string().min(1, 'Tier name required'),
  price: z.coerce.number().min(0, 'Price must be >= 0'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be >= 1'),
  description: z.string().optional(),
});

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  categoryId: z.string().min(1, 'Select a category'),
  startDate: z.string().min(1, 'Start date required'),
  endDate: z.string().min(1, 'End date required'),
  venue: z.string().optional(),
  address: z.string().optional(),
  isOnline: z.boolean().default(false),
  maxAttendees: z.coerce.number().int().min(1).optional(),
  tags: z.string().optional(),
  tiers: z.array(tierSchema).min(1, 'At least one ticket tier is required'),
});

type EventFormData = z.infer<typeof eventSchema>;

export function EventCreatePage(): JSX.Element {
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const createEvent = useCreateEvent();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      isOnline: false,
      tiers: [{ name: 'General Admission', price: 0, quantity: 100, description: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'tiers' });
  const isOnline = watch('isOnline');

  function onSubmit(data: EventFormData): void {
    const tagsArray = data.tags
      ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    createEvent.mutate(
      {
        ...data,
        tags: tagsArray,
      } as Parameters<typeof createEvent.mutate>[0],
      {
        onSuccess: (result) => {
          navigate(`${ROUTES.EVENTS}/${result.id}`);
        },
      }
    );
  }

  return (
    <div className="container-app max-w-3xl py-8">
      <h1 className="mb-8 text-2xl font-bold text-secondary-900">Create New Event</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <section className="card space-y-4">
          <h2 className="text-lg font-semibold text-secondary-900">Basic Information</h2>
          <Input
            label="Event Title"
            placeholder="My Awesome Conference"
            error={errors.title?.message}
            {...register('title')}
          />
          <Textarea
            label="Description"
            rows={5}
            placeholder="Tell people what your event is about..."
            error={errors.description?.message}
            {...register('description')}
          />
          <div>
            <label className="label">Category</label>
            <select className="input-field" {...register('categoryId')}>
              <option value="">Select a category</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-error-500">{errors.categoryId.message}</p>
            )}
          </div>
          <Input
            label="Tags"
            placeholder="react, conference, tech (comma separated)"
            error={errors.tags?.message}
            {...register('tags')}
          />
        </section>

        {/* Date & Location */}
        <section className="card space-y-4">
          <h2 className="text-lg font-semibold text-secondary-900">Date & Location</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Start Date & Time"
              type="datetime-local"
              error={errors.startDate?.message}
              {...register('startDate')}
            />
            <Input
              label="End Date & Time"
              type="datetime-local"
              error={errors.endDate?.message}
              {...register('endDate')}
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
              {...register('isOnline')}
            />
            <span className="text-sm text-secondary-700">This is an online event</span>
          </label>

          {!isOnline && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Venue Name"
                placeholder="Convention Center"
                {...register('venue')}
              />
              <Input
                label="Address"
                placeholder="123 Main St, City"
                {...register('address')}
              />
            </div>
          )}

          <Input
            label="Max Attendees"
            type="number"
            placeholder="500"
            error={errors.maxAttendees?.message}
            {...register('maxAttendees')}
          />
        </section>

        {/* Ticket Tiers */}
        <section className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-secondary-900">Ticket Tiers</h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() =>
                append({ name: '', price: 0, quantity: 50, description: '' })
              }
            >
              Add Tier
            </Button>
          </div>

          {errors.tiers?.root && (
            <p className="text-sm text-error-500">{errors.tiers.root.message}</p>
          )}

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-lg border border-secondary-200 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-secondary-700">
                  Tier {index + 1}
                </h3>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-secondary-400 hover:text-error-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Input
                  label="Name"
                  placeholder="VIP"
                  error={errors.tiers?.[index]?.name?.message}
                  {...register(`tiers.${index}.name`)}
                />
                <Input
                  label="Price ($)"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  error={errors.tiers?.[index]?.price?.message}
                  {...register(`tiers.${index}.price`)}
                />
                <Input
                  label="Quantity"
                  type="number"
                  placeholder="100"
                  error={errors.tiers?.[index]?.quantity?.message}
                  {...register(`tiers.${index}.quantity`)}
                />
              </div>
              <Input
                label="Description (optional)"
                placeholder="What's included in this tier?"
                {...register(`tiers.${index}.description`)}
              />
            </div>
          ))}
        </section>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={createEvent.isPending}
          >
            Create Event
          </Button>
        </div>
      </form>
    </div>
  );
}
