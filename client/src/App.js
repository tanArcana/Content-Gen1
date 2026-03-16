import React, { useState } from 'react';
import './styles/index.css';
import Header from './components/Header';
import PlatformSelector from './components/PlatformSelector';
import ContentForm from './components/ContentForm';
import OutputArea from './components/OutputArea';
import { useContentGenerator } from './hooks/useContentGenerator';

export default function App() {
  const [selectedPlatform, setSelectedPlatform] = useState('twitter');
  const {
    platforms,
    topics,
    loading,
    error,
    results,
    generate,
    generateAll,
    clearResults,
    clearError,
  } = useContentGenerator();

  return (
    <div className="app">
      <Header />
      <main className="main">
        <aside className="controls">
          <PlatformSelector
            platforms={platforms}
            selected={selectedPlatform}
            onSelect={setSelectedPlatform}
          />
          <ContentForm
            platforms={platforms}
            topics={topics}
            selectedPlatform={selectedPlatform}
            onGenerate={generate}
            onGenerateAll={generateAll}
            loading={loading}
          />
          {error && (
            <div className="control-card" style={{ borderColor: 'var(--error)' }}>
              <p style={{ color: 'var(--error)', fontSize: '0.85rem' }}>{error}</p>
              <button className="btn-action" onClick={clearError} style={{ marginTop: '0.5rem' }}>
                Dismiss
              </button>
            </div>
          )}
        </aside>
        <section>
          <OutputArea results={results} onClear={clearResults} />
        </section>
      </main>
    </div>
  );
}
