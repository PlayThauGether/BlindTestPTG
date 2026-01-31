// server.js - Serveur proxy pour Deezer API
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Activer CORS pour toutes les origines
app.use(cors());
app.use(express.json());

// Route de test
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Quiz Party Proxy Server is running! 🎵',
    endpoints: {
      playlist: '/api/deezer/playlist/:id',
      chart: '/api/deezer/chart'
    }
  });
});

// Route pour récupérer une playlist Deezer
app.get('/api/deezer/playlist/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📥 Fetching playlist ${id}...`);
    
    const response = await fetch(`https://api.deezer.com/playlist/${id}`);
    
    if (!response.ok) {
      throw new Error(`Deezer API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Playlist ${id} fetched successfully`);
    
    res.json(data);
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch playlist',
      message: error.message 
    });
  }
});

// Route pour récupérer le top chart
app.get('/api/deezer/chart', async (req, res) => {
  try {
    console.log('📥 Fetching chart...');
    
    const response = await fetch('https://api.deezer.com/chart/0/tracks?limit=100');
    
    if (!response.ok) {
      throw new Error(`Deezer API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Chart fetched successfully');
    
    res.json(data);
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch chart',
      message: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Export pour Vercel
module.exports = app;
