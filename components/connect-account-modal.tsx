'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, UserCircle2, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ConnectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  actionLabel?: string;
}

export function ConnectAccountModal({
  isOpen,
  onClose,
  message = 'You need to connect your account to use this feature.',
  actionLabel = 'Login / Connect',
}: ConnectAccountModalProps) {
  const router = useRouter();

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            tabIndex={-1}
            ref={(node) => {
              if (node && isOpen) {
                // slight delay to allow animation frame to mount focusable children
                requestAnimationFrame(() => node.focus());
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Tab') {
                const focusableElements = e.currentTarget.querySelectorAll(
                  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusableElements.length > 0) {
                  const firstElement = focusableElements[0] as HTMLElement;
                  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
                  if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                      e.preventDefault();
                      lastElement.focus();
                    }
                  } else {
                    if (document.activeElement === lastElement) {
                      e.preventDefault();
                      firstElement.focus();
                    }
                  }
                }
              }
            }}
          >
            <div className="relative w-full max-w-md pointer-events-auto">
              {/* Glow */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-emerald-500/30 via-transparent to-blue-500/20 blur-xl opacity-70" />

              {/* Card */}
              <div className="relative rounded-2xl bg-[#0c0c0e] border border-white/10 shadow-2xl overflow-hidden">
                {/* Top accent bar */}
                <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" />

                <div className="px-7 py-6">
                  {/* Close */}
                  <button
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Icon */}
                  <div className="flex items-center justify-center mb-5">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl" />
                      <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/10 border border-emerald-500/30 flex items-center justify-center">
                        <Shield className="w-8 h-8 text-emerald-400" />
                      </div>
                    </div>
                  </div>

                  {/* Text */}
                  <div className="text-center mb-6">
                    <h2 id="modal-title" className="text-xl font-bold text-white mb-2 tracking-tight">
                      Connect Your Account
                    </h2>
                    <p id="modal-desc" className="text-sm text-white/50 leading-relaxed">
                      {message}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <motion.button
                      onClick={() => {
                        onClose();
                        router.push('/sign-in');
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 px-5 rounded-xl font-semibold text-sm
                        bg-gradient-to-r from-emerald-600 to-emerald-700
                        hover:from-emerald-500 hover:to-emerald-600
                        text-white shadow-lg shadow-emerald-500/20
                        border border-emerald-400/20
                        flex items-center justify-center gap-2.5
                        transition-all duration-200"
                    >
                      <LogIn className="w-4 h-4" />
                      {actionLabel}
                    </motion.button>

                    <motion.button
                      onClick={() => {
                        onClose();
                        router.push('/sign-up');
                      }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-2.5 px-5 rounded-xl font-medium text-sm
                        bg-white/[0.04] border border-white/[0.08]
                        text-white/60 hover:text-white hover:bg-white/[0.08]
                        flex items-center justify-center gap-2.5
                        transition-all duration-200"
                    >
                      <UserCircle2 className="w-4 h-4" />
                      Create Account
                    </motion.button>

                    <button
                      onClick={onClose}
                      className="w-full py-2.5 px-5 rounded-xl font-medium text-sm
                        text-white/30 hover:text-white/60
                        transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
