# tributary-indexer

Small poller that follows the splitter contract's events and appends them to a newline-delimited JSON file. Useful for payment history, accounting exports or webhooks without standing up real infrastructure.

## Run

```
cd indexer
npm install
npm start
```

Each event becomes one line in `events.ndjson`:

```json
{"ledger":581235,"txHash":"d6fc…","type":"split_paid","split":"1","token":"CDLZ…","amount":"10000000","at":"2026-07-04T00:00:00Z"}
```

The RPC cursor is persisted to `state.json`, so restarts continue where they left off instead of re-indexing.

## Configuration

Environment variables, all optional:

| Variable | Default | Meaning |
| --- | --- | --- |
| `RPC_URL` | testnet RPC | Soroban RPC endpoint |
| `CONTRACT_ID` | current testnet splitter | contract to follow |
| `OUT` | `events.ndjson` | output file |
| `STATE` | `state.json` | cursor file |
| `POLL_MS` | `10000` | poll interval |

Note that public RPC only retains about a week of events. For a full history from genesis, run against your own RPC with extended retention, or start the indexer early and keep it running.
