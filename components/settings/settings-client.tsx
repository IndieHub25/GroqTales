'use client';

import NotificationsSettings from '@/components/settings/notifications-settings';
import PrivacySettings from '@/components/settings/privacy-settings';
import WalletSettings from '@/components/settings/wallet-settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { ProfileForm } from './profile-form';

export default function SettingsClient() {
  return (
    <Tabs defaultValue="profile">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="wallet">Wallet</TabsTrigger>
        <TabsTrigger value="privacy">Privacy</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <ProfileForm />
      </TabsContent>
      <TabsContent value="notifications">
        <NotificationsSettings />
      </TabsContent>
      <TabsContent value="wallet">
        <WalletSettings />
      </TabsContent>
      <TabsContent value="privacy">
        <PrivacySettings />
      </TabsContent>
    </Tabs>
  );
}
