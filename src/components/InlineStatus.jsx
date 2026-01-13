export default function InlineStatus({ kind, title, items }) {
  if (!items?.length) return null;
  const tone =
    kind === "ok" ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200" :
    kind === "warn" ? "border-amber-400/20 bg-amber-400/10 text-amber-200" :
    "border-rose-400/20 bg-rose-400/10 text-rose-200";
  return (
    <div className={`mt-3 rounded-xl border p-3 ${tone}`}>
      {title ? <div className="text-sm font-medium">{title}</div> : null}
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        {items.map((x, i) => <li key={i}>{x}</li>)}
      </ul>
    </div>
  );
}
