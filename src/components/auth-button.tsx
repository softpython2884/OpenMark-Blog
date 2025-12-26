'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User } from '@/lib/definitions';
import { logout } from '@/lib/auth';
import { LogIn, LogOut, PlusCircle, User as UserIcon, Shield } from 'lucide-react';

export function AuthButton({ user }: { user: User | null }) {
  const handleLogout = async () => {
    await logout();
  };

  if (!user) {
    return (
      <Button asChild variant="outline" size="sm">
        <Link href="/login">
          <LogIn className="mr-2 h-4 w-4" />
          Login
        </Link>
      </Button>
    );
  }

  const canCreate = ['ADMIN', 'EDITOR', 'AUTHOR'].includes(user.role);
  const isAdmin = user.role === 'ADMIN';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAdmin && (
           <DropdownMenuItem asChild>
             <Link href="/admin">
              <Shield className="mr-2 h-4 w-4" />
              <span>Admin Panel</span>
             </Link>
           </DropdownMenuItem>
        )}
        {canCreate && (
          <DropdownMenuItem asChild>
            <Link href="/editor">
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>New Post</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
