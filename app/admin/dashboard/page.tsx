'use client';

import {
  BarChart3,
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Settings,
  LogOut,
  Activity,
  Wallet,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Send,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState, Suspense } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { VerifiedBadge } from '@/components/verified-badge';
import { getAdminActions } from '@/lib/admin-service';

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
function DashboardContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [isPostLoading, setIsPostLoading] = useState(false);
  const { toast } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const sessionToken = searchParams.get('sessionToken');

  useEffect(() => {
    // Check if authentication is directly from URL token (most reliable method)
    if (sessionToken) {
      try {
        // Decode and validate the session token
        const decodedToken = JSON.parse(atob(sessionToken));
        const { employeeId, timestamp, signature } = decodedToken;

        // Basic validation
        if (!employeeId || !timestamp || !signature) {
          console.log('Invalid session token structure');
          router.push('/admin/login');
          return;
        }

        // Check if token is expired (24 hours)
        const now = Date.now();
        const isExpired = now - timestamp > 24 * 60 * 60 * 1000;

        if (isExpired) {
          console.log('Session token expired');
          router.push('/admin/login');
          return;
        }

        // Store valid session data
        if (typeof window !== 'undefined') {
          localStorage.setItem('adminSession', 'true');
          localStorage.setItem('employeeId', employeeId);
          localStorage.setItem('adminSessionTimestamp', now.toString());
          document.cookie = 'adminSessionActive=true; path=/; max-age=86400'; // 24 hours
        }

        setIsLoading(false);
        return;
      } catch (error) {
        console.error('Error validating session token:', error);
        router.push('/admin/login');
        return;
      }
    }

    // Check existing authentication methods
    try {
      if (typeof window !== 'undefined') {
        const adminSession = localStorage.getItem('adminSession');
        const employeeId = localStorage.getItem('employeeId');
        const sessionTimestamp = localStorage.getItem('adminSessionTimestamp');

        const now = Date.now();
        // Check if session has expired (24 hours)
        const isExpired =
          sessionTimestamp &&
          now - parseInt(sessionTimestamp) > 24 * 60 * 60 * 1000;

        if (!adminSession || !employeeId || isExpired) {
          // Try to check cookie as fallback
          const hasCookie =
            typeof document !== 'undefined' &&
            document.cookie
              .split(';')
              .some((c) => c.trim().startsWith('adminSessionActive=true'));

          if (!hasCookie) {
            console.log('No valid admin session found, redirecting to login');
            router.push('/admin/login');
            return;
          }
        }

        // Session exists and is valid, refresh it
        localStorage.setItem('adminSessionTimestamp', now.toString());
        if (typeof document !== 'undefined') {
          document.cookie = 'adminSessionActive=true; path=/; max-age=86400'; // 24 hours
        }

        // Set up periodic session refresh without depending on React state
        const intervalId = window.setInterval(
          () => {
            try {
              if (typeof window !== 'undefined') {
                localStorage.setItem(
                  'adminSessionTimestamp',
                  Date.now().toString()
                );
                if (typeof document !== 'undefined') {
                  document.cookie =
                    'adminSessionActive=true; path=/; max-age=86400';
                }
              }
            } catch (error) {
              console.error('Error refreshing session:', error);
              // Not critical, will try again next interval
            }
          },
          15 * 60 * 1000
        ); // 15 minutes

        setIsLoading(false);

        // Clear interval on component unmount
        return () => window.clearInterval(intervalId);
      } else {
        // SSR case - just set loading to false to avoid infinite loading
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error checking admin authentication:', error);
      setAuthError('Authentication error. Please try logging in again.');
      setIsLoading(false);
      return;
    }
  }, [router, sessionToken]);

  const handleLogout = () => {
    try {
      if (typeof window !== 'undefined') {
        // Clear all localStorage items
        localStorage.removeItem('adminSession');
        localStorage.removeItem('employeeId');
        localStorage.removeItem('adminSessionTimestamp');
        localStorage.removeItem('adminSessionToken');

        // Expire all cookies
        if (typeof document !== 'undefined') {
          document.cookie = 'adminSessionActive=; path=/; max-age=0';
        }
      }
      // Show logout toast
      toast({
        title: 'Logged out successfully',
        description: 'You have been logged out of the admin dashboard',
      });

      // Redirect after a short delay to ensure toast is shown
      setTimeout(() => {
        router.push('/admin/login');
      }, 800);
    } catch (error) {
      console.error('Error during logout:', error);

      // Redirect anyway, even if clearing storage failed
      toast({
        variant: 'destructive',
        title: 'Logout issue',
        description:
          "There was a problem during logout, but you've been redirected to the login page.",
      });

      setTimeout(() => {
        router.push('/admin/login');
      }, 800);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setIsPostLoading(true);
    try {
      // In a real app, this would call an API endpoint
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate API call

      toast({
        title: 'Post created',
        description: 'Your admin post has been published',
      });

      setNewPost('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Post failed',
        description: 'Could not create your post',
      });
    } finally {
      setIsPostLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <div className="text-destructive text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Authentication Error</h2>
          <p>{authError}</p>
        </div>
        <Button
          onClick={() => router.push('/admin/login')}
          className="theme-gradient-bg"
        >
          Return to Login
        </Button>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-heading">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your GroqTales platform
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/settings')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">12,453</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Stories</p>
                  <p className="text-2xl font-bold">8,721</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenue (ETH)</p>
                  <p className="text-2xl font-bold">284.56</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Growth Rate</p>
                  <p className="text-2xl font-bold">+24.8%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="analytics">
          <TabsList className="mb-6">
            <TabsTrigger value="analytics">
              <Activity className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="transactions">
              <Wallet className="w-4 h-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="community">
              <MessageSquare className="w-4 h-4 mr-2" />
              Community
            </TabsTrigger>
            <TabsTrigger value="reports">
              <BarChart3 className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>
                    Monthly user acquisition stats
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center border rounded-lg">
                    [User Growth Chart Placeholder]
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                  <CardDescription>Monthly revenue in ETH</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center border rounded-lg">
                    [Revenue Chart Placeholder]
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest platform transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4">
                  [Transaction Table Placeholder]
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create Admin Post</CardTitle>
                  <CardDescription>
                    Post as GroqTales admin to the community feed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreatePost} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full theme-gradient-bg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">GroqTales</span>
                        <VerifiedBadge className="ml-1" />
                      </div>
                    </div>

                    <Textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="Share an announcement or update with the community..."
                      className="min-h-[120px]"
                      required
                    />

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isPostLoading || !newPost.trim()}
                      >
                        {isPostLoading ? (
                          <>
                            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            Posting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Post as Admin
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Admin Interactions</CardTitle>
                  <CardDescription>
                    Your recent activity on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getAdminActions().length === 0 ? (
                      <div className="text-center p-6 text-muted-foreground">
                        No recent admin interactions
                      </div>
                    ) : (
                      getAdminActions().map((action, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 border rounded-lg"
                        >
                          {action.type === 'like' && (
                            <ThumbsUp className="w-5 h-5 text-green-500" />
                          )}
                          {action.type === 'dislike' && (
                            <ThumbsDown className="w-5 h-5 text-red-500" />
                          )}
                          {action.type === 'comment' && (
                            <MessageSquare className="w-5 h-5 text-blue-500" />
                          )}
                          {action.type === 'delete' && (
                            <Trash2 className="w-5 h-5 text-red-500" />
                          )}
                          {action.type === 'post' && (
                            <Send className="w-5 h-5 text-purple-500" />
                          )}

                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="font-medium">GroqTales</span>
                              <VerifiedBadge className="ml-1" size="sm" />
                              <span className="ml-2 text-xs text-muted-foreground">
                                {action.timestamp.toLocaleString()}
                              </span>
                            </div>

                            <p className="text-sm mt-1">
                              {action.type === 'like' &&
                                `Liked story #${action.storyId}`}
                              {action.type === 'dislike' &&
                                `Disliked story #${action.storyId}`}
                              {action.type === 'comment' &&
                                `Commented on story #${action.storyId}: "${action.content}"`}
                              {action.type === 'delete' &&
                                `Deleted story #${action.storyId}`}
                              {action.type === 'post' &&
                                `Posted: "${action.content}"`}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Platform Reports</CardTitle>
                <CardDescription>
                  Detailed analytics and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4">
                  [Reports Dashboard Placeholder]
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
