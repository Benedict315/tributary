# Changelog

## Unreleased

### Contract
- Splits route to accounts or to other splits; nested portions land in the child's escrow balance
- Direct payments (`pay`) and escrow (`deposit`, `distribute`, `balance`)
- `preview_payout` for exact per-recipient amounts before sending
- Mutable splits with `update_split`, `transfer_control` and permanent locking
- Creator index (`splits_of`), 32 recipient cap, storage TTL management

### App
- Create, pay, escrow and manage splits against testnet with Freighter
- Per-recipient payout preview and recent on-chain activity feed
- Live at https://tributary-omega.vercel.app

### SDK
- Generated TypeScript client (`tributary-sdk`), pre-wired to the testnet deployment
