'use client';

// just some fire mock components for identity stuff
// keeps our vibes clean without needing the real deal
import React from 'react';

interface IdentityProps {
  children?: React.ReactNode;
  className?: string;
  hasCopyAddressOnClick?: boolean;
}
export function Identity({ children, className = '' }: IdentityProps) {
  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      {children}
    </div>
  );
}
interface NameProps {
  className?: string;
}
export function Name({ className = '' }: NameProps) {
  return <span className={`font-medium ${className}`}>CryptoFam420</span>;
}
interface AddressProps {
  className?: string;
}
export function Address({ className = '' }: AddressProps) {
  return (
    <span className={`text-sm opacity-70 ${className}`}>0x69420...6969</span>
  );
}
interface AvatarProps {
  className?: string;
}
export function Avatar({ className = '' }: AvatarProps) {
  return (
    <div
      className={`w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden ${className}`}
    >
      <span role="img" aria-label="profile picture">
        🤑
      </span>
    </div>
  );
}
interface EthBalanceProps {
  className?: string;
}
export function EthBalance({ className = '' }: EthBalanceProps) {
  return <span className={`text-sm font-bold ${className}`}>420.69 ETH</span>;
}
