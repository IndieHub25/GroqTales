"use client";

import { useEffect, useState } from "react";
import { useWeb3 } from "@/components/providers/web3-provider";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileStats } from "@/components/profile/profile-stats";
import { StoryCard } from "@/components/profile/story-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";


export default function ProfilePage() {
  const { account, connected, connecting } = useWeb3();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const params = useParams();

  const walletFromUrl = typeof params?.username === "string" ? params.username : "";
  const isOwner = connected && 
                  account?.toLowerCase() === walletFromUrl?.toLowerCase();

  useEffect(() => {
    const fetchProfile = async () => {
      if (walletFromUrl) {
        try {
          setLoading(true);
          const response = await fetch(`/api/v1/users/profile/${walletFromUrl}`);
          if (!response.ok) throw new Error("Failed to load");
          const data = await response.json();
          
          setProfileData(data);
          setError(false);
        } catch (err) {
          console.error(err);
          setError(true);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [walletFromUrl]);
  // Show Loading Skeleton while fetching
  if (connecting || (connected && loading)) {
    return <div className="container mx-auto p-20"><Skeleton className="h-40 w-full" /></div>;
  }
  if (!profileData || !profileData.user) {
  return <div className="p-20 text-white"> User not found.</div>;
}

  return (
    <main className="min-h-screen bg-black text-slate-200 pb-20">
      <ProfileHeader user={profileData?.user} isOwner={isOwner} />
      
      <div className="container mx-auto px-4">
        <ProfileStats stats={profileData?.stats} />
        
        <div className="mt-8">
          <Tabs defaultValue="stories" className="w-full">
            <div className="flex justify-center md:justify-start mb-6">
              <TabsList className="bg-slate-900 border border-slate-800">
                <TabsTrigger value="stories">Stories</TabsTrigger>
                <TabsTrigger value="collections">Collections</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="stories" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {/* Map through the REAL stories from your API */}
                {profileData?.stories?.map((story: any, idx: number) => (
                  <StoryCard key={story._id || idx} story={story} />
                ))}
              </div>
              
               {profileData?.stories?.length === 0 && (
                <div className="text-center py-20 text-slate-500">
                  <p className="text-lg">No stories told yet.</p>
                  <button className="mt-4 text-violet-400 hover:underline">Create your first story</button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="collections">
              <div className="p-10 text-center text-slate-500 bg-slate-900/30 rounded-lg border border-slate-800 border-dashed">
                Collections feature coming soon.
              </div>
            </TabsContent>
            
            <TabsContent value="activity">
              <div className="p-10 text-center text-slate-500 bg-slate-900/30 rounded-lg border border-slate-800 border-dashed">
                Activity feed coming soon.
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}