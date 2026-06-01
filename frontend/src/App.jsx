import { useState } from "react";
import axios from "axios";

function App() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState("rewrite");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        "http://127.0.0.1:8000/api/rewrite/",
        {
          text,
          mode,
        }
      );

      setResult(res.data.result);
    } catch (error) {
      console.error(error);
      setResult("Error connecting to API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h1>AI Writing Assistant</h1>

      <textarea
        rows="10"
        style={{ width: "100%" }}
        placeholder="Enter your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <br />
      <br />

      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
      >
        <option value="rewrite">Rewrite</option>
        <option value="summarise">Summarise</option>
      </select>

      <br />
      <br />

      <button onClick={submit}>
        {loading ? "Processing..." : "Submit"}
      </button>

      <hr />

      <h2>Result</h2>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "15px",
          minHeight: "100px",
        }}
      >
        {result}
      </div>
    </div>
  );
}

export default App;