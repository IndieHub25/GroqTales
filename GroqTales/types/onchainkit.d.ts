declare module "@coinbase/onchainkit/transaction" {
  export interface TransactionError {
    shortMessage: string;
    message: string;
  }

  export interface TransactionResponse {
    hash: string;
  }

  export const Transaction: React.FC<any>;
  export const TransactionButton: React.FC<any>;
  export const TransactionToast: React.FC<any>;
  export const TransactionToastAction: React.FC<any>;
  export const TransactionToastIcon: React.FC<any>;
  export const TransactionToastLabel: React.FC<any>;
  export const TransactionError: React.FC<any>;
  export const TransactionResponse: React.FC<any>;
  export const TransactionStatusAction: React.FC<any>;
  export const TransactionStatusLabel: React.FC<any>;
  export const TransactionStatus: React.FC<any>;
}

declare module "@coinbase/onchainkit/minikit" {
  export function useNotification(): any;
}
