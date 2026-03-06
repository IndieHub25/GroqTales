'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Github,
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Linkedin,
  Send,
  Hexagon,
  ArrowRight,
  Globe2
} from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  subject: z.string().min(5, { message: 'Subject must be at least 5 characters.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

const ContactInfo = ({ icon: Icon, title, content, link }: any) => (
  <motion.div whileHover={{ scale: 1.02 }} className="flex items-start space-x-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 hover:bg-white/10 transition-all group">
    <div className="p-3 bg-black/40 rounded-xl border border-white/5 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 transition-colors">
      <Icon className="w-6 h-6 text-white/70 group-hover:text-emerald-400" />
    </div>
    <div>
      <h3 className="font-semibold text-white/50 text-sm tracking-wider uppercase mb-1">{title}</h3>
      {link ? (
        <Link href={link} className="text-base font-medium text-white hover:text-emerald-300 transition-colors">
          {content}
        </Link>
      ) : (
        <p className="text-base font-medium text-white">{content}</p>
      )}
    </div>
  </motion.div>
);

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', subject: '', message: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    form.reset();
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-emerald-500/10 blur-[150px] rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-blue-500/10 blur-[150px] rounded-full -translate-x-1/3 translate-y-1/3" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      <div className="container mx-auto px-6 py-24 relative z-10 max-w-7xl">
        
        {/* Header Section */}
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="text-center mb-20 max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold tracking-wider text-emerald-400 mb-6">
            <Globe2 className="w-4 h-4" /> GLOBAL TRANSMISSION
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 relative">
            Establish <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Contact</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-xl text-white/50 leading-relaxed font-light">
            Whether you have a question about the protocol, need technical engineering support, or want to forge a creative partnership.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          
          {/* Left Column: Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-7">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="text-center py-16 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 mb-8 relative">
                      <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-[ping_2s_ease-out_infinite]" />
                      <Send className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-3xl font-bold mb-4 tracking-tight">Transmission Received</h3>
                    <p className="text-white/60 mb-10 max-w-md mx-auto text-lg">
                      Your message has been securely anchored into our network. Our specialists will respond shortly.
                    </p>
                    <Button onClick={() => setIsSubmitted(false)} className="bg-white hover:bg-white/90 text-black rounded-full px-8 h-12 font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                      Initialize New Query
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="mb-8">
                       <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2"><Hexagon className="w-5 h-5 text-emerald-400" /> Secure Terminal</h2>
                       <p className="text-white/40 text-sm">All entries are encrypted and transmitted directly to the GroqTales support mainframe.</p>
                    </div>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white/70 font-medium">Designation</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} className="bg-black/50 border-white/10 focus-visible:ring-emerald-500 h-14 rounded-xl text-white placeholder:text-white/20 transition-all hover:bg-black/70" />
                              </FormControl>
                              <FormMessage className="text-rose-400" />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white/70 font-medium">Network Address (Email)</FormLabel>
                              <FormControl>
                                <Input placeholder="john@domain.com" {...field} className="bg-black/50 border-white/10 focus-visible:ring-emerald-500 h-14 rounded-xl text-white placeholder:text-white/20 transition-all hover:bg-black/70" />
                              </FormControl>
                              <FormMessage className="text-rose-400" />
                            </FormItem>
                          )} />
                        </div>
                        <FormField control={form.control} name="subject" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/70 font-medium">Query Vector (Subject)</FormLabel>
                            <FormControl>
                              <Input placeholder="What do you need assistance with?" {...field} className="bg-black/50 border-white/10 focus-visible:ring-emerald-500 h-14 rounded-xl text-white placeholder:text-white/20 transition-all hover:bg-black/70" />
                            </FormControl>
                            <FormMessage className="text-rose-400" />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="message" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/70 font-medium">Data Payload (Message)</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Transmit your message here..." className="bg-black/50 border-white/10 focus-visible:ring-emerald-500 min-h-[160px] rounded-xl text-white placeholder:text-white/20 resize-none transition-all hover:bg-black/70 p-4" {...field} />
                            </FormControl>
                            <FormMessage className="text-rose-400" />
                          </FormItem>
                        )} />
                        <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg rounded-xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] group overflow-hidden relative mt-8">
                          {isSubmitting ? (
                            <span className="flex items-center gap-2 z-10 relative">Transmitting <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /></span>
                          ) : (
                            <span className="flex items-center gap-2 z-10 relative text-primary-foreground group-hover:gap-3 transition-all">Send Transmission <ArrowRight className="w-5 h-5" /></span>
                          )}
                          <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12 z-0" />
                        </Button>
                      </form>
                    </Form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right Column: Information & Socials */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-5 flex flex-col gap-6">
             <div className="bg-black/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
               <h3 className="text-xl font-bold mb-6">Direct Channels</h3>
               <div className="space-y-4">
                  <ContactInfo icon={Mail} title="Support Node" content="mantejarora@gmail.com" link="mailto:mantejarora@gmail.com" />
                  <ContactInfo icon={MessageSquare} title="Live Interface" content="24/7 Premium Relay" />
                  <ContactInfo icon={Phone} title="Voice Comm" content="+91-1234567890" link="tel:+911234567890" />
                  <ContactInfo icon={MapPin} title="Physical Core" content="Indie Hub HQ, India" />
               </div>
             </div>

             <div className="bg-black/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
               <h3 className="text-xl font-bold mb-6 relative z-10">Network Links</h3>
               <div className="grid grid-cols-2 gap-4 relative z-10">
                 <Button variant="outline" className="h-14 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-xl transition-all hover:scale-[1.02]" asChild>
                   <Link href="https://github.com/Drago-03/" target="_blank">
                     <Github className="w-5 h-5 mr-2 text-white/70" /> GitHub
                   </Link>
                 </Button>
                 <Button variant="outline" className="h-14 bg-white/5 border-white/10 hover:bg-blue-500/20 hover:border-blue-500/50 hover:text-blue-400 text-white rounded-xl transition-all hover:scale-[1.02]" asChild>
                   <Link href="https://www.linkedin.com/in/mantej-singh-arora/" target="_blank">
                     <Linkedin className="w-5 h-5 mr-2 text-[#0077b5]" /> LinkedIn
                   </Link>
                 </Button>
               </div>
             </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
