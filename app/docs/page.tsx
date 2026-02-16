'use client';

import {
  BookOpen,
  Wallet,
  HelpCircle,
  ChevronRight,
  Github,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full blur-3xl opacity-20 animate-float"></div>
    <div className="absolute bottom-40 right-20 w-40 h-40 bg-gradient-to-r from-blue-200 to-teal-200 rounded-full blur-3xl opacity-20 animate-float-delayed"></div>
    <div className="absolute top-1/2 left-1/3 w-36 h-36 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full blur-3xl opacity-20 animate-float-slow"></div>
  </div>
);

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <FloatingDoodles />
      <FloatingGithub />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent mb-4">
            Documentation & Resources
          </h1>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about creating and trading AI-generated
            story NFTs
          </p>
        </div>

        <Tabs defaultValue="getting-started" className="space-y-8">
          <TabsList className="grid grid-cols-3 max-w-2xl mx-auto">
            <TabsTrigger value="getting-started" className="space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>Getting Started</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="space-x-2">
              <Wallet className="w-4 h-4" />
              <span>Wallet Setup</span>
            </TabsTrigger>
            <TabsTrigger value="faq" className="space-x-2">
              <HelpCircle className="w-4 h-4" />
              <span>FAQ</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="getting-started" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Start Guide</CardTitle>
                <CardDescription>
                  Learn the basics of using GroqTales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    1. Create Your Account
                  </h3>
                  <p className="text-muted-foreground">
                    Sign up using your email or connect with your Web3 wallet.
                    Complete your profile to start creating and collecting
                    stories.
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/auth/signup" className="flex items-center">
                      Create Account <ChevronRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    2. Set Up Your Wallet
                  </h3>
                  <p className="text-muted-foreground">
                    Connect your Monad wallet to mint and collect story NFTs.
                    New to Web3? Follow our wallet setup guide.
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="#wallet-setup" className="flex items-center">
                      Wallet Guide <ChevronRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    3. Create Your First Story
                  </h3>
                  <p className="text-muted-foreground">
                    Use our Groq-powered AI to generate unique stories, edit
                    them to your liking, and mint them as NFTs.
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/create" className="flex items-center">
                      Start Creating <ChevronRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Wallet Setup Guide</CardTitle>
                <CardDescription>
                  Learn how to set up your Monad wallet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Installing Monad Wallet
                  </h3>
                  <ol className="space-y-4 list-decimal pl-4">
                    <li>
                      Visit the official Monad wallet website
                      <Button variant="link" asChild className="px-2 h-auto">
                        <Link
                          href="https://monad.xyz"
                          target="_blank"
                          className="flex items-center"
                        >
                          monad.xyz <ExternalLink className="ml-1 w-3 h-3" />
                        </Link>
                      </Button>
                    </li>
                    <li>
                      Download and install the wallet extension for your browser
                    </li>
                    <li>
                      Create a new wallet and securely store your recovery
                      phrase
                    </li>
                    <li>Add MONAD tokens to your wallet for transactions</li>
                  </ol>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Connecting to GroqTales
                  </h3>
                  <ol className="space-y-4 list-decimal pl-4">
                    <li>
                      Click the "Connect Wallet" button in the navigation bar
                    </li>
                    <li>Select Monad from the available wallet options</li>
                    <li>Approve the connection request in your wallet</li>
                    <li>
                      Your wallet address will appear in the top right corner
                    </li>
                  </ol>
                </div>

                <div className="mt-6">
                  <Button variant="outline" asChild>
                    <Link
                      href="/profile/settings"
                      className="flex items-center"
                    >
                      Manage Wallet Settings{' '}
                      <ChevronRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Common questions about using GroqTales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">What is GroqTales?</h3>
                  <p className="text-muted-foreground">
                    GroqTales is a platform that combines AI-powered
                    storytelling with blockchain technology. Users can create
                    unique stories using Groq AI and mint them as NFTs on the
                    Monad blockchain.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    How does story generation work?
                  </h3>
                  <p className="text-muted-foreground">
                    Our platform uses Groq's advanced AI models to generate
                    unique stories based on your prompts and preferences. You
                    can edit and customize the generated stories before minting
                    them as NFTs.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">What are the fees?</h3>
                  <p className="text-muted-foreground">
                    Story generation is free. When minting NFTs, you'll need to
                    pay gas fees on the Monad network, which are typically very
                    low. We take a 5% commission on NFT sales.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    How do I sell my story NFTs?
                  </h3>
                  <p className="text-muted-foreground">
                    After minting a story NFT, you can list it for sale on our
                    marketplace. Set your price in MONAD tokens, and interested
                    buyers can purchase directly through the platform.
                  </p>
                </div>

                <div className="mt-6">
                  <Button variant="outline" asChild>
                    <Link href="/contact" className="flex items-center">
                      More Questions? Contact Us{' '}
                      <ChevronRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
