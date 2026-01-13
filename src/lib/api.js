const DEFAULT_BASE = "";

/**
 * Calls Netlify Function at /.netlify/functions/validate
 * You can override base in local non-netlify dev by setting VITE_FUNCTIONS_BASE.
 */
export async function validateStep(step, payload) {
  const base = import.meta.env.VITE_FUNCTIONS_BASE || DEFAULT_BASE;
  const res = await fetch(`${base}/.netlify/functions/validate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ step, ...payload })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}
