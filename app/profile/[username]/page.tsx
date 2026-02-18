'use client';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';

import {
  ProfileContentTabs,
  ProfileLayout,
} from '@/components/profile/profile-layout';
import { ProfileInfoForm } from '@/components/profile/profile-info-form';
import { useWeb3 } from '@/components/providers/web3-provider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EditableProfileFields, UserProfileUI } from '@/types/profile';

function buildInitialProfile(walletFromUrl: string): UserProfileUI {
  return {
    name: '',
    username: walletFromUrl,
    avatar: '',
    bio: '',
    website: '',
    twitter: '',
    github: '',
    email: '',
    joinDate: '',
    isVerified: false,
    storiesCount: 0,
    followers: 0,
    following: 0,
    walletAddress: walletFromUrl,
    badges: [],
    totalViews: 0,
    totalLikes: 0,
  };
}
export default function ProfilePage() {
  const params = useParams();
  const { account } = useWeb3();
  const walletFromUrl = (params?.username as string) || '';

  const [userData, setUserData] = useState<UserProfileUI>(() =>
    buildInitialProfile(walletFromUrl)
  );
  const [isEditing, setIsEditing] = useState(false);

  const isOwner =
    !!account && account.toLowerCase() === walletFromUrl.toLowerCase();
  const handleAvatarChange = (newAvatar: string) => {
    setUserData((prev) => ({ ...prev, avatar: newAvatar }));
  };
  const handleProfileSave = (updatedData: EditableProfileFields) => {
    setUserData((prev) => ({ ...prev, ...updatedData }));
    setIsEditing(false);
  };

  return (
    <ProfileLayout
      userData={userData}
      isOwner={isOwner}
      isEditing={isEditing}
      onEditToggle={() => setIsEditing((v) => !v)}
      onAvatarChange={handleAvatarChange}
    >
      {isOwner && isEditing ? (
        <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl font-black uppercase italic">
              Edit Profile
            </CardTitle>
            <CardDescription>
              Update your personal information and public profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileInfoForm
              initialData={{
                name: userData.name,
                username: userData.username,
                bio: userData.bio,
                website: userData.website,
                twitter: userData.twitter,
                github: userData.github,
                email: userData.email,
              }}
              isEditing={true}
              onSave={handleProfileSave}
            />
          </CardContent>
        </Card>
      ) : (
        <ProfileContentTabs />
      )}
    </ProfileLayout>
  );
}