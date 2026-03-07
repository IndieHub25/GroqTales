'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ShieldAlert, Shield, ShieldCheck, User as UserIcon,
    Search, AlertCircle, RefreshCcw
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

// Define the User type based on backend response
interface AdminUser {
    _id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'user' | 'moderator' | 'admin';
    createdAt: string;
    wallet?: {
        address: string;
    };
    storyCount: number;
}

export default function AccessControlPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Role update state
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');
    const [pendingRoleChange, setPendingRoleChange] = useState<{ userId: string; newRole: string } | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const { toast } = useToast();
    const router = useRouter();

    // Load users on mount
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError('');

            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('No access token found');
            }

            // Hardcoded API endpoint because the user requested all API calls to route securely.
            // Alternatively, relative routing works best matching the backend API structure
            const response = await fetch('https://groqtales-backend-api.onrender.com/api/v1/admin/access/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401 || response.status === 403) {
                toast({
                    title: "Access Denied",
                    description: "This page requires superadmin privileges.",
                    variant: "destructive"
                });
                router.push('/');
                return;
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch users');
            }

            setUsers(data.data);
        } catch (err: any) {
            console.error('Error fetching users:', err);
            setError(err.message || 'An error occurred while fetching users.');
        } finally {
            setLoading(false);
        }
    };

    const initiateRoleChange = (userId: string, newRole: string) => {
        setPendingRoleChange({ userId, newRole });
        setAdminPassword('');
        setIsPasswordModalOpen(true);
    };

    const confirmRoleChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pendingRoleChange || !adminPassword) return;

        try {
            setIsUpdating(true);
            const token = localStorage.getItem('accessToken');

            const response = await fetch('https://groqtales-backend-api.onrender.com/api/v1/admin/access/roles', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: pendingRoleChange.userId,
                    newRole: pendingRoleChange.newRole,
                    adminPassword
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to update role');
            }

            toast({
                title: "Role Updated",
                description: `Successfully updated user role to ${pendingRoleChange.newRole}.`,
            });

            // Update local state to reflect the role change immediately
            setUsers(users.map(u =>
                u._id === pendingRoleChange.userId
                    ? { ...u, role: pendingRoleChange.newRole as AdminUser['role'] }
                    : u
            ));

            setIsPasswordModalOpen(false);
            setPendingRoleChange(null);
        } catch (err: any) {
            toast({
                title: "Update Failed",
                description: err.message,
                variant: "destructive"
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <ShieldAlert className="w-4 h-4 text-red-400" />;
            case 'moderator': return <ShieldCheck className="w-4 h-4 text-amber-400" />;
            default: return <UserIcon className="w-4 h-4 text-emerald-400" />;
        }
    };

    const filteredUsers = users.filter(user =>
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user._id.includes(searchQuery)
    );

    return (
        <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <Shield className="w-8 h-8 text-emerald-400" />
                        Superadmin Access Control
                    </h1>
                    <p className="text-white/60 mt-1">
                        Manage platform users, view connections, and modify administrative roles.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                        <Input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-emerald-500"
                        />
                    </div>
                    <Button variant="outline" size="icon" onClick={fetchUsers} disabled={loading} className="border-white/10 hover:bg-white/10">
                        <RefreshCcw className={`h-4 w-4 text-white ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            <Card className="bg-black/40 border-white/10 text-white shadow-xl backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>User Directory</CardTitle>
                    <CardDescription className="text-white/50">
                        {filteredUsers.length} user(s) found. Role changes require master password confirmation.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="p-4 mb-4 rounded-md bg-destructive/10 text-destructive text-sm flex items-center gap-2 border border-destructive/20">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    <div className="rounded-md border border-white/10 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-white/5 disabled:hover:bg-transparent">
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead className="text-white/60 font-medium">User</TableHead>
                                    <TableHead className="text-white/60 font-medium hidden md:table-cell">Identity</TableHead>
                                    <TableHead className="text-white/60 font-medium">Stories</TableHead>
                                    <TableHead className="text-white/60 font-medium">Joined</TableHead>
                                    <TableHead className="text-white/60 font-medium text-right">Role Access</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && users.length === 0 ? (
                                    <TableRow className="border-white/10 hover:bg-white/5">
                                        <TableCell colSpan={5} className="h-24 text-center text-white/40">Loading users...</TableCell>
                                    </TableRow>
                                ) : filteredUsers.length === 0 ? (
                                    <TableRow className="border-white/10 hover:bg-white/5">
                                        <TableCell colSpan={5} className="h-24 text-center text-white/40">No users found.</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <TableRow key={user._id} className="border-white/10 hover:bg-white/5 transition-colors">
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span className="text-white">{user.username || 'Anonymous'}</span>
                                                    <span className="text-xs text-white/40 font-mono truncate max-w-[120px]" title={user._id}>{user._id}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm text-white/80">{user.email || 'No email provided'}</span>
                                                    {user.wallet?.address && (
                                                        <span className="text-xs font-mono text-emerald-400/80 bg-emerald-400/10 px-2 py-0.5 rounded-full w-fit">
                                                            {user.wallet.address.substring(0, 6)}...{user.wallet.address.substring(user.wallet.address.length - 4)}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center justify-center bg-white/10 px-2.5 py-1 rounded-md text-xs font-medium text-white/80">
                                                    {user.storyCount} stories
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-white/60 text-sm">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Select
                                                    value={user.role}
                                                    onValueChange={(val) => initiateRoleChange(user._id, val)}
                                                >
                                                    <SelectTrigger className="w-[140px] ml-auto bg-black border-white/20 text-white focus:ring-emerald-500 h-9">
                                                        <div className="flex items-center gap-2">
                                                            {getRoleIcon(user.role)}
                                                            <SelectValue placeholder="Select role" />
                                                        </div>
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-zinc-950 border-white/10 text-white">
                                                        <SelectItem value="user" className="focus:bg-white/10 focus:text-white cursor-pointer">
                                                            <div className="flex items-center gap-2">
                                                                <UserIcon className="w-4 h-4 text-emerald-400" />
                                                                User
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="moderator" className="focus:bg-white/10 focus:text-white cursor-pointer">
                                                            <div className="flex items-center gap-2">
                                                                <ShieldCheck className="w-4 h-4 text-amber-400" />
                                                                Moderator
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="admin" className="focus:bg-white/10 focus:text-white cursor-pointer">
                                                            <div className="flex items-center gap-2">
                                                                <ShieldAlert className="w-4 h-4 text-red-400" />
                                                                Admin
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Password Confirmation Modal */}
            <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <ShieldAlert className="h-5 w-5 text-red-500" /> Security Verification
                        </DialogTitle>
                        <DialogDescription className="text-white/60">
                            You are altering a user's administrative access. Please enter the master admin password to confirm this action.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={confirmRoleChange} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-white/80">Master Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="bg-black/50 border-white/20 text-white focus-visible:ring-emerald-500"
                                autoFocus
                            />
                        </div>

                        <DialogFooter className="mt-6 gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setIsPasswordModalOpen(false);
                                    setPendingRoleChange(null);
                                }}
                                disabled={isUpdating}
                                className="text-white/60 hover:text-white hover:bg-white/5"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isUpdating || !adminPassword}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                            >
                                {isUpdating ? 'Applying Change...' : 'Confirm Role Update'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
