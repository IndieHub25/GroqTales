'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, LogIn, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import WalletConnect from '@/components/wallet-connect';
import { loginWithUsernameOrEmail } from '@/app/actions/auth';

export function SignInForm({ onToggleMode }: { onToggleMode: () => void }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const validateForm = () => {
    if (!identifier.trim()) {
      setErrorMsg('Email or Username is required');
      return false;
    }
    if (!password) {
      setErrorMsg('Password is required');
      return false;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrorMsg('');
    
    try {
      const result = await loginWithUsernameOrEmail(identifier, password);

      if (result.error) {
        throw new Error(result.error);
      }
      
      setSuccess(true);
      toast({
        title: 'Authentication Successful',
        description: 'You have securely logged in.',
      });
      
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 800);
      
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      if (!success) setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setErrorMsg(error.message || 'Error communicating with Google authentication');
    }
  };

  return (
    <div className="w-full max-w-md px-6 py-12 relative z-10 flex flex-col">
      <div className="flex flex-col items-center mb-10">
        <Link href="/" className="mb-6 block transition-opacity hover:opacity-80">
          <div className="relative w-16 h-16">
            <Image src="/logo.png" alt="GroqTales Logo" fill className="object-contain" priority />
          </div>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">Sign in to GroqTales</h1>
        <p className="text-neutral-400 text-sm text-center">Manage your content, libraries, and Web3 portfolio</p>
      </div>

      <div className="bg-[#121214] border border-neutral-800 p-8 rounded-2xl shadow-xl w-full">
        <form onSubmit={handleSignIn} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="identifier" className="text-xs font-medium text-neutral-400 uppercase tracking-widest">
              Email / Username
            </Label>
            <div className={`relative flex items-center rounded-xl border transition-colors ${focusedField === 'identifier' ? 'border-neutral-500 bg-[#1c1c1f]' : 'border-neutral-800 bg-[#141417]'}`}>
              <svg className={`absolute left-4 w-4 h-4 transition-colors ${focusedField === 'identifier' ? 'text-neutral-300' : 'text-neutral-600'}`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <Input 
                id="identifier" 
                type="text" 
                autoComplete="username"
                required 
                value={identifier}
                disabled={loading || success}
                onFocus={() => setFocusedField('identifier')}
                onBlur={() => setFocusedField(null)}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-transparent border-none text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-0 shadow-none text-sm rounded-xl"
                placeholder="name@company.com or username"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-medium text-neutral-400 uppercase tracking-widest">
              Password
            </Label>
            <div className={`relative flex items-center rounded-xl border transition-colors ${focusedField === 'password' ? 'border-neutral-500 bg-[#1c1c1f]' : 'border-neutral-800 bg-[#141417]'}`}>
              <Lock className={`absolute left-4 w-4 h-4 transition-colors ${focusedField === 'password' ? 'text-neutral-300' : 'text-neutral-600'}`} />
              <Input 
                id="password" 
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required 
                value={password}
                disabled={loading || success}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-11 pr-12 bg-transparent border-none text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-0 shadow-none text-sm rounded-xl"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-pressed={showPassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-4 text-neutral-500 hover:text-neutral-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 rounded-sm transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 text-red-400 text-xs font-medium bg-red-950/30 border border-red-900/50 p-3 rounded-lg animate-in fade-in zoom-in-95 duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading || success}
            className="w-full h-12 rounded-xl bg-white text-black hover:bg-neutral-200 transition-colors text-sm font-semibold tracking-wide flex items-center justify-center mt-2 group"
          >
            {success ? (
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="w-5 h-5" />
                <span>Authenticated</span>
              </div>
            ) : loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                <span>Signing In...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Sign In</span>
                <LogIn className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </Button>
        </form>

        <div className="my-6 relative flex items-center py-2">
          <div className="flex-grow border-t border-neutral-800"></div>
          <span className="flex-shrink-0 mx-4 text-xs font-medium uppercase tracking-widest text-neutral-500">Or continue with</span>
          <div className="flex-grow border-t border-neutral-800"></div>
        </div>

        <div className="space-y-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleGoogleSignIn}
            disabled={loading || success}
            className="w-full h-11 rounded-xl bg-[#18181b] border-neutral-800 hover:bg-[#202024] hover:border-neutral-700 text-neutral-300 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </Button>

          <div className="w-full relative">
            <WalletConnect />
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-neutral-500 font-medium">
        Need to create an account?{' '}
        <button onClick={onToggleMode} className="text-white hover:text-neutral-300 transition-colors ml-1 font-semibold focus:outline-none">
          Register Here
        </button>
      </p>
      
    </div>
  );
}
