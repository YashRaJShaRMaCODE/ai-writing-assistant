import { useRef, useState } from "react";
import axios from "axios";

const MAX_LENGTH = 5000;
const REQUEST_TIMEOUT_MS = 45_000;
const DRAFT_STORAGE_KEY = "clear-writing:draft:v1";
const PREVIOUS_DRAFT_STORAGE_KEY = "clear-writing:previous-draft:v1";
const sampleDrafts = [
  {
    label: "Project update",
    text: "Hi team, the new onboarding flow is ready for review. I’m checking the mobile layout today and will share a link by 4 p.m. Please send any feedback before then.",
  },
  {
    label: "Meeting follow-up",
    text: "Thanks for today’s planning meeting. I’ll update the timeline by Thursday and confirm the open questions with engineering. Could you share the latest pricing note before then?",
  },
];
const API_URL = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "")
  || (import.meta.env.DEV ? "http://127.0.0.1:8000" : "");

function readSessionDraft(key = DRAFT_STORAGE_KEY) {
  try {
    return [...(sessionStorage.getItem(key) || "")].slice(0, MAX_LENGTH).join("");
  } catch {
    return "";
  }
}

function persistSessionDraft(value, key = DRAFT_STORAGE_KEY) {
  try {
    if (value) sessionStorage.setItem(key, value);
    else sessionStorage.removeItem(key);
  } catch {
    // Draft editing remains available when browser storage is disabled or full.
  }
}

function App() {
  const [text, setText] = useState(readSessionDraft);
  const [mode, setMode] = useState("rewrite");
  const [style, setStyle] = useState("clear");
  const [result, setResult] = useState("");
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [previousDraft, setPreviousDraft] = useState(() => readSessionDraft(PREVIOUS_DRAFT_STORAGE_KEY));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [adultConfirmed, setAdultConfirmed] = useState(false);
  const [processingConfirmed, setProcessingConfirmed] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy result");
  const [copyStatus, setCopyStatus] = useState("");
  const textareaRef = useRef(null);
  const characterCount = [...text].length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const submit = async () => {
    if (!API_URL || !text.trim() || characterCount > MAX_LENGTH || !adultConfirmed || !processingConfirmed || loading) return;
    setLoading(true);
    setError("");
    setResult("");
    setComparisonOpen(false);
    setCopyStatus("");

    try {
      const response = await axios.post(`${API_URL}/api/rewrite/`, {
        text, mode, style, adult_confirmed: adultConfirmed, external_processing_confirmed: processingConfirmed,
      }, { timeout: REQUEST_TIMEOUT_MS });
      setResult(response.data.result);
    } catch (requestError) {
      const response = axios.isAxiosError(requestError) ? requestError.response : undefined;
      const code = axios.isAxiosError(requestError) ? requestError.code : undefined;
      const serverMessage = response?.data?.error;
      setError(
        response?.status === 429
          ? "You’ve reached the demo request limit. Try again later; your draft is still here."
          : code === "ECONNABORTED" || code === "ETIMEDOUT"
            ? "The request timed out. Your draft is still here; wait a moment before retrying."
          : (typeof serverMessage === "string" && serverMessage) ||
            (response
              ? "The writing service returned an unexpected response. Try again."
              : "Couldn’t reach the writing service. Check your connection and try again."),
      );
    } finally {
      setLoading(false);
    }
  };

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopyLabel("Copied");
      setCopyStatus("Copied to clipboard.");
      window.setTimeout(() => setCopyLabel("Copy result"), 1600);
    } catch {
      setCopyLabel("Copy unavailable");
      setCopyStatus("Clipboard unavailable. Select and copy the result manually.");
      window.setTimeout(() => setCopyLabel("Copy result"), 1600);
    }
  };

  const updateText = (value) => {
    const nextText = [...value].slice(0, MAX_LENGTH).join("");
    setText(nextText);
    persistSessionDraft(nextText);
    setPreviousDraft("");
    persistSessionDraft("", PREVIOUS_DRAFT_STORAGE_KEY);
    setResult("");
    setComparisonOpen(false);
    setError("");
    setCopyStatus("");
  };

  const updateMode = (value) => {
    setMode(value);
    setResult("");
    setComparisonOpen(false);
    setError("");
  };

  const updateStyle = (value) => {
    setStyle(value);
    setResult("");
    setComparisonOpen(false);
    setError("");
  };

  const useResultAsDraft = () => {
    const nextText = [...result].slice(0, MAX_LENGTH).join("");
    setPreviousDraft(text);
    persistSessionDraft(text, PREVIOUS_DRAFT_STORAGE_KEY);
    setText(nextText);
    persistSessionDraft(nextText);
    setResult("");
    setComparisonOpen(false);
    setError("");
    setCopyStatus("");
    textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    textareaRef.current?.focus({ preventScroll: true });
  };

  const restorePreviousDraft = () => {
    updateText(previousDraft);
    textareaRef.current?.focus({ preventScroll: true });
  };

  const downloadResult = () => {
    const url = URL.createObjectURL(new Blob([result], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "clear-writing-result.txt";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setCopyStatus("Text file download started.");
  };

  const handleEditorKeyDown = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  };

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Clear writing home">
          <span className="brand-mark" aria-hidden="true">W</span>
          <span>Clear writing</span>
        </a>
        <span className="topbar-note">A quieter way to find the right words</span>
        <span className="mode-badge"><span aria-hidden="true" /> Writing studio</span>
      </header>

      <section className="intro" id="top">
        <p className="eyebrow">For work in progress</p>
        <h1>Say it with <em>clarity.</em></h1>
        <p className="intro-copy">Keep your meaning. Lose the friction. Rewrite a draft or find the heart of a longer note.</p>
      </section>

      <section className="workspace" aria-label="Writing workspace">
        <div className="editor-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">01 / Your draft</p>
              <h2>Start with what you have</h2>
            </div>
            {text ? (
              <button className="quiet-button" type="button" disabled={loading} onClick={() => updateText("")}>
                Clear draft
              </button>
            ) : (
              <span className="limit-chip">Up to 5,000 characters</span>
            )}
          </div>

          <label className="field-label" htmlFor="source-text">Text to work on</label>
          <textarea
            id="source-text"
            ref={textareaRef}
            disabled={loading}
            placeholder="Paste a note, message or paragraph…"
            value={text}
            onChange={(event) => updateText(event.target.value)}
            onKeyDown={handleEditorKeyDown}
            aria-describedby="privacy-note character-count keyboard-hint"
          />
          <div className="editor-meta">
            <span>{wordCount.toLocaleString()} {wordCount === 1 ? "word" : "words"}</span>
            <span id="character-count">{characterCount.toLocaleString()} / {MAX_LENGTH.toLocaleString()} characters</span>
            <span id="keyboard-hint">⌘ / Ctrl + Enter to run</span>
          </div>

          {!text && (
            <div className="sample-row" aria-label="Sample drafts">
              <span>Try a sample</span>
              {sampleDrafts.map((sample) => (
                <button key={sample.label} type="button" onClick={() => updateText(sample.text)}>
                  {sample.label}
                </button>
              ))}
            </div>
          )}

          <div className="action-row">
            <div>
              <div className="action-controls">
                <div className="mode-switch" role="group" aria-label="Choose a writing action">
                  <button type="button" disabled={loading} aria-pressed={mode === "rewrite"} onClick={() => updateMode("rewrite")}>Rewrite</button>
                  <button type="button" disabled={loading} aria-pressed={mode === "summarise"} onClick={() => updateMode("summarise")}>Summarise</button>
                </div>
                <label className="style-control">
                  <span>Output tone</span>
                  <select disabled={loading} value={style} onChange={(event) => updateStyle(event.target.value)}>
                    <option value="clear">Clear</option>
                    <option value="warm">Warm</option>
                    <option value="direct">Direct</option>
                    <option value="formal">Formal</option>
                  </select>
                </label>
              </div>
              <p className="mode-hint">
                {mode === "rewrite" ? "Keep the idea. Make the wording clearer." : "Keep the key points. Leave out the extra detail."}
              </p>
            </div>
            <button
              className={`primary-button${loading ? " is-loading" : ""}`}
              type="button"
              onClick={submit}
              disabled={!API_URL || loading || !text.trim() || characterCount > MAX_LENGTH || !adultConfirmed || !processingConfirmed}
            >
              {loading ? "Working…" : mode === "rewrite" ? "Rewrite text" : "Create summary"}
              {!loading && <span aria-hidden="true">↗</span>}
            </button>
          </div>

          {!API_URL && <p className="service-note" role="status">The writing service is unavailable right now. Please try again later.</p>}
          <p className="submit-hint" aria-live="polite">
            {!adultConfirmed ? "Confirm you’re 18 or older to continue." : !processingConfirmed ? "Agree to send the draft to Gemini before continuing." : "Your draft is sent only when you choose Rewrite or Summarise."}
          </p>
          <p className="privacy-note" id="privacy-note">
            Your draft is kept in this browser tab so it can survive a reload; choose Clear draft to remove it. Text is sent to Google Gemini only after you choose an action and confirm processing. Don’t include sensitive or private details. On unpaid API use, Google may use prompts and responses to improve its services and human reviewers may process them. <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noreferrer">Read Gemini’s terms</a>.
          </p>
          <label className="consent-row">
            <input type="checkbox" disabled={loading} checked={adultConfirmed} onChange={(event) => setAdultConfirmed(event.target.checked)} />
            <span>I confirm I’m 18 or older.</span>
          </label>
          <label className="consent-row">
            <input type="checkbox" disabled={loading} checked={processingConfirmed} onChange={(event) => setProcessingConfirmed(event.target.checked)} />
            <span>I agree to send this text to Google Gemini for processing.</span>
          </label>
          {error && <p className="error-message" role="alert">{error}</p>}
        </div>

        <section className="result-panel" aria-labelledby="result-heading" aria-busy={loading}>
          <div className="panel-heading result-heading">
            <div>
              <p className="eyebrow">02 / Review</p>
              <h2 id="result-heading">Your result</h2>
            </div>
          </div>
          <div className={`result-body${result ? " has-result" : ""}`} aria-live="polite">
            {result ? (
              comparisonOpen ? (
                <div className="comparison-view" id="draft-comparison" aria-label="Compare your draft with the result">
                  <article><h3>Original · {wordCount.toLocaleString()} words</h3><p>{text}</p></article>
                  <article><h3>{mode === "rewrite" ? "Rewrite" : "Summary"} · {result.trim().split(/\s+/).length.toLocaleString()} words</h3><p>{result}</p></article>
                </div>
              ) : <p>{result}</p>
            ) : (
              <div className="empty-state">
                <span className="empty-mark" aria-hidden="true">Aa</span>
                <h3>{loading ? "Finding a clearer version" : "Your words, with room to breathe"}</h3>
                <p>{loading ? "This usually takes a few seconds." : "Your rewrite or summary will appear here."}</p>
              </div>
            )}
          </div>
          {(result || previousDraft) && (
            <div className="result-actions">
              {previousDraft && <button className="quiet-button" type="button" onClick={restorePreviousDraft}>Restore previous draft</button>}
              {result && (
                <>
                  <button className="quiet-button" type="button" aria-expanded={comparisonOpen} onClick={() => setComparisonOpen((open) => !open)}>{comparisonOpen ? "Back to result" : "Compare with draft"}</button>
                  <button className="quiet-button" type="button" onClick={useResultAsDraft}>Use as next draft</button>
                  <button className="quiet-button" type="button" onClick={downloadResult}>Download .txt</button>
                  <button className="copy-button" type="button" onClick={copyResult}>{copyLabel}</button>
                </>
              )}
            </div>
          )}
          <span className="visually-hidden" role="status" aria-live="polite">{copyStatus}</span>
          <div className="result-footer">
            <span>AI-generated. Check that it still says what you mean.</span>
            <span>Draft stays in this tab only.</span>
          </div>
        </section>
      </section>

      <footer className="page-footer">
        <span>Clear writing, one pass at a time.</span>
        <span>18+ · Professional use</span>
      </footer>
    </main>
  );
}

export default App;
