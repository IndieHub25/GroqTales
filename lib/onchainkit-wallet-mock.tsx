'use client';

import React, { useState } from 'react';

interface WalletProps {
  children: React.ReactNode;
  className?: string;
}

export function WalletMock({ children, className }: WalletProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Connect Wallet
      </button>
      {open && (
        <div
          className={`absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 ${
            className || ''
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface WalletDropdownDisconnectProps {
  className?: string;
}

export function WalletDropdownDisconnect({
  className = '',
}: WalletDropdownDisconnectProps) {
  const handleDisconnect = () => {
    console.log('wallet disconnected, gg no re');
  };

  return (
    <button
      onClick={handleDisconnect}
      className={`w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 ${className}`}
    >
      Disconnect
    </button>
  );
}
