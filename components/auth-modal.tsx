'use client';

import { Wallet } from 'lucide-react';
import React from 'react';

import { useWeb3 } from '@/components/providers/web3-provider';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const { connectWallet, connecting } = useWeb3();

    const handleConnect = async () => {
        try {
            await connectWallet();
            onClose();
        } catch (error) {
            console.error('Failed to connect wallet:', error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5" />
                        Connect Wallet
                    </DialogTitle>
                    <DialogDescription>
                        Connect your wallet to create stories, mint NFTs, and save your progress.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Button
                        onClick={handleConnect}
                        disabled={connecting}
                        className="w-full flex items-center justify-center gap-2"
                        size="lg"
                    >
                        {connecting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                <span>Connecting...</span>
                            </>
                        ) : (
                            <>
                                <Wallet className="h-5 w-5" />
                                <span>Connect with MetaMask</span>
                            </>
                        )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                        By connecting, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
