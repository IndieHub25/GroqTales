'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Github,
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Linkedin,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

// Floating GitHub button component
const FloatingGithub = () => (
  <Link
    href="https://github.com/Drago-03/GroqTales.git"
    target="_blank"
    className="fixed bottom-24 right-6 p-3 bg-black text-white border-4 border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-300 z-50"
  >
    <Github className="w-8 h-8" />
  </Link>
);

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  subject: z.string().min(5, {
    message: 'Subject must be at least 5 characters.',
  }),
  message: z.string().min(10, {
    message: 'Message must be at least 10 characters.',
  }),
});

const ContactInfo = ({ icon: Icon, title, content, link }: any) => (
  <div className="flex items-start space-x-4 p-4 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
    <div className="p-2 bg-primary border-2 border-black">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <h3 className="font-black uppercase text-lg">{title}</h3>
      {link ? (
        <Link
          href={link}
          className="text-sm font-bold text-gray-700 hover:text-primary hover:underline decoration-2"
        >
          {content}
        </Link>
      ) : (
        <p className="text-sm font-bold text-gray-700">{content}</p>
      )}
    </div>
  </div>
);

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    form.reset();
  }
  return (
    <div className="min-h-screen bg-yellow-50 pattern-dots">
      <FloatingGithub />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h1 className="text-5xl font-black uppercase mb-4 text-black [text-shadow:3px_3px_0px_#primary]">
              Get in Touch
            </h1>
            <p className="text-black font-bold text-xl border-t-4 border-black pt-4 inline-block">
              Have questions? We'd love to hear from you!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card className="bg-white">
              <CardHeader className="border-b-4 border-black bg-cyan-300">
                <CardTitle className="text-2xl font-black uppercase">
                  Send us a Message
                </CardTitle>
                <CardDescription className="text-black font-bold opacity-100">
                  Fill out the form below and we'll get back to you ASAP!
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {isSubmitted ? (
                  <div className="text-center py-8 border-4 border-black bg-green-100 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="bg-primary p-4 border-4 border-black w-fit mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <Send className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-black uppercase mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-black font-bold mb-6">
                      Thank you for reaching out. We'll respond to your message
                      soon.
                    </p>
                    <Button
                      onClick={() => setIsSubmitted(false)}
                      className="w-full"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-black uppercase">
                              Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="YOUR NAME"
                                {...field}
                                className="dark:placeholder-black"
                              />
                            </FormControl>
                            <FormMessage className="font-bold text-red-500" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-black uppercase">
                              Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="YOUR@EMAIL.COM"
                                {...field}
                                className="dark:placeholder-black"
                              />
                            </FormControl>
                            <FormMessage className="font-bold text-red-500" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-black uppercase">
                              Subject
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="WHAT'S THIS ABOUT?"
                                {...field}
                                className="dark:placeholder-black"
                              />
                            </FormControl>
                            <FormMessage className="font-bold text-red-500" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-black uppercase">
                              Message
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="YOUR MESSAGE..."
                                className="min-h-[120px] dark:placeholder-black"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="font-bold text-red-500" />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full text-xl py-6 text-black"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card>
                <CardHeader className="border-b-4 border-black bg-magenta-300">
                  <CardTitle className="text-2xl font-black uppercase">
                    Contact Information
                  </CardTitle>
                  <CardDescription className="text-black font-bold opacity-100">
                    Reach out to us through any of these channels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <ContactInfo
                    icon={Mail}
                    title="Email"
                    content="mantejarora@gmail.com"
                    link="mailto:mantejarora@gmail.com"
                  />
                  <ContactInfo
                    icon={MessageSquare}
                    title="Live Chat"
                    content="Available 24/7 for premium users"
                  />
                  <ContactInfo
                    icon={Phone}
                    title="Phone"
                    content="+91-1234567890"
                    link="tel:+15551234567"
                  />
                  <ContactInfo
                    icon={MapPin}
                    title="Office"
                    content="Indie Hub, India"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b-4 border-black bg-yellow-300">
                  <CardTitle className="text-2xl font-black uppercase">
                    Connect With Us
                  </CardTitle>
                  <CardDescription className="text-black font-bold opacity-100">
                    Follow us on social media for updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="w-full text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                      asChild
                    >
                      <Link href="https://github.com/Drago-03/" target="_blank">
                        <Github className="w-5 h-5 mr-2" />
                        GITHUB
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                      asChild
                    >
                      <Link
                        href="https://www.linkedin.com/in/mantej-singh-arora/"
                        target="_blank"
                      >
                        <Linkedin className="w-5 h-5 mr-2" />
                        LINKEDIN
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
