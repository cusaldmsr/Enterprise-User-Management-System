import { AlertTriangle, Loader2 } from 'lucide-react';
import type { User } from '../../types';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '../ui/alert-dialog';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';

interface Props {
  user: User;
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteDialog({ user, isLoading, onConfirm, onClose }: Props) {
  const roleName = (user.role as { name?: string })?.name ?? 'USER';
  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`;

  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-destructive/15 border border-destructive/25 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={22} className="text-destructive" />
            </div>
            <div>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription className="mt-0">
                This action cannot be undone.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <p className="text-sm text-muted-foreground leading-relaxed px-1">
          Are you sure you want to permanently delete{' '}
          <span className="font-semibold text-foreground">
            {user.firstName} {user.lastName}
          </span>
          ? The user will receive a deletion email notification.
        </p>

        {/* User preview */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
          <Avatar className="h-10 w-10 border-2 border-destructive/30 flex-shrink-0">
            <AvatarImage
              src={user.profileImage || `https://api.dicebear.com/8.x/avataaars/svg?seed=${user.firstName}`}
              alt={user.firstName}
            />
            <AvatarFallback className="text-xs bg-destructive/10 text-destructive">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <Badge variant="muted" className="text-xs flex-shrink-0">{roleName}</Badge>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} onClick={onClose}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            id="confirm-delete-btn"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive/20 hover:bg-destructive/30 border border-destructive/40 hover:border-destructive/60 text-destructive hover:text-destructive shadow-none"
          >
            {isLoading
              ? <><Loader2 size={14} className="animate-spin" /> Deleting...</>
              : 'Delete User'
            }
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
