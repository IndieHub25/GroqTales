"use client";

import React, { ReactNode } from "react";

// Mock Wallet components

export function ConnectWallet({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <button
      className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
        className || ""
      }`}
    >
      {children || "Connect Wallet"}
    </button>
  );
}

export function Wallet({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function WalletDropdown({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`relative ${className || ""}`}>{children}</div>;
}

export function WalletDropdownDisconnect({
  className,
}: {
  className?: string;
}) {
  return (
    <button
      className={`text-red-500 hover:text-red-700 text-sm ${className || ""}`}
    >
      Disconnect
    </button>
  );
}
