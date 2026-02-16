'use client';

import { Lock, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface AdminLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function AdminLoginModal({ open, onOpenChange }: AdminLoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const [redirectPath, setRedirectPath] = useState('/admin/dashboard');

  // Check for the current path when the modal opens
  useEffect(() => {
    if (open && typeof window !== 'undefined') {
      // Remember the path the user was trying to access
      const path = window.location.pathname;
      if (path.startsWith('/admin/') && path !== '/admin/login') {
        setRedirectPath(path);
      }
    }
  }, [open]);

  // Generate a secure token for session management
  const generateSessionToken = (userId: string): string => {
    // In a real app, this would use a more secure method like JWT
    // For this demo, we'll create a simple but reasonably unique token
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `${userId}_${timestamp}_${randomPart}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // In a real implementation, this would call an API endpoint
      // For demo purposes, using simple credential check
      if (
        (username === 'admin' && password === 'groqtales') ||
        (username === 'GT001' && password === 'admin123')
      ) {
        // Create a secure session token
        const sessionToken = generateSessionToken(username);

        // Set up a robust admin session
        setupAdminSession(username, sessionToken);

        toast({
          title: 'Login successful',
          description: 'Redirecting to admin dashboard...',
        });

        // Build redirect URL with token
        const redirectWithToken = redirectPath.includes('?')
          ? `${redirectPath}&sessionToken=${sessionToken}`
          : `${redirectPath}?sessionToken=${sessionToken}`;

        // Close modal and redirect
        setTimeout(() => {
          onOpenChange(false);
          router.push(redirectWithToken);
        }, 1000);
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to set up a robust admin session
  const setupAdminSession = (employeeId: string, sessionToken: string) => {
    try {
      // Try multiple storage methods for better resilience

      if (typeof window !== 'undefined') {
        // Primary storage - localStorage for persistent sessions
        if (window.localStorage) {
          localStorage.setItem('adminSession', 'true');
          localStorage.setItem('employeeId', employeeId);
          localStorage.setItem('adminSessionToken', sessionToken);
          localStorage.setItem('adminSessionTimestamp', Date.now().toString());
        }
        // Secondary storage - cookies for cross-tab consistency
        if (typeof document !== 'undefined') {
          const expirationDate = new Date();
          expirationDate.setHours(expirationDate.getHours() + 24); // 24-hour expiration
          document.cookie = `adminSessionActive=true; path=/; expires=${expirationDate.toUTCString()}`;
          document.cookie = `adminSessionToken=${sessionToken}; path=/; expires=${expirationDate.toUTCString()}`;
        }
        // Tertiary - session storage as another option
        if (window.sessionStorage) {
          sessionStorage.setItem('adminSession', 'true');
        }
      }
      console.log('Admin session established for:', employeeId);
    } catch (error) {
      console.error('Failed to set up admin session:', error);
      // Continue with the login even if localStorage fails
      // The URL token will still work as a fallback
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" /> Admin Login
          </DialogTitle>
          <DialogDescription>
            Please enter your credentials to access the admin dashboard.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div
              className="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center gap-2"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin or GT001"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <p className="text-xs text-muted-foreground">
              Use "groqtales" for admin or "admin123" for GT001
            </p>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
