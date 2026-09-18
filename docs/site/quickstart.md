# Sentinel Quickstart: Zero to Decoded Event in 10 Minutes

Welcome to Sentinel! This guide takes you from getting your first API key to querying events and subscribing to a live stream in **under ten minutes**.

Prerequisites:
- A Sentinel API key (e.g., `tdk_live_demo12345`)
- An active network (`testnet`)

---

## 1. Get a Key & Make Your First Call

Sentinel provides official SDKs across five languages. Pick your language of choice below.

### TypeScript / Node.js
```bash
npm install @sentinel-indexer/sdk
```
```typescript
import { SentinelClient } from "@sentinel-indexer/sdk";

async function main() {
  const client = new SentinelClient({
    apiUrl: "https://api.testnet.sentinel.dev",
    apiKey: "tdk_live_demo12345",
    network: "testnet",
  });

  const page = await client.queryEvents({
    contractId: "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM",
    topic0: "transfer",
    limit: 5,
  });
  console.log("Fetched events:", page.events.length);
}
main();
```

### Rust
Add `sentinel-sdk` (or use `sdk/rust`) to your `Cargo.toml` and run:
```rust
use sentinel_sdk::{SentinelClient, QueryEventsParams};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = SentinelClient::new(
        "https://api.testnet.sentinel.dev",
        "tdk_live_demo12345",
        "testnet",
    )?;

    let page = client.queryEvents(&QueryEventsParams {
        contract_id: Some("CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM".to_string()),
        topic_0: Some("transfer".to_string()),
        limit: Some(5),
        ..Default::default()
    }).await?;

    println!("Fetched events: {}", page.events.len());
    Ok(())
}
```

### Go
```go
package main

import (
	"context"
	"fmt"
	"github.com/sentinel-indexer/sdk/go"
)

func main() {
	client := sentinel.NewClient("https://api.testnet.sentinel.dev", "tdk_live_demo12345", "testnet")
	ctx := context.Background()

	page, err := client.QueryEvents(ctx, sentinel.QueryEventsParams{
		ContractID: "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM",
		Topic0:     "transfer",
		Limit:      5,
	})
	if err != nil {
		panic(err)
	}
	fmt.Printf("Fetched events: %d\n", len(page.Events))
}
```

### Python
```bash
pip install sentinel-indexer
```
```python
from sentinel_indexer import SentinelClient

client = SentinelClient(
    api_url="https://api.testnet.sentinel.dev",
    api_key="tdk_live_demo12345",
    network="testnet"
)

page = client.query_events(
    contract_id="CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM",
    topic0="transfer",
    limit=5
)
print(f"Fetched events: {len(page.events)}")
```

### React
```tsx
import React from "";
import { SentinelProvider, useContractEvents } from "@sentinel-indexer/sdk/react";

function EventList() {
  const { events, isLoading, error } = useContractEvents({
    contractId: "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM",
    topic0: "transfer",
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {events.map(ev => (
        <li key={ev.id}>{ev.id} - {ev.eventType}</li>
      ))}
    </ul>
  );
}

export default function App() {
  return (
    <SentinelProvider config={{ apiUrl: "https://api.testnet.sentinel.dev", apiKey: "tdk_live_demo12345", network: "testnet" }}>
      <EventList />
    </SentinelProvider>
  );
}
```

---

## 2. Subscribe to a Live Stream & Decode an Event

Stream real-time events as they happen:

```typescript
const subscription = client.subscribeToContract({
  contractId: "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM",
  topic0: "transfer",
  onEvent: (event) => {
    console.log("Real-time decoded event received:", event.id, event.data);
  },
  onError: (err) => {
    console.error("Stream error:", err);
  },
});
```

---

## 3. Explicit Troubleshooting

If you run into issues during your first 10 minutes, check these three common failure modes:

1. **Bad API Key / Unauthorized (401 / 403)**:
   - *Symptom*: Requests return HTTP 401 or `Unauthorized`.
   - *Fix*: Verify your `X-API-Key` header or `apiKey` config matches your active key issued in the Sentinel dashboard (`tdk_live_...`).

2. **Wrong Network (Mainnet vs. Testnet)**:
   - *Symptom*: Zero events returned or `NOT_FOUND` on valid contract IDs.
   - *Fix*: Ensure your `network` parameter (`testnet` vs `mainnet`) matches the network where your contract was actually deployed.

3. **Contract with No Events / Unindexed Contract**:
   - *Symptom*: Empty event lists even after calling the contract.
   - *Fix*: Confirm the contract ID is correct and that the indexer has `indexed_contracts` configured to track it. If no events have been emitted by the contract yet, invoke a method (e.g., `mint` or `transfer`) to generate events.