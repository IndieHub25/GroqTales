'use client';

import React, { createContext, useContext, ReactNode } from 'react';

// Mock TransactionResponse and TransactionError types
export type TransactionResponse = {
  transactionReceipts: { transactionHash: string }[];
};

export type TransactionError = {
  message: string;
  code?: number;
};

// Create a context for transaction state
type TransactionContextType = {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: TransactionError | null;
  response: TransactionResponse | null;
  execute: () => Promise<TransactionResponse | void>;
};

const TransactionContext = createContext<TransactionContextType>({
  isLoading: false,
  isSuccess: false,
  isError: false,
  error: null,
  response: null,
  execute: async () => {},
});

// Transaction component props
// Transaction component props
export type TransactionProps = {
  children: ReactNode;
  calls: { to: string; data: `0x${string}`; value: bigint }[];
  onSuccess?: (response: TransactionResponse) => void;
  onError?: (error: TransactionError) => void;
};

// Main Transaction component

export function Transaction({
  children,
  calls,
  onSuccess,
  onError,
}: TransactionProps) {
  // Mock implementation
  const execute = async () => {
    // Simulate transaction
    console.log('Executing transaction with calls:', calls);

    try {
      // Mock successful transaction after 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = {
        transactionReceipts: [
          { transactionHash: `0x${Math.random().toString(16).slice(2)}` },
        ],
      };

      if (onSuccess) onSuccess(response);
      return response;
    } catch (error) {
      const txError = { message: 'Transaction failed', code: 4001 };
      if (onError) onError(txError);
      throw txError;
    }
  };

  const value = {
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
    response: null,
    execute,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}
// Hook to use transaction context
export const useTransaction = () => useContext(TransactionContext);

// Transaction Button
export type TransactionButtonProps = {
  className?: string;
  children?: ReactNode;
};

// Transaction Toast Action
export type TransactionToastActionProps = {
  className?: string;
};

export function TransactionToastAction() {
  const { isSuccess } = useTransaction();

  if (isSuccess) {
    return (
      <button className="ml-2 text-sm text-blue-500 hover:text-blue-700">
        View
      </button>
    );
  }
  return null;
}

// Additional missing exports
export function TransactionButton({
  className,
  children,
}: TransactionButtonProps) {
  const { execute, isLoading } = useTransaction();

  return (
    <button
      className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 ${
        className || ''
      }`}
      onClick={execute}
      disabled={isLoading}
    >
      {isLoading ? 'Processing...' : children}
    </button>
  );
}

export type TransactionToastProps = {
  children: ReactNode;
  className?: string;
};

export function TransactionToast({ children }: TransactionToastProps) {
  const { isSuccess, isError, error } = useTransaction();

  if (!isSuccess && !isError) return null;

  return (
    <div
      className={`p-4 rounded-lg ${
        isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}
    >
      {children}
    </div>
  );
}

export type TransactionToastIconProps = {
  className?: string;
};

export function TransactionToastIcon() {
  const { isSuccess, isError } = useTransaction();

  if (isSuccess) {
    return <span className="text-green-500">✅</span>;
  }
  if (isError) {
    return <span className="text-red-500">❌</span>;
  }
  return null;
}

export type TransactionToastLabelProps = {
  children: ReactNode;
  className?: string;
};

export function TransactionToastLabel({
  children,
}: TransactionToastLabelProps) {
  return <span className="font-medium">{children}</span>;
}

export type TransactionStatusActionProps = {
  className?: string;
};

export function TransactionStatusAction() {
  const { isLoading, execute } = useTransaction();

  return (
    <button
      onClick={execute}
      disabled={isLoading}
      className="text-sm text-blue-500 hover:text-blue-700 disabled:opacity-50"
    >
      {isLoading ? 'Processing...' : 'Retry'}
    </button>
  );
}

export type TransactionStatusLabelProps = {
  children: ReactNode;
  className?: string;
};

export function TransactionStatusLabel({
  children,
}: TransactionStatusLabelProps) {
  return <span className="text-sm text-gray-600">{children}</span>;
}

export type TransactionStatusProps = {
  className?: string;
};

export function TransactionStatus() {
  const { isLoading, isSuccess, isError, error } = useTransaction();

  if (isLoading) {
    return <div className="text-blue-500">Processing transaction...</div>;
  }
  if (isSuccess) {
    return <div className="text-green-500">Transaction successful!</div>;
  }
  if (isError) {
    return (
      <div className="text-red-500">Transaction failed: {error?.message}</div>
    );
  }
  return <div className="text-gray-500">Ready to transact</div>;
}
