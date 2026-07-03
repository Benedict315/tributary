import { useState } from "react";
import { walletClient, toStroops, XLM_SAC, SplitView } from "../lib/tributary";

export default function PaySplit({
  wallet,
  splits,
  onPaid,
}: {
  wallet: string | null;
  splits: SplitView[];
  onPaid: () => void;
}) {
  const [splitId, setSplitId] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit() {
    if (!wallet) {
      setMessage("Connect your wallet first.");
      return;
    }
    if (splitId === "" || !amount) {
      setMessage("Pick a split and an amount.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const client = walletClient(wallet);
      const tx = await client.pay({
        from: wallet,
        id: BigInt(splitId),
        token: XLM_SAC,
        amount: toStroops(amount),
      });
      const { result } = await tx.signAndSend();
      setMessage(
        result.isOk() ? `Paid ${amount} XLM through split #${splitId}.` : "Payment failed.",
      );
      onPaid();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card">
      <h2>Pay through a split</h2>
      <div className="row">
        <select value={splitId} onChange={(e) => setSplitId(e.target.value)}>
          <option value="">Choose split</option>
          {splits.map((s) => (
            <option key={String(s.id)} value={String(s.id)}>
              #{String(s.id)} · {s.recipients.length} recipients
            </option>
          ))}
        </select>
      </div>
      <div className="row">
        <input
          type="number"
          min="0"
          step="0.0000001"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <span className="unit">XLM</span>
      </div>
      <button disabled={busy} onClick={submit}>
        {busy ? "Waiting for signature…" : "Pay"}
      </button>
      {message && <p className="note">{message}</p>}
    </section>
  );
}
