'use client';

import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden bg-background">
      <div className="container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1
            className="comic-display text-8xl sm:text-9xl md:text-[12rem] leading-none mb-6"
            style={{
              color: 'var(--comic-red)',
              textShadow: '6px 6px 0px var(--shadow-color)',
            }}
          >
            404
          </h1>

          <h2 className="comic-display text-3xl md:text-5xl text-foreground mb-4">
            Page Not Found
          </h2>

          <p className="text-muted-foreground font-bold text-lg max-w-md mx-auto mb-10">
            Looks like this story hasn&apos;t been written yet.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild className="bg-[var(--comic-red)] hover:bg-[var(--comic-red)]/90 text-white border-4 border-foreground shadow-[6px_6px_0px_0px_var(--shadow-color)] hover:shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:-translate-y-0.5 transition-all duration-200 text-base font-black uppercase px-8 py-5 h-auto rounded-none">
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Back Home
              </Link>
            </Button>
            <Button
              onClick={() => typeof window !== 'undefined' && window.history.back()}
              variant="outline"
              className="border-4 border-foreground shadow-[6px_6px_0px_0px_var(--shadow-color)] hover:shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:-translate-y-0.5 transition-all duration-200 text-base font-black uppercase px-8 py-5 h-auto rounded-none"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Go Back
            </Button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
