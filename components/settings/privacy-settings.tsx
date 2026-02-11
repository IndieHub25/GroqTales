"use client";

import {useEffect, useState} from "react";
import {toast} from "sonner";
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from "@/components/ui/card";
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type PrivacySettingsData = {
    profilePublic: boolean;
    allowComments: boolean;
    showActivity: boolean;
    showReadingHistory: boolean;
    dataCollection: boolean;
    personalization: boolean;
};
const DEFAULTS: PrivacySettingsData = {
    profilePublic: true,
    allowComments: true,
    showActivity: true,
    showReadingHistory: true,
    dataCollection: false,
    personalization: false,
};
export default function PrivacySettings(){
    const [settings, setSettings] = useState<PrivacySettingsData | null>(null);
    const [loading, setLoading] = useState(true);

    //Fetch current settings on load
    useEffect(() => {
        async function fetchPrivacy(){
            try{
                const res = await fetch("/api/v1/settings/privacy");
                if(!res.ok) throw new Error();
                const data = await res.json();
                setSettings(data);
            } catch(err){
                toast.error("Failed to load privacy settings");
            } finally {
                setLoading(false);
            }
        }
        fetchPrivacy();
    }, []);
    //Update handler
    const handleToggle = async(key: keyof PrivacySettingsData, value: boolean) => {
        if(!settings) return;
        const previousSettings: PrivacySettingsData = settings;
        const newSettings:PrivacySettingsData = {
            ...settings, 
            [key]: value
        };
        setSettings(newSettings);
        try{
            const res = await fetch("/api/v1/settings/privacy", {
                method: "PUT",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify(newSettings),
            });
            if(!res.ok) throw new Error();
            toast.success("Privacy preference updated");
        }catch(err){
            setSettings(previousSettings);
            toast.error("Failed to save setting");
        }
        };

        if (loading || !settings) return <div className="p-4 text-center">Loading settings...</div>;
    return (
        <Card>
            <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                    Manage how your profile and activity are seen by the GroqTales community.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Visibility
                    </h3>
                    <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label>Public Profile</Label>
                    <p className="text-xs text-muted-foreground">Allow anyone to see your stories and collections.</p>
                </div>
                <Switch
                    checked={settings.profilePublic}
                    onCheckedChange={(v)=>handleToggle("profilePublic",v)}/>
                </div>
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Show Activity</Label>
                        <p className="text-xs text-muted-foreground">Display your likes and follows on your profile. </p>
                    </div>
                <Switch
                    checked={settings.showActivity}
                    onCheckedChange={(v)=>handleToggle("showActivity",v)}/>
                </div>
                </div>
                <Separator />
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Interactions
                    </h3>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Allow Comments</Label>
                            <p className="text-xs text-muted-foreground">Let others leave comments on your stories.</p>
                        </div>
                        <Switch
                        checked={settings.allowComments}
                        onCheckedChange={(v)=>handleToggle("allowComments",v)}
                        />
                    </div>
                </div>
                <Separator/>
                <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Data & Analytics
                    </h3>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Usage Data</Label>
                            <p className="text-xs text-muted-foreground">Help us improve by sharing anonymous usage data.</p>
                        </div>
                        <Switch
                        checked={settings.dataCollection}
                        onCheckedChange={(v)=>handleToggle("dataCollection",v)}/>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}