import React, { useState } from 'react';

export default function ContentCard({ result }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback copy
      const el = document.createElement('textarea');
      el.value = result.content;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([result.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.platformId}-${result.contentType}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="content-card">
      <div className="content-card-header">
        <div className="content-card-header-left">
          <span className="platform-label">{result.platform}</span>
          <span className="content-type-badge">{result.contentType?.replace(/_/g, ' ')}</span>
          <span className="tone-badge">{result.tone}</span>
        </div>
      </div>
      <div className="content-card-body">
        <pre>{result.content}</pre>
      </div>
      <div className="content-card-footer">
        <span className={`char-count ${!result.withinLimit ? 'over-limit' : ''}`}>
          {result.characterCount} / {result.maxLength} chars
          {!result.withinLimit && ' (over limit!)'}
        </span>
        <div className="content-actions">
          <button className={`btn-action ${copied ? 'copied' : ''}`} onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button className="btn-action" onClick={handleDownload}>
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
