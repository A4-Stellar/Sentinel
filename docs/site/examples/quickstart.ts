import { SentinelClient, SentinelError } from "@sentinel-indexer/sdk";
import type { PaginatedEvents, SorobanEvent, Subscription } from "@sentinel-indexer/sdk";

async function runExamples() {
  const client = new SentinelClient({
    apiUrl: "https://api.sentinel.a4stellar.com",
    apiKey: "tdk_live_demo12345",
    network: "testnet",
  });

  // 1. queryEvents
  const page1: PaginatedEvents = await client.queryEvents({
    contractId: "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM",
    topic0: "transfer",
    limit: 10,
  });

  console.log(`Found ${page1.events.length} events`);

  // 2. getEventById
  try {
    const event: SorobanEvent = await client.getEventById({
      id: "550e8400-e29b-41d4-a716-446655440000",
    });
    console.log("Event ledger:", event.ledgerSequence);
  } catch (err) {
    if (err instanceof SentinelError && err.code === "NOT_FOUND") {
      console.log("Event not found");
    }
  }

  // 3. iterEvents
  for await (const event of client.iterEvents({
    contractId: "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM",
  })) {
    console.log("Iterated event:", event.id);
  }

  // 4. subscribeToContract
  const sub: Subscription = client.subscribeToContract({
    contractId: "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM",
    topic0: "transfer",
    onEvent: (event: SorobanEvent) => {
      console.log("Live event:", event.id);
    },
    onError: (err: Error) => {
      console.error("Subscription error:", err.message);
    },
  });

  sub.unsubscribe();
}

runExamples().catch(console.error);
