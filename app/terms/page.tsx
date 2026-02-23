'use client';

import { Github } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import LegalHeader from "@/components/LegalHeader";

// Floating GitHub button component
export const FloatingGithub = () => (
  <Link
    href="https://github.com/Drago-03/GroqTales.git"
    target="_blank"
    className="fixed bottom-28 right-10 p-3 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50"
  >
    <Github className="w-6 h-6 text-white" />
  </Link>
);

// Floating doodle elements
const FloatingDoodles = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-r from-rose-200 to-pink-200 rounded-full blur-3xl opacity-20 animate-float"></div>
    <div className="absolute bottom-40 left-20 w-40 h-40 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full blur-3xl opacity-20 animate-float-delayed"></div>
    <div className="absolute top-1/3 right-1/3 w-36 h-36 bg-gradient-to-r from-amber-200 to-yellow-200 rounded-full blur-3xl opacity-20 animate-float-slow"></div>
  </div>
);

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <FloatingDoodles />
      <FloatingGithub />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <LegalHeader />
          <h1 className="
            text-4xl md:text-5xl
            font-black
            text-center
            mb-6
            text-black
            dark:text-white
          ">
            Terms of Service
          </h1>
          <p className="text-muted-foreground text-center mb-12">
            Last updated: March 15, 2024
          </p>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                By accessing and using GroqTales ("the Platform"), you agree to
                be bound by these Terms of Service and all applicable laws and
                regulations. If you do not agree with any of these terms, you
                are prohibited from using or accessing the Platform.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>2. Use of Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">2.1 Account Creation</h3>
              <p>
                To access certain features of the Platform, you must create an
                account. You agree to provide accurate, current, and complete
                information during registration and to update such information
                to keep it accurate, current, and complete.
              </p>

              <h3 className="text-lg font-semibold">2.2 Account Security</h3>
              <p>
                You are responsible for maintaining the confidentiality of your
                account and password. You agree to accept responsibility for all
                activities that occur under your account.
              </p>

              <h3 className="text-lg font-semibold">2.3 Wallet Integration</h3>
              <p>
                The Platform integrates with Monad blockchain wallets. You are
                responsible for all activities conducted through your connected
                wallet and for maintaining its security.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>3. Content and NFTs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">
                3.1 AI-Generated Content
              </h3>
              <p>
                Stories generated through our Groq AI system are subject to
                certain usage rights. While you own the NFTs you mint, the
                underlying AI model and technology remain the property of their
                respective owners.
              </p>

              <h3 className="text-lg font-semibold">3.2 NFT Ownership</h3>
              <p>
                Purchasing a story NFT grants you ownership of the token on the
                Monad blockchain. This ownership is subject to the terms of the
                smart contract and does not necessarily confer copyright or
                other intellectual property rights.
              </p>

              <h3 className="text-lg font-semibold">3.3 Content Guidelines</h3>
              <p>
                Users must not generate, mint, or trade content that is illegal,
                harmful, threatening, abusive, harassing, defamatory, or
                otherwise objectionable.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>4. Fees and Payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Platform charges fees for certain services, including NFT
                minting and trading. All fees are clearly displayed before
                transactions and are non-refundable unless required by law.
              </p>
              <p>
                Transaction fees on the Monad blockchain (gas fees) are separate
                from Platform fees and are determined by network conditions.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>5. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We reserve the right to terminate or suspend your account and
                access to the Platform immediately, without prior notice or
                liability, for any reason whatsoever, including without
                limitation if you breach the Terms.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>6. Disclaimers and Limitations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Platform is provided "as is" without any warranties,
                expressed or implied. We do not guarantee uninterrupted access
                to the Platform or that it will be free from errors.
              </p>
              <p>
                We are not responsible for any losses or damages arising from
                your use of the Platform, including but not limited to direct,
                indirect, incidental, consequential, or punitive damages.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>7. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We reserve the right to modify these terms at any time. We will
                notify users of any material changes via email or through the
                Platform. Continued use of the Platform after such modifications
                constitutes acceptance of the updated terms.
              </p>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              For questions about these Terms of Service, please contact us at{' '}
              <Link href="/contact" className="text-primary hover:underline">
                support@groqtales.com
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}