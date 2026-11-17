import templeModelControl from "../../temple-model-control.cjs";templeModelControl.configure({ appId: "7b331bb76f6abd4143504cd4a1a17023" }); /**
 * Netlify Functions v2 (ESM) handler.
 * Uses OpenAI Responses API to polish OFNR draft without altering specifics.
 */
async function templeOriginalhandler(req) {
  if (req.httpMethod !== "POST") {
    return ok({ error: "Use POST" });
  }

  let body;
  try {
    body = JSON.parse(req.body);
  } catch {
    return ok({ error: "Invalid JSON body" });
  }

  const draft = body?.draft;
  if (!draft) {
    return ok({ error: "Missing draft" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return ok({ error: "Missing OPENAI_API_KEY env var" });
  }

  try {
    const r = await templeModelControl.fetch("netlify/functions/generate-ofnr", "https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5-nano",
        store: false,
        input: [
        {
          role: "system",
          content:
          "You are a Nonviolent Communication (NVC) coach. " +
          "Your task is to polish a completed OFNR draft into 1-3 cohesive, natural-sounding statements. " +
          "DO NOT alter the specific content, facts, feelings, needs, or requests. " +
          "Simply rephrase and connect the elements into flowing, authentic language. " +
          "Return only the polished statement, no explanations."
        },
        {
          role: "user",
          content: `Polish this OFNR draft into natural, cohesive language:\n\n${draft}`
        }],

        text: {
          format: {
            type: "json_schema",
            name: "ofnr_polish",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                polished: { type: "string" }
              },
              required: ["polished"]
            }
          }
        }
      })
    });

    const data = await r.json();

    if (!r.ok) {
      return ok({ error: "OpenAI request failed", details: data?.error?.message });
    }

    const text = extractText(data);
    const parsed = safeJson(text);

    if (!parsed) {
      return ok({ error: "Model returned unreadable output", raw: String(text || "").slice(0, 800) });
    }

    return ok({ polished: parsed.polished || "Failed to generate polished version." });
  } catch (err) {
    console.error("generate-ofnr error:", err);
    return ok({ error: "Unexpected server error", details: String(err?.message || err) });
  }
}export const handler = templeModelControl.wrap(templeModelControl.wrap(templeOriginalhandler));

function ok(obj) {
  return {
    statusCode: 200,
    body: JSON.stringify(obj),
    headers: { "Content-Type": "application/json" }
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
