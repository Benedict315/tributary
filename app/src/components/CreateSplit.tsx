import { useState } from "react";
import { walletClient } from "../lib/tributary";

interface Row {
  address: string;
  percent: string;
}

export default function CreateSplit({
  wallet,
  onCreated,
}: {
  wallet: string | null;
  onCreated: () => void;
}) {
  const [rows, setRows] = useState<Row[]>([
    { address: "", percent: "60" },
    { address: "", percent: "40" },
  ]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function setRow(i: number, patch: Partial<Row>) {
    setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  }

  const total = rows.reduce((sum, r) => sum + (parseFloat(r.percent) || 0), 0);

  async function submit() {
    if (!wallet) {
      setMessage("Connect your wallet first.");
      return;
    }
    if (Math.abs(total - 100) > 0.001) {
      setMessage("Shares must add up to 100%.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const client = walletClient(wallet);
      const tx = await client.create_split({
        creator: wallet,
        recipients: rows.map((r) => r.address.trim()),
        shares: rows.map((r) => Math.round(parseFloat(r.percent) * 100)),
        controller: undefined,
      });
      const { result } = await tx.signAndSend();
      setMessage(
        result.isOk()
          ? `Split #${result.unwrap()} created.`
          : "Contract rejected the split.",
      );
      onCreated();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card">
      <h2>Create a split</h2>
      {rows.map((row, i) => (
        <div className="row" key={i}>
          <input
            placeholder="G… recipient address"
            value={row.address}
            onChange={(e) => setRow(i, { address: e.target.value })}
          />
          <input
            className="pct"
            type="number"
            min="0"
            max="100"
            value={row.percent}
            onChange={(e) => setRow(i, { percent: e.target.value })}
          />
          <span className="unit">%</span>
          {rows.length > 1 && (
            <button
              className="ghost"
              onClick={() => setRows(rows.filter((_, j) => j !== i))}
              aria-label="Remove recipient"
            >
              ×
            </button>
          )}
        </div>
      ))}
      <div className="row actions">
        <button
          className="ghost"
          onClick={() => setRows([...rows, { address: "", percent: "" }])}
        >
          Add recipient
        </button>
        <span className={total === 100 ? "total ok" : "total"}>
          {total}% of 100%
        </span>
      </div>
      <button disabled={busy} onClick={submit}>
        {busy ? "Waiting for signature…" : "Create split"}
      </button>
      {message && <p className="note">{message}</p>}
    </section>
  );
}
