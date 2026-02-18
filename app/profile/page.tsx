'use client';
import React, { useState } from 'react';

import {
  ProfileContentTabs,
  ProfileLayout,
} from '@/components/profile/profile-layout';
import { ProfileInfoForm } from '@/components/profile/profile-info-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EditableProfileFields, UserProfileUI } from '@/types/profile';

const initialUserData: UserProfileUI = {
  name: 'Alex Thompson',
  username: 'alexstoryteller',
  avatar: '/avatars/alex.jpg',
  bio: 'Web3 storyteller exploring the intersection of AI and blockchain. Creating unique narrative experiences one story at a time.',
  website: 'https://groqtales.io',
  twitter: 'alex_web3',
  github: 'alex-dev',
  email: 'alex@example.com',
  joinDate: 'March 2024',
  isVerified: true,
  storiesCount: 0,
  followers: 1240,
  following: 384,
  walletAddress: '0x1234...5678',
  badges: ['Top Creator', 'Early Adopter', 'Story Master'],
  totalViews: 25600,
  totalLikes: 3200,
};

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserProfileUI>(initialUserData);
  const [isEditing, setIsEditing] = useState(false);

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
      isOwner={true}
      isEditing={isEditing}
      onEditToggle={() => setIsEditing((v) => !v)}
      onAvatarChange={handleAvatarChange}
    >
      {isEditing ? (
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