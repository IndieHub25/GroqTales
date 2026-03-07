'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle, PenTool, Library, Sparkles, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import WalletConnect from '@/components/wallet-connect';

type Step = 'role' | 'details';
type Role = 'creator' | 'collector' | 'both' | null;

export function SignUpForm({ onToggleMode }: { onToggleMode: () => void }) {
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
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Password Strength Logic
  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const strength = getPasswordStrength();
  const getStrengthColor = () => {
    if (strength < 50) return 'bg-red-500';
    if (strength < 100) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const validateForm = () => {
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('First and last name are required');
      return false;
    }
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      setErrorMsg('Username must be 3-20 characters long and can only contain letters, numbers, and underscores');
      return false;
    }
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isEmail) {
      setErrorMsg('Please enter a valid email address');
      return false;
    }
    if (strength < 100) {
      setErrorMsg('Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, and a number');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
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
      
      timeoutRef.current = setTimeout(() => {
        onToggleMode(); // Automatically toggle to login after registration success.
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
      setErrorMsg(error.message || 'Error communicating with Google authentication');
    }
  };

  return (
    <div className="w-full max-w-lg px-6 relative z-10 flex flex-col pt-8 pb-12">
      <div className="flex flex-col items-center mb-8 text-center">
        <Link href="/" className="mb-6 block transition-opacity hover:opacity-80">
          <div className="relative w-16 h-16">
            <Image src="/logo.png" alt="GroqTales Logo" fill className="object-contain" priority />
          </div>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">Create your Account</h1>
        <p className="text-neutral-400 text-sm">
           {step === 'role' ? 'Select how you plan to use GroqTales.' : 'Enter your details to get started.'}
        </p>
      </div>

      <div className="bg-[#121214] border border-neutral-800 p-8 rounded-2xl shadow-xl w-full">
        {step === 'role' ? (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <div className="grid grid-cols-1 gap-4 mb-8">
              <button 
                onClick={() => setSelectedRole('creator')}
                className={`p-5 rounded-xl border text-left transition-colors group ${selectedRole === 'creator' ? 'border-blue-500 bg-blue-950/20' : 'border-neutral-800 bg-[#141417] hover:border-neutral-600'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${selectedRole === 'creator' ? 'bg-blue-600/20 text-blue-500' : 'bg-neutral-800 text-neutral-400 group-hover:text-neutral-300'}`}>
                    <PenTool className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-200 text-sm">Creator</h3>
                    <p className="text-xs text-neutral-500 mt-1">Publish stories and mint NFTs</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => setSelectedRole('collector')}
                className={`p-5 rounded-xl border text-left transition-colors group ${selectedRole === 'collector' ? 'border-indigo-500 bg-indigo-950/20' : 'border-neutral-800 bg-[#141417] hover:border-neutral-600'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${selectedRole === 'collector' ? 'bg-indigo-600/20 text-indigo-500' : 'bg-neutral-800 text-neutral-400 group-hover:text-neutral-300'}`}>
                    <Library className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-200 text-sm">Collector</h3>
                    <p className="text-xs text-neutral-500 mt-1">Discover, read, and collect stories</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => setSelectedRole('both')}
                className={`p-5 rounded-xl border text-left transition-colors group ${selectedRole === 'both' ? 'border-emerald-500 bg-emerald-950/20' : 'border-neutral-800 bg-[#141417] hover:border-neutral-600'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${selectedRole === 'both' ? 'bg-emerald-600/20 text-emerald-500' : 'bg-neutral-800 text-neutral-400 group-hover:text-neutral-300'}`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-200 text-sm">Both</h3>
                    <p className="text-xs text-neutral-500 mt-1">The full platform experience</p>
                  </div>
                </div>
              </button>
            </div>

            <Button 
              onClick={() => setStep('details')}
              disabled={!selectedRole}
              className="w-full h-12 rounded-xl bg-white text-black hover:bg-neutral-200 disabled:opacity-50 transition-colors text-sm font-semibold flex items-center justify-center gap-2 group"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <div className="my-6 flex items-center">
              <div className="flex-1 h-px bg-neutral-800"></div>
              <span className="px-4 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">Or continue with</span>
              <div className="flex-1 h-px bg-neutral-800"></div>
            </div>

            <div className="w-full relative">
              <WalletConnect />
            </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">First Name</Label>
                  <div className={`relative flex items-center rounded-xl border transition-colors ${focusedField === 'firstName' ? 'border-neutral-500 bg-[#1c1c1f]' : 'border-neutral-800 bg-[#141417]'}`}>
                    <Input 
                      id="firstName" type="text" required value={firstName}
                      disabled={loading || success}
                      onFocus={() => setFocusedField('firstName')} onBlur={() => setFocusedField(null)}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full h-11 px-4 bg-transparent border-none text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-0 shadow-none text-sm"
                      placeholder="Jane"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Last Name</Label>
                  <div className={`relative flex items-center rounded-xl border transition-colors ${focusedField === 'lastName' ? 'border-neutral-500 bg-[#1c1c1f]' : 'border-neutral-800 bg-[#141417]'}`}>
                    <Input 
                      id="lastName" type="text" required value={lastName}
                      disabled={loading || success}
                      onFocus={() => setFocusedField('lastName')} onBlur={() => setFocusedField(null)}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full h-11 px-4 bg-transparent border-none text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-0 shadow-none text-sm"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Username</Label>
                <div className={`relative flex items-center rounded-xl border transition-colors ${focusedField === 'username' ? 'border-neutral-500 bg-[#1c1c1f]' : 'border-neutral-800 bg-[#141417]'}`}>
                  <User className={`absolute left-4 w-4 h-4 transition-colors ${focusedField === 'username' ? 'text-neutral-300' : 'text-neutral-600'}`} />
                  <Input 
                    id="username" type="text" required value={username}
                    disabled={loading || success}
                    onFocus={() => setFocusedField('username')} onBlur={() => setFocusedField(null)}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 bg-transparent border-none text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-0 shadow-none text-sm"
                    placeholder="jdoe_123"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Email Address</Label>
                <div className={`relative flex items-center rounded-xl border transition-colors ${focusedField === 'email' ? 'border-neutral-500 bg-[#1c1c1f]' : 'border-neutral-800 bg-[#141417]'}`}>
                  <Mail className={`absolute left-4 w-4 h-4 transition-colors ${focusedField === 'email' ? 'text-neutral-300' : 'text-neutral-600'}`} />
                  <Input 
                    id="email" type="email" required value={email}
                    disabled={loading || success}
                    onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 bg-transparent border-none text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-0 shadow-none text-sm"
                    placeholder="name@company.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2 relative">
                  <Label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Password</Label>
                  <div className={`relative flex items-center rounded-xl border transition-colors ${focusedField === 'password' ? 'border-neutral-500 bg-[#1c1c1f]' : 'border-neutral-800 bg-[#141417]'}`}>
                    <Lock className={`absolute left-3 w-4 h-4 transition-colors ${focusedField === 'password' ? 'text-neutral-300' : 'text-neutral-600'}`} />
                    <Input 
                      id="password" type={showPassword ? 'text' : 'password'} required value={password}
                      disabled={loading || success}
                      onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 pl-9 pr-10 bg-transparent border-none text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-0 shadow-none text-sm"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} aria-pressed={showPassword} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 text-neutral-500 hover:text-neutral-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 rounded-sm transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="w-full flex gap-1 mt-1">
                      <div className={`h-1 flex-1 rounded-sm ${strength >= 25 ? getStrengthColor() : 'bg-neutral-800'}`}></div>
                      <div className={`h-1 flex-1 rounded-sm ${strength >= 50 ? getStrengthColor() : 'bg-neutral-800'}`}></div>
                      <div className={`h-1 flex-1 rounded-sm ${strength >= 75 ? getStrengthColor() : 'bg-neutral-800'}`}></div>
                      <div className={`h-1 flex-1 rounded-sm ${strength >= 100 ? getStrengthColor() : 'bg-neutral-800'}`}></div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Confirm Password</Label>
                  <div className={`relative flex items-center rounded-xl border transition-colors ${focusedField === 'confirmPassword' ? 'border-neutral-500 bg-[#1c1c1f]' : 'border-neutral-800 bg-[#141417]'}`}>
                    <Lock className={`absolute left-3 w-4 h-4 transition-colors ${focusedField === 'confirmPassword' ? 'text-neutral-300' : 'text-neutral-600'}`} />
                    <Input 
                      id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required value={confirmPassword}
                      disabled={loading || success}
                      onFocus={() => setFocusedField('confirmPassword')} onBlur={() => setFocusedField(null)}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-11 pl-9 pr-10 bg-transparent border-none text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-0 shadow-none text-sm"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-pressed={showConfirmPassword} aria-label={showConfirmPassword ? "Hide password" : "Show password"} className="absolute right-3 text-neutral-500 hover:text-neutral-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 rounded-sm transition-colors">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-800/50">
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Short Bio (Opt)</Label>
                  <div className={`relative flex items-center rounded-xl border transition-colors ${focusedField === 'bio' ? 'border-neutral-500 bg-[#1c1c1f]' : 'border-neutral-800 bg-[#141417]'}`}>
                    <Input 
                      id="bio" type="text" value={bio}
                      disabled={loading || success}
                      onFocus={() => setFocusedField('bio')} onBlur={() => setFocusedField(null)}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full h-11 px-4 bg-transparent border-none text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-0 shadow-none text-sm"
                      placeholder="A quick intro"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="favoriteGenre" className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Fav Genre (Opt)</Label>
                  <div className={`relative flex items-center rounded-xl border transition-colors ${focusedField === 'favoriteGenre' ? 'border-neutral-500 bg-[#1c1c1f]' : 'border-neutral-800 bg-[#141417]'}`}>
                    <Input 
                      id="favoriteGenre" type="text" value={favoriteGenre}
                      disabled={loading || success}
                      onFocus={() => setFocusedField('favoriteGenre')} onBlur={() => setFocusedField(null)}
                      onChange={(e) => setFavoriteGenre(e.target.value)}
                      className="w-full h-11 px-4 bg-transparent border-none text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-0 shadow-none text-sm"
                      placeholder="Sci-Fi"
                    />
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 text-red-400 text-xs font-medium bg-red-950/30 border border-red-900/50 p-3 rounded-lg animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="pt-4 flex flex-col gap-3">
                <Button 
                  type="submit" 
                  disabled={loading || success}
                  className="w-full h-12 rounded-xl bg-white text-black hover:bg-neutral-200 transition-colors text-sm font-semibold flex items-center justify-center gap-2 group"
                >
                  {success ? (
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Registered Successfully</span>
                    </div>
                  ) : loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => setStep('role')}
                  className="text-xs font-medium text-neutral-500 hover:text-neutral-300 transition-colors py-2"
                >
                  ← Back to Role Selection
                </button>
              </div>
            </form>

            <div className="my-6 relative flex items-center py-2">
              <div className="flex-grow border-t border-neutral-800"></div>
              <span className="flex-shrink-0 mx-4 text-xs font-medium uppercase tracking-widest text-neutral-500">Or continue with</span>
              <div className="flex-grow border-t border-neutral-800"></div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGoogleSignUp}
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
          </div>
        )}
      </div>

      <p className="mt-8 text-center text-sm text-neutral-500 font-medium pb-8 border-transparent">
        Already have an account?{' '}
        <button onClick={onToggleMode} className="text-white hover:text-neutral-300 transition-colors ml-1 font-semibold focus:outline-none">
          Sign In Here
        </button>
      </p>
      
    </div>
  );
}
