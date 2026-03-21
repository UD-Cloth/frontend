import { useState } from 'react';
import api from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LayoutDashboard, Lock, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAdminAuthStore } from '@/stores/adminAuthStore';
import { toast } from 'sonner';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLogin() {
    const navigate = useNavigate();
    const { login } = useAdminAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        try {
            const response = await api.post<any>('/auth/login', {
                email: data.email,
                password: data.password
            });
            const user = response.data;

            if (!user.isAdmin) {
                toast.error('Access denied. Admin privileges required.');
                setIsLoading(false);
                return;
            }

            // Save user to localStorage to maintain session for API calls
            localStorage.setItem('userInfo', JSON.stringify(user));

            login(user.email, 'admin');
            toast.success('Logged in successfully');
            navigate('/admin/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <Card className="w-full max-w-md shadow-lg border-primary/10">
                <CardHeader className="space-y-2 text-center pb-6">
                    <div className="flex justify-center mb-4">
                        <div className="bg-primary/10 text-primary p-3 rounded-2xl">
                            <LayoutDashboard className="h-8 w-8" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Admin Welcome Back</CardTitle>
                    <CardDescription>
                        Enter your credentials to access the admin dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@example.com"
                                    className="pl-9"
                                    {...register('email')}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password">Password</Label>
                                <Button variant="link" className="p-0 h-auto text-xs text-muted-foreground" type="button">
                                    Forgot password?
                                </Button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-9"
                                    {...register('password')}
                                />
                            </div>
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password.message}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t p-4 mt-2 bg-muted/50">
                    <p className="text-xs text-center text-muted-foreground">
                        Secure admin portal. Internal use only.
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
