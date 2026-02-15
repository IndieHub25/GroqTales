//import React from 'react';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import SettingsClient from '@/components/settings/settings-client';
import { redirect } from 'next/navigation';
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
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/settings');
  }

  return <SettingsClient />;
}