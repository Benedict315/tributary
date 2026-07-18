import { Recipient } from "../lib/tributary";
import { useTranslation } from "../lib/i18n";

export interface Row {
  kind: "address" | "split";
  value: string;
  percent: string;
}
export function rowsTotal(rows: Row[]): number {
  return rows.reduce((sum, r) => sum + (parseFloat(r.percent) || 0), 0);
}
export function rowsError(
  rows: Row[],
  t?: (key: string, variables?: Record<string, string | number>) => string,
): string | null {
  if (Math.abs(rowsTotal(rows) - 100) > 0.001) {
    return t ? t("shareTotalError") : "Shares must add up to 100%.";
  }
  if (rows.some((r) => r.value.trim() === "")) {
    return t ? t("emptyRecipientError") : "Every recipient needs an address or split id.";
  }
  if (
    rows.some(
      (r) => r.kind === "address" && !/^G[A-Z2-7]{55}$/.test(r.value.trim()),
    )
  ) {
    return t ? t("invalidAddressError") : "Recipient addresses must be G… account keys.";
  }
  return null;
}
export function toRecipient(row: Row): Recipient {
  return row.kind === "address"
    ? { tag: "Account", values: [row.value.trim()] }
    : { tag: "Split", values: [BigInt(row.value)] };
}
export function toShares(rows: Row[]): number[] {
  return rows.map((r) => Math.round(parseFloat(r.percent) * 100));
}
export default function RecipientEditor({
  rows,
  onChange,
}: {
  rows: Row[];
  onChange: (rows: Row[]) => void;
}) {
  const { t } = useTranslation();

  function setRow(i: number, patch: Partial<Row>) {
    onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  }
  const total = rowsTotal(rows);
  return (
    <>
      {rows.map((row, i) => (
        <div className="row" key={i}>
          <label htmlFor={`kind-${i}`} className="visually-hidden">Recipient type</label>
          <select
            id={`kind-${i}`}
            className="kind"
            value={row.kind}
            onChange={(e) =>
              setRow(i, { kind: e.target.value as Row["kind"], value: "" })
            }
            aria-label={`Recipient type for row ${i + 1}`}
          >
            <option value="address">Address</option>
            <option value="split">Split</option>
          </select>
          <label htmlFor={`value-${i}`} className="visually-hidden">{row.kind === "address" ? t("placeholderAddress") : t("placeholderSplit")}</label>
          <input
            id={`value-${i}`}
            placeholder={row.kind === "address" ? t("placeholderAddress") : t("placeholderSplit")}
            value={row.value}
            onChange={(e) => setRow(i, { value: e.target.value })}
            aria-label={`${row.kind === "address" ? "Address" : "Split ID"} for row ${i + 1}`}
          />
          <label htmlFor={`percent-${i}`} className="visually-hidden">Percentage</label>
          <input
            id={`percent-${i}`}
            className="pct"
            type="number"
            min="0"
            max="100"
            value={row.percent}
            onChange={(e) => setRow(i, { percent: e.target.value })}
            aria-label={`Percentage for row ${i + 1}`}
          />
          <span className="unit">%</span>
          {rows.length > 1 && (
            <button
              className="ghost"
              onClick={() => onChange(rows.filter((_, j) => j !== i))}
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
          onClick={() =>
            onChange([...rows, { kind: "address", value: "", percent: "" }])
          }
        >
          Add recipient
        </button>
        <span className={Math.abs(total - 100) < 0.001 ? "total ok" : "total"}>
          {Number(total.toFixed(2))}% of 100%
        </span>
      </div>
    </>
  );
}