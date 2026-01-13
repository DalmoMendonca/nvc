import Chip from "./Chip";
import { titleCase } from "../lib/utils";

export default function PickerGrid({ groups, selected, onSelect, filter, disabled }) {
  const q = (filter || "").trim().toLowerCase();
  const matches = (s) => !q || s.toLowerCase().includes(q);

  return (
    <div className="space-y-5">
      {groups.map((g) => {
        const items = g.items.filter(matches);
        if (!items.length) return null;
        return (
          <div key={g.title}>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              {g.title}
            </div>
            <div className="flex flex-wrap gap-2">
              {items.map((it) => (
                <Chip
                  key={it}
                  active={selected?.toLowerCase?.() === it.toLowerCase()}
                  onClick={() => !disabled && onSelect(it)}
                  title={disabled ? "Busy" : ""}
                >
                  {titleCase(it)}
                </Chip>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
