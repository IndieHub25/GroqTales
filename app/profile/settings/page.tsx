'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Upload,
  Wallet,
  Bell,
  Shield,
  EyeOff,
  AtSign,
  Copy,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Badge } from '@/components/ui/badge';
import {ApiResponse, User, NotificationSettings, PrivacySettings,} from '@/types/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {useWeb3} from '@/components/providers/web3-provider';


const profileFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters.' })
    .max(30, { message: 'Username must be less than 30 characters.' }),
  displayName: z
    .string()
    .min(2, { message: 'Display name must be at least 2 characters.' })
    .max(50, { message: 'Display name must be less than 50 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  bio: z
    .string()
    .max(250, { message: 'Bio must be less than 250 characters.' })
    .optional(),
  primaryGenre: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function SettingsPage() {
  // const [avatar, setAvatar] = useState<string>(
  //   'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  // );
  
  const[user, setUser] = useState<User|null>(null);
  const[notifications, setNotifications] = useState<NotificationSettings| null>(null);
  const[privacy, setPrivacy] =  useState<PrivacySettings | null>(null);
  const[loading, setLoading] = useState(true);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: 'onChange',
  });

  // const onSubmit = (data: ProfileFormValues) => {
  //   // In a real app, this would save the data to the server
  //   console.log(data);
  //   // Show success message or redirect
  // };
  useEffect(()=>{
  const controller = new AbortController();
  async function hydrate(){
    try{
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/profile`,{
          credentials: 'include',
          signal: controller.signal,
        }
      );
        
      
      //if(!profileRes.ok || !notifRes.ok) throw new Error();

      const json: ApiResponse<User> = await res.json();
      //const notifJson = await notifRes.json();
      if(!json.success || !json.data) return;
      const userData = json.data;
      setUser(userData);
      setNotifications(userData.preferences.notifications);
      setPrivacy(userData.preferences.privacy);

      form.reset({
        username: userData.username,
        displayName: userData.displayName,
        email: userData.email,
        bio: userData.bio ?? '',
        //primaryGenre: profileJson.user.primaryGenre ?? '',
      });
    } catch(err){
      console.error(err);
    }
      finally {
      setLoading(false);
    }
  }
  hydrate();
  return () => controller.abort();
},[form])
const onSubmit = (data: ProfileFormValues) => {
    // In a real app, this would save the data to the server
    console.log(data);
    // Show success message or redirect
  };
  if(loading || !user || !notifications || !privacy)
    return <div className="p-8">Loading...</div>
  return (
    <div className="container max-w-5xl mx-auto py-12 px-4 min-h-screen">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link
            href="/profile"
            className="flex items-center text-muted-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Link>
        </Button>
        <h1 className="text-4xl font-bold gradient-heading mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and settings
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-4 w-full md:w-auto mb-8">
          <TabsTrigger value="profile" className="text-sm">
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-sm">
            Notifications
          </TabsTrigger>
          <TabsTrigger value="wallet" className="text-sm">
            Wallet
          </TabsTrigger>
          <TabsTrigger value="privacy" className="text-sm">
            Privacy
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="mt-0">
          <div className="grid grid-cols-1 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your profile details visible to other users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                  >
                    <div className="space-y-8">
                      <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
                        <div className="relative group">
                          {/* <Avatar className="h-24 w-24 border">
                            <AvatarImage src={profile?.avatar} alt="Profile picture" />
                            <AvatarFallback>AC</AvatarFallback>
                          </Avatar> */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Upload className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="space-y-2 w-full max-w-sm">
                          <FormLabel className="text-sm font-medium">
                            Profile Picture
                          </FormLabel>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs text-muted-foreground flex gap-1 h-8"
                            >
                              <Upload className="h-3.5 w-3.5" />
                              Upload
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs text-muted-foreground h-8"
                            >
                              Remove
                            </Button>
                          </div>
                          <FormDescription className="text-xs text-muted-foreground">
                            Recommended size: 400x400px. Max 2MB.
                          </FormDescription>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <div className="flex items-center">
                                <span className="text-muted-foreground mr-1 text-sm">
                                  @
                                </span>
                                <Input placeholder="username" {...field} />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Your unique username on the platform.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your name displayed to other users.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="email@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Used for notifications and account recovery.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us about yourself and your storytelling style"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              <span
                                className={`${
                                  (field.value?.length || 0) > 200
                                    ? 'text-warning'
                                    : ''
                                }`}
                              >
                                {field.value?.length || 0}
                              </span>
                              /250 characters
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="primaryGenre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Genre</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value ?? ''}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your primary writing genre" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="sci-fi">
                                  Science Fiction
                                </SelectItem>
                                <SelectItem value="fantasy">Fantasy</SelectItem>
                                <SelectItem value="mystery">Mystery</SelectItem>
                                <SelectItem value="horror">Horror</SelectItem>
                                <SelectItem value="romance">Romance</SelectItem>
                                <SelectItem value="historical">
                                  Historical Fiction
                                </SelectItem>
                                <SelectItem value="thriller">
                                  Thriller
                                </SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              This will be displayed on your profile and help
                              with story recommendations.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="mt-0">
          <div className="grid grid-cols-1 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how and when you receive notifications
                </CardDescription>
              </CardHeader>
              {/* <CardContent className="space-y-6"> */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label
                          htmlFor="comments"
                          className="text-sm font-medium"
                        >
                          Story Comments
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Receive emails when someone comments on your stories
                        </p>
                      </div>
                      <Switch 
                        id="comments" 
                        checked={notifications.comments}
                        onCheckedChange={(value)=>
                          setNotifications({
                            ...notifications,
                            comments: value, 
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label htmlFor="likes" className="text-sm font-medium">
                          Story Likes
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Receive emails when someone likes your stories
                        </p>
                      </div>
                      <Switch id="likes" 
                      checked={notifications.likes}
                        onCheckedChange={(value)=>
                          setNotifications({
                            ...notifications,
                            likes: value,
                            })
                          }
                     />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label
                          htmlFor="followers"
                          className="text-sm font-medium"
                        >
                          New Followers
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Receive emails when someone follows you
                        </p>
                      </div>
                      <Switch 
                      id="followers" 
                      checked={notifications.follows}
                        onCheckedChange={(value)=>
                          setNotifications({
                            ...notifications,
                           follows: value,
                          })
                        }
                        />
                    </div>

                    {/* <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label
                          htmlFor="nft-sale"
                          className="text-sm font-medium"
                        >
                          NFT Sales
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Receive emails when one of your NFT stories is sold
                        </p>
                      </div>
                      <Switch 
                      id="nft-sale" 
                      checked={notifications.nftSales}
                        onCheckedChange={(value)=>{
                          setNotifications((prev: any)=>({
                            ...prev,
                            email:{
                              ...prev.email,
                              comments: value,
                            },
                          }));
                        }}
                       />
                    </div> */}

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label
                          htmlFor="newsletter"
                          className="text-sm font-medium"
                        >
                          Platform Updates
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Receive emails about new features and platform updates
                        </p>
                      </div>
                      <Switch id="newsletter" />
                    </div>
                  </div>
                </div>

                {/* <div className="space-y-4">
                  <h3 className="text-lg font-medium">In-App Notifications</h3>
                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label
                          htmlFor="app-comments"
                          className="text-sm font-medium"
                        >
                          Story Comments
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Show notifications when someone comments on your
                          stories
                        </p>
                      </div>
                      <Switch id="app-comments" 
                      checked={!!notifications?.inApp?.comments}
                        onCheckedChange={(value)=>{
                          setNotifications((prev: any)=>({
                            ...prev,
                            email:{
                              ...prev.email,
                              comments: value,
                            },
                          }));
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label
                          htmlFor="app-likes"
                          className="text-sm font-medium"
                        >
                          Story Likes
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Show notifications when someone likes your stories
                        </p>
                      </div>
                      <Switch 
                      id="app-likes" 
                      checked={!!notifications?.inApp?.likes}
                        onCheckedChange={(value)=>{
                          setNotifications((prev: any)=>({
                            ...prev,
                            email:{
                              ...prev.email,
                              comments: value,
                            },
                          }));
                        }}
                       />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label
                          htmlFor="app-followers"
                          className="text-sm font-medium"
                        >
                          New Followers
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Show notifications when someone follows you
                        </p>
                      </div>
                      <Switch id="app-followers" 
                      checked={!!notifications?.inApp?.followers}
                        onCheckedChange={(value)=>{
                          setNotifications((prev: any)=>({
                            ...prev,
                            email:{
                              ...prev.email,
                              comments: value,
                            },
                          }));
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label
                          htmlFor="app-messages"
                          className="text-sm font-medium"
                        >
                          Direct Messages
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Show notifications for new direct messages
                        </p>
                      </div>
                      <Switch id="app-messages"
                      checked={!!notifications?.inApp?.messages}
                        onCheckedChange={(value)=>{
                          setNotifications((prev: any)=>({
                            ...prev,
                            email:{
                              ...prev.email,
                              comments: value,
                            },
                          }));
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </CardContent> */}
              {/* <CardFooter className="flex justify-end space-x-4 border-t pt-6">
                <Button variant="outline">Reset to Defaults</Button>
                <Button>Save Preferences</Button>
              </CardFooter> */}
            </Card>
          </div>
        </TabsContent>

        {/* Wallet Settings */}
        <TabsContent value="wallet" className="mt-0">
          <div className="grid grid-cols-1 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Blockchain Wallet</CardTitle>
                <CardDescription>
                  Manage your connected wallet and NFT preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border bg-muted/40 p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Wallet className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-medium mb-1">
                        Connected Wallet
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        {/* <Badge
                          variant="outline"
                          className="bg-primary/10 font-mono text-xs py-1"
                        >
                          0x1a2b3c4d5e6f7890abcdef1234567890abcdef12
                        </Badge> */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-1"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      {/* <div className="flex gap-2 items-center text-sm text-muted-foreground">
                        <Badge>Monad</Badge>
                        <span>Connected Jan 15, 2023</span>
                      </div> */}
                    </div>
                    <div>
                      <Button variant="outline" size="sm">
                        Disconnect
                      </Button>
                    </div>
                  </div>
                </div>

                {/* <div className="space-y-4">
                  <h3 className="text-lg font-medium">NFT Settings</h3>
                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label
                          htmlFor="auto-sign"
                          className="text-sm font-medium"
                        >
                          Auto-sign NFT Transactions
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Automatically sign transactions below 0.01 ETH without
                          prompting
                        </p>
                      </div>
                      <Switch id="auto-sign" 
                      checked={!!notifications?.inApp?.auto-sign}
                        onCheckedChange={(value)=>{
                          setNotifications((prev: any)=>({
                            ...prev,
                            email:{
                              ...prev.email,
                              comments: value,
                            },
                          }));
                        }}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label
                          htmlFor="nft-visibility"
                          className="text-sm font-medium"
                        >
                          NFT Public Visibility
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Make your NFT collection public on your profile
                        </p>
                      </div>
                      <Switch 
                      id="nft-visibility" 
                      checked={!!notifications?.inApp?.nft-visibility}
                        onCheckedChange={(value)=>{
                          setNotifications((prev: any)=>({
                            ...prev,
                            email:{
                              ...prev.email,
                              comments: value,
                            },
                          }));
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label
                          htmlFor="gas-optimization"
                          className="text-sm font-medium"
                        >
                          Gas Fee Optimization
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Wait for optimal gas fees when minting NFTs
                        </p>
                      </div>
                      <Switch 
                      id="gas-optimization" 
                      checked={!!notifications?.inApp?.gas-optimization}
                        onCheckedChange={(value)=>{
                          setNotifications((prev: any)=>({
                            ...prev,
                            email:{
                              ...prev.email,
                              comments: value,
                            },
                          }));
                        }}
                      defaultChecked />
                    </div>
                  </div>
                </div> */}

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Transaction History</h3>
                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 border rounded-md bg-card">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-500/10 p-1.5 rounded-full">
                          <AtSign className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Story NFT Minted
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Feb 23, 2023
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-right">
                        <p className="font-medium">Beyond the Quantum Veil</p>
                        <p className="text-xs text-muted-foreground">
                          0.05 ETH gas fee
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 border rounded-md bg-card">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500/10 p-1.5 rounded-full">
                          <AtSign className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Story NFT Minted
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Jan 12, 2023
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-right">
                        <p className="font-medium">
                          Whispers of the Digital Forest
                        </p>
                        <p className="text-xs text-muted-foreground">
                          0.03 ETH gas fee
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center mt-4">
                    <Button variant="outline">View All Transactions</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="mt-0">
          <div className="grid grid-cols-1 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Manage your privacy preferences and account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Visibility Settings</h3>
                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label
                          htmlFor="profile-visibility"
                          className="text-sm font-medium"
                        >
                          Public Profile
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Make your profile visible to all users
                        </p>
                      </div>
                      <Switch 
                      id="profile-visibility"
                      checked={privacy.profileVisible}
                        onCheckedChange={(value)=>
                          setPrivacy({
                            ...privacy,
                           profileVisible: value,
                          })
                        }
                      defaultChecked />
                    </div>

                    {/* <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label
                          htmlFor="story-comments"
                          className="text-sm font-medium"
                        >
                          Story Comments
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Allow users to comment on your stories
                        </p>
                      </div>
                      <Switch id="story-comments"
                      checked={!!notifications?.privacy?.allowcomments}
                        onCheckedChange={(value)=>{
                          setNotifications((prev: any)=>({
                            ...prev,
                            email:{
                              ...prev.email,
                              comments: value,
                            },
                          }));
                        }} 
                      />
                    </div> */}

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label
                          htmlFor="show-activity"
                          className="text-sm font-medium"
                        >
                          Activity Feed
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Show your activity in other users' feeds
                        </p>
                      </div>
                      <Switch id="show-activity" 
                      checked={privacy.activityVisible}
                        onCheckedChange={(value)=>
                          setPrivacy({
                            ...privacy,
                           activityVisible: value,
                        })}
                      />
                    </div>

                    {/* <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label
                          htmlFor="show-reading"
                          className="text-sm font-medium"
                        >
                          Reading History
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Show stories you've read on your profile
                        </p>
                      </div>
                      <Switch id="show-reading"
                      checked={!!notifications?.privacy?.showReading}
                        onCheckedChange={(value)=>{
                          setNotifications((prev: any)=>({
                            ...prev,
                            email:{
                              ...prev.email,
                              comments: value,
                            },
                          }));
                        }} 
                      />
                    </div> */}
                  </div>
                </div>

                {/* <div className="space-y-4">
                  <h3 className="text-lg font-medium">Account Security</h3>
                  <Separator className="my-4" /> */}

                  {/* <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label
                          htmlFor="two-factor"
                          className="text-sm font-medium"
                        >
                          Two-Factor Authentication
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-amber-500 border-amber-200 bg-amber-50"
                        >
                          Not Enabled
                        </Badge>
                        <Switch id="two-factor" />
                      </div>
                    </div> */}

                    {/* <div className="mt-4">
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto flex items-center gap-2"
                        size="sm"
                      >
                        <Shield className="h-4 w-4" />
                        <span>Change Password</span>
                      </Button>
                    </div>
                  </div>
                </div> */}

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Data & Privacy</h3>
                  <Separator className="my-4" />

                  {/* <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label
                          htmlFor="data-collection"
                          className="text-sm font-medium"
                        >
                          Usage Data Collection
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Allow us to collect anonymous usage data to improve
                          the platform
                        </p>
                      </div>
                      <Switch 
                      id="data-collection" 
                      checked={!!notifications?.privacy?.dataCollections}
                        onCheckedChange={(value)=>{
                          setNotifications((prev: any)=>({
                            ...prev,
                            email:{
                              ...prev.email,
                              comments: value,
                            },
                          }));
                        }}
                       />
                    </div> */}

                    {/* <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label
                          htmlFor="personalization"
                          className="text-sm font-medium"
                        >
                          Content Personalization
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Allow us to use your reading history to personalize
                          recommendations
                        </p>
                      </div>
                      <Switch 
                      id="personalization"
                      checked={!!notifications?.privacy?.personalization}
                        onCheckedChange={(value)=>{
                          setNotifications((prev: any)=>({
                            ...prev,
                            email:{
                              ...prev.email,
                              comments: value,
                            },
                          }));
                        }} 
                       />
                    </div>
                  </div> */}

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      size="sm"
                    >
                      <EyeOff className="h-4 w-4" />
                      <span>Download My Data</span>
                    </Button>
                    <Button variant="destructive" size="sm">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-4 border-t pt-6">
                <Button variant="outline">Cancel</Button>
                <Button>Save Privacy Settings</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
