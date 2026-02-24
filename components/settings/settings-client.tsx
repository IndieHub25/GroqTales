"use client";

import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {ProfileForm} from "./profile-form";
import NotificationsSettings from "@/components/settings/notifications-settings";
import WalletSettings from "@/components/settings/wallet-settings";
import PrivacySettings from "@/components/settings/privacy-settings";

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
                <ProfileForm/>
            </TabsContent>
            <TabsContent value="notifications">
                <NotificationsSettings/>
            </TabsContent>
            <TabsContent value="wallet">
                <WalletSettings/>
            </TabsContent>
            <TabsContent value="privacy">
                <PrivacySettings/>
            </TabsContent>
        </Tabs>
    );
}