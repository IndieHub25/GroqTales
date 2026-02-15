'use client';

import { Upload } from 'lucide-react';
import React, { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface AvatarSelectorProps {
    currentAvatar: string;
    onAvatarChange: (newAvatar: string) => void;
    children?: React.ReactNode;
}

export function AvatarSelector({
    currentAvatar,
    onAvatarChange,
    children,
}: AvatarSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [previewAvatar, setPreviewAvatar] = useState(currentAvatar);

    const handleSave = () => {
        onAvatarChange(previewAvatar);
        setIsOpen(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-950 border-2 border-black dark:border-slate-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-none">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold uppercase italic">
                        Upload Avatar
                    </DialogTitle>
                    <DialogDescription>
                        Upload a new profile picture.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center py-4">
                    <Avatar className="w-32 h-32 border-4 border-black dark:border-slate-700 mb-6">
                        <AvatarImage src={previewAvatar} />
                        <AvatarFallback>PV</AvatarFallback>
                    </Avatar>

                    <div className="w-full flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 bg-slate-50 dark:bg-slate-900/50">
                        <Upload className="w-10 h-10 text-slate-400 mb-2" />
                        <Label
                            htmlFor="avatar-upload"
                            className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 cursor-pointer hover:text-primary transition-colors"
                        >
                            Click to upload image
                        </Label>
                        <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <p className="text-xs text-slate-400 text-center uppercase font-bold">
                            JPG, PNG or GIF (MAX. 2MB)
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        className="border-2 border-black dark:border-slate-700 font-bold"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="bg-primary text-white font-bold border-2 border-black dark:border-transparent shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-none hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all"
                    >
                        Save Avatar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
