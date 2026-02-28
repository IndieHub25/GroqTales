'use client';

import {
  HelpCircle,
  Wallet,
  BookOpen,
  Coins,
  Shield,
  Users,
  PenSquare,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import React, { useEffect, useState, Suspense } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function FAQPage() {
  return (
    <Suspense fallback={<div>Loading FAQ page...</div>}>
      <FAQContent />
    </Suspense>
  );
}
function FAQContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get('category') || 'general'
  );

  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', value);
    // Preserve the FAQ item if it exists
    const faqItem = searchParams.get('faq');
    if (faqItem) {
      params.set('faq', faqItem);
    }
    router.push(`/faq?${params.toString()}`);
  };

  // Handle direct links to specific FAQ items
  useEffect(() => {
    const faqItem = searchParams.get('faq');
    const category = searchParams.get('category');

    if (category) {
      setActiveTab(category);
    }
    if (faqItem) {
      setTimeout(() => {
        const element = document.getElementById(faqItem);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          const accordionTrigger = element.querySelector(
            '[data-state]'
          ) as HTMLElement;
          if (
            accordionTrigger &&
            accordionTrigger.getAttribute('data-state') === 'closed'
          ) {
            accordionTrigger.click();
          }
        }
      }, 100); // Small delay to ensure DOM is ready
    }
  }, [searchParams]);

  // Handle link clicks
  const handleLinkClick = (category: string, faqItem: string) => {
    const params = new URLSearchParams();
    params.set('category', category);
    params.set('faq', faqItem);
    router.push(`/faq?${params.toString()}`);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full theme-gradient-bg mx-auto mb-6 flex items-center justify-center">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 gradient-heading">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about GroqTales, from getting
            started to advanced features.
          </p>
        </div>

        {/* Quick Links */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleLinkClick('wallet', 'what-is-wallet')}
              className="text-sm text-primary hover:underline"
            >
              What is a Web3 wallet?
            </button>
            <button
              onClick={() => handleLinkClick('stories', 'story-types')}
              className="text-sm text-primary hover:underline"
            >
              Types of stories
            </button>
            <button
              onClick={() => handleLinkClick('creators', 'become-creator')}
              className="text-sm text-primary hover:underline"
            >
              Become a creator
            </button>
          </div>
        </div>

        {/* FAQ Categories */}
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-8"
        >
          <TabsList className="flex flex-wrap justify-center gap-2">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Wallet & NFTs
            </TabsTrigger>
            <TabsTrigger value="stories" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Stories
            </TabsTrigger>
            <TabsTrigger value="creators" className="flex items-center gap-2">
              <PenSquare className="w-4 h-4" />
              Creators
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Community
            </TabsTrigger>
            <TabsTrigger value="troubleshooting" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Troubleshooting
            </TabsTrigger>
          </TabsList>

          {/* General FAQs */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Questions</CardTitle>
                <CardDescription>
                  Basic information about GroqTales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem
                    value="what-is-groqtales"
                    id="what-is-groqtales"
                  >
                    <AccordionTrigger>What is GroqTales?</AccordionTrigger>
                    <AccordionContent>
                      GroqTales is a Web3-enabled storytelling platform that
                      combines creative writing with blockchain technology. It
                      allows writers to create, share, and monetize their
                      stories through NFTs while building a community of readers
                      and fellow creators.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="how-to-start" id="how-to-start">
                    <AccordionTrigger>How do I get started?</AccordionTrigger>
                    <AccordionContent>
                      You can start by browsing stories without an account. To
                      create or interact with stories, you'll need to connect a
                      Web3 wallet like MetaMask. Once connected, you can create
                      your profile, write stories, and participate in the
                      community.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="is-it-free" id="is-it-free">
                    <AccordionTrigger>
                      Is GroqTales free to use?
                    </AccordionTrigger>
                    <AccordionContent>
                      Basic features like reading public stories and browsing
                      the platform are free. Creating and minting NFT stories
                      may involve gas fees on the blockchain. Some premium
                      features or exclusive content might require payment or
                      token ownership.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wallet & NFTs FAQs */}
          <TabsContent value="wallet">
            <Card>
              <CardHeader>
                <CardTitle>Wallet & NFTs</CardTitle>
                <CardDescription>
                  Questions about Web3 wallets and NFT stories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="what-is-wallet" id="what-is-wallet">
                    <AccordionTrigger>
                      What is a Web3 wallet and why do I need one?
                    </AccordionTrigger>
                    <AccordionContent>
                      A Web3 wallet like MetaMask is your digital identity on
                      the blockchain. It's needed to authenticate your account,
                      own NFT stories, and participate in transactions. Think of
                      it as your key to the Web3 features of GroqTales.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="supported-networks">
                    <AccordionTrigger>
                      Which networks are supported?
                    </AccordionTrigger>
                    <AccordionContent>
                      GroqTales currently supports Ethereum Mainnet and Polygon.
                      We chose these networks for their security, widespread
                      adoption, and reasonable transaction costs. More networks
                      may be added in the future.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="nft-ownership">
                    <AccordionTrigger>
                      What does owning an NFT story mean?
                    </AccordionTrigger>
                    <AccordionContent>
                      When you own an NFT story, you have verifiable ownership
                      of that digital content on the blockchain. This can
                      include special access rights, the ability to resell the
                      story, and participation in the story's community. The
                      specific rights are detailed in each NFT's description.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stories FAQs */}
          <TabsContent value="stories">
            <Card>
              <CardHeader>
                <CardTitle>Stories</CardTitle>
                <CardDescription>
                  Information about reading and creating stories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="story-types">
                    <AccordionTrigger>
                      What types of stories can I create?
                    </AccordionTrigger>
                    <AccordionContent>
                      You can create stories in various genres including Science
                      Fiction, Fantasy, Romance, Mystery, and more. Stories can
                      be traditional text-based narratives, interactive stories,
                      or multimedia experiences combining text with images and
                      audio.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="story-rights">
                    <AccordionTrigger>
                      Who owns the rights to my stories?
                    </AccordionTrigger>
                    <AccordionContent>
                      You retain the intellectual property rights to your
                      stories. When you mint a story as an NFT, you're creating
                      a digital certificate of ownership that can be traded, but
                      the underlying creative rights remain with you unless
                      explicitly transferred.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="monetization">
                    <AccordionTrigger>
                      How can I monetize my stories?
                    </AccordionTrigger>
                    <AccordionContent>
                      There are several ways to monetize your stories on
                      GroqTales: 1. Mint them as NFTs for direct sales 2. Earn
                      royalties from secondary sales 3. Create premium content
                      for subscribers 4. Participate in writing contests and
                      challenges 5. Receive tips from readers
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Creators FAQs */}
          <TabsContent value="creators">
            <Card>
              <CardHeader>
                <CardTitle>Creators</CardTitle>
                <CardDescription>
                  Information for story creators and writers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="become-creator">
                    <AccordionTrigger>
                      How do I become a creator?
                    </AccordionTrigger>
                    <AccordionContent>
                      To become a creator: 1. Connect your Web3 wallet 2.
                      Complete your creator profile 3. Pass the creator
                      verification process 4. Start creating and publishing
                      stories The verification process helps maintain quality
                      and prevent spam.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="creator-tools">
                    <AccordionTrigger>
                      What tools are available for creators?
                    </AccordionTrigger>
                    <AccordionContent>
                      GroqTales provides several tools for creators: - Rich text
                      editor with formatting options - AI-assisted writing and
                      editing tools - Cover image generation - Analytics
                      dashboard - Community engagement tools - NFT minting
                      interface
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="revenue-share">
                    <AccordionTrigger>
                      How does revenue sharing work?
                    </AccordionTrigger>
                    <AccordionContent>
                      Creators receive 90% of primary sales and can set their
                      own royalty percentage (up to 10%) for secondary sales.
                      Platform fees are 10% on primary sales to maintain and
                      improve the platform. All transactions are handled
                      automatically through smart contracts.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Community FAQs */}
          <TabsContent value="community">
            <Card>
              <CardHeader>
                <CardTitle>Community</CardTitle>
                <CardDescription>
                  Questions about community participation and interaction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="interaction">
                    <AccordionTrigger>
                      How can I interact with other users?
                    </AccordionTrigger>
                    <AccordionContent>
                      You can interact through: - Comments on stories - Direct
                      messages to creators - Community forums - Writing
                      challenges and contests - Collaborative story projects -
                      Social features like following and sharing
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="reporting">
                    <AccordionTrigger>
                      How do I report inappropriate content?
                    </AccordionTrigger>
                    <AccordionContent>
                      Use the "Report" button on any content to flag it for
                      review. Our moderation team will investigate all reports
                      within 24 hours. You can also contact support directly for
                      urgent concerns. We take community safety seriously and
                      have zero tolerance for harmful content.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="community-guidelines">
                    <AccordionTrigger>
                      What are the community guidelines?
                    </AccordionTrigger>
                    <AccordionContent>
                      Our community guidelines ensure a safe and creative
                      environment: - Respect intellectual property rights - No
                      hate speech or harassment - No plagiarism -
                      Age-appropriate content only - Constructive feedback
                      Violations may result in account suspension.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Troubleshooting FAQs */}
          <TabsContent value="troubleshooting">
            <Card>
              <CardHeader>
                <CardTitle>Troubleshooting</CardTitle>
                <CardDescription>
                  Common technical issues and solutions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">

                  <AccordionItem value="wallet-not-connecting" id="wallet-not-connecting">
                    <AccordionTrigger>
                      What should I do if my wallet doesn’t connect?
                    </AccordionTrigger>
                    <AccordionContent>
                      Ensure your wallet extension is installed and unlocked.
                      Confirm you are on a supported network and refresh the page.
                      If the issue persists, clear browser cache or try another browser.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="transaction-pending" id="transaction-pending">
                    <AccordionTrigger>
                      Why is my transaction pending?
                    </AccordionTrigger>
                    <AccordionContent>
                      Transactions may remain pending due to network congestion or low gas fees.
                      You can speed up the transaction from your wallet interface or wait for confirmation.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="mint-failed" id="mint-failed">
                    <AccordionTrigger>
                      What if my NFT minting fails?
                    </AccordionTrigger>
                    <AccordionContent>
                      Minting may fail due to insufficient balance or incorrect network.
                      Ensure you have enough funds for gas and are connected to the correct network.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="profile-not-loading" id="profile-not-loading">
                    <AccordionTrigger>
                      Why is my profile not loading?
                    </AccordionTrigger>
                    <AccordionContent>
                      This can occur due to temporary backend issues.
                      Try refreshing the page or reconnecting your wallet.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Category Navigation */}
        <div className="mt-8 p-6 bg-muted/30 rounded-lg">
          <h3 className="font-semibold mb-4">Browse by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              {
                value: 'general',
                icon: HelpCircle,
                label: 'General Questions',
              },
              { value: 'wallet', icon: Wallet, label: 'Wallet & NFTs' },
              { value: 'stories', icon: BookOpen, label: 'Stories' },
              { value: 'creators', icon: PenSquare, label: 'Creators' },
              { value: 'community', icon: Users, label: 'Community' },
              { value: 'troubleshooting', icon: Shield, label: 'Troubleshooting' },
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => handleTabChange(value)}
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Still Need Help Section */}
        <div className="mt-12 text-center">
          <Card className="bg-muted/30">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
              <p className="text-muted-foreground mb-6">
                Can't find the answer you're looking for? Our support team is
                here to help.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild>
                  <Link href="/contact">Contact Support</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/docs">View Documentation</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
