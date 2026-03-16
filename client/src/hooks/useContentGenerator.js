import { useState, useEffect, useCallback } from 'react';

const API_BASE = '/api';

export function useContentGenerator() {
  const [platforms, setPlatforms] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);

  // Fetch available platforms on mount
  useEffect(() => {
    fetch(`${API_BASE}/platforms`)
      .then(res => res.json())
      .then(data => {
        setPlatforms(data.platforms || []);
        setTopics(data.topics || []);
      })
      .catch(err => setError('Failed to load platforms'));
  }, []);

  // Generate content for a single platform
  const generate = useCallback(async ({ platform, topic, contentType, tone, keywords, customPrompt }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, topic, contentType, tone, keywords, customPrompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setResults(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate content for ALL platforms
  const generateAll = useCallback(async ({ topic, tone, keywords, customPrompt }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/generate-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, tone, keywords, customPrompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      // Flatten platform results into the results list
      const platformResults = Object.values(data.platforms).filter(r => !r.error);
      setResults(prev => [...platformResults, ...prev]);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => setResults([]), []);
  const clearError = useCallback(() => setError(null), []);

  return {
    platforms,
    topics,
    loading,
    error,
    results,
    history,
    generate,
    generateAll,
    clearResults,
    clearError,
  };
}
