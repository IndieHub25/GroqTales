'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
    Bell,
    BellOff,
    CheckCheck,
    BookOpen,
    Heart,
    UserPlus,
    AlertCircle,
    ArrowLeft,
    RefreshCw,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    type Notification,
} from '@/lib/feeds-client';

const POLL_INTERVAL_MS = 15_000; // 15 seconds

const NOTIF_ICONS: Record<string, typeof Bell> = {
    story_approved: BookOpen,
    story_rejected: AlertCircle,
    new_follower: UserPlus,
    new_like: Heart,
    system: Bell,
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return days < 30 ? `${days}d ago` : new Date(dateStr).toLocaleDateString();
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const loadNotifications = useCallback(async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        try {
            const data = await fetchNotifications(false, 50);
            setNotifications(data);
        } catch {
            // Silently fail — keep existing data
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Initial load + polling
    useEffect(() => {
        loadNotifications();

        intervalRef.current = setInterval(() => {
            loadNotifications();
        }, POLL_INTERVAL_MS);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [loadNotifications]);

    const handleMarkRead = async (id: string) => {
        const ok = await markNotificationRead(id);
        if (ok) {
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: 1 } : n)),
            );
        }
    };

    const handleMarkAllRead = async () => {
        const ok = await markAllNotificationsRead();
        if (ok) {
            setNotifications((prev) => prev.map((n) => ({ ...n, read: 1 })));
        }
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <main className="min-h-screen py-12">
            <div className="container max-w-3xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/profile/me">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                                Notifications
                                {unreadCount > 0 && (
                                    <Badge className="bg-violet-500 text-white text-xs">
                                        {unreadCount}
                                    </Badge>
                                )}
                            </h1>
                            <p className="text-slate-400 text-sm">
                                Stay updated on your stories and community
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-white"
                            onClick={() => loadNotifications(true)}
                            disabled={refreshing}
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        </Button>
                        {unreadCount > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 border-slate-700 text-slate-300"
                                onClick={handleMarkAllRead}
                            >
                                <CheckCheck className="w-4 h-4" /> Mark All Read
                            </Button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-20 rounded-xl" />
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <Card className="border-slate-800 bg-slate-950/50">
                        <CardContent className="p-12 text-center">
                            <BellOff className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <p className="text-lg font-medium text-slate-300">
                                No notifications yet
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                                When something happens, you&#39;ll see it here.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {notifications.map((notif) => {
                            const Icon = NOTIF_ICONS[notif.type] || Bell;
                            const isRead = !!notif.read;

                            return (
                                <Card
                                    key={notif.id}
                                    className={`border-slate-800 transition-colors cursor-pointer ${isRead
                                        ? 'bg-slate-950/30 hover:bg-slate-950/50'
                                        : 'bg-slate-950/80 border-l-2 border-l-violet-500 hover:bg-slate-900/80'
                                        }`}
                                    onClick={() => !isRead && handleMarkRead(notif.id)}
                                >
                                    <CardContent className="p-4 flex items-start gap-4">
                                        <div
                                            className={`p-2.5 rounded-xl flex-shrink-0 ${isRead ? 'bg-slate-800/50' : 'bg-violet-500/10'
                                                }`}
                                        >
                                            <Icon
                                                className={`w-4 h-4 ${isRead ? 'text-slate-500' : 'text-violet-400'
                                                    }`}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className={`text-sm ${isRead
                                                    ? 'text-slate-400 font-normal'
                                                    : 'text-slate-200 font-medium'
                                                    }`}
                                            >
                                                {notif.title}
                                            </p>
                                            {notif.body && (
                                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                                    {notif.body}
                                                </p>
                                            )}
                                            <p className="text-[10px] text-slate-600 mt-1">
                                                {timeAgo(notif.created_at)}
                                            </p>
                                        </div>
                                        {!isRead && (
                                            <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0 mt-2" />
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
