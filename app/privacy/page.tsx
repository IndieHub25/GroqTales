'use client';

import {
  Github,
  Shield,
  Lock,
  Eye,
  Database,
  Bell,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import LegalHeader from '@/components/LegalHeader';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Floating GitHub button component
import { FloatingGithub } from '../terms/page';

// Floating doodle elements
const FloatingDoodles = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-teal-200 to-cyan-200 rounded-full blur-3xl opacity-20 animate-float"></div>
    <div className="absolute bottom-40 right-20 w-40 h-40 bg-gradient-to-r from-fuchsia-200 to-pink-200 rounded-full blur-3xl opacity-20 animate-float-delayed"></div>
    <div className="absolute top-1/2 left-1/3 w-36 h-36 bg-gradient-to-r from-sky-200 to-indigo-200 rounded-full blur-3xl opacity-20 animate-float-slow"></div>
  </div>
);

const PrivacySection = ({ icon: Icon, title, children }: any) => (
  <Card className="mb-8">
    <CardHeader className="flex flex-row items-center space-x-2">
      <div className="p-2 bg-primary/10 rounded-full">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">{children}</CardContent>
  </Card>
);

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <FloatingDoodles />
      <FloatingGithub />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <LegalHeader />
          <h1
            className="
            text-4xl md:text-5xl
            font-black
            text-center
            mb-6
            text-black
            dark:text-white
          "
          >
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-center mb-12">
            Last updated: March 15, 2024
          </p>

          <PrivacySection icon={Shield} title="1. Information We Collect">
            <h3 className="text-lg font-semibold">1.1 Personal Information</h3>
            <p>
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name and email address when you create an account</li>
              <li>Blockchain wallet address when you connect your wallet</li>
              <li>Profile information such as biography and avatar</li>
              <li>Stories and content you create or interact with</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 pt-4">
              1.2 Automatically Collected Information
            </h3>
            <p>
              We automatically collect certain information when you use the
              Platform:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Device and browser information</li>
              <li>IP address and location data</li>
              <li>Usage patterns and interactions</li>
              <li>Blockchain transaction data</li>
            </ul>
          </PrivacySection>

          <PrivacySection icon={Lock} title="2. How We Use Your Information">
            <p>We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Providing and improving our services</li>
              <li>Processing transactions and maintaining records</li>
              <li>Communicating with you about updates and changes</li>
              <li>Personalizing your experience</li>
              <li>Ensuring platform security and preventing fraud</li>
            </ul>
          </PrivacySection>

          <PrivacySection icon={Eye} title="3. Information Sharing">
            <p>
              We do not sell your personal information. We may share your
              information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>With your consent</li>
              <li>To comply with legal obligations</li>
              <li>With service providers who assist in platform operations</li>
              <li>In connection with a business transfer or merger</li>
            </ul>
          </PrivacySection>

          <PrivacySection icon={Database} title="4. Data Storage and Security">
            <p>
              We implement appropriate technical and organizational measures to
              protect your personal information. However, no method of
              transmission over the internet or electronic storage is 100%
              secure.
            </p>
            <p className="mt-2">
              Your blockchain transactions are publicly visible on the Monad
              network, but we protect your private account information using
              industry-standard encryption.
            </p>
          </PrivacySection>

          <PrivacySection icon={Bell} title="5. Your Privacy Rights">
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to data processing</li>
              <li>Withdraw consent</li>
            </ul>
          </PrivacySection>

          <PrivacySection icon={Trash2} title="6. Data Retention">
            <p>
              We retain your personal information for as long as necessary to
              provide our services and comply with legal obligations. When we no
              longer need personal information, we securely delete or anonymize
              it.
            </p>
          </PrivacySection>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              For questions about our Privacy Policy or to exercise your privacy
              rights, please contact us at{' '}
              <Link href="/contact" className="text-primary hover:underline">
                privacy@groqtales.com
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
