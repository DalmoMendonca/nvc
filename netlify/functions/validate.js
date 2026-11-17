import templeModelControl from "../../temple-model-control.cjs";templeModelControl.configure({ appId: "7b331bb76f6abd4143504cd4a1a17023" }); /**
 * Netlify Functions v2 (ESM) handler.
 * Uses OpenAI Responses API with Structured Outputs to guarantee JSON.
 */
async function templeOriginalhandler(req) {
  if (req.httpMethod !== "POST") {
    return ok({ valid: false, confidence: 0, issues: ["Use POST"], suggestions: [], notes: [] });
  }

  let body;
  try {
    body = JSON.parse(req.body);
  } catch {
    return ok({ valid: false, confidence: 0, issues: ["Invalid JSON body"], suggestions: [], notes: [] });
  }

  const step = body?.step;
  if (!step) {
    return ok({ valid: false, confidence: 0, issues: ["Missing step"], suggestions: [], notes: [] });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return ok({
      valid: false,
      confidence: 0,
      issues: ["Missing OPENAI_API_KEY env var"],
      suggestions: ["Set OPENAI_API_KEY in Netlify environment variables"],
      notes: []
    });
  }

  const input = buildInput(step, body);
  if (!input) {
    return ok({ valid: false, confidence: 0, issues: ["Unknown step"], suggestions: [], notes: [] });
  }

  try {
    const r = await templeModelControl.fetch("netlify/functions/validate", "https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-nano",
        store: false,
        input,
        text: {
          format: {
            type: "json_schema",
            name: "nvc_validation",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                valid: { type: "boolean" },
                confidence: { type: "number" },
                issues: { type: "array", items: { type: "string" } },
                suggestions: { type: "array", items: { type: "string" } },
                notes: { type: "array", items: { type: "string" } }
              },
              required: ["valid", "confidence", "issues", "suggestions", "notes"]
            }
          }
        }
      })
    });

    const data = await r.json();

    if (!r.ok) {
      return ok({
        valid: false,
        confidence: 0,
        issues: ["OpenAI request failed"],
        suggestions: [data?.error?.message || "Unknown OpenAI error"],
        notes: []
      });
    }

    const text = extractText(data);
    const parsed = safeJson(text);

    if (!parsed) {
      return ok({
        valid: false,
        confidence: 0,
        issues: ["Model returned unreadable output"],
        suggestions: ["Try again. If it persists, reduce the input to one sentence."],
        notes: [String(text || "").slice(0, 800)]
      });
    }

    return ok(normalize(parsed));
  } catch (err) {
    console.error("validate error:", err);
    return ok({
      valid: false,
      confidence: 0,
      issues: ["Unexpected server error"],
      suggestions: [String(err?.message || err)],
      notes: []
    });
  }
}export const handler = templeModelControl.wrap(templeModelControl.wrap(templeOriginalhandler));

function ok(obj) {
  return {
    statusCode: 200,
    body: JSON.stringify(obj),
    headers: { "Content-Type": "application/json" }
  };
}

function normalize(x) {
  const conf =
  typeof x.confidence === "number" && Number.isFinite(x.confidence) ?
  x.confidence :
  x.valid ?
  0.75 :
  0.25;

  return {
    valid: !!x.valid,
    confidence: Math.max(0, Math.min(1, conf)),
    issues: Array.isArray(x.issues) ? x.issues.slice(0, 8) : [],
    suggestions: Array.isArray(x.suggestions) ? x.suggestions.slice(0, 10) : [],
    notes: Array.isArray(x.notes) ? x.notes.slice(0, 8) : []
  };
}

function safeJson(s) {
  if (!s) return null;
  const cleaned = String(s).
  trim().
  replace(/^```json\s*/i, "").
  replace(/```\s*$/i, "");

  try {
    return JSON.parse(cleaned);
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      return JSON.parse(m[0]);
    } catch {
      return null;
    }
  }
}

function extractText(j) {
  if (typeof j?.output_text === "string" && j.output_text.trim()) return j.output_text;

  const parts = [];
  const output = Array.isArray(j?.output) ? j.output : [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const c of content) {
      const t = c?.text ?? c?.output_text ?? c?.value;
      if (typeof t === "string" && t.trim()) parts.push(t);
    }
  }
  return parts.join("\n").trim();
}

function buildInput(step, body) {
  const base =
  "You are a Nonviolent Communication (NVC) coach. " +
  "Be gentle, specific, and practical. " +
  "Return JSON that matches the provided schema exactly.";

  const text = String(body?.text || "").trim();

  if (step === "observation") {
    return [
    { role: "system", content: base + " Validate an owned, observable observation." },
    {
      role: "user",
      content:
      "Determine whether the text is an OBSERVATION (camera-capturable; no blame/diagnosis/mind-reading). " +
      "If invalid, suggest 2-4 rewrites that use time/place/words/actions. " +
      "Return valid=false if it contains feelings/needs/interpretations instead of observations.\n\n" +
      `Text: ${text}`
    }];

  }

  if (step === "feeling") {
    const known = Array.isArray(body?.known) ? body.known.slice(0, 600) : [];
    return [
    { role: "system", content: base + " Validate a true feeling (emotion/sensation), not interpretation." },
    {
      role: "user",
      content:
      "Determine whether the text is a FEELING word (emotion/sensation), not a thought, story, or evaluation. " +
      "TRUE FEELINGS are emotions or bodily sensations like: sad, happy, anxious, relieved, angry, calm, frustrated, excited, worried, peaceful, hurt, joyful, scared, content, etc. " +
      "INTERPRETATIONS (not feelings) include: ignored, disrespected, judged, rejected, abandoned, misunderstood, criticized, blamed, etc. " +
      "Any real emotion or bodily sensation is valid. Any interpretation, accusation, or rationalization about what others are doing is not a feeling. " +
      "If it is an interpretation, suggest 3-6 true feelings that might underlie that interpretation. " +
      "If it matches the known feelings list (case-insensitive), it's automatically valid.\n\n" +
      `Text: ${text}\nKnownFeelings: ${known.join(", ")}`
    }];

  }

  if (step === "need") {
    return [
    { role: "system", content: base + " Validate a universal need, not a strategy." },
    {
      role: "user",
      content:
      "Determine whether the text is a NEED (universal human value/need) vs a strategy/demand/outcome. " +
      "TRUE NEEDS are universal human values like: connection, love, belonging, safety, trust, respect, understanding, clarity, autonomy, freedom, peace, joy, meaning, purpose, contribution, growth, learning, rest, nourishment, health, comfort, beauty, harmony, justice, honesty, authenticity, celebration, play, creativity, sex, intimacy, touch, etc. " +
      "STRATEGIES (not needs) are specific outcomes or actions: for you to apologize, for you to listen, to be on time, to clean your room, to pay me back, to finish the project, etc. " +
      "Any real universal human need is valid, even if it seems challenging (like sex, power, control). " +
      "If invalid, suggest 3-6 possibly related universal needs.\n\n" +
      `Text: ${text}`
    }];

  }

  if (step === "request") {
    return [
    { role: "system", content: base + " Validate a clear, doable, time-specific request." },
    {
      role: "user",
      content:
      "Determine whether the text is a REQUEST that is actionable, positively stated, and time-specific. " +
      "If invalid, suggest 1-3 rewrites as a single clear ask with timeframe.\n\n" +
      `Text: ${text}`
    }];

  }

  return null;
}
