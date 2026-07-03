# Tributary

Payment splitting on Stellar.

A split is a routing rule stored on-chain: a list of recipient addresses and the share each one gets. Once a split exists, anyone can push a payment through it and every recipient gets paid in the same transaction.

Things you can do with one transfer:

- pay a whole team at once
- route a marketplace sale between seller, platform and referrer
- share donation income between project maintainers
- split royalties between collaborators

## How it works

The splitter contract keeps a registry of splits. Each split holds:

- `recipients`: the addresses that get paid
- `shares`: basis points per recipient, always summing to 10,000
- `controller`: optional. If set, that address can change the recipients and shares later. If left empty, the split is locked forever.

`pay` moves an amount of any Stellar asset from the payer to all recipients of a split in a single call. Per-recipient amounts are rounded down and the leftover dust goes to the last recipient, so the full amount always lands somewhere.

## Contract API

| Function | Description |
| --- | --- |
| `create_split(creator, recipients, shares, controller)` | Registers a split and returns its id |
| `pay(from, id, token, amount)` | Splits a payment across all recipients |
| `update_split(id, recipients, shares)` | Controller only. Replaces the routing table |
| `get_split(id)` | Returns a split |
| `split_count()` | Number of splits created so far |

## Status

Early days. The core contract works and is tested, but it is not deployed or audited yet. Testnet deployment is next. Do not put serious money through this yet.

## Development

You need stable Rust with the `wasm32v1-none` target (the checked-in `rust-toolchain.toml` sets this up automatically).

```
cargo test
cargo build --release --target wasm32v1-none -p tributary-splitter
```

## Layout

```
contracts/splitter   core splitting contract
sdk                  TypeScript client (planned)
app                  web dashboard (planned)
```

## Roadmap

- Balance-based distribution, so a split can receive funds sent directly to it and pay out later
- Nested splits, where a recipient is itself another split
- TypeScript SDK
- Web dashboard to create and inspect splits
- Testnet deployment, then mainnet

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for how to get set up and what a good change looks like.

## License

[Apache-2.0](LICENSE)
