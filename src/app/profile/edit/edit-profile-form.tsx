'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useActionState, useEffect } from 'react';
import { User } from '@/lib/definitions';
import { updateProfile } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ProfileFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long.'),
  avatarUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  bio: z.string().max(200, 'Bio cannot exceed 200 characters.').optional(),
  isEmailPublic: z.boolean().default(false),
});

type ProfileFormData = z.infer<typeof ProfileFormSchema>;

export function EditProfileForm({ user }: { user: User }) {
  const { toast } = useToast();
  const [state, formAction] = useActionState(updateProfile, null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      name: user.name,
      avatarUrl: user.avatarUrl,
      bio: user.bio || '',
      isEmailPublic: user.isEmailPublic || false,
    },
  });
  
  useEffect(() => {
    if (state?.message) {
      toast({
        variant: state.errors ? 'destructive' : 'default',
        title: state.errors ? 'Error' : 'Success',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Information</CardTitle>
        <CardDescription>Update your public profile details here.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input id="avatarUrl" {...register('avatarUrl')} />
            {errors.avatarUrl && <p className="text-sm text-destructive">{errors.avatarUrl.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" {...register('bio')} placeholder="Tell us a little about yourself" />
            {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
          </div>
          
          <Controller
            control={control}
            name="isEmailPublic"
            render={({ field }) => (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="isEmailPublic" className="text-base">Make Email Public</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow other users to see your email address on your profile.
                  </p>
                </div>
                <Switch
                  id="isEmailPublic"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
            )}
          />
          
          {errors.isEmailPublic && <p className="text-sm text-destructive">{errors.isEmailPublic.message}</p>}

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
