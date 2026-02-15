'use client';

import {
    User,
    Mail,
    Link as LinkIcon,
    Twitter,
    Github,
    Globe,
    Save,
} from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ProfileInfoFormProps {
    initialData: {
        displayName: string;
        username: string;
        bio: string;
        website: string;
        twitter: string;
        github: string;
        email: string;
    };
    onSave: (data: any) => void;
    isEditing: boolean;
}

export function ProfileInfoForm({
    initialData,
    onSave,
    isEditing,
}: ProfileInfoFormProps) {
    const [formData, setFormData] = React.useState(initialData);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isEditing) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Display Name
                        </h3>
                        <p className="text-lg font-bold">{formData.displayName}</p>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Username
                        </h3>
                        <p className="text-lg font-mono">@{formData.username}</p>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Bio
                        </h3>
                        <p className="text-base leading-relaxed">
                            {formData.bio || 'No bio provided.'}
                        </p>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                        Links
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formData.website && (
                            <a
                                href={formData.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-primary hover:underline"
                            >
                                <Globe className="w-4 h-4" />
                                <span>{formData.website}</span>
                            </a>
                        )}
                        {formData.twitter && (
                            <a
                                href={`https://twitter.com/${formData.twitter}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-blue-400 hover:underline"
                            >
                                <Twitter className="w-4 h-4" />
                                <span>@{formData.twitter}</span>
                            </a>
                        )}
                        {formData.github && (
                            <a
                                href={`https://github.com/${formData.github}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 hover:underline"
                            >
                                <Github className="w-4 h-4" />
                                <span>{formData.github}</span>
                            </a>
                        )}
                    </div>
                    {(!formData.website && !formData.twitter && !formData.github) && (
                        <p className="text-sm text-muted-foreground italic">No links added yet.</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="displayName"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleChange}
                            className="pl-9 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus-visible:border-primary focus-visible:ring-0"
                            placeholder="Your Name"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-3 text-muted-foreground font-bold">@</span>
                        <Input
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="pl-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus-visible:border-primary focus-visible:ring-0"
                            placeholder="username"
                        />
                    </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        className="min-h-[100px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus-visible:border-primary focus-visible:ring-0 resize-none"
                        placeholder="Tell us about yourself..."
                    />
                </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Social Links
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="website"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                className="pl-9 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700"
                                placeholder="https://yourwebsite.com"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="twitter">Twitter Handle</Label>
                        <div className="relative">
                            <Twitter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="twitter"
                                name="twitter"
                                value={formData.twitter}
                                onChange={handleChange}
                                className="pl-9 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700"
                                placeholder="username"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="github">GitHub Username</Label>
                        <div className="relative">
                            <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="github"
                                name="github"
                                value={formData.github}
                                onChange={handleChange}
                                className="pl-9 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700"
                                placeholder="username"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="opacity-50">Email (Read-only)</Label>
                        <div className="relative opacity-50 cursor-not-allowed">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                name="email"
                                value={formData.email}
                                readOnly
                                className="pl-9 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    type="submit"
                    className="bg-primary text-white font-bold border-2 border-black dark:border-transparent shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-none hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all gap-2"
                >
                    <Save className="w-4 h-4" />
                    Save Changes
                </Button>
            </div>
        </form>
    );
}
