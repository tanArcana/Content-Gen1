const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { generateContent, generateAllPlatforms } = require('../services/contentGenerator');
const { PLATFORMS, UNIVERSAL_TOPICS } = require('../config/platforms');

const router = express.Router();

// In-memory history store (swap for DB in production)
const contentHistory = [];

// GET /api/platforms — list all supported platforms
router.get('/platforms', (req, res) => {
  res.json({
    platforms: Object.values(PLATFORMS),
    topics: UNIVERSAL_TOPICS,
  });
});

// GET /api/platforms/:id — single platform info
router.get('/platforms/:id', (req, res) => {
  const platform = PLATFORMS[req.params.id];
  if (!platform) {
    return res.status(404).json({ error: 'Platform not found' });
  }
  res.json(platform);
});

// POST /api/generate — generate content for a single platform
router.post('/generate', (req, res) => {
  try {
    const { platform, topic, contentType, tone, keywords, customPrompt } = req.body;

    if (!platform || !topic) {
      return res.status(400).json({ error: 'platform and topic are required' });
    }

    const result = generateContent({ platform, topic, contentType, tone, keywords, customPrompt });
    const entry = { id: uuidv4(), ...result };
    contentHistory.unshift(entry);
    if (contentHistory.length > 100) contentHistory.pop();

    res.json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/generate-all — generate content for ALL platforms at once
router.post('/generate-all', (req, res) => {
  try {
    const { topic, tone, keywords, customPrompt } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'topic is required' });
    }

    const results = generateAllPlatforms({ topic, tone, keywords, customPrompt });
    const entry = { id: uuidv4(), topic, generatedAt: new Date().toISOString(), platforms: results };
    contentHistory.unshift(entry);
    if (contentHistory.length > 100) contentHistory.pop();

    res.json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/history — recent generation history
router.get('/history', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  res.json(contentHistory.slice(0, limit));
});

// DELETE /api/history — clear history
router.delete('/history', (req, res) => {
  contentHistory.length = 0;
  res.json({ message: 'History cleared' });
});

module.exports = router;
