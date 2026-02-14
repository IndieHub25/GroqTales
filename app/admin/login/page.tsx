'use client';

import { Shield, Lock, AlertCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, Suspense } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

interface LoginForm {
  employeeId: string;
  password: string;
}
// Mock admin credentials - In production, this would be handled by a secure backend
const MOCK_ADMIN = {
  employeeId: 'GT001',
  password: 'admin123',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading login page...</div>}>
      <LoginContent />
    </Suspense>
  );
}
function LoginContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginForm>({
    employeeId: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  // Get the return URL from query parameters if available
  const returnUrl = searchParams.get('returnUrl') || '/admin/dashboard';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(''); // Clear error when input changes
  };

  // Generate a secure token for session management
  const generateSessionToken = (userId: string): string => {
    // In a real app, this would use a more secure method like JWT
    // For this demo, we'll create a simple but reasonably unique token
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `${userId}_${timestamp}_${randomPart}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Check for simple admin login
      if (
        formData.employeeId === 'admin' &&
        formData.password === 'groqtales'
      ) {
        // Set up a robust admin session with a secure token
        const sessionToken = generateSessionToken('admin');
        setupAdminSession('admin', sessionToken);

        toast({
          title: 'Login Successful',
          description: 'Welcome to the admin dashboard',
        });

        // Redirect with token in URL for more reliable session establishment
        const redirectUrl = returnUrl.includes('?')
          ? `${returnUrl}&sessionToken=${sessionToken}`
          : `${returnUrl}?sessionToken=${sessionToken}`;

        router.push(redirectUrl);
        return;
      }
      // Validate employee ID format for GT001 pattern
      if (
        formData.employeeId !== 'admin' &&
        !formData.employeeId.match(/^GT\d{3}$/)
      ) {
        throw new Error(
          "Invalid employee ID format. Should be GT followed by 3 digits (e.g., GT001) or 'admin'"
        );
      }
      // In production, this would be an API call to validate credentials
      if (
        formData.employeeId === MOCK_ADMIN.employeeId &&
        formData.password === MOCK_ADMIN.password
      ) {
        // Set up a robust admin session with a secure token
        const sessionToken = generateSessionToken(formData.employeeId);
        setupAdminSession(formData.employeeId, sessionToken);

        toast({
          title: 'Login Successful',
          description: 'Welcome to the admin dashboard',
        });

        // Redirect with token in URL for more reliable session establishment
        const redirectUrl = returnUrl.includes('?')
          ? `${returnUrl}&sessionToken=${sessionToken}`
          : `${returnUrl}?sessionToken=${sessionToken}`;

        router.push(redirectUrl);
      } else {
        throw new Error('Invalid employee ID or password');
      }
    } catch (error: any) {
      setError(error.message);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to set up a robust admin session
  const setupAdminSession = (employeeId: string, sessionToken: string) => {
    // SSR guard - ensure we're running on client side
    if (typeof window === 'undefined') {
      console.warn('setupAdminSession called on server side, skipping');
      return;
    }

    try {
      // Try multiple storage methods for better resilience

      // Primary storage - localStorage for persistent sessions
      localStorage.setItem('adminSession', 'true');
      localStorage.setItem('employeeId', employeeId);
      localStorage.setItem('adminSessionToken', sessionToken);
      localStorage.setItem('adminSessionTimestamp', Date.now().toString());

      // Secondary storage - cookies for cross-tab consistency
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 24); // 24-hour expiration
      document.cookie = `adminSessionActive=true; path=/; expires=${expirationDate.toUTCString()}`;
      document.cookie = `adminSessionToken=${sessionToken}; path=/; expires=${expirationDate.toUTCString()}`;

      // Tertiary - session storage as another option
      sessionStorage.setItem('adminSession', 'true');

      console.log('Admin session established for:', employeeId);
    } catch (error) {
      // If any storage mechanism fails, log but continue
      // The URL token will still work as a fallback
      console.error('Error setting up storage for admin session:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-full theme-gradient-bg mx-auto mb-4 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            Access the GroqTales admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="employeeId" className="text-sm font-medium">
                Employee ID
              </label>
              <Input
                id="employeeId"
                name="employeeId"
                placeholder="GT001 or admin"
                value={formData.employeeId}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Enter &quot;GT001&quot; with password &quot;admin123&quot; or &quot;admin&quot; with password
                &quot;groqtales&quot;
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full theme-gradient-bg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Lock className="mr-2 h-4 w-4 animate-pulse" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Login to Dashboard
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                For admin access requests, please contact the IT department
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
