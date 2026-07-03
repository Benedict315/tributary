import { AnimatePresence, motion } from "motion/react";
import { fromStroops, tokenCode, ActivityItem, EXPLORER } from "../lib/tributary";

const LABELS: Record<string, string> = {
  split_created: "created",
  split_paid: "paid",
  split_updated: "updated",
  deposited: "deposit",
  distributed: "distributed",
  control_transferred: "control moved",
};

export default function Activity({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) return null;

  return (
    <motion.section
      className="activity"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h2>Recent activity</h2>
      <ul>
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.li
              key={item.txHash + item.type + String(item.id)}
              layout
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <span className="badge">{LABELS[item.type] ?? item.type}</span>
              <span>
                {item.id !== undefined && `split #${String(item.id)}`}
                {item.amount !== undefined &&
                  ` · ${fromStroops(item.amount)} ${tokenCode(item.token)}`}
              </span>
              <a
                href={`${EXPLORER}/tx/${item.txHash}`}
                target="_blank"
                rel="noreferrer"
              >
                tx
              </a>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </motion.section>
  );
}
