import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Search, ShieldAlert, ShieldCheck, UserX, UserCheck, Trash2, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { useAdminUsers, useDeleteUser, useUpdateUserRole, useToggleUserBlock, User } from '@/hooks/useUsers';

export default function AdminUsers() {
    const { data, isLoading } = useAdminUsers();
    const users = (data as User[]) || [];
    const { mutate: updateRole, isPending: isUpdatingRole } = useUpdateUserRole();
    const { mutate: toggleBlock, isPending: isTogglingBlock } = useToggleUserBlock();
    const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    // Bug #155: Use confirmation dialog instead of browser confirm()
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const filteredUsers = users.filter(user =>
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleStatusToggle = (user: User) => {
        toggleBlock(
            { userId: user._id, isBlocked: !user.isBlocked },
            {
                onSuccess: () => {
                    const newStatus = user.isBlocked ? 'Active' : 'Blocked';
                    toast({
                        title: `User ${newStatus}`,
                        description: `${user.firstName} ${user.lastName} has been ${newStatus.toLowerCase()}.`,
                    });
                },
                onError: (error: any) => {
                    toast({
                        title: "Error",
                        description: error.message || "Failed to update user status.",
                        variant: "destructive",
                    });
                },
            }
        );
    };

    const handleRoleToggle = (user: User) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        updateRole(
            { userId: user._id, role: newRole },
            {
                onSuccess: () => {
                    const displayRole = newRole === 'admin' ? 'Admin' : 'User';
                    toast({
                        title: "Role Updated",
                        description: `${user.firstName}'s role changed to ${displayRole}.`,
                    });
                },
                onError: (error: any) => {
                    toast({
                        title: "Error",
                        description: error.message || "Failed to update user role.",
                        variant: "destructive",
                    });
                },
            }
        );
    };

    const handleDelete = (user: User) => {
        // Bug #155: Show proper confirmation dialog instead of browser confirm()
        setUserToDelete(user);
    };

    const confirmDelete = () => {
        if (!userToDelete) return;
        deleteUser(userToDelete._id, {
                onSuccess: () => {
                    setUserToDelete(null);
                    toast({
                        variant: "destructive",
                        title: "User Deleted",
                        description: `${userToDelete.firstName} ${userToDelete.lastName} has been permanently removed.`,
                    });
                },
                onError: (error: any) => {
                    setUserToDelete(null);
                    toast({
                        title: "Error",
                        description: error.message || "Failed to delete user.",
                        variant: "destructive",
                    });
                },
            });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <>
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage registered customers and administrative staff.
                    </p>
                </div>
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium">
                    Total: {users.length}
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search by name or email..."
                        className="pl-9 bg-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="font-semibold text-slate-900">Name</TableHead>
                                <TableHead className="font-semibold text-slate-900">Role</TableHead>
                                <TableHead className="font-semibold text-slate-900">Status</TableHead>
                                <TableHead className="font-semibold text-slate-900 hidden md:table-cell">Joined</TableHead>
                                <TableHead className="font-semibold text-slate-900 text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user._id}>
                                        <TableCell>
                                            <div className="font-medium text-slate-900">{user.firstName} {user.lastName}</div>
                                            <div className="text-sm text-slate-500">{user.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'admin' ? "default" : "secondary"}>
                                                {user.role === 'admin' ? 'Admin' : 'User'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={user.isBlocked ? "destructive" : "outline"}
                                                className={user.isBlocked ? '' : 'text-emerald-600 border-emerald-200 bg-emerald-50'}
                                            >
                                                {user.isBlocked ? 'Blocked' : 'Active'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-slate-500">
                                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </TableCell>
                                        <TableCell className="text-right pr-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                        disabled={isUpdatingRole || isTogglingBlock || isDeleting}
                                                    >
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>

                                                    <DropdownMenuItem
                                                        onClick={() => handleStatusToggle(user)}
                                                        disabled={isTogglingBlock}
                                                    >
                                                        {user.isBlocked ? (
                                                            <><UserCheck className="mr-2 h-4 w-4" /> Unblock User</>
                                                        ) : (
                                                            <><UserX className="mr-2 h-4 w-4" /> Block User</>
                                                        )}
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onClick={() => handleRoleToggle(user)}
                                                        disabled={isUpdatingRole}
                                                    >
                                                        {user.role === 'admin' ? (
                                                            <><ShieldAlert className="mr-2 h-4 w-4" /> Demote to User</>
                                                        ) : (
                                                            <><ShieldCheck className="mr-2 h-4 w-4" /> Promote to Admin</>
                                                        )}
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(user)}
                                                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                        disabled={isDeleting}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>

        {/* Bug #155: Confirmation dialog for user deletion */}
        <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User Account?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete the account for{" "}
                {userToDelete?.firstName} {userToDelete?.lastName}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={confirmDelete}>
                {isDeleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </>
    );
}
