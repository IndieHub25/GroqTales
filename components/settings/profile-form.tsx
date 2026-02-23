"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

type ProfileData = {
  username: string;
  displayName: string;
  bio: string;
  website: string;
  location: string;
  primaryGenre: string;
};

export function ProfileForm() {
  const supabase = createClient();
  const [sessionUser, setSessionUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSessionUser(data?.user));
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  
  const { register, handleSubmit, setValue, watch } = useForm<ProfileData>({
    defaultValues: {
      username: "",
      displayName: "",
      bio: "",
      website: "",
      location: "",
      primaryGenre: "other",
    },
  });

  const selectedGenre = watch("primaryGenre");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/settings/profile");
        if (!res.ok) throw new Error();

          const data = await res.json();
          setValue("username", data.username?? "");
          setValue("displayName", data.displayName?? "");
          setValue("bio", data.bio ?? "");
          setValue("website", data.website ?? "");
          setValue("location", data.location ?? "");
          setValue("primaryGenre", data.primaryGenre ?? "other");

          setAvatarUrl(data.avatarUrl?? null);
          setDisplayName(data.displayName?? null);
        
      } catch (error) {
        console.error("Failed to load profile", error);
        toast.error("Failed to load profile");
      }
    }
    if (sessionUser) {
      loadProfile();
    }
  }, [sessionUser, setValue]);

  const onSubmit = async (data: ProfileData) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your personal information and public profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div>
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarUrl || sessionUser?.user_metadata?.avatar_url || "/placeholder-avatar.jpg"} />
                <AvatarFallback>
                  {displayName?.slice(0, 2).toUpperCase() || 
                  sessionUser?.user_metadata?.name?.slice(0, 2).toUpperCase() || 

                "GT"}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" type="button" className="mt-2 w-full" disabled title="Coming soon">
                Change
              </Button>
            </div>

            <div className="space-y-4 flex-1 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input id="displayName" {...register("displayName")} placeholder="Your Name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" {...register("username")} placeholder="username" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  {...register("bio")}
                  placeholder="Tell us about yourself"
                  className="resize-none h-24"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" {...register("website")} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" {...register("location")} placeholder="City, Country" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Preferred Genre</Label>
            <Select 
              value={selectedGenre} 
              onValueChange={(val) => setValue("primaryGenre", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sci-fi">Science Fiction</SelectItem>
                <SelectItem value="fantasy">Fantasy</SelectItem>
                <SelectItem value="mystery">Mystery</SelectItem>
                <SelectItem value="romance">Romance</SelectItem>
                <SelectItem value="horror">Horror</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}