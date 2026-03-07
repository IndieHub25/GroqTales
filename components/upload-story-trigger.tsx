'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '@/components/providers/web3-provider';
import { createClient } from '@/lib/supabase/client';

interface UploadStoryTriggerProps {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
    className?: string;
    buttonText?: string;
    icon?: boolean;
}

export function UploadStoryTrigger({
    variant = 'primary',
    className = '',
    buttonText = 'Upload Story',
    icon = true
}: UploadStoryTriggerProps) {
    const router = useRouter();
    const { account } = useWeb3();
    const [session, setSession] = React.useState<any>(null);
    const supabase = React.useMemo(() => createClient(), []);

    React.useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    const handleUploadClick = (e: React.MouseEvent) => {
        e.preventDefault();
        // Strict check: An authenticated Supabase session is required to upload
        if (!session) {
            router.push('/sign-in');
        } else {
            router.push('/upload');
        }
    };

    // Return specific styled buttons based on variant
    const getButtonPreset = () => {
        switch (variant) {
            case 'primary':
                return `comic-button ${className}`;
            case 'secondary':
                return `comic-button-secondary bg-[var(--comic-purple)] text-white ${className}`;
            case 'outline':
                return `border-4 border-foreground bg-transparent font-bold uppercase hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] transition-all ${className}`;
            case 'ghost':
            case 'link':
                return `hover:underline font-bold text-foreground cursor-pointer ${className}`;
            default:
                return `comic-button ${className}`;
        }
    };

    return (
        <Button
            variant={variant === 'primary' || variant === 'secondary' ? 'default' : variant}
            className={getButtonPreset()}
            onClick={handleUploadClick}
        >
            {icon && <Upload className="w-5 h-5 mr-2" />}
            {buttonText}
        </Button>
    );
}
