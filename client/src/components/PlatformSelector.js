import React from 'react';

export default function PlatformSelector({ platforms, selected, onSelect }) {
  return (
    <div className="control-card">
      <h3>Platform</h3>
      <div className="platform-grid">
        {platforms.map(p => (
          <button
            key={p.id}
            className={`platform-btn ${selected === p.id ? 'active' : ''}`}
            onClick={() => onSelect(p.id)}
            title={p.description}
          >
            <span className="platform-icon">{p.icon}</span>
            <span>{p.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
