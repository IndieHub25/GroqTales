'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, LogIn, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import WalletConnect from '@/components/wallet-connect';

export default function SignInPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    if (!identifier) {
      setErrorMsg('Please enter your email or username');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    
    try {
      let loginEmail = identifier;

      // If the identifier doesn't have an '@', assume it's a username and look it up
      if (!identifier.includes('@')) {
        const { data, error: lookupError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', identifier)
          .single();
          
        if (lookupError || !data || !data.email) {
          throw new Error('Username not found or has no associated email');
        }
        loginEmail = data.email;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (error) throw error;
      
      setSuccess(true);
      toast({
        title: 'Authentication Successful',
        description: 'You have been securely logged in.',
      });
      
      // Delay redirect slightly for the success animation
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 1000);
      
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to sign in');
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
      setErrorMsg(error.message || 'Google Auth Error');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-6 -mb-6 flex items-center justify-center overflow-hidden bg-black text-white selection:bg-white/20">
      
      {/* Cinematic Starfield Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1920')] bg-cover bg-center opacity-40 mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black z-10" />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(circle,_rgba(59,130,246,0.15)_0%,_transparent_60%)] filter blur-[120px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,_rgba(168,85,247,0.1)_0%,_transparent_60%)] filter blur-[100px]"
        />
      </div>
      
      {/* Content wrapper */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[440px] px-6 py-12 relative z-10"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <Link href="/" className="group relative w-16 h-16 block mb-6 outline-none rounded-full">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full h-full relative z-10">
              <Image src="/logo.png" alt="GroqTales Logo" fill className="object-contain" priority />
            </motion.div>
            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Link>
          
          <h1 className="text-3xl tracking-tight font-medium text-white mb-2">Welcome Back</h1>
          <p className="text-white/50 text-sm max-w-[280px]">Log in to access your library, royalties, and AI tools.</p>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-xl relative overflow-hidden">
          
          {/* Subtle glow that follows focus */}
          <AnimatePresence>
            {focusedField && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`absolute w-32 h-32 blur-[60px] rounded-full pointer-events-none transition-all duration-700
                  ${focusedField === 'identifier' ? 'top-10 left-10 bg-blue-500/20' : 'bottom-32 right-10 bg-purple-500/20'}
                `}
              />
            )}
          </AnimatePresence>

          <form onSubmit={handleSignIn} className="space-y-4 relative z-10">
            <div className="space-y-1.5">
              <Label htmlFor="identifier" className="text-xs font-semibold uppercase tracking-wider text-white/60 ml-1">Email or Username</Label>
              <div className={`relative flex items-center transition-all duration-300 rounded-2xl border ${focusedField === 'identifier' ? 'border-white/40 bg-white/10' : 'border-white/10 bg-white/5'}`}>
                <Mail className={`absolute left-4 w-4 h-4 transition-colors duration-300 ${focusedField === 'identifier' ? 'text-white' : 'text-white/40'}`} />
                <Input 
                  id="identifier" 
                  type="text" 
                  required 
                  value={identifier}
                  disabled={loading || success}
                  onFocus={() => setFocusedField('identifier')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 bg-transparent border-none text-white placeholder:text-white/30 focus-visible:ring-0 shadow-none text-sm"
                  placeholder="Enter your email or username"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-start items-center ml-1">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-white/60">Password</Label>
              </div>
              <div className={`relative flex items-center transition-all duration-300 rounded-2xl border ${focusedField === 'password' ? 'border-white/40 bg-white/10' : 'border-white/10 bg-white/5'}`}>
                <Lock className={`absolute left-4 w-4 h-4 transition-colors duration-300 ${focusedField === 'password' ? 'text-white' : 'text-white/40'}`} />
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  disabled={loading || success}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 bg-transparent border-none text-white placeholder:text-white/30 focus-visible:ring-0 shadow-none text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <AnimatePresence>
              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }} 
                  animate={{ opacity: 1, height: 'auto', y: 0 }} 
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 text-red-400 text-xs font-medium bg-red-500/10 border border-red-500/20 p-3 rounded-xl mt-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button 
              type="submit" 
              disabled={loading || success}
              className="w-full h-12 mt-2 rounded-2xl bg-white text-black hover:bg-white/90 transition-all duration-300 text-sm font-semibold tracking-wide flex items-center justify-center relative overflow-hidden group"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div key="success" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Success</span>
                  </motion.div>
                ) : loading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </motion.div>
                ) : (
                  <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                    <span>Sign In To Proceed</span>
                    <LogIn className="w-4 h-4 opacity-50 transition-opacity group-hover:opacity-100" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <span className="px-4 text-[10px] font-semibold uppercase tracking-widest text-white/40">Or continue with</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>

          <div className="space-y-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGoogleSignIn}
              disabled={loading || success}
              className="w-full h-11 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white transition-all text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </Button>

            <div className="w-full relative z-20">
              <WalletConnect />
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-white/50 font-medium">
          Need an account?{' '}
          <Link href="/sign-up" className="text-white hover:text-blue-400 transition-colors ml-1 border-b border-transparent hover:border-blue-400 pb-0.5">
            Create One
          </Link>
        </p>
        
      </motion.div>
    </div>
  );
}
