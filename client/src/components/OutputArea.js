import React from 'react';
import ContentCard from './ContentCard';

export default function OutputArea({ results, onClear }) {
  if (results.length === 0) {
    return (
      <div className="output-area">
        <div className="output-empty">
          <div className="empty-icon">AI</div>
          <h2>Ready to Generate</h2>
          <p>
            Select a platform, enter your topic, and click Generate to create
            AI-powered social media content instantly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="output-area">
      <div className="multi-results-header">
        <h2>Generated Content ({results.length})</h2>
        <button className="btn-action" onClick={onClear}>
          Clear All
        </button>
      </div>
      <div className="results-grid">
        {results.map((result, idx) => (
          <ContentCard key={result.id || idx} result={result} />
        ))}
      </div>
    </div>
  );
}
