export function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function titleCase(s) {
  return (s || "")
    .split(" ")
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}
