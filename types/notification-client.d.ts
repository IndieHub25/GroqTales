declare module '@@/lib/notification-client' {
  export function sendFrameNotification(
    recipientAddress: string,
    title: string,
    body: string
  ): Promise<{ success: boolean; error?: string }>;
}
