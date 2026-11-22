
import React, { useState } from "react";
import { Send, LoaderCircle } from "lucide-react";


export default function Chat({
  onSubmit,
  loading,
  answer,
}) {
  const [question, setQuestion] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const value = question.trim();
    if (!value || loading) return;

    onSubmit(value);
  }

  return (
    <div className="panel chat-panel">
      <div className="panel-header">
        <h3>Research Assistant</h3>
        <span className="muted">MultiHop-X</span>
      </div>

      <form onSubmit={handleSubmit} className="query-form">
        <textarea
          value={question}
          onChange={(event) =>
            setQuestion(event.target.value)
          }
          placeholder="Ask a complex research question..."
          rows={4}
          maxLength={3000}
          disabled={loading}
        />

        <button
          className="primary-button"
          type="submit"
          disabled={loading || !question.trim()}
        >
          {loading ? (
            <>
              <LoaderCircle className="spin" size={17} />
              Researching...
            </>
          ) : (
            <>
              <Send size={17} />
              Start Research
            </>
          )}
        </button>
      </form>

      <div className="answer-box">
        <h4>Research Answer</h4>

        {answer ? (
          <div className="answer-text">{answer}</div>
        ) : (
          <p className="muted">
            Your source-grounded research answer will appear here.
          </p>
        )}
      </div>
    </div>
  );
}
