import React, { useMemo, useState } from "react";
import { validateStep } from "./lib/api";
import { FEELING_GROUPS } from "./data/feelings";
import { NEED_GROUPS } from "./data/needs";
import Modal from "./components/Modal";
import PickerGrid from "./components/PickerGrid";
import { cx } from "./lib/utils";

function IconButton({ label, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
    >
      ?
    </button>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600">
      {children}
    </span>
  );
}

function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition",
        disabled ? "cursor-not-allowed opacity-50" : "hover:opacity-95",
        "bg-brand-500 text-white shadow-softer"
      )}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm transition",
        "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      {children}
    </button>
  );
}

function InlineHint({ kind, title, lines, report }) {
  if (!report) return null;
  
  // If it's a pass, show only "Good!"
  if (report.valid) {
    return (
      <div className="mt-4 glass rounded-2xl p-4 border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 animate-slide-up">
        <div className="flex items-center gap-2 text-emerald-800 font-semibold">
          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          Good!
        </div>
      </div>
    );
  }

  const issues = report.issues || [];
  const suggestions = report.suggestions || [];
  const hasContent = issues.length > 0 || suggestions.length > 0;

  if (!hasContent) return null;

  return (
    <div className="mt-4 glass rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 animate-slide-up">
      <div className="p-4">
        {issues.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 font-semibold text-amber-900 mb-3">
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              Notes:
            </div>
            <ul className="space-y-2">
              {issues.map((x, i) => (
                <li key={i} className="text-amber-800 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0"></span>
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {suggestions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 font-semibold text-amber-900 mb-3">
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              Suggestions:
            </div>
            <ul className="space-y-2">
              {suggestions.map((x, i) => (
                <li key={i} className="text-amber-800 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0"></span>
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function StepDots({ current, total }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cx(
            "h-2 w-2 rounded-full",
            i === current ? "bg-brand-500" : "bg-zinc-300"
          )}
        />
      ))}
    </div>
  );
}

export default function App() {
  const steps = [
    {
      key: "observation",
      title: "Observation",
      helper: "Concrete and specific. Stick to what a camera could capture.",
    },
    {
      key: "feeling",
      title: "Feeling",
      helper: "An emotion or bodily sensation — not a judgment, story, or interpretation.",
    },
    {
      key: "need",
      title: "Need",
      helper: "A universal value/need underneath — not a strategy or a demand.",
    },
    {
      key: "request",
      title: "Request",
      helper: "A clear, doable ask with a timeframe. Not a demand.",
    },
  ];

  const [aboutOpen, setAboutOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const [observation, setObservation] = useState("");
  const [feeling, setFeeling] = useState("");
  const [need, setNeed] = useState("");
  const [request, setRequest] = useState("");

  const [feelingSource, setFeelingSource] = useState("text"); // text|list
  const [needSource, setNeedSource] = useState("text"); // text|list

  const [report, setReport] = useState(null);
  const [passed, setPassed] = useState({
    observation: false,
    feeling: false,
    need: false,
    request: false,
  });
  const [ofnrMode, setOfnrMode] = useState(false);
  const [polishedOfnr, setPolishedOfnr] = useState("");

  const [feelingQuery, setFeelingQuery] = useState("");
  const [needQuery, setNeedQuery] = useState("");

  const current = steps[stepIndex];

  const draft = useMemo(() => {
    const o = observation.trim();
    const f = feeling.trim();
    const n = need.trim();
    const r = request.trim();
    const lines = [];
    if (o) lines.push(`Observation: ${o}`);
    if (f) lines.push(`Feeling: I feel ${f}`);
    if (n) lines.push(`Need: because I need ${n}`);
    if (r) lines.push(`Request: Would you be willing to ${r}?`);
    return lines.join("\n");
  }, [observation, feeling, need, request]);

  const currentValue = () => {
    if (current.key === "observation") return observation;
    if (current.key === "feeling") return feeling;
    if (current.key === "need") return need;
    return request;
  };

  const setCurrentValue = (v) => {
    if (current.key === "observation") setObservation(v);
    else if (current.key === "feeling") setFeeling(v);
    else if (current.key === "need") setNeed(v);
    else setRequest(v);
  };

  const isFreeTextStep = () => {
    if (current.key === "feeling") return feelingSource === "text";
    if (current.key === "need") return needSource === "text";
    return true;
  };

  const stepPassed = passed[current.key];

  async function check() {
    setBusy(true);
    setReport(null);
    
    // If this is a list selection, auto-approve without API call
    if ((current.key === "feeling" && feelingSource === "list") || 
        (current.key === "need" && needSource === "list")) {
      setReport({
        valid: true,
        issues: [],
        suggestions: [],
        notes: []
      });
      setPassed((p) => ({ ...p, [current.key]: true }));
      setBusy(false);
      return;
    }
    
    try {
      const payload = { text: currentValue() };
      if (current.key === "feeling") payload.known = flattenFeelings();
      const data = await validateStep(current.key, payload);
      setReport(data);
      setPassed((p) => ({ ...p, [current.key]: !!data?.valid }));
    } catch (e) {
      setReport({
        valid: false,
        issues: ["The checker failed to respond."],
        suggestions: [String(e.message || e)],
      });
      setPassed((p) => ({ ...p, [current.key]: false }));
    } finally {
      setBusy(false);
    }
  }

  function next() {
    setReport(null);
    // If we're on the request step and it passed, enter OFNR mode
    if (current.key === "request" && passed.request) {
      setOfnrMode(true);
    } else {
      const nxt = Math.min(stepIndex + 1, steps.length - 1);
      setStepIndex(nxt);
    }
  }

  function back() {
    setReport(null);
    const prev = Math.max(stepIndex - 1, 0);
    setStepIndex(prev);
  }

  function resetAll() {
    setStepIndex(0);
    setObservation("");
    setFeeling("");
    setNeed("");
    setRequest("");
    setFeelingSource("text");
    setNeedSource("text");
    setFeelingQuery("");
    setNeedQuery("");
    setReport(null);
    setPassed({ observation: false, feeling: false, need: false, request: false });
    setOfnrMode(false);
    setPolishedOfnr("");
  }

  function onEdit(v) {
    setCurrentValue(v);
    setReport(null);
    setPassed((p) => ({ ...p, [current.key]: false }));
    if (current.key === "feeling") setFeelingSource("text");
    if (current.key === "need") setNeedSource("text");
  }

  function selectFeelingFromList(x) {
    setFeeling(x);
    setFeelingSource("list");
    setReport(null);
    setPassed((p) => ({ ...p, feeling: true }));
  }

  function selectNeedFromList(x) {
    setNeed(x);
    setNeedSource("list");
    setReport(null);
    setPassed((p) => ({ ...p, need: true }));
  }

  const primaryLabel = (() => {
    if (!currentValue().trim()) return "Check";
    if (!isFreeTextStep()) return "Next";
    return stepPassed ? "Next" : "Check";
  })();

  const primaryDisabled = !currentValue().trim() || busy;

  async function onPrimary() {
    if (primaryLabel === "Check") await check();
    else next();
  }

  async function generateOFNR() {
    setBusy(true);
    try {
      const response = await fetch("/.netlify/functions/generate-ofnr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft }),
      });
      
      if (!response.ok) throw new Error("Generation failed");
      
      const data = await response.json();
      setPolishedOfnr(data.polished || "Failed to generate polished version.");
    } catch (e) {
      setPolishedOfnr(`Error: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-100 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="mb-12 text-center animate-slide-up">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="px-4 py-2 rounded-full glass text-xs font-semibold text-teal-800 tracking-wider uppercase">
              NONVIOLENT COMMUNICATION
            </div>
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 animate-pulse"></div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
            Practice the OFNR Model
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 leading-relaxed">
            Write your best attempt for each step, then press{" "}
            <span className="font-semibold text-teal-600">Check</span> for feedback and watch your NVC skills transform.
          </p>
        </header>

        <div className="flex items-center justify-end gap-4 mb-8">
          <button
            type="button"
            aria-label="About NVC"
            title="About NVC"
            onClick={() => setAboutOpen(true)}
            className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-600 hover:text-teal-600 btn-magical tooltip-magical"
            data-tooltip="Learn about NVC"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={resetAll}
            className="px-6 py-3 rounded-full glass text-gray-700 hover:text-teal-600 font-medium btn-magical"
          >
            Start over
          </button>
        </div>

        {ofnrMode ? (
          <div className="animate-slide-up">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 animate-pulse"></div>
                <div className="text-lg font-semibold text-gray-800">Complete Draft</div>
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 animate-pulse"></div>
              </div>
              <p className="text-gray-600">Your OFNR statement is ready to be polished ✨</p>
            </div>

            <div className="glass rounded-3xl p-8 card-magical">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Your Draft</h2>
              </div>
              
              <div className="whitespace-pre-wrap rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-6 text-gray-800 mb-8 border border-purple-100">
                {draft}
              </div>
              
              {!polishedOfnr ? (
                <div className="text-center">
                  <button
                    onClick={generateOFNR}
                    disabled={busy}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold btn-magical disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    {busy ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Generate OFNR
                      </span>
                    )}
                  </button>
                </div>
              ) : (
                <div className="animate-slide-up">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Polished OFNR Statement</h2>
                  </div>
                  
                  <div className="whitespace-pre-wrap rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 p-6 text-emerald-900 mb-6 border border-emerald-200">
                    {polishedOfnr}
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(polishedOfnr);
                        } catch {}
                      }}
                      className="px-6 py-3 glass text-gray-700 hover:text-emerald-600 font-medium btn-magical"
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Polished
                      </span>
                    </button>
                    <button
                      onClick={() => setPolishedOfnr("")}
                      className="px-6 py-3 glass text-gray-700 hover:text-purple-600 font-medium btn-magical"
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Regenerate
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="animate-slide-up">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {steps.map((_, i) => (
                    <div key={i} className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          i === stepIndex 
                            ? 'bg-gradient-to-r from-purple-400 to-pink-400 step-dot active' 
                            : i < stepIndex 
                            ? 'bg-emerald-400' 
                            : 'bg-gray-300'
                        }`}
                      />
                      {i < steps.length - 1 && (
                        <div className={`w-8 h-0.5 transition-all duration-300 ${
                          i < stepIndex ? 'bg-emerald-400' : 'bg-gray-300'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  Step {stepIndex + 1} of {steps.length}
                </div>
              </div>
            </div>

            <div className="glass rounded-3xl p-8 card-magical">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
                <div>
                  <div className="text-2xl font-bold text-gray-800 mb-2">{current.title}</div>
                  <div className="text-gray-600">{current.helper}</div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={back}
                    disabled={stepIndex === 0 || busy}
                    className="px-6 py-3 glass text-gray-700 hover:text-purple-600 font-medium btn-magical disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Back
                  </button>
                  <button
                    onClick={onPrimary}
                    disabled={primaryDisabled}
                    className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold btn-magical disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    {busy ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Checking…
                      </span>
                    ) : (
                      primaryLabel
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-6">
              {current.key === "observation" ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Write your observation
                  </label>
                  <textarea
                    value={observation}
                    onChange={(e) => {
                      if (e.target.value.length <= 200) {
                        onEdit(e.target.value);
                      }
                    }}
                    placeholder='Example: "When we agreed to start at 9:00 and the meeting began at 9:20..."'
                    className="w-full min-h-[140px] resize-none rounded-2xl glass px-6 py-4 text-gray-800 placeholder-gray-500 input-magical focus-magical"
                    maxLength={200}
                  />
                  <div className="mt-3 text-sm text-gray-600 flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Try: time, place, words said, actions taken. Avoid: "always/never", labels, motives.
                  </div>
                  {isFreeTextStep() && current.key === "observation" ? (
                    <InlineHint
                      kind={report?.valid ? "pass" : report ? "fail" : null}
                      title={report ? (report.valid ? "Pass" : "Notes") : null}
                      report={report}
                    />
                  ) : null}
                </div>
              ) : null}

              {current.key === "feeling" ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Your feeling
                    </label>
                    <input
                      value={feeling}
                      onChange={(e) => {
                        if (e.target.value.length <= 200) {
                          onEdit(e.target.value);
                        }
                      }}
                      placeholder='Example: "anxious", "sad", "relieved"'
                      className="w-full rounded-2xl glass px-6 py-4 text-gray-800 placeholder-gray-500 input-magical focus-magical"
                      maxLength={200}
                    />
                    <div className="mt-3 text-sm text-gray-600 flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      If you type something like "ignored" or "disrespected", the checker will treat it as interpretation and suggest true feelings.
                    </div>
                    {isFreeTextStep() && feelingSource === "text" ? (
                      <InlineHint
                        kind={report?.valid ? "pass" : report ? "fail" : null}
                        title={report ? (report.valid ? "Pass" : "Notes") : null}
                        report={report}
                      />
                    ) : null}
                  </div>

                  <div className="glass rounded-2xl p-6">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        Pick from a feelings list
                      </div>
                      <input
                        value={feelingQuery}
                        onChange={(e) => setFeelingQuery(e.target.value)}
                        placeholder="Search…"
                        className="w-48 rounded-xl glass px-4 py-2 text-sm text-gray-800 placeholder-gray-500 input-magical focus-magical"
                      />
                    </div>
                    <PickerGrid
                      groups={FEELING_GROUPS}
                      selected={feeling}
                      onSelect={(x) => selectFeelingFromList(x)}
                      filter={feelingQuery}
                      disabled={busy}
                    />
                  </div>
                </div>
              ) : null}

              {current.key === "need" ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Your need
                    </label>
                    <input
                      value={need}
                      onChange={(e) => {
                        if (e.target.value.length <= 200) {
                          onEdit(e.target.value);
                        }
                      }}
                      placeholder='Example: "clarity", "trust", "rest", "connection"'
                      className="w-full rounded-2xl glass px-6 py-4 text-gray-800 placeholder-gray-500 input-magical focus-magical"
                      maxLength={200}
                    />
                    <div className="mt-3 text-sm text-gray-600 flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Needs are universal values. Strategies are specific outcomes (e.g., "for you to apologize").
                    </div>
                    {isFreeTextStep() && needSource === "text" ? (
                      <InlineHint
                        kind={report?.valid ? "pass" : report ? "fail" : null}
                        title={report ? (report.valid ? "Pass" : "Notes") : null}
                        report={report}
                      />
                    ) : null}
                  </div>

                  <div className="glass rounded-2xl p-6">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        Pick from a needs list
                      </div>
                      <input
                        value={needQuery}
                        onChange={(e) => setNeedQuery(e.target.value)}
                        placeholder="Search…"
                        className="w-48 rounded-xl glass px-4 py-2 text-sm text-gray-800 placeholder-gray-500 input-magical focus-magical"
                      />
                    </div>
                    <PickerGrid
                      groups={NEED_GROUPS}
                      selected={need}
                      onSelect={(x) => selectNeedFromList(x)}
                      filter={needQuery}
                      disabled={busy}
                    />
                  </div>
                </div>
              ) : null}

              {current.key === "request" ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Your request
                  </label>
                  <textarea
                    value={request}
                    onChange={(e) => {
                      if (e.target.value.length <= 200) {
                        onEdit(e.target.value);
                      }
                    }}
                    placeholder='Example: "Would you be willing to start at 9:00 tomorrow, or message me by 8:45 if you&#39;ll be late?"'
                    className="w-full min-h-[140px] resize-none rounded-2xl glass px-6 py-4 text-gray-800 placeholder-gray-500 input-magical focus-magical"
                    maxLength={200}
                  />
                  <div className="mt-3 text-sm text-gray-600 flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Make it doable, time-specific, and positively stated. One ask is better than five.
                  </div>
                  {isFreeTextStep() ? (
                    <InlineHint
                      kind={report?.valid ? "pass" : report ? "fail" : null}
                      title={report ? (report.valid ? "Pass" : "Notes") : null}
                      report={report}
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-softer">
            <div className="text-sm font-semibold text-zinc-900">Draft</div>
            <div className="mt-2 whitespace-pre-wrap rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800">
              {draft || "As you complete steps, your draft will appear here."}
            </div>
            <div className="mt-3 flex gap-2">
              <SecondaryButton
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(draft);
                  } catch {}
                }}
                disabled={!draft}
              >
                Copy
              </SecondaryButton>
              <div className="flex-1" />
            </div>
          </div>
        </div>
        )}

        <footer className="mt-10 flex items-center justify-center py-6 text-sm text-zinc-500">
          Made with ❤️ |&nbsp;<a href="https://hiredalmo.com" target="_blank" rel="noopener noreferrer">hiredalmo.com</a>
        </footer>
      </div>

      <Modal open={aboutOpen} title="About NVC" onClose={() => setAboutOpen(false)}>
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Understanding NVC</h3>
          </div>
          
          <p className="text-gray-600 leading-relaxed">
            Nonviolent Communication (NVC) helps you speak truth without blame and listen without defense.
            A common practice structure is <span className="font-semibold text-purple-600">OFNR</span>:
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">O</span>
              </div>
              <div>
                <span className="font-semibold text-gray-800">Observation:</span>{" "}
                <span className="text-gray-600">what happened, in concrete terms.</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">F</span>
              </div>
              <div>
                <span className="font-semibold text-gray-800">Feeling:</span>{" "}
                <span className="text-gray-600">what you feel (emotion/sensation), not a story.</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">N</span>
              </div>
              <div>
                <span className="font-semibold text-gray-800">Need:</span>{" "}
                <span className="text-gray-600">what matters underneath (a universal value/need).</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">R</span>
              </div>
              <div>
                <span className="font-semibold text-gray-800">Request:</span>{" "}
                <span className="text-gray-600">a clear, doable ask with a timeframe.</span>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <p className="text-gray-600 leading-relaxed">
              This app helps you practice this model. Write your best attempt, then press{" "}
              <span className="font-semibold text-purple-600">Check</span> to get feedback and{" "}
              <span className="font-semibold text-purple-600">Next</span> to advance.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );

  function flattenFeelings() {
    return FEELING_GROUPS.flatMap((g) => g.items).map((s) => s.toLowerCase());
  }
}
