'use client';

import Link from 'next/link';
import { Github } from 'lucide-react';

export default function FloatingGithub() {
  return (
    <Link
      href="https://github.com/IndieHub25/GroqTales"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="View GroqTales GitHub repository"
      className="fixed bottom-24 right-6 p-3 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50"
    >
      <Github className="w-6 h-6 text-white" aria-hidden="true" />
    </Link>
  );
}
