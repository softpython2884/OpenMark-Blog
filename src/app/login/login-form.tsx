'use client';

import { useActionState } from 'react';
import { login } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useActionState(login, initialState);

  return (
    <form action={dispatch} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="m@example.com"
          required
        />
        {state?.errors?.email && (
            <p className="text-sm font-medium text-destructive">
                {state.errors.email[0]}
            </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
        {state?.errors?.password && (
            <p className="text-sm font-medium text-destructive">
                {state.errors.password[0]}
            </p>
        )}
      </div>
       {state?.message && (
        <p className="text-sm font-medium text-destructive">
            {state.message}
        </p>
        )}
      <Button type="submit" className="w-full">
        Login
      </Button>
    </form>
  );
}
