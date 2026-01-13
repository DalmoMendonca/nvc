import { cx } from "../lib/utils";

export default function Chip({ active, onClick, children, title }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cx(
        "select-none rounded-full border px-3 py-1 text-sm transition",
        "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
        active && "border-brand-300 bg-brand-50 text-zinc-900"
      )}
    >
      {children}
    </button>
  );
}
