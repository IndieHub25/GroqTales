"use client";
import {toast} from "sonner";
import {useEffect, useState} from "react";
import {Switch} from "@/components/ui/switch";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton } from "@/components/ui/skeleton";

type NotificationSettings ={
    email: {
        comments: boolean;
        followers: boolean;
        likes: boolean;
        nftSales: boolean;
    };
};
const DEFAULTS: NotificationSettings = {
    email: {
        comments: false,
        followers: false,
        likes: false,
        nftSales: false,
    },
};
export default function NotificationsSettings() {
    const [notifications, setNotifications] = useState<NotificationSettings| null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const load = async() => {
            try {
                const res = await fetch("/api/v1/settings/notifications");
                if(!res.ok) {
                    throw new Error();
                }
                const data = await res.json();
                if(!data || typeof data !=="object"){
                    throw new Error("Invalid response");
                }
                setNotifications(data);
            } catch {
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
        if (!notifications) return;
        const prev= notifications;

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
                body: JSON.stringify({
                    email:{
                        [key]: value,
                    },
                }),
            });
            if(!res.ok) {
                throw new Error();
            } 
            const updated = await res.json();
            if(!updated || !updated.email || typeof updated.email[key]!=="boolean")
            {
                throw new Error("Invalid response");
            }
            setNotifications(updated);
        } catch{
            setNotifications(prev);
            toast.error("Failed to update notification settings");
        }
    };
    if(loading || !notifications){
        return <Skeleton />;
    }
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