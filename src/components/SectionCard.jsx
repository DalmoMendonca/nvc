import { cx } from "../lib/utils";

export default function SectionCard({ title, subtitle, children, right }) {
  return (
    <section className={cx(
      "rounded-2xl border border-white/10 bg-white/5 shadow-soft",
      "backdrop-blur-xl"
    )}>
      <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
        <div>
          <h2 className="text-base font-medium tracking-tight text-white">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm leading-5 text-white/60">{subtitle}</p>
          ) : null}
        </div>
        {right}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
