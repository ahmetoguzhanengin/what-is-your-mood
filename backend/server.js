const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Supabase Client - Skip for now (will configure later)
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_URL !== 'your_supabase_url_here') {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
}

// In-memory game storage (in production, use Redis or database)
const games = new Map();
const players = new Map();

// Utility functions
function generateGameCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Sample meme cards and prompts
const SAMPLE_MEMES = [
  { id: '1', image_url: 'https://i.imgflip.com/1bij.jpg', title: 'Success Kid', tags: ['success', 'baby'], is_turkish: false },
  { id: '2', image_url: 'https://i.imgflip.com/30b1gx.jpg', title: 'Drake Pointing', tags: ['choice', 'pointing'], is_turkish: false },
  { id: '3', image_url: 'https://i.imgflip.com/4t0m5.jpg', title: 'Bernie I Am Once Again Asking', tags: ['asking', 'bernie'], is_turkish: false },
  { id: '4', image_url: 'https://i.imgflip.com/1ur9b0.jpg', title: 'Surprised Pikachu', tags: ['surprise', 'pikachu'], is_turkish: false },
  { id: '5', image_url: 'https://i.imgflip.com/23ls.jpg', title: 'Grandma Finds The Internet', tags: ['grandma', 'internet'], is_turkish: false },
];

const SAMPLE_PROMPTS = [
  "Tuvalete gittiğimde benden önce birinin sifonu çekmediğini görmüşümdür.",
  "Arkadaşım bana 'Sadece bir bira içeceğiz' dediğinde...",
  "Pazartesi sabahı alarm çaldığında ruh halim:",
  "Anne babamın beni övdüğünde ben:",
  "Instagram'da eski sevgilimin mutlu fotoğrafını gördüğümde:",
  "Markette alışveriş yaparken kartım çekmediğinde:",
  "Whatsapp'ta 'Konuşmamız lazım' mesajı aldığımda:"
];

// REST API Endpoints
app.post('/api/games', async (req, res) => {
  try {
    const { username } = req.body;
    const gameCode = generateGameCode();
    const gameId = uuidv4();
    const playerId = uuidv4();

    // Create game object
    const game = {
      id: gameId,
      code: gameCode,
      host_id: playerId,
      status: 'waiting',
      current_round: 0,
      max_rounds: 7,
      created_at: new Date().toISOString(),
      players: []
    };

    // Create host player
    const player = {
      id: playerId,
      game_id: gameId,
      username,
      score: 0,
      is_host: true,
      is_connected: true,
      cards: []
    };

    games.set(gameCode, game);
    players.set(playerId, player);
    game.players.push(player);

    res.json({
      success: true,
      gameCode,
      playerId,
      game,
      player
    });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/games/:gameCode/join', async (req, res) => {
  try {
    const { gameCode } = req.params;
    const { username } = req.body;
    
    const game = games.get(gameCode);
    if (!game) {
      return res.status(404).json({ success: false, error: 'Game not found' });
    }

    if (game.status !== 'waiting') {
      return res.status(400).json({ success: false, error: 'Game already started' });
    }

    if (game.players.length >= 8) {
      return res.status(400).json({ success: false, error: 'Game is full' });
    }

    const playerId = uuidv4();
    const player = {
      id: playerId,
      game_id: game.id,
      username,
      score: 0,
      is_host: false,
      is_connected: true,
      cards: []
    };

    players.set(playerId, player);
    game.players.push(player);

    res.json({
      success: true,
      playerId,
      game,
      player
    });
  } catch (error) {
    console.error('Error joining game:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Socket.io Events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_game', ({ gameCode, playerId }) => {
    socket.join(gameCode);
    socket.gameCode = gameCode;
    socket.playerId = playerId;
    
    const game = games.get(gameCode);
    if (game) {
      socket.to(gameCode).emit('player_joined', {
        player: players.get(playerId),
        players: game.players
      });
    }
  });

  socket.on('start_game', () => {
    const { gameCode, playerId } = socket;
    const game = games.get(gameCode);
    const player = players.get(playerId);

    if (!game || !player || !player.is_host) {
      return socket.emit('error', { message: 'Unauthorized' });
    }

    if (game.players.filter(p => p.is_connected).length < 3) {
      return socket.emit('error', { message: 'Need at least 3 players' });
    }

    // Distribute cards to all players
    game.players.forEach(p => {
      p.cards = getRandomMemes(7);
    });

    game.status = 'in_progress';
    game.current_round = 1;

    const firstPrompt = SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];

    io.to(gameCode).emit('game_started', {
      game,
      prompt: firstPrompt,
      round: 1
    });
  });

  socket.on('submit_card', ({ cardId }) => {
    const { gameCode, playerId } = socket;
    const game = games.get(gameCode);
    const player = players.get(playerId);

    if (!game || !player) return;

    // Store submitted card (implement full logic)
    socket.to(gameCode).emit('card_submitted', {
      playerId,
      cardId
    });
  });

  socket.on('disconnect', () => {
    const { gameCode, playerId } = socket;
    if (gameCode && playerId) {
      const player = players.get(playerId);
      if (player) {
        player.is_connected = false;
        socket.to(gameCode).emit('player_left', { playerId });
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

// Utility function to get random memes
function getRandomMemes(count) {
  const shuffled = [...SAMPLE_MEMES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🎮 Game server is ready!`);
}); 