'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, UploadCloud, Edit3, Type, CheckCircle2,
    AlertCircle, X, ChevronRight, Save, Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
    const [activeTab, setActiveTab] = useState<'document' | 'write'>('document');
    const [isHovering, setIsHovering] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [markdownContent, setMarkdownContent] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const router = useRouter();

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsHovering(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsHovering(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsHovering(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const draggedFile = e.dataTransfer.files.item(0);
            if (draggedFile) {
                handleFileSelection(draggedFile);
            }
        }
    };

    const handleFileSelection = (selectedFile: File) => {
        const validTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'text/markdown'
        ];

        if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.md')) {
            toast({
                title: "Invalid file type",
                description: "Please upload a PDF, DOCX, TXT, or MD file.",
                variant: "destructive"
            });
            return;
        }

        // Automatically set title from filename without extension
        if (!title) {
            const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
            setTitle(nameWithoutExt);
        }

        setFile(selectedFile);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            toast({ title: "Title required", description: "Please enter a title for your story.", variant: "destructive" });
            return;
        }

        if (activeTab === 'document' && !file) {
            toast({ title: "File required", description: "Please upload a document file.", variant: "destructive" });
            return;
        }

        if (activeTab === 'write' && !markdownContent.trim()) {
            toast({ title: "Content required", description: "Please write some content for your story.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) throw new Error("Authentication required");

            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);

            let endpoint = 'https://groqtales-backend-api.onrender.com/api/v1/stories';
            let requestOptions: RequestInit = {
                headers: { 'Authorization': `Bearer ${token}` }
            };

            if (activeTab === 'document' && file) {
                formData.append('file', file);
                requestOptions.method = 'POST';
                requestOptions.body = formData;
            } else {
                requestOptions.method = 'POST';
                requestOptions.headers = {
                    ...requestOptions.headers,
                    'Content-Type': 'application/json'
                };
                requestOptions.body = JSON.stringify({
                    title,
                    description,
                    content: markdownContent,
                    isMarkdown: true
                });
            }

            const response = await fetch(endpoint, requestOptions);
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Failed to publish story');

            toast({
                title: "Success! 🎉",
                description: "Your story has been created and sent for AI processing.",
            });

            // Redirect to the new story or dashboard
            router.push(`/stories/${data.data?._id || ''}`);

        } catch (err: any) {
            toast({
                title: "Upload Failed",
                description: err.message,
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30">
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen" />
                <div className="absolute top-[40%] right-[-10%] w-[40%] h-[60%] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-sm font-medium mb-6"
                    >
                        <Edit3 className="w-4 h-4" /> Start Creating
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
                    >
                        Bring Your World to Life
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-white/60"
                    >
                        Upload your existing manuscripts or craft them live using our markdown editor.
                    </motion.p>
                </div>

                {/* Main Interface Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                    {/* Left Column: Metadata & Controls */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-4 space-y-8"
                    >
                        {/* Input Method Tabs */}
                        <div className="p-1.5 bg-white/5 border border-white/10 rounded-2xl flex gap-1">
                            <button
                                onClick={() => setActiveTab('document')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === 'document'
                                    ? 'bg-white text-black shadow-lg shadow-white/5'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <FileText className="w-4 h-4" /> Document
                            </button>
                            <button
                                onClick={() => setActiveTab('write')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === 'write'
                                    ? 'bg-white text-black shadow-lg shadow-white/5'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Type className="w-4 h-4" /> Markdown
                            </button>
                        </div>

                        {/* Story Details Form Sidebar */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md">
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
                                <AlertCircle className="w-5 h-5 text-emerald-400" /> Details
                            </h2>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-white/80 font-medium">Story Title</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Enter a captivating title..."
                                        className="bg-black/50 border-white/10 focus-visible:ring-emerald-500 h-12 rounded-xl text-white placeholder:text-white/30"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-white/80 font-medium flex justify-between">
                                        Synopsis <span className="text-white/40 font-normal">Optional</span>
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Briefly describe your story..."
                                        className="bg-black/50 border-white/10 focus-visible:ring-emerald-500 min-h-[140px] rounded-xl text-white placeholder:text-white/30 resize-none"
                                    />
                                </div>
                            </div>

                            {/* Submit CTA */}
                            <div className="mt-8 pt-6 border-t border-white/10">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg rounded-xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)]"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">Processing <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /></span>
                                    ) : (
                                        <span className="flex items-center gap-2 text-primary-foreground">Publish Story <ChevronRight className="w-5 h-5" /></span>
                                    )}
                                </Button>
                                <p className="text-center text-xs text-white/40 mt-4 leading-relaxed">
                                    By publishing, you agree to our Terms of Service and moderation guidelines.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Input Area */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-8 min-h-[600px] h-full"
                    >
                        <AnimatePresence mode="wait">

                            {/* Document Upload Tab */}
                            {activeTab === 'document' && (
                                <motion.div
                                    key="upload"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="h-full"
                                >
                                    <div
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={() => !file && fileInputRef.current?.click()}
                                        className={`
                      relative flex flex-col items-center justify-center p-12 text-center 
                      h-full min-h-[500px] rounded-3xl border-2 border-dashed transition-all duration-300
                      ${file
                                                ? 'bg-emerald-500/5 border-emerald-500/30'
                                                : isHovering
                                                    ? 'bg-white/10 border-white text-white cursor-pointer scale-[1.02]'
                                                    : 'bg-white/5 border-white/20 hover:border-white/40 cursor-pointer'
                                            }
                    `}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept=".pdf,.doc,.docx,.txt,.md"
                                            onChange={(e) => {
                                                const file = e.target.files?.item(0);
                                                if (file) handleFileSelection(file);
                                            }}
                                        />

                                        {file ? (
                                            <div className="flex flex-col items-center space-y-6">
                                                <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                                                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-2xl font-bold text-white">{file.name}</p>
                                                    <p className="text-white/60">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                                    className="mt-6 border-white/20 text-white hover:bg-white/10"
                                                >
                                                    <X className="w-4 h-4 mr-2" /> Remove File
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center space-y-6">
                                                <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-colors duration-300 ${isHovering ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>
                                                    <UploadCloud className="w-10 h-10" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-2xl font-semibold">Drag and drop your manuscript</p>
                                                    <p className="text-white/50">Supports PDF, DOCX, TXT, and Markdown up to 50MB</p>
                                                </div>
                                                <Button variant="secondary" className="mt-8 px-8 h-12 rounded-xl pointer-events-none">
                                                    Browse Files
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Markdown Editor Tab */}
                            {activeTab === 'write' && (
                                <motion.div
                                    key="write"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="h-full rounded-3xl overflow-hidden border border-white/10 bg-black/60 backdrop-blur-md flex flex-col"
                                >
                                    <div className="h-16 px-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-400/20 border border-red-400/50" />
                                            <div className="w-3 h-3 rounded-full bg-amber-400/20 border border-amber-400/50" />
                                            <div className="w-3 h-3 rounded-full bg-emerald-400/20 border border-emerald-400/50" />
                                        </div>
                                        <div className="flex gap-4 text-white/40 text-sm font-medium">
                                            <span className="flex items-center gap-1.5"><Type className="w-4 h-4" /> Markdown</span>
                                        </div>
                                    </div>
                                    <Textarea
                                        value={markdownContent}
                                        onChange={(e) => setMarkdownContent(e.target.value)}
                                        placeholder="# Chapter 1: The Beginning&#10;&#10;Use markdown to structure your story..."
                                        className="flex-1 w-full bg-transparent border-0 rounded-none focus-visible:ring-0 p-8 md:p-12 text-lg text-white placeholder:text-white/20 resize-none font-serif leading-relaxed"
                                    />
                                    <div className="h-12 border-t border-white/10 bg-white/5 px-6 flex items-center justify-between text-xs text-white/40">
                                        <span>{markdownContent.length} characters</span>
                                        <span className="flex items-center gap-2"><Save className="w-3 h-3" /> Auto-saving</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}
