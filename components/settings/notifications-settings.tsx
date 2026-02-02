"use client";

import {useEffect, useState} from "react";
import {Switch} from "@/components/ui/switch";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

type NotificationSettings ={
    email: {
        comments: boolean;
        followers: boolean;
        likes: boolean;
        nftPurchases: boolean;
    };
};
const DEFAULTS: NotificationSettings = {
    email: {
        comments: false,
        followers: false,
        likes: false,
        nftPurchases: false,
    },
};
export default function NotificationsSettings() {
    const [notifications, setNotifications] = useState<NotificationSettings>(DEFAULTS);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetch("/api/settings/notifications")
        .then((res)=>res.json())
        .then(setNotifications)
        .finally(()=>setLoading(false));         
    }, []);
    const toggle = async(
        key: keyof NotificationSettings["email"],
        value: boolean  
    ) => {
        const next = {
            ...notifications,
            email: {
                ...notifications.email,
                [key]: value,
            },
        };
        setNotifications(next);
        fetch("/api/settings/notifications", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(next),
        });
    };
    if(loading) return <p>Loading...</p>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {(Object.entries({
                    "comments":"Story Comments",
                    "followers":"New Followers",
                    "likes":"Story Likes",
                    "nftPurchases":"NFT Purchases",
                })as [keyof NotificationSettings["email"], string][]).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between">
                        <span>{label}</span>
                        <Switch
                            checked={notifications.email[key]}
                            onCheckedChange={(v) => toggle(key, v)}
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}