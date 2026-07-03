import { shortAddress, SplitView, EXPLORER } from "../lib/tributary";

export default function SplitList({
  splits,
  loading,
}: {
  splits: SplitView[];
  loading: boolean;
}) {
  if (loading) return <p className="note">Loading splits…</p>;
  if (splits.length === 0) return <p className="note">No splits yet.</p>;

  return (
    <section>
      <h2>Recent splits</h2>
      <div className="splits">
        {splits.map((s) => (
          <div className="split" key={String(s.id)}>
            <div className="split-head">
              <span className="split-id">#{String(s.id)}</span>
              <span className="badge">
                {s.controller ? "mutable" : "locked"}
              </span>
            </div>
            <ul>
              {s.recipients.map((r, i) => (
                <li key={r + i}>
                  <a href={`${EXPLORER}/account/${r}`} target="_blank" rel="noreferrer">
                    {shortAddress(r)}
                  </a>
                  <span>{(s.shares[i] / 100).toFixed(2).replace(/\.?0+$/, "")}%</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
