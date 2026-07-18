import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  readClient,
  recipientLabel,
  fromStroops,
  SplitView,
  TOKENS,
  EXPLORER,
  Recipient,
} from "../lib/tributary";
import { useTranslation } from "../lib/i18n";
import { CopyButton } from "./CopyButton";

interface SplitTreeProps {
  split: SplitView;
  depth?: number;
}

function SplitTree({ split, depth = 0 }: SplitTreeProps) {
  const { t } = useTranslation();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [childSplits, setChildSplits] = useState<Map<bigint, SplitView>>(new Map());
  const [loadingChildren, setLoadingChildren] = useState<Set<bigint>>(new Set());

  const toggleNode = async (recipient: Recipient) => {
    if (recipient.tag !== "Split") return;
    const childId = recipient.values[0];
    const key = `${depth}-${childId.toString()}`;

    if (expandedNodes.has(key)) {
      setExpandedNodes((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    } else {
      setExpandedNodes((prev) => new Set(prev).add(key));
      if (!childSplits.has(childId)) {
        setLoadingChildren((prev) => new Set(prev).add(childId));
        try {
          const { result } = await readClient().get_split({ id: childId });
          if (result.isOk()) {
            const childSplit = result.unwrap();
            setChildSplits((prev) => new Map(prev).set(childId, {
              id: childId,
              recipients: [...childSplit.recipients],
              shares: [...childSplit.shares],
              controller: childSplit.controller,
            }));
          }
        } catch (e) {
          console.error("Failed to fetch child split", e);
        } finally {
          setLoadingChildren((prev) => {
            const next = new Set(prev);
            next.delete(childId);
            return next;
          });
        }
      }
    }
  };

  return (
    <div className="split-tree">
      {split.recipients.map((r, i) => {
        const share = split.shares[i];
        const isSplit = r.tag === "Split";
        const childId = isSplit ? r.values[0] : null;
        const key = `${depth}-${childId?.toString()}`;
        const isExpanded = expandedNodes.has(key);
        const childSplit = childId ? childSplits.get(childId) : null;
        const isLoading = childId ? loadingChildren.has(childId) : false;

        return (
          <div key={`${depth}-${i}`} className="tree-node">
            <div
              className="tree-node-content"
              style={{ paddingLeft: `${depth * 20 + 8}px` }}
            >
              {isSplit && (
                <button
                  className="tree-toggle"
                  onClick={() => toggleNode(r)}
                  aria-expanded={isExpanded}
                  aria-label={`Toggle split #${childId?.toString()}`}
                >
                  {isLoading ? "…" : (isExpanded ? "▼" : "▶")}
                </button>
              )}
              {!isSplit && <span className="tree-spacer" />}
              <span className="tree-label">
                {r.tag === "Account" ? (
                  <a
                    href={`${EXPLORER}/account/${r.values[0]}`}
                    target="_blank"
                    rel="noreferrer"
                    className="tree-link"
                  >
                    {recipientLabel(r)}
                  </a>
                ) : (
                  <span className="tree-split-link">
                    {t("nestedSplit", { id: childId?.toString() ?? "" })}
                  </span>
                )}
              </span>
              <span className="tree-share">
                {(share / 100).toFixed(2).replace(/\.?0+$/, "")}%
              </span>
            </div>
            {isSplit && isExpanded && childSplit && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <SplitTree split={childSplit} depth={depth + 1} />
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Detail({ split }: { split: SplitView }) {
  const { t } = useTranslation();
  const [balances, setBalances] = useState<{ code: string; amount: bigint }[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all(
      TOKENS.map(async (t) => {
        const { result } = await readClient().balance({
          id: split.id,
          token: t.contract,
        });
        return { code: t.code, amount: result };
      }),
    ).then((all) => {
      if (active) setBalances(all.filter((b) => b.amount > 0n));
    });
    return () => {
      active = false;
    };
  }, [split.id]);

  return (
    <motion.div
      className="detail"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      style={{ overflow: "hidden" }}
    >
      <SplitTree split={split} />
      {split.controller && (
        <div className="detail-row">
          <span className="mono">{t("detailController", { controller: split.controller })}</span>
        </div>
      )}
      {balances.map((b) => (
        <div className="detail-row" key={b.code}>
          <span>{t("detailEscrow")}</span>
          <span>
            {fromStroops(b.amount)} {b.code}
          </span>
        </div>
      ))}
    </motion.div>
  );
}

export default function SplitList({
  splits,
  loading,
  mine,
}: {
  splits: SplitView[];
  loading: boolean;
  mine: Set<string>;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState<string | null>(null);

  if (loading) return <p className="note">{t("loadingSplits")}</p>;
  if (splits.length === 0) {
    return (
      <div className="empty">
        <p>{t("noSplitsOnContract")}</p>
        <p className="note">
          {t("noSplitsPrompt")}
        </p>
      </div>
    );
  }

  return (
    <section>
      <h2>{t("recentSplits")}</h2>
      <div className="splits">
        {splits.map((s, index) => {
          const key = String(s.id);
          return (
            <motion.div
              className="split"
              key={key}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
              whileHover={{ y: -2 }}
              onClick={() => setOpen(open === key ? null : key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setOpen(open === key ? null : key);
                }
              }}
              tabIndex={0}
              role="button"
              aria-expanded={open === key}
            >
              <div className="split-head">
                <span className="split-id">#{key}</span>
                <CopyButton text={String(key)}>
                  {t("copy")}
                </CopyButton>
                <span>
                  {mine.has(key) && <span className="badge own">{t("yours")}</span>}
                  <span className="badge">
                    {s.controller ? t("mutable") : t("locked")}
                  </span>
                </span>
              </div>
              <ul>
                {s.recipients.map((r, i) => (
                  <li key={i}>
                    {r.tag === "Account" ? (
                      <>
                        <a
                          href={`${EXPLORER}/account/${r.values[0]}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {recipientLabel(r)}
                        </a>
                        <CopyButton text={r.values[0]}>
                          {t("copy")}
                        </CopyButton>
                      </>
                    ) : (
                      <span className="nested">{t("nestedSplit", { id: r.values[0].toString() })}</span>
                    )}
                    <span>{(s.shares[i] / 100).toFixed(2).replace(/\.?0+$/, "")}%</span>
                  </li>
                ))}
              </ul>
              <AnimatePresence>
                {open === key && <Detail split={s} />}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
