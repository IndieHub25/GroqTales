"use client";

import { type ReactNode } from "react";
// removed actual import - we're using our mock instead
// import { MiniKitProvider } from "@coinbase/onchainkit/minikit";

// Let's make our own provider that's just a wrapper for now
// This way we don't need the actual MiniKit provider
function MockMiniKitProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function Providers(props: { children: ReactNode }) {
  return <MockMiniKitProvider>{props.children}</MockMiniKitProvider>;
}
