import { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Share2, Heart, MessageSquare, ArrowLeft, Twitter } from 'lucide-react';

import { fetchStoryById } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

type Props = {
    params: { id: string };
};

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const story = fetchStoryById(params.id);

    if (!story) {
        return {
            title: 'Story Not Found | GroqTales',
        };
    }

    const description = story.excerpt || story.description || story.content?.substring(0, 150) || 'A beautiful story on GroqTales';
    const coverImage = story.coverImage || '/default-og.png'; // Should use absolute URL for real prod

    return {
        title: `${story.title} | GroqTales`,
        description,
        openGraph: {
            title: story.title,
            description,
            images: [coverImage],
            type: 'article',
            authors: [story.author],
        },
        twitter: {
            card: 'summary_large_image',
            title: story.title,
            description,
            images: [coverImage],
        },
    };
}

export default async function StoryPage({ params }: Props) {
    const story = fetchStoryById(params.id);

    if (!story) {
        notFound();
    }

    // Calculate formatted date if it exists
    const dateStr = story.createdAt instanceof Date
        ? story.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : story.createdAt
            ? new Date(story.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : null;

    return (
        <div className="min-h-screen bg-background">
            {/* Top Header / Navigation */}
            <div className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                    <Button variant="ghost" size="sm" asChild className="-ml-2">
                        <Link href="/?tab=community">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Stories
                        </Link>
                    </Button>
                    <div className="flex-1" />
                    <Button variant="outline" size="sm" asChild>
                        <Link
                            href={`https://twitter.com/intent/tweet?text=Reading "${story.title}" on GroqTales&url=${encodeURIComponent(`https://groqtales.com/story/${story.id}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Twitter className="mr-2 h-4 w-4 text-[#1DA1F2]" />
                            Share
                        </Link>
                    </Button>
                </div>
            </div>

            <main className="container max-w-4xl py-6 lg:py-10">
                <article className="prose dark:prose-invert max-w-none">
                    {story.genre && (
                        <div className="mb-4">
                            <Badge variant="secondary" className="capitalize text-sm px-3 py-1">
                                {story.genre}
                            </Badge>
                        </div>
                    )}

                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        {story.title}
                    </h1>

                    <div className="flex items-center space-x-4 mb-8">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={story.authorAvatar} alt={story.author} />
                            <AvatarFallback>{story.author?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{story.author}</p>
                            <p className="text-sm text-muted-foreground">
                                {story.authorUsername || '@' + story.author?.toLowerCase().replace(/\s+/g, '')}
                                {dateStr && ` • ${dateStr}`}
                            </p>
                        </div>
                    </div>

                    {story.coverImage && (
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-10 shadow-lg border">
                            <Image
                                src={story.coverImage}
                                alt={story.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}

                    <div className="text-lg leading-relaxed space-y-6">
                        {/* Split content by newlines and render paragraphs, fallback to description */}
                        {(story.content || story.description || '')
                            .split('\n')
                            .filter((p: string) => p.trim() !== '')
                            .map((paragraph: string, i: number) => (
                                <p key={i}>{paragraph}</p>
                            ))}
                    </div>
                </article>

                <hr className="my-10" />

                <div className="flex justify-between items-center px-4 py-6 bg-muted/30 rounded-lg border">
                    <div className="flex space-x-6 text-muted-foreground">
                        <div className="flex items-center space-x-2">
                            <Heart className="h-5 w-5 hover:text-red-500 cursor-pointer transition-colors" />
                            <span className="font-medium">{story.likes || 12}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <MessageSquare className="h-5 w-5 hover:text-blue-500 cursor-pointer transition-colors" />
                            <span className="font-medium">{story.comments || 4}</span>
                        </div>
                    </div>

                    <Button className="font-semibold shadow-sm" asChild>
                        <Link
                            href={`https://twitter.com/intent/tweet?text=I just read "${story.title}" by ${story.author} on GroqTales! Check it out: &url=${encodeURIComponent(`https://groqtales.com/story/${story.id}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Share2 className="mr-2 h-4 w-4" />
                            Share this story
                        </Link>
                    </Button>
                </div>
            </main>
        </div>
    );
}
