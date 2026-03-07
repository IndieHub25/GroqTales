import { AnimatedAuthContainer } from '@/components/auth/animated-auth-container';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | GroqTales',
  description: 'Access your account to manage your content, libraries, and Web3 portfolio.',
};

export default function SignInPage() {
  return <AnimatedAuthContainer initialMode="login" />;
}
