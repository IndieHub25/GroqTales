"use client";
import {toast} from "sonner";
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
        const load = async() => {
            try {
                const res = await fetch("/api/v1/settings/notifications");
                if(!res.ok) {
                    throw new Error("Failed to load notification settings");
                }
                const data = await res.json();
                setNotifications(data);
            } catch(err) {
                toast.error("Could not load notification settings");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);
    const toggle = async(
        key: keyof NotificationSettings["email"],
        value: boolean  
    ) => {
        const prev = notifications;

        const next : NotificationSettings = {
            ...notifications,
            email: {
                ...notifications.email,
                [key]: value,
            },
        };
        setNotifications(next);
        try {
            const res = await fetch("/api/v1/settings/notifications", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(next),
            });
            if(!res.ok) {
                throw new Error("Update failed");
            } 
        } catch(err) {
            setNotifications(prev);
            toast.error("Failed to update notification settings");
        }
    };
    return (
        <Card>
            <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {Object.keys(notifications.email).map((key) => (
                    <div key={key} className="flex items-center justify-between">
                        <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                        <Switch
                            checked={notifications.email[key as keyof NotificationSettings["email"]]}
                            onCheckedChange={(v) => toggle(key as keyof NotificationSettings["email"], v)}
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}