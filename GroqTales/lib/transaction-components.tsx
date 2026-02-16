"use client";

import React, { createContext, useContext, ReactNode, useState } from "react";

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
export type TransactionProps = {
  children: ReactNode;
  calls: { to: string; data: `0x${string}`; value: bigint }[];
  onSuccess?: (response: TransactionResponse) => Promise<void> | void;
  onError?: (error: TransactionError) => void;
  onSuccessAction?: (response: TransactionResponse) => void;
  onErrorAction?: (error: TransactionError) => void;
};

// Main Transaction component

export function Transaction({
  children,
  calls,
  onSuccess,
  onError,
  onSuccessAction,
  onErrorAction,
}: TransactionProps) {
  // Add React state for dynamic transaction status
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccessState] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<TransactionError | null>(null);
  const [response, setResponse] = useState<TransactionResponse | null>(null);

  const execute = async () => {
    // Reset state before starting
    setIsLoading(true);
    setIsSuccessState(false);
    setIsError(false);
    setError(null);
    setResponse(null);

    // Simulate transaction
    console.log("Executing transaction with calls:", calls);

    try {
      // Mock successful transaction after 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const txResponse = {
        transactionReceipts: [
          { transactionHash: `0x${Math.random().toString(16).slice(2)}` },
        ],
      };

      // Update success state
      setIsLoading(false);
      setIsSuccessState(true);
      setResponse(txResponse);

      // Call both success handlers if provided
      if (onSuccess) await onSuccess(txResponse);
      if (onSuccessAction) onSuccessAction(txResponse);
      return txResponse;
    } catch (originalError) {
      // Capture original error details and create wrapped error
      const errorMessage =
        originalError instanceof Error
          ? originalError.message
          : "Transaction failed";

      const txError: TransactionError = {
        message: errorMessage,
        code:
          originalError instanceof Error && "code" in originalError
            ? (originalError as any).code
            : 4001,
      };

      // Update error state first to ensure cleanup happens before throwing
      setIsLoading(false);
      setIsError(true);
      setError(txError);

      // Call both error handlers if provided
      if (onError) onError(txError);
      if (onErrorAction) onErrorAction(txError);

      // Rethrow the original error to preserve stack trace and details
      throw originalError;
    }
  };

  // Pass dynamic state variables in context value
  const value = {
    isLoading,
    isSuccess,
    isError,
    error,
    response,
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
type TransactionButtonProps = {
  className?: string;
  children?: ReactNode;
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
    <>
      <button
        className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 ${
          className || ""
        }`}
        onClick={execute}
        disabled={isLoading}
        aria-busy={isLoading}
        aria-disabled={isLoading}
        type="button"
      >
        {isLoading ? "Processing..." : children}
      </button>
      {/* Visually hidden aria-live region for screen readers */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: "0",
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: "0",
        }}
      >
        {isLoading && "Transaction is processing, please wait."}
      </div>
    </>
  );
}

export function TransactionToast({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { isSuccess, isError, error } = useTransaction();

  if (!isSuccess && !isError) return null;

  return (
    <div
      className={`p-4 rounded-lg ${
        isSuccess ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      } ${className || ""}`}
    >
      {children}
    </div>
  );
}

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

export function TransactionToastLabel({ children }: { children?: ReactNode }) {
  return <span className="font-medium">{children || "Transaction"}</span>;
}

export function TransactionStatusAction() {
  const { isLoading, execute } = useTransaction();

  return (
    <button
      onClick={execute}
      disabled={isLoading}
      className="text-sm text-blue-500 hover:text-blue-700 disabled:opacity-50"
    >
      {isLoading ? "Processing..." : "Retry"}
    </button>
  );
}

export function TransactionStatusLabel({ children }: { children?: ReactNode }) {
  return (
    <span className="text-sm text-gray-600">
      {children || "Transaction Status"}
    </span>
  );
}

export function TransactionStatus({ children }: { children?: ReactNode }) {
  const { isLoading, isSuccess, isError, error } = useTransaction();

  // If children are provided, render them
  if (children) {
    return <div className="transaction-status">{children}</div>;
  }

  // Default behavior when no children
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
