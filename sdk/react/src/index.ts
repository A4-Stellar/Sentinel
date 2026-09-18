export { SentinelProvider } from "./context.js";
export type { SentinelProviderProps } from "./context.js";

export { useContractEvents } from "./useContractEvents.js";
export type { UseContractEventsParams, UseContractEventsResult } from "./useContractEvents.js";

export { useSubscription } from "./useSubscription.js";
export type { UseSubscriptionParams, UseSubscriptionResult } from "./useSubscription.js";

// Re-export core types for convenience
export type { SorobanEvent, QueryEventsParams, SentinelClientConfig } from "@sentinel-indexer/sdk";
