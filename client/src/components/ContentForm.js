import React, { useState } from 'react';

export default function ContentForm({
  platforms,
  topics,
  selectedPlatform,
  onGenerate,
  onGenerateAll,
  loading,
}) {
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState('');
  const [tone, setTone] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');

  const platform = platforms.find(p => p.id === selectedPlatform);

  const handleKeywordKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && keywordInput.trim()) {
      e.preventDefault();
      const kw = keywordInput.trim().replace(/,/g, '');
      if (kw && !keywords.includes(kw)) {
        setKeywords(prev => [...prev, kw]);
      }
      setKeywordInput('');
    }
    if (e.key === 'Backspace' && !keywordInput && keywords.length > 0) {
      setKeywords(prev => prev.slice(0, -1));
    }
  };

  const removeKeyword = (kw) => {
    setKeywords(prev => prev.filter(k => k !== kw));
  };

  const handleGenerate = () => {
    if (!topic.trim()) return;
    onGenerate({
      platform: selectedPlatform,
      topic: topic.trim(),
      contentType: contentType || undefined,
      tone: tone || undefined,
      keywords,
      customPrompt: customPrompt.trim() || undefined,
    });
  };

  const handleGenerateAll = () => {
    if (!topic.trim()) return;
    onGenerateAll({
      topic: topic.trim(),
      tone: tone || undefined,
      keywords,
      customPrompt: customPrompt.trim() || undefined,
    });
  };

  return (
    <>
      <div className="control-card">
        <h3>Topic</h3>
        <div className="form-group">
          <input
            type="text"
            placeholder="Enter your topic or subject..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <div className="topic-chips">
          {topics.map(t => (
            <button
              key={t}
              className={`topic-chip ${topic === t ? 'active' : ''}`}
              onClick={() => setTopic(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {platform && (
        <div className="control-card">
          <h3>Content Settings</h3>
          <div className="form-group">
            <label>Content Type</label>
            <select value={contentType} onChange={(e) => setContentType(e.target.value)}>
              <option value="">Default</option>
              {platform.contentTypes.map(ct => (
                <option key={ct} value={ct}>
                  {ct.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Tone</label>
            <select value={tone} onChange={(e) => setTone(e.target.value)}>
              <option value="">Default</option>
              {platform.tones.map(t => (
                <option key={t} value={t}>
                  {t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="control-card">
        <h3>Keywords</h3>
        <div className="keywords-container" onClick={() => document.getElementById('keyword-input')?.focus()}>
          {keywords.map(kw => (
            <span key={kw} className="keyword-tag">
              {kw}
              <button onClick={() => removeKeyword(kw)}>&times;</button>
            </span>
          ))}
          <input
            id="keyword-input"
            type="text"
            placeholder={keywords.length === 0 ? 'Type and press Enter...' : ''}
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={handleKeywordKeyDown}
          />
        </div>
      </div>

      <div className="control-card">
        <h3>Custom Direction (Optional)</h3>
        <textarea
          placeholder="Add specific instructions, brand voice, or context..."
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          rows={3}
        />
      </div>

      <div className="generate-section">
        <button
          className={`btn-generate ${loading ? 'loading' : ''}`}
          onClick={handleGenerate}
          disabled={!topic.trim() || !selectedPlatform || loading}
        >
          Generate for {platform ? platform.name : 'Selected Platform'}
        </button>
        <button
          className={`btn-generate btn-generate-all ${loading ? 'loading' : ''}`}
          onClick={handleGenerateAll}
          disabled={!topic.trim() || loading}
        >
          Generate for ALL Platforms
        </button>
      </div>
    </>
  );
}
