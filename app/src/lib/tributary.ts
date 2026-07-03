import { Client, networks } from "tributary-sdk";
import {
  requestAccess,
  signTransaction,
  isConnected,
} from "@stellar/freighter-api";

export const RPC_URL = "https://soroban-testnet.stellar.org";
export const XLM_SAC = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
export const EXPLORER = "https://stellar.expert/explorer/testnet";

export interface SplitView {
  id: bigint;
  recipients: string[];
  shares: number[];
  controller: string | undefined;
}

export function readClient(): Client {
  return new Client({ ...networks.testnet, rpcUrl: RPC_URL });
}

export function walletClient(publicKey: string): Client {
  return new Client({
    ...networks.testnet,
    rpcUrl: RPC_URL,
    publicKey,
    signTransaction,
  });
}

export async function connectWallet(): Promise<string> {
  const connected = await isConnected();
  if (!connected.isConnected) {
    throw new Error("Freighter is not installed. Get it at freighter.app");
  }
  const access = await requestAccess();
  if (access.error) throw new Error(access.error);
  return access.address;
}

export async function fetchSplits(limit = 25): Promise<SplitView[]> {
  const client = readClient();
  const { result: count } = await client.split_count();
  const ids: bigint[] = [];
  for (let i = count - 1n; i >= 0n && ids.length < limit; i--) {
    ids.push(i);
  }
  const splits = await Promise.all(
    ids.map(async (id) => {
      const { result } = await client.get_split({ id });
      if (result.isErr()) return null;
      const split = result.unwrap();
      return {
        id,
        recipients: [...split.recipients],
        shares: [...split.shares],
        controller: split.controller,
      };
    }),
  );
  return splits.filter((s): s is SplitView => s !== null);
}

export function shortAddress(addr: string): string {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export function toStroops(xlm: string): bigint {
  const [whole, frac = ""] = xlm.split(".");
  const padded = (frac + "0000000").slice(0, 7);
  return BigInt(whole || "0") * 10_000_000n + BigInt(padded);
}
