'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    BookOpen,
    CheckCircle2,
    XCircle,
    Clock,
    Eye,
    Shield,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface PendingStory {
    _id: string;
    title: string;
    content: string;
    genre: string;
    author?: { _id: string; username?: string; firstName?: string; lastName?: string };
    createdAt: string;
    moderationStatus: string;
}

export default function ModerationPage() {
    const [stories, setStories] = useState<PendingStory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://groqtales-backend-api.onrender.com';

    // Check admin auth
    const isAdmin =
        typeof window !== 'undefined'
            ? !!localStorage.getItem('adminSession')
            : false;

    useEffect(() => {
        if (!isAdmin) {
            setError('Admin access required');
            setLoading(false);
            return;
        }

        async function fetchPending() {
            try {
                const token = localStorage.getItem('accessToken') || '';
                const res = await fetch(
                    `${baseUrl}/api/v1/stories?status=pending&limit=50`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (!res.ok) throw new Error('Failed to fetch');
                const json = await res.json();
                setStories(json.data || []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchPending();
    }, [baseUrl, isAdmin]);

    const handleModerate = async (
        storyId: string,
        status: 'approved' | 'rejected',
        notes = ''
    ) => {
        setActionLoading(storyId);
        try {
            const token = localStorage.getItem('accessToken') || '';
            const res = await fetch(
                `${baseUrl}/api/v1/stories/${storyId}/moderate`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status, notes }),
                }
            );
            if (!res.ok) {
                const err = await res.json();
                alert(`Failed: ${err.error || 'Unknown error'}`);
            } else {
                setStories((prev) => prev.filter((s) => s._id !== storyId));
            }
        } catch {
            alert('Network error');
        } finally {
            setActionLoading(null);
        }
    };

    if (!isAdmin) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Shield className="w-16 h-16 text-red-400 mx-auto" />
                    <h2 className="text-2xl font-bold text-white">Admin Access Required</h2>
                    <p className="text-slate-400">
                        You need admin privileges to access this page.
                    </p>
                    <Button asChild>
                        <Link href="/">Back to Home</Link>
                    </Button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen py-12">
            <div className="container max-w-6xl mx-auto px-4">
                <div className="flex items-center gap-3 mb-8">
                    <Shield className="w-8 h-8 text-emerald-400" />
                    <div>
                        <h1 className="text-3xl font-bold text-white">Content Moderation</h1>
                        <p className="text-slate-400 text-sm">
                            Review and approve or reject pending story submissions
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-40 rounded-xl" />
                        ))}
                    </div>
                ) : error ? (
                    <Card className="border-red-500/20 bg-red-500/5">
                        <CardContent className="p-6 text-center text-red-400">
                            {error}
                        </CardContent>
                    </Card>
                ) : stories.length === 0 ? (
                    <Card className="border-slate-800 bg-slate-950/50">
                        <CardContent className="p-12 text-center">
                            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                            <p className="text-lg font-medium text-slate-100">All caught up!</p>
                            <p className="text-slate-400 text-sm mt-1">
                                No pending stories to review.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {stories.map((story) => (
                            <Card
                                key={story._id}
                                className="border-slate-800 bg-slate-950/50 hover:border-violet-500/30 transition-colors"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 text-violet-400 flex-shrink-0" />
                                                {story.title}
                                            </CardTitle>
                                            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-400">
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-slate-800 text-slate-300 border-0"
                                                >
                                                    {story.genre}
                                                </Badge>
                                                <span>
                                                    by{' '}
                                                    {story.author?.username ||
                                                        `${story.author?.firstName || ''} ${story.author?.lastName || ''}`.trim() ||
                                                        'Unknown'}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(story.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className="bg-amber-500/10 text-amber-400 border-amber-500/30 flex-shrink-0"
                                        >
                                            Pending
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-300 mb-4 line-clamp-3">
                                        {story.content}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            size="sm"
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                                            disabled={actionLoading === story._id}
                                            onClick={() => handleModerate(story._id, 'approved')}
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 gap-1"
                                            disabled={actionLoading === story._id}
                                            onClick={() =>
                                                handleModerate(
                                                    story._id,
                                                    'rejected',
                                                    'Content does not meet guidelines'
                                                )
                                            }
                                        >
                                            <XCircle className="w-3.5 h-3.5" />
                                            Reject
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-slate-400 hover:text-white gap-1 ml-auto"
                                            asChild
                                        >
                                            <Link href={`/stories/${story._id}`}>
                                                <Eye className="w-3.5 h-3.5" /> View Full
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
