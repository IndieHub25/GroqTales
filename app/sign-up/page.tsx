'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle, PenTool, Library, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import WalletConnect from '@/components/wallet-connect';

type Step = 'role' | 'details';
type Role = 'creator' | 'collector' | 'both' | null;

export default function SignUpPage() {
  const [step, setStep] = useState<Step>('role');
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [favoriteGenre, setFavoriteGenre] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            first_name: firstName,
            last_name: lastName,
            preferred_role: selectedRole,
            bio: bio,
            favorite_genre: favoriteGenre
          }
        }
      });

      if (error) throw error;
      
      setSuccess(true);
      toast({
        title: 'Account Created successfully.',
        description: 'Please check your email to verify your account.',
      });
      
      setTimeout(() => {
        router.push('/sign-in');
      }, 1500);
      
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to sign up');
    } finally {
      if (!success) setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      localStorage.setItem('preferred_role', selectedRole || 'both');
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
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-6 -mb-6 flex items-center justify-center overflow-hidden bg-black text-white selection:bg-white/20 pt-14 pb-14">
      
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

      <div className="w-full max-w-[500px] px-6 relative z-10">
        <div className="flex flex-col items-center mb-8 text-center">
          <Link href="/" className="group relative w-16 h-16 block mb-6 outline-none rounded-full">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full h-full relative z-10">
              <Image src="/logo.png" alt="GroqTales Logo" fill className="object-contain" priority />
            </motion.div>
            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Link>
          
          <h1 className="text-3xl tracking-tight font-medium text-white mb-2">Join GroqTales</h1>
          <p className="text-white/50 text-sm max-w-[280px]">
             {step === 'role' ? 'How do you want to use the platform?' : 'Let\'s get your account set up.'}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-xl relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {step === 'role' ? (
              <motion.div 
                key="role-step"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="grid grid-cols-1 gap-4 mb-8">
                  <button 
                    onClick={() => setSelectedRole('creator')}
                    className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-300 overflow-hidden group
                      ${selectedRole === 'creator' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${selectedRole === 'creator' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70 group-hover:text-white'}`}>
                        <PenTool className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-base">Creator</h3>
                        <p className="text-xs text-white/50 mt-1">I want to write stories and mint NFTs</p>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={() => setSelectedRole('collector')}
                    className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-300 overflow-hidden group
                      ${selectedRole === 'collector' ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${selectedRole === 'collector' ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/70 group-hover:text-white'}`}>
                        <Library className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-base">Collector / Reader</h3>
                        <p className="text-xs text-white/50 mt-1">I want to discover, read, and collect stories</p>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={() => setSelectedRole('both')}
                    className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-300 overflow-hidden group
                      ${selectedRole === 'both' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${selectedRole === 'both' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/70 group-hover:text-white'}`}>
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-base">Both</h3>
                        <p className="text-xs text-white/50 mt-1">I want the full GroqTales experience</p>
                      </div>
                    </div>
                  </button>
                </div>

                <Button 
                  onClick={() => setStep('details')}
                  disabled={!selectedRole}
                  className="w-full h-12 rounded-2xl bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm font-semibold tracking-wide flex items-center justify-center relative overflow-hidden group"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  <span>Continue</span>
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                key="details-step"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* Subtle glow that follows focus */}
                <AnimatePresence>
                  {focusedField && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`absolute w-40 h-40 blur-[70px] rounded-full pointer-events-none transition-all duration-700
                        ${focusedField === 'firstName' || focusedField === 'lastName' ? 'top-10 left-1/2 bg-blue-500/20' : ''}
                        ${focusedField === 'username' ? 'top-32 right-10 bg-emerald-500/20' : ''}
                        ${focusedField === 'email' ? 'top-48 left-10 bg-purple-500/20' : ''}
                        ${focusedField === 'password' ? 'bottom-24 right-1/2 bg-pink-500/20' : ''}
                      `}
                    />
                  )}
                </AnimatePresence>

                <form onSubmit={handleEmailSignUp} className="space-y-4 relative z-10">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName" className="text-[11px] font-semibold uppercase tracking-wider text-white/60 ml-1">First Name</Label>
                      <div className={`relative flex items-center transition-all duration-300 rounded-xl border ${focusedField === 'firstName' ? 'border-white/40 bg-white/10' : 'border-white/10 bg-white/5'}`}>
                        <Input 
                          id="firstName" type="text" required value={firstName}
                          disabled={loading || success}
                          onFocus={() => setFocusedField('firstName')} onBlur={() => setFocusedField(null)}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full h-11 px-4 bg-transparent border-none text-white placeholder:text-white/30 focus-visible:ring-0 shadow-none text-sm"
                          placeholder="Jane"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName" className="text-[11px] font-semibold uppercase tracking-wider text-white/60 ml-1">Last Name</Label>
                      <div className={`relative flex items-center transition-all duration-300 rounded-xl border ${focusedField === 'lastName' ? 'border-white/40 bg-white/10' : 'border-white/10 bg-white/5'}`}>
                        <Input 
                          id="lastName" type="text" required value={lastName}
                          disabled={loading || success}
                          onFocus={() => setFocusedField('lastName')} onBlur={() => setFocusedField(null)}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full h-11 px-4 bg-transparent border-none text-white placeholder:text-white/30 focus-visible:ring-0 shadow-none text-sm"
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="username" className="text-[11px] font-semibold uppercase tracking-wider text-white/60 ml-1">Username</Label>
                    <div className={`relative flex items-center transition-all duration-300 rounded-xl border ${focusedField === 'username' ? 'border-white/40 bg-white/10' : 'border-white/10 bg-white/5'}`}>
                      <User className={`absolute left-4 w-4 h-4 transition-colors duration-300 ${focusedField === 'username' ? 'text-white' : 'text-white/40'}`} />
                      <Input 
                        id="username" type="text" required value={username}
                        disabled={loading || success}
                        onFocus={() => setFocusedField('username')} onBlur={() => setFocusedField(null)}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full h-11 pl-11 pr-4 bg-transparent border-none text-white placeholder:text-white/30 focus-visible:ring-0 shadow-none text-sm"
                        placeholder="Choose a username"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-wider text-white/60 ml-1">Email Address</Label>
                    <div className={`relative flex items-center transition-all duration-300 rounded-xl border ${focusedField === 'email' ? 'border-white/40 bg-white/10' : 'border-white/10 bg-white/5'}`}>
                      <Mail className={`absolute left-4 w-4 h-4 transition-colors duration-300 ${focusedField === 'email' ? 'text-white' : 'text-white/40'}`} />
                      <Input 
                        id="email" type="email" required value={email}
                        disabled={loading || success}
                        onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-11 pl-11 pr-4 bg-transparent border-none text-white placeholder:text-white/30 focus-visible:ring-0 shadow-none text-sm"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-wider text-white/60 ml-1">Password</Label>
                    <div className={`relative flex items-center transition-all duration-300 rounded-xl border ${focusedField === 'password' ? 'border-white/40 bg-white/10' : 'border-white/10 bg-white/5'}`}>
                      <Lock className={`absolute left-4 w-4 h-4 transition-colors duration-300 ${focusedField === 'password' ? 'text-white' : 'text-white/40'}`} />
                      <Input 
                        id="password" type="password" required minLength={8} value={password}
                        disabled={loading || success}
                        onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-11 pl-11 pr-4 bg-transparent border-none text-white placeholder:text-white/30 focus-visible:ring-0 shadow-none text-sm"
                        placeholder="Min 8 characters"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-[11px] font-semibold uppercase tracking-wider text-white/60 ml-1">Confirm Password</Label>
                    <div className={`relative flex items-center transition-all duration-300 rounded-xl border ${focusedField === 'confirmPassword' ? 'border-white/40 bg-white/10' : 'border-white/10 bg-white/5'}`}>
                      <Lock className={`absolute left-4 w-4 h-4 transition-colors duration-300 ${focusedField === 'confirmPassword' ? 'text-white' : 'text-white/40'}`} />
                      <Input 
                        id="confirmPassword" type="password" required minLength={8} value={confirmPassword}
                        disabled={loading || success}
                        onFocus={() => setFocusedField('confirmPassword')} onBlur={() => setFocusedField(null)}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-11 pl-11 pr-4 bg-transparent border-none text-white placeholder:text-white/30 focus-visible:ring-0 shadow-none text-sm"
                        placeholder="Retype password"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="bio" className="text-[11px] font-semibold uppercase tracking-wider text-white/60 ml-1">Short Bio (Optional)</Label>
                      <div className={`relative flex items-center transition-all duration-300 rounded-xl border ${focusedField === 'bio' ? 'border-white/40 bg-white/10' : 'border-white/10 bg-white/5'}`}>
                        <Input 
                          id="bio" type="text" value={bio}
                          disabled={loading || success}
                          onFocus={() => setFocusedField('bio')} onBlur={() => setFocusedField(null)}
                          onChange={(e) => setBio(e.target.value)}
                          className="w-full h-11 px-4 bg-transparent border-none text-white placeholder:text-white/30 focus-visible:ring-0 shadow-none text-sm"
                          placeholder="A quick intro..."
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="favoriteGenre" className="text-[11px] font-semibold uppercase tracking-wider text-white/60 ml-1">Favorite Genre</Label>
                      <div className={`relative flex items-center transition-all duration-300 rounded-xl border ${focusedField === 'favoriteGenre' ? 'border-white/40 bg-white/10' : 'border-white/10 bg-white/5'}`}>
                        <Input 
                          id="favoriteGenre" type="text" required value={favoriteGenre}
                          disabled={loading || success}
                          onFocus={() => setFocusedField('favoriteGenre')} onBlur={() => setFocusedField(null)}
                          onChange={(e) => setFavoriteGenre(e.target.value)}
                          className="w-full h-11 px-4 bg-transparent border-none text-white placeholder:text-white/30 focus-visible:ring-0 shadow-none text-sm"
                          placeholder="e.g. Sci-Fi, Fantasy"
                        />
                      </div>
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

                  <div className="pt-2 flex flex-col gap-3">
                    <Button 
                      type="submit" 
                      disabled={loading || success}
                      className="w-full h-12 rounded-2xl bg-white text-black hover:bg-white/90 transition-all duration-300 text-sm font-semibold tracking-wide flex items-center justify-center relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                      
                      <AnimatePresence mode="wait">
                        {success ? (
                          <motion.div key="success" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="w-5 h-5" />
                            <span>Registered</span>
                          </motion.div>
                        ) : loading ? (
                          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            <span>Creating...</span>
                          </motion.div>
                        ) : (
                          <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                            <span>Create Account</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>

                    <button
                      type="button"
                      onClick={() => setStep('role')}
                      className="text-xs font-semibold text-white/50 hover:text-white transition-colors py-2 uppercase tracking-wider"
                    >
                      Back to Role Selection
                    </button>
                  </div>
                </form>

                <div className="my-6 flex items-center">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                  <span className="px-4 text-[10px] font-semibold uppercase tracking-widest text-white/40">Or continue with</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleGoogleSignUp}
                    disabled={loading || success}
                    className="w-full h-11 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white transition-all text-sm font-medium px-0"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </Button>

                  <div className="w-full relative z-20">
                    {/* Will use custom styling logic below for the wallet connect wrapper if needed, but keeping component default initially */}
                    <div className="h-11 flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-xl transition-all cursor-pointer">
                      <WalletConnect />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-8 text-center text-sm text-white/50 font-medium pb-8">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-white hover:text-emerald-400 transition-colors ml-1 border-b border-transparent hover:border-emerald-400 pb-0.5">
            Sign In
          </Link>
        </p>
        
      </div>
    </div>
  );
}
