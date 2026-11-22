
import { ExternalLink, FileText, ShieldCheck } from "lucide-react";
import React from "react";
export default function Evidence({
  sources = [],
  verification = {},
}) {
  const claims = verification.claims || [];

  return (
    <div className="panel evidence-panel">
      <div className="panel-header">
        <h3>Evidence & Verification</h3>
        <ShieldCheck size={18} />
      </div>

      <div className="trace-section">
        <h4>Retrieved Sources ({sources.length})</h4>

        {sources.length === 0 && (
          <p className="muted">No sources collected yet.</p>
        )}

        <div className="source-list">
          {sources.map((source, index) => (
            <div
              className="source-card"
              key={`${source.citation_id}-${index}`}
            >
              <div className="source-heading">
                <FileText size={15} />
                <strong>
                  {source.source_name || "Untitled"}
                </strong>
              </div>

              <small>
                {source.citation_id} · {source.hop_id}
                {source.page ? ` · Page ${source.page}` : ""}
              </small>

              <p>{source.preview}</p>

              {source.url &&
                /^https?:\/\//i.test(source.url) && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open source <ExternalLink size={13} />
                  </a>
                )}
            </div>
          ))}
        </div>
      </div>

      <div className="trace-section">
        <h4>Claim Verification</h4>

        {claims.length === 0 && (
          <p className="muted">
            Claims will appear after the verifier runs.
          </p>
        )}

        {claims.map((claim, index) => (
          <div className="claim-card" key={index}>
            <span className={`pill ${claim.status}`}>
              {claim.status}
            </span>

            <p>{claim.claim}</p>
            <small>{claim.explanation}</small>

            <div className="citation-tags">
              {(claim.citation_ids || []).map((id) => (
                <span key={id} className="citation-tag">
                  {id}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
