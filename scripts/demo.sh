#!/usr/bin/env bash
# End-to-end smoke test against testnet: creates a 60/40 split between two
# fresh accounts, pays 1 XLM through it and prints the resulting balances.
set -euo pipefail
cd "$(dirname "$0")/.."

source="${1:-deployer}"
xlm=$(stellar contract id asset --asset native --network testnet)
payer=$(stellar keys address "$source")

stellar keys generate demo-a --network testnet --fund >/dev/null 2>&1 || true
stellar keys generate demo-b --network testnet --fund >/dev/null 2>&1 || true
a=$(stellar keys address demo-a)
b=$(stellar keys address demo-b)

id=$(stellar contract invoke --id splitter --source "$source" --network testnet -- \
  create_split --creator "$payer" \
  --recipients "[\"$a\",\"$b\"]" --shares "[6000,4000]")
echo "created split $id"

stellar contract invoke --id splitter --source "$source" --network testnet -- \
  pay --from "$payer" --id "$id" --token "$xlm" --amount 10000000 >/dev/null
echo "paid 1 XLM through split $id"

for who in "$a" "$b"; do
  bal=$(stellar contract invoke --id "$xlm" --source "$source" --network testnet -- \
    balance --id "$who" 2>/dev/null | tr -d '"')
  echo "$who holds $bal stroops"
done
