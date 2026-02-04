'use client';

import { Github, Cookie, Shield, Settings, Info } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LegalHeader from "@/components/LegalHeader";

// Floating GitHub button component
const FloatingGithub = () => (
  <Link
    href="https://github.com/Drago-03/GroqTales.git"
    target="_blank"
    className="fixed bottom-24 right-6 p-3 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50"
  >
    <Github className="w-6 h-6 text-white" />
  </Link>
);

// Floating doodle elements
const FloatingDoodles = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-orange-200 to-amber-200 rounded-full blur-3xl opacity-20 animate-float"></div>
    <div className="absolute bottom-40 right-20 w-40 h-40 bg-gradient-to-r from-lime-200 to-emerald-200 rounded-full blur-3xl opacity-20 animate-float-delayed"></div>
    <div className="absolute top-1/2 left-1/3 w-36 h-36 bg-gradient-to-r from-sky-200 to-blue-200 rounded-full blur-3xl opacity-20 animate-float-slow"></div>
  </div>
);

const CookieSection = ({ icon: Icon, title, children }: any) => (
  <Card className="mb-8">
    <CardHeader className="flex flex-row items-center space-x-4">
      <div className="p-2 bg-primary/10 rounded-full">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">{children}</CardContent>
  </Card>
);

export default function CookiePolicyPage() {
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
            Cookie Policy
          </h1>
          <p className="text-muted-foreground text-center mb-12">
            Last updated: March 15, 2024
          </p>

          <CookieSection icon={Info} title="What Are Cookies?">
            <p>
              Cookies are small text files that are placed on your device when
              you visit our website. They help us provide you with a better
              experience by:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Remembering your preferences and settings</li>
              <li>Keeping you signed in to your account</li>
              <li>Understanding how you use our platform</li>
              <li>Improving our services based on your behavior</li>
            </ul>
          </CookieSection>

          <CookieSection icon={Cookie} title="Types of Cookies We Use">
            <h3 className="text-lg font-semibold">Essential Cookies</h3>
            <p>
              These cookies are necessary for the website to properly. They
              enable core functionality such as security, network management,
              and accessibility. You cannot opt out of these cookies.
            </p>

            <h3 className="text-lg font-semibold mt-4">Performance Cookies</h3>
            <p>
              These cookies help us understand how visitors interact with our
              website by collecting and reporting information anonymously. They
              help us improve our platform.
            </p>

            <h3 className="text-lg font-semibold mt-4">
              Functionality Cookies
            </h3>
            <p>
              These cookies enable enhanced functionality and personalization.
              They may be set by us or by third-party providers whose services
              we have added to our pages.
            </p>

            <h3 className="text-lg font-semibold mt-4">Targeting Cookies</h3>
            <p>
              These cookies may be set through our site by our advertising
              partners. They may be used by those companies to build a profile
              of your interests and show you relevant advertisements on other
              sites.
            </p>
          </CookieSection>

          <CookieSection icon={Shield} title="How We Protect Your Data">
            <p>
              We take the protection of your data seriously. Our cookies are
              encrypted and we follow industry best practices for data security.
              We never sell your personal information collected through cookies.
            </p>
            <p className="mt-2">
              For more information about how we protect your data, please read
              our{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </CookieSection>

          <CookieSection
            icon={Settings}
            title="Managing Your Cookie Preferences"
          >
            <h3 className="text-lg font-semibold">Browser Settings</h3>
            <p>
              You can control and/or delete cookies as you wish. You can delete
              all cookies that are already on your computer and you can set most
              browsers to prevent them from being placed.
            </p>

            <div className="mt-4 space-y-4">
              <p className="font-medium">
                How to manage cookies in your browser:
              </p>

              <div className="space-y-2">
                <p>
                  <span className="font-medium">Chrome:</span> Settings {'->'}{' '}
                  Privacy and security {'->'} Cookies and other site data
                </p>
                <p>
                  <span className="font-medium">Firefox:</span> Options {'->'}{' '}
                  Privacy & Security {'->'} Cookies and Site Data
                </p>
                <p>
                  <span className="font-medium">Safari:</span> Preferences{' '}
                  {'->'} Privacy {'->'} Cookies and website data
                </p>
                <p>
                  <span className="font-medium">Edge:</span> Settings {'->'}{' '}
                  Cookies and site permissions {'->'} Cookies and site data
                </p>
              </div>
            </div>

            <div className="mt-6">
              <Button variant="outline" className="w-full sm:w-auto">
                Update Cookie Preferences
              </Button>
            </div>
          </CookieSection>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              For questions about our Cookie Policy, please{' '}
              <Link href="/contact" className="text-primary hover:underline">
                contact us
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
