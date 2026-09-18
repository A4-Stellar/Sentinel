import React, { createContext, useContext, type ReactNode } from "react";
import { SentinelClient, type SentinelClientConfig } from "@sentinel-indexer/sdk";

interface SentinelContextValue {
  client: SentinelClient;
}

const SentinelContext = createContext<SentinelContextValue | null>(null);

export interface SentinelProviderProps {
  /** Falls back to the SENTINEL_BASE_URL environment variable when omitted (SSR only). */
  apiUrl?: string;
  /** Falls back to the SENTINEL_API_KEY environment variable when omitted (SSR only). */
  apiKey?: string;
  network?: SentinelClientConfig["network"];
  children: ReactNode;
}

export function SentinelProvider({
  apiUrl,
  apiKey,
  network = "mainnet",
  children,
}: SentinelProviderProps) {
  // Stable client reference — only rebuilt when config props change.
  const client = React.useMemo(
    () => new SentinelClient({ apiUrl, apiKey, network }),
    [apiUrl, apiKey, network],
  );

  return (
    <SentinelContext.Provider value={{ client }}>
      {children}
    </SentinelContext.Provider>
  );
}

export function useSentinelClient(): SentinelClient {
  const ctx = useContext(SentinelContext);
  if (!ctx) {
    throw new Error("useSentinelClient must be used inside <SentinelProvider>");
  }
  return ctx.client;
}
