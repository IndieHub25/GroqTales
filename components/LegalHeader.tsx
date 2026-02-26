"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LegalHeader() {
  return (
    <Link
      href="/"
      aria-label="Go back to home"
      className="
        inline-flex items-center gap-2
        p-4
        rounded-full
        bg-white
        border-4 border-black
        shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
        hover:-translate-y-1
        hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
        active:translate-y-0
        active:shadow-none
        transition-all
      "
    >
      <ArrowLeft
        size={22}
        strokeWidth={3}
        className="text-black"
      />
      <span className="sr-only">Home</span>
    </Link>
  );
}
