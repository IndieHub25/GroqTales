"use client";

import { useState, useEffect } from "react";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
import { DashboardTour } from "@/components/dashboard/DashboardTour";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Wallet, 
  BookOpen, 
  Trophy, 
  Plus, 
  MoreVertical, 
  ArrowUpRight 
} from "lucide-react";

interface ChecklistStep {
  id: string;
  label: string;
  isCompleted: boolean;
  actionUrl?: string;
}

export default function DashboardPage() {
  const [runTour, setRunTour] = useState(false);

  const [isChecklistVisible, setIsChecklistVisible] = useState(false);

  const [checklistSteps, setChecklistSteps] = useState<ChecklistStep[]>([
    { id: "profile", label: "Complete your Creator Profile", isCompleted: true },
    { id: "wallet", label: "Connect Web3 Wallet", isCompleted: false },
    { id: "story", label: "Publish your first Story", isCompleted: false },
    { id: "mint", label: "Mint a Story NFT", isCompleted: false },
    { id: "social", label: "Share on Social Media", isCompleted: false },
  ]);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("has_seen_dashboard_tour");
    if (!hasSeenTour) {
      setRunTour(true);
    }

    const isDismissed = localStorage.getItem("onboarding_dismissed");
    if (!isDismissed) {
      setIsChecklistVisible(true);
    }
  }, []);

  const handleTourComplete = () => {
    setRunTour(false);
    localStorage.setItem("has_seen_dashboard_tour", "true");
  };

  const handleChecklistDismiss = () => {
    setIsChecklistVisible(false);
    localStorage.setItem("onboarding_dismissed", "true");
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <DashboardTour 
        shouldRun={runTour} 
        onComplete={handleTourComplete} 
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Creator Dashboard</h1>
          <p className="text-muted-foreground">Manage your stories, NFTs, and earnings.</p>
        </div>

        <Button variant="outline" className="tour-wallet-connect gap-2">
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      </div>

      <OnboardingChecklist 
        steps={checklistSteps}
        isVisible={isChecklistVisible}
        onDismiss={handleChecklistDismiss}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="tour-analytics">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <span className="text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,234.56</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-green-500 flex items-center mr-1">
                +20.1% <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stories Published</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">
              +2 new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NFTs Minted</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground mt-1">
              6 sold on secondary market
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Readers</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground mt-1">
              +201 since last hour
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">  
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Stories</CardTitle>
             
             <Button className="tour-create-story bg-primary text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" /> Create New Story
             </Button>

          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                📚
                            </div>
                            <div>
                                <p className="font-medium">The Lost Algorithm of Atlantis</p>
                                <p className="text-sm text-muted-foreground">Updated 2 hours ago</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
                <div className="p-3 bg-primary/10 rounded-lg text-primary border border-primary/20">
                    <strong>💡 Pro Tip:</strong> Minting your story as an NFT allows you to earn royalties every time it is resold.
                </div>
                <div className="p-3 bg-muted rounded-lg border">
                    <strong>Writing with AI:</strong> Try using the "Fantasy" prompt preset to generate immersive worlds quickly.
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}