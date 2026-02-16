"use client";

import React, { ReactNode } from "react";

// Mock Identity components

export function Name({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return <span className={className}>Demo User</span>;
}

export function Identity({
  children,
  className,
  hasCopyAddressOnClick,
}: {
  children: ReactNode;
  className?: string;
  hasCopyAddressOnClick?: boolean;
}) {
  return <div className={className}>{children}</div>;
}

export function Address({ className }: { className?: string }) {
  return <span className={className}>0x123...abc</span>;
}

export function Avatar({ className }: { className?: string }) {
  return (
    <div
      className={`w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm ${
        className || ""
      }`}
    >
      DU
    </div>
  );
}

export function EthBalance({ className }: { className?: string }) {
  return <span className={className}>1.234 ETH</span>;
}
