import { useState } from "react";
import axios from "axios";

const MAX_LENGTH = 5000;
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function App() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState("rewrite");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [adultConfirmed, setAdultConfirmed] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy result");
  const characterCount = [...text].length;

  const submit = async () => {
    if (!text.trim() || characterCount > MAX_LENGTH || !adultConfirmed || loading) return;
    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await axios.post(`${API_URL}/api/rewrite/`, { text, mode });
      setResult(response.data.result);
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Couldn’t reach the writing service. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopyLabel("Copied");
      window.setTimeout(() => setCopyLabel("Copy result"), 1600);
    } catch {
      setCopyLabel("Copy unavailable");
      window.setTimeout(() => setCopyLabel("Copy result"), 1600);
    }
  };

  const updateText = (value) => {
    setText(value);
    setResult("");
    setError("");
  };

  const updateMode = (value) => {
    setMode(value);
    setResult("");
    setError("");
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
              <p className="eyebrow">Your draft</p>
              <h2>Start with what you have</h2>
            </div>
            <span className="limit-chip">Up to 5,000 characters</span>
          </div>

          <label className="field-label" htmlFor="source-text">Text to work on</label>
          <textarea
            id="source-text"
            maxLength={MAX_LENGTH}
            placeholder="Paste a note, message or paragraph…"
            value={text}
            onChange={(event) => updateText(event.target.value)}
            aria-describedby="privacy-note character-count"
          />
          <div className="editor-meta">
            <span id="character-count">{characterCount.toLocaleString()} / {MAX_LENGTH.toLocaleString()}</span>
            <span>Plain text only</span>
          </div>

          <div className="action-row">
            <div className="mode-switch" role="group" aria-label="Choose a writing action">
              <button type="button" aria-pressed={mode === "rewrite"} onClick={() => updateMode("rewrite")}>Rewrite</button>
              <button type="button" aria-pressed={mode === "summarise"} onClick={() => updateMode("summarise")}>Summarise</button>
            </div>
            <button
              className="primary-button"
              type="button"
              onClick={submit}
              disabled={loading || !text.trim() || characterCount > MAX_LENGTH || !adultConfirmed}
            >
              {loading ? "Working…" : mode === "rewrite" ? "Rewrite text" : "Create summary"}
              {!loading && <span aria-hidden="true">↗</span>}
            </button>
          </div>

          <p className="privacy-note" id="privacy-note">
            Your text is sent to Google Gemini for processing. Don’t include sensitive or private details. On unpaid API use, Google may use prompts and responses to improve its services and human reviewers may process them. <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noreferrer">Read Gemini’s terms</a>.
          </p>
          <label className="consent-row">
            <input type="checkbox" checked={adultConfirmed} onChange={(event) => setAdultConfirmed(event.target.checked)} />
            <span>I’m 18 or older and understand my text is sent to Google Gemini.</span>
          </label>
          {error && <p className="error-message" role="alert">{error}</p>}
        </div>

        <section className="result-panel" aria-labelledby="result-heading" aria-busy={loading}>
          <div className="panel-heading result-heading">
            <div>
              <p className="eyebrow">The next draft</p>
              <h2 id="result-heading">Your result</h2>
            </div>
            {result && <button className="copy-button" type="button" onClick={copyResult}>{copyLabel}</button>}
          </div>
          <div className={`result-body${result ? " has-result" : ""}`} aria-live="polite">
            {result ? (
              <p>{result}</p>
            ) : (
              <div className="empty-state">
                <span className="empty-mark" aria-hidden="true">Aa</span>
                <h3>{loading ? "Finding a clearer version" : "Your words, with room to breathe"}</h3>
                <p>{loading ? "This usually takes a few seconds." : "Your rewrite or summary will appear here."}</p>
              </div>
            )}
          </div>
          <div className="result-footer">
            <span>AI-generated. Review before you share.</span>
            <span>Nothing is saved by this app.</span>
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
