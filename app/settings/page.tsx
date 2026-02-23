//import React from 'react';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import SettingsClient from '@/components/settings/settings-client';
// import { Button } from '@/components/ui/button';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { Switch } from '@/components/ui/switch';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { ProfileForm } from '@/components/settings/profile-form';
import { redirect } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import {useAccount, useConnect} from "wagmi";
// import { chainConfig } from 'viem/zksync';

// type NotificationSettings = {
//   email: {
//     comments: boolean;
//     followers: boolean;
//     likes: boolean;
//     nftPurchases: boolean;
//   };
// };

// const defaultNotifications: NotificationSettings = {
//   email: {
//     comments: true,
//     followers: false,
//     likes: true,
//     nftPurchases: true,
//   },
// };
// const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotifications);

// const [loading, setLoading] = useState(true);
// useEffect(() => {
//   fetch("/api/settings/notifications")
//   .then(res => res.json())
//   .then(setNotifications);
// })
// const {address, chain} = useAccount();
// const { connect, connectors} = useConnect();

// useEffect(() => {
//   if (address && chain) {
//   fetch("/api/settings/wallet",{
//     method: "GET",
//     headers:{"Content-Type": "application/json"},
//     body: JSON.stringify({
//       address,
//       network: chain.name,
//       provider: "wagmi",
//     }),
//   });
// }
// }, [address, chain]);

export const metadata: Metadata = {
  title: 'Settings - GroqTales',
  description: 'Manage your account settings and preferences.',
};

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session || !session.user) {
    redirect('/');
  }

  // Create mock user combining Supabase info
  const user = {
    name: session.user.user_metadata?.name || 'User',
    email: session.user.email,
    image: session.user.user_metadata?.avatar_url,
    walletAddress: session.user.user_metadata?.wallet || session.user.email
  };
  
  return <SettingsClient />;
}
// return (
//   <div className="container mx-auto py-10 px-4 md:px-6">
//     <h1 className="text-4xl font-bold mb-6">Settings</h1>

//     <Tabs defaultValue="profile" className="w-full">
//       <TabsList className="grid w-full md:w-auto grid-cols-3 md:grid-cols-6 mb-8 h-auto gap-2">
//         <TabsTrigger value="profile">Profile</TabsTrigger>
//         <TabsTrigger value="account">Account</TabsTrigger>
//         <TabsTrigger value="notifications">Notify</TabsTrigger>
//         <TabsTrigger value="wallet">Wallet</TabsTrigger>
//         <TabsTrigger value="appearance">Theme</TabsTrigger>
//         <TabsTrigger value="privacy">Privacy</TabsTrigger>
//       </TabsList>

//       <TabsContent value="profile">
//         <ProfileForm />
//       </TabsContent>

//       <TabsContent value="account">
//         <Card>
//           <CardHeader>
//             <CardTitle>Account Settings</CardTitle>
//             <CardDescription>
//               Manage your account credentials and security
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="email">Email Address</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   defaultValue={session?.user?.email || ""}
//                   disabled
//                 />
//                 <p className="text-[0.8rem] text-muted-foreground">
//                   Email cannot be changed directly. Contact support.
//                 </p>
//               </div>
//               <div className="border-t pt-4 mt-4">
//                   <h3 className="font-medium mb-4">Security</h3>
//                   <Button variant="outline">Change Password</Button>
//               </div>
//             </div>

//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h4 className="font-medium">Two-factor Authentication</h4>
//                   <p className="text-sm text-muted-foreground">
//                     Add an extra layer of security to your account
//                   </p>
//                 </div>
//                 <Switch disabled />
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </TabsContent>

//       <TabsContent value="notifications">
//         <Card>
//           <CardHeader>
//             <CardTitle>Notification Preferences</CardTitle>
//             <CardDescription>
//               Manage how and when you receive notifications
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {[
//                 { title: "New Story Comments", desc: "When someone comments on your stories" },
//                 { title: "New Followers", desc: "When someone follows your profile" },
//                 { title: "Story Likes", desc: "When someone likes your stories" },
//                 { title: "NFT Purchases", desc: "When someone purchases your NFT stories" },
//               ].map((item, i) => (
//                   <div key={i} className="flex items-center justify-between">
//                   <div>
//                       <h4 className="font-medium">{item.title}</h4>
//                       <p className="text-sm text-muted-foreground">{item.desc}</p>
//                   </div>
//                   <Switch
//                   checked={notifications?.email.comments}
//                   onCheckedChange={(v)=>
//                     fetch("/api/settings/notifications", {
//                       method: "PUT",
//                       headers:{"Content-Type": "application/json"},
//                       body: JSON.stringify({
//                         email: { ...notifications.email, comments: v},
//                       }),
//                     })
//                   }/>
//                   </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </TabsContent>

//       <TabsContent value="wallet">
//         <Card>
//           <CardHeader>
//             <CardTitle>Wallet Settings</CardTitle>
//             <CardDescription>
//               Manage your crypto wallet and NFT preferences
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="wallet-address">Connected Wallet</Label>
//                 <div className="flex gap-2">
//                   <Input id="wallet-address" placeholder="No wallet connected" readOnly />
//                   <Button variant="outline">Connect</Button>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="network">Preferred Network</Label>
//                 <Select defaultValue="ethereum">
//                   <SelectTrigger id="network">
//                     <SelectValue placeholder="Select network" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="ethereum">Ethereum</SelectItem>
//                     <SelectItem value="polygon">Polygon</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </TabsContent>

//       <TabsContent value="appearance">
//         <Card>
//           <CardHeader>
//             <CardTitle>Appearance Settings</CardTitle>
//             <CardDescription>
//               Customize how GroqTales looks for you
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <Label>Theme</Label>
//                 <div className="grid grid-cols-3 gap-2">
//                   <Button variant="outline" className="justify-start">Light</Button>
//                   <Button variant="outline" className="justify-start">Dark</Button>
//                   <Button variant="outline" className="justify-start">System</Button>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </TabsContent>

//       <TabsContent value="privacy">
//         <Card>
//           <CardHeader>
//             <CardTitle>Privacy Settings</CardTitle>
//             <CardDescription>
//               Control your data and privacy preferences
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h4 className="font-medium">Profile Visibility</h4>
//                   <p className="text-sm text-muted-foreground">Who can see your profile</p>
//                 </div>
//                 <Select defaultValue="public">
//                   <SelectTrigger className="w-[180px]">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="public">Public</SelectItem>
//                     <SelectItem value="private">Private</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             <div className="pt-4 border-t">
//               <h3 className="font-medium mb-2 text-destructive">Danger Zone</h3>
//               <Button variant="destructive" className="w-full sm:w-auto">
//                  Delete Account
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </TabsContent>
//     </Tabs>
//   </div>
//);
//}
