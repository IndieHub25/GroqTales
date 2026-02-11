"use client";
import {useState, useEffect} from "react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from "@/components/ui/card";


export default function WalletSettings(){
    const [wallet, setWallet] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(()=>{
        async function loadWallet() {
            try{
                const res = await fetch("/api/v1/settings/wallet");
                if (!res.ok) throw new Error();
                const data = await res.json();
                setWallet(data);
            } catch{
                toast.error("Failed to load wallet");
            } finally {
                setLoading(false);
            }
        }
        loadWallet();
    }, []);
    const connectWallet = async () => {
        if(!window.ethereum){
            toast.error("Please install MetaMask");
            return;
        }
        try{
            const [address] = await window.ethereum.request({method: "eth_requestAccounts"});
            const chainId = await window.ethereum.request({method:"eth_chainId"});

            // const walletData ={
            //     address: accounts[0],
            //     network: chainId === "0x1"?" Ethereum": "Unknown",
            //     provider: "MetaMask"
            // };
            const res = await fetch("/api/v1/settings/wallet",{
                method: "PUT",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({address, chainId}),
            });
            if(!res.ok) throw new Error();

            const updated = await res.json();
            setWallet(updated);
            
            toast.success("Wallet connected");
            
        } catch(err){
            toast.error("Wallet Connection failed");
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