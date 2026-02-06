"use client";
import {useState, useEffect} from "react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from "@/components/ui/card";


export default function WalletSettings(){
    const [wallet, setWallet] = useState<{address: string, network: string} | null>(null);
    const connectWallet = async () => {
        if(!window.ethereum) return toast.error("Please install MetaMask");
        try{
            const accounts = await window.ethereum.request({method: "eth_requestAccounts"});
            const chainId = await window.ethereum.request({method:"eth_chainId"});

            const walletData ={
                address: accounts[0],
                network: chainId === "0x1"?" Ethereum": "Unknown",
                provider: "MetaMask"
            };
            const res = await fetch("/api/v1/settings/wallet",{
                method: "PUT",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify(walletData),
            });
            if(res.ok) {
                setWallet(walletData);
                toast.success("Wallet connected and saved!");
            }
        } catch(err){
            toast.error("Connection failed");
        }
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle>Wallet Settings</CardTitle>
                <CardDescription>Connect your wallet to mint and manage NFTs.</CardDescription>
            </CardHeader>
            <CardContent>
                {wallet ? (
                    <div className="space-y-2">
                        <p className="text-sm font-mono bg-muted p-2 rounded">
                            {wallet.address}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Network: {wallet.network}
                        </p>
                    </div>
                ):(
                    <Button onClick={connectWallet}>Connect Wallet</Button>
                )}
            </CardContent>
        </Card>
    );
}