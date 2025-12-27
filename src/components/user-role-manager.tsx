'use client';

import { useTransition } from 'react';
import type { User, Role } from '@/lib/definitions';
import { updateUserRole } from '@/lib/actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const adminRoles: Role[] = ['ADMIN', 'EDITOR', 'AUTHOR', 'MODERATOR', 'READER', 'SUSPENDED'];
const moderatorRoles: Role[] = ['AUTHOR', 'READER', 'SUSPENDED'];

export function UserRoleManager({ users, currentUser }: { users: User[], currentUser: User }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleRoleChange = (userId: number, newRole: Role) => {
    startTransition(async () => {
      try {
        const result = await updateUserRole(userId, newRole);
        if (result.success) {
            toast({
                title: 'Success',
                description: 'User role updated successfully.',
            });
        } else {
            throw new Error(result.message);
        }
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message,
        });
      }
    });
  };

  const availableRoles = currentUser.role === 'ADMIN' ? adminRoles : moderatorRoles;

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Current Role</TableHead>
            <TableHead className="text-right">Change Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.role === 'ADMIN' ? 'default' : user.role === 'SUSPENDED' ? 'destructive' : 'secondary'}>{user.role}</Badge>
              </TableCell>
              <TableCell className="text-right">
                {currentUser.id !== user.id ? (
                    <Select
                        defaultValue={user.role}
                        onValueChange={(newRole: Role) => handleRoleChange(user.id, newRole)}
                        disabled={isPending}
                    >
                    <SelectTrigger className="w-[180px] ml-auto">
                        <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableRoles.map((role) => (
                        <SelectItem key={role} value={role} disabled={!availableRoles.includes(role)}>
                            {role}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                ) : (
                    <span className="text-sm text-muted-foreground italic">Cannot change own role</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
