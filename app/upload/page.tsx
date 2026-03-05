'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, UploadCloud, Edit3, Type, CheckCircle2,
    AlertCircle, X, ChevronRight, Save, Image as ImageIcon, Book, Hexagon, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function UploadPage() {
    const [activeTab, setActiveTab] = useState<'document' | 'write'>('document');
    const [isHovering, setIsHovering] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [textPreview, setTextPreview] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [markdownContent, setMarkdownContent] = useState('');
    const [genre, setGenre] = useState('other');
    const [formatType, setFormatType] = useState<'storybook' | 'comic_book'>('storybook');
    
    // Cover Image & Extra Metadata
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const [characterSetting, setCharacterSetting] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const router = useRouter();
    const supabase = React.useMemo(() => createClient(), []);

    React.useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast({
                    title: 'Access Denied',
                    description: 'Please log in to upload stories.',
                    variant: 'destructive',
                });
                router.push('/sign-in');
            }
        };
        checkAuth();
    }, [supabase.auth, router, toast]);

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
            const file = e.dataTransfer.files[0];
            if (file) handleFileSelection(file);
        }
    };

    const handleFileSelection = (selectedFile: File) => {
        const validTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
            'text/plain',
            'text/markdown'
        ];

        const extension = selectedFile.name.split('.').pop()?.toLowerCase();
        const validExtensions = ['pdf', 'docx', 'txt', 'md'];

        if (!validTypes.includes(selectedFile.type) && !validExtensions.includes(extension || '')) {
            toast({
                title: "Invalid file type",
                description: "Please upload a PDF, DOCX, TXT, or MD file.",
                variant: "destructive"
            });
            return;
        }

        if (selectedFile.size > 50 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "The maximum file size is 50MB.",
                variant: "destructive"
            });
            return;
        }

        // Preview rendering based on file type
        if (selectedFile.type === 'application/pdf' || extension === 'pdf') {
            setFilePreview(URL.createObjectURL(selectedFile));
            setTextPreview(null);
        } else if (['text/plain', 'text/markdown'].includes(selectedFile.type) || ['txt', 'md'].includes(extension || '')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setTextPreview(e.target?.result as string);
                setFilePreview(null);
            };
            reader.readAsText(selectedFile);
        } else {
            // DOCX or others not easily previewable in browser
            setFilePreview(null);
            setTextPreview("Preview not available for this format. Ready for backend processing!");
        }

        if (!title) {
            const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
            setTitle(nameWithoutExt);
        }
        setFile(selectedFile);
    };

    const clearFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFile(null);
        setFilePreview(null);
        setTextPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
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

        if (!coverImage) {
            toast({ title: "Cover Image required", description: "Please upload a cover image for your story.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("Authentication required");

            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('genre', genre);
            formData.append('formatType', formatType === 'comic_book' ? 'Comic Book' : 'Storybook');
            formData.append('coverImage', coverImage);
            if (formatType === 'storybook') {
                formData.append('characterSetting', characterSetting);
                formData.append('tags', JSON.stringify(tags));
            }

            let endpoint = '';
            let requestOptions: RequestInit = {
                headers: { 'Authorization': `Bearer ${token}` }
            };

            if (activeTab === 'document' && file) {
                endpoint = `${process.env.NEXT_PUBLIC_API_URL || 'https://groqtales-backend-api.onrender.com'}/api/v1/stories/upload-file`;
                formData.append('file', file);
                requestOptions.method = 'POST';
                requestOptions.body = formData;
            } else {
                endpoint = `${process.env.NEXT_PUBLIC_API_URL || 'https://groqtales-backend-api.onrender.com'}/api/v1/stories/upload`;
                // Because we have a file (coverImage), we MUST use FormData even for the live writer, removing application/json.
                formData.append('content', markdownContent);
                formData.append('source', 'uploaded');
                
                requestOptions.method = 'POST';
                requestOptions.body = formData;
            }

            const response = await fetch(endpoint, requestOptions);
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Failed to publish story');

            toast({
                title: "Success! 🎉",
                description: "Your file is verified, uploaded, and the AI generated an interactive synopsis!",
            });
            router.push('/gallery');

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
        <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 font-sans">
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[60%] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-sm font-medium mb-6">
                        <Hexagon className="w-4 h-4" /> Interactive Upload
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Bring Your Universe Online
                    </motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-white/60">
                        Upload large manuscripts up to 50MB. Our neural engine will automatically craft a synopsis for the Gallery.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                    {/* Left Column: Metadata & Controls */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-4 space-y-8">
                        {/* Input Method Tabs */}
                        <div className="p-1.5 bg-white/5 border border-white/10 rounded-2xl flex gap-1">
                            <button
                                onClick={() => setActiveTab('document')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === 'document' ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                            >
                                <FileText className="w-4 h-4" /> Documents
                            </button>
                            <button
                                onClick={() => setActiveTab('write')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === 'write' ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                            >
                                <Type className="w-4 h-4" /> Live Writer
                            </button>
                        </div>

                        {/* Story Details Form Sidebar */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md relative overflow-hidden group">
                           <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white relative z-10">
                                <AlertCircle className="w-5 h-5 text-emerald-400" /> Metacore Settings
                            </h2>

                            <div className="space-y-6 relative z-10">
                                <div className="space-y-2">
                                    <Label className="text-white/80 font-medium">Format Strategy</Label>
                                    <div className="flex bg-black/40 border border-white/10 p-1.5 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setFormatType('storybook')}
                                            className={`flex-1 flex justify-center items-center gap-2 py-2 rounded-lg text-sm transition-colors ${formatType === 'storybook' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-white/50 hover:text-white/80'}`}
                                        >
                                            <Book className="w-4 h-4" /> Storybook
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormatType('comic_book')}
                                            className={`flex-1 flex justify-center items-center gap-2 py-2 rounded-lg text-sm transition-colors ${formatType === 'comic_book' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-white/50 hover:text-white/80'}`}
                                        >
                                            <Layers className="w-4 h-4" /> Comic Book
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-white/80 font-medium">Creation Title</Label>
                                    <Input
                                        id="title" value={title} onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Name your universe..."
                                        className="bg-black/50 border-white/10 focus-visible:ring-emerald-500 h-12 rounded-xl text-white placeholder:text-white/30 transition-all hover:bg-black/70"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="genre" className="text-white/80 font-medium">Core Genre</Label>
                                    <select
                                        id="genre" value={genre} onChange={(e) => setGenre(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 focus-visible:ring-emerald-500 h-12 rounded-xl text-white px-3 transition-all hover:bg-black/70"
                                    >
                                        <option value="sci-fi">Sci-Fi</option>
                                        <option value="fantasy">Fantasy</option>
                                        <option value="mystery">Mystery</option>
                                        <option value="adventure">Adventure</option>
                                        <option value="romance">Romance</option>
                                        <option value="horror">Horror</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white/80 font-medium flex justify-between">
                                        Cover Image <span className="text-emerald-400 font-normal">Required</span>
                                    </Label>
                                    <div
                                      onClick={() => coverInputRef.current?.click()}
                                      className="w-full h-32 bg-black/50 border border-white/10 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-black/70 hover:border-emerald-500/50 transition-all group overflow-hidden relative"
                                    >
                                        <input
                                            type="file" ref={coverInputRef} className="hidden" accept="image/jpeg,image/png,image/webp"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setCoverImage(file);
                                                    setCoverImagePreview(URL.createObjectURL(file));
                                                }
                                            }}
                                        />
                                        {coverImagePreview ? (
                                            <div className="absolute inset-0">
                                              <img src={coverImagePreview} alt="Cover Preview" className="w-full h-full object-cover" />
                                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                  <span className="text-white font-medium flex items-center gap-2"><Edit3 className="w-4 h-4" /> Change Image</span>
                                              </div>
                                            </div>
                                        ) : (
                                            <>
                                                <ImageIcon className="w-8 h-8 text-white/40 mb-2 group-hover:text-emerald-400 transition-colors" />
                                                <span className="text-sm text-white/50 group-hover:text-white/80 transition-colors">Click to upload 16:9 ratio image</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-white/80 font-medium flex justify-between">
                                        Manual Synopsis <span className="text-white/40 font-normal">Optional</span>
                                    </Label>
                                    <Textarea
                                        id="description" value={description} onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Leave empty and the AI will scan your file to build a dynamic synopsis..."
                                        className="bg-black/50 border-white/10 focus-visible:ring-emerald-500 min-h-[100px] rounded-xl text-white placeholder:text-white/30 resize-none transition-all hover:bg-black/70"
                                    />
                                </div>

                                {formatType === 'storybook' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="characterSetting" className="text-white/80 font-medium">Core Character Focus</Label>
                                            <Input
                                                id="characterSetting" value={characterSetting} onChange={(e) => setCharacterSetting(e.target.value)}
                                                placeholder="e.g., A rogue AI and a weary detective"
                                                className="bg-black/50 border-white/10 focus-visible:ring-emerald-500 h-10 rounded-xl text-white placeholder:text-white/30 transition-all hover:bg-black/70"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-white/80 font-medium">Story Tags</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={tagInput}
                                                    onChange={(e) => setTagInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && tagInput.trim()) {
                                                            e.preventDefault();
                                                            if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
                                                            setTagInput('');
                                                        }
                                                    }}
                                                    placeholder="Press Enter to add tag..."
                                                    className="bg-black/50 border-white/10 focus-visible:ring-emerald-500 h-10 rounded-xl text-white placeholder:text-white/30 transition-all hover:bg-black/70 flex-1"
                                                />
                                                <Button
                                                  onClick={(e) => {
                                                      e.preventDefault();
                                                      if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                                                          setTags([...tags, tagInput.trim()]);
                                                          setTagInput('');
                                                      }
                                                  }}
                                                  className="bg-white/10 hover:bg-white/20 text-white rounded-xl h-10 px-4 transition-all border border-white/5"
                                                >
                                                    Add
                                                </Button>
                                            </div>
                                            {tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {tags.map(tag => (
                                                        <span key={tag} className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-medium">
                                                            {tag}
                                                            <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-white transition-colors">
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
                                <Button
                                    onClick={handleSubmit} disabled={isSubmitting}
                                    className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg rounded-xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] group overflow-hidden relative"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2 z-10 relative">Initializing Sync <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /></span>
                                    ) : (
                                        <span className="flex items-center gap-2 z-10 relative text-primary-foreground group-hover:gap-3 transition-all">Engage Deployment <ChevronRight className="w-5 h-5" /></span>
                                    )}
                                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12 z-0" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Input Area */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-8 h-[750px] flex flex-col">
                        <AnimatePresence mode="wait">
                            {activeTab === 'document' && (
                                <motion.div key="upload" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="h-full">
                                    <div
                                        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                                        onClick={() => !file && !filePreview && fileInputRef.current?.click()}
                                        className={`
                      relative flex flex-col items-center justify-center p-8 text-center 
                      h-full rounded-3xl border border-white/10 transition-all duration-500 overflow-hidden
                      ${file
                                                ? 'bg-black/40 backdrop-blur-md'
                                                : isHovering
                                                    ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.1)] cursor-pointer scale-[1.01]'
                                                    : 'bg-white/5 hover:border-white/30 cursor-pointer' }
                    `}
                                    >
                                        <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx,.txt,.md" onChange={(e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                const file = e.target.files[0];
                                                if (file) handleFileSelection(file);
                                            }
                                        }} />
                                        
                                        {file ? (
                                            <div className="w-full h-full flex flex-col">
                                                 <div className="flex justify-between items-center mb-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                                                     <div className="flex items-center gap-3 text-left">
                                                         <div className="p-3 bg-emerald-500/20 rounded-xl">
                                                             <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                                         </div>
                                                         <div>
                                                             <p className="font-bold text-white text-lg truncate max-w-sm">{file.name}</p>
                                                             <p className="text-white/50 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready for parsing</p>
                                                         </div>
                                                     </div>
                                                     <Button variant="ghost" onClick={clearFile} className="hover:bg-rose-500/20 hover:text-rose-400 text-white/50 transition-colors">
                                                         <X className="w-5 h-5 mr-1" /> Clear
                                                     </Button>
                                                 </div>
                                                 
                                                 <div className="flex-1 w-full bg-black/80 rounded-2xl border border-white/10 overflow-hidden relative group">
                                                    {filePreview ? (
                                                        <object data={filePreview} type="application/pdf" className="w-full h-full rounded-2xl" aria-label="PDF Preview">
                                                            <div className="flex items-center justify-center h-full text-white/50">Browser cannot render PDF directly.</div>
                                                        </object>
                                                    ) : textPreview ? (
                                                        <div className="w-full h-full p-8 text-left text-white/80 font-mono text-sm whitespace-pre-wrap overflow-y-auto custom-scrollbar">
                                                            {textPreview}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full text-white/40 flex-col gap-2">
                                                            <Layers className="w-12 h-12 opacity-50" />
                                                            <p>Binary format attached. Synoptic AI agent will scan upon deployment.</p>
                                                        </div>
                                                    )}
                                                 </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center space-y-6">
                                                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className={`w-32 h-32 rounded-3xl flex items-center justify-center transition-colors duration-500 ${isHovering ? 'bg-emerald-500 text-black shadow-[0_0_40px_rgba(16,185,129,0.4)]' : 'bg-white/5 border border-white/10 text-emerald-400'}`}>
                                                    <UploadCloud className="w-12 h-12" />
                                                </motion.div>
                                                <div className="space-y-3">
                                                    <h3 className="text-3xl font-bold tracking-tight">Drop your visual or textual masterpiece</h3>
                                                    <p className="text-white/50 max-w-md mx-auto leading-relaxed">System supports standard formats including PDF, DOCX, TXT, and Markdown up to 50MB per file boundary.</p>
                                                </div>
                                                <Button variant="secondary" className="mt-8 px-8 h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 pointer-events-none">
                                                    Browse Local Assets
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'write' && (
                                <motion.div key="write" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="h-full rounded-3xl overflow-hidden border border-white/10 bg-black/60 backdrop-blur-md flex flex-col">
                                    <div className="h-16 px-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-rose-400/30 border border-rose-400/50" />
                                            <div className="w-3 h-3 rounded-full bg-amber-400/30 border border-amber-400/50" />
                                            <div className="w-3 h-3 rounded-full bg-emerald-400/30 border border-emerald-400/50" />
                                        </div>
                                        <div className="flex gap-4 text-emerald-400 text-sm font-semibold">
                                            <span className="flex items-center gap-1.5"><Type className="w-4 h-4" /> Integrated IDE</span>
                                        </div>
                                    </div>
                                    <Textarea
                                        value={markdownContent} onChange={(e) => setMarkdownContent(e.target.value)}
                                        placeholder="# Chapter 1: The Singularity&#10;&#10;Inject your markdown structures directly into the mainframe..."
                                        className="flex-1 w-full bg-transparent border-0 rounded-none focus-visible:ring-0 p-8 md:p-12 text-lg text-white placeholder:text-white/20 resize-none font-mono leading-relaxed"
                                    />
                                    <div className="h-12 border-t border-white/10 bg-black/40 px-6 flex items-center justify-between text-xs text-white/40">
                                        <span className="font-mono bg-white/5 px-2 py-1 rounded-md">{markdownContent.length} bytes processed</span>
                                        <span className="flex items-center gap-2 text-emerald-500/70"><Save className="w-3 h-3 animate-pulse" /> Daemon syncing</span>
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
