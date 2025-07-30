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

// Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Admin Supabase Client (for operations that bypass RLS)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Real-time game state will be managed through Supabase database

// Utility functions
async function generateUniqueGameCode() {
  let code;
  let isUnique = false;
  
  while (!isUnique) {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { data } = await supabase
      .from('games')
      .select('id')
      .eq('code', code)
      .single();
    
    if (!data) {
      isUnique = true;
    }
  }
  
  return code;
}

// Meme cards and prompts are now stored in Supabase database

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'No authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Authentication failed' });
  }
};

// REST API Endpoints

// Authentication Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Check if username is available
    const { data: existingUser } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();

    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Username already taken' });
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({ success: false, error: authError.message });
    }

    // Always create profile on signup
    if (authData.user) {
      console.log('Creating user profile for:', authData.user.id, username);
      await createUserProfile(authData.user.id, username);
    }

    res.json({
      success: true,
      user: authData.user,
      session: authData.session,
      message: 'Please check your email to confirm your account'
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    // Get user profile
    let { data: userProfile } = await supabase
      .from('users')
      .select(`
        *,
        user_stats (*)
      `)
      .eq('id', data.user.id)
      .single();

    // If no profile exists, create one
    if (!userProfile) {
      console.log('No profile found for user, creating one...');
      // Use username from email (temporary solution)
      const username = email.split('@')[0];
      await createUserProfile(data.user.id, username);
      
      // Fetch the newly created profile
      const { data: newProfile } = await supabaseAdmin
        .from('users')
        .select(`
          *,
          user_stats (*)
        `)
        .eq('id', data.user.id)
        .single();
      
      userProfile = newProfile;
    }

    res.json({
      success: true,
      user: data.user,
      session: data.session,
      profile: userProfile
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/signout', authenticateUser, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.json({ success: true, message: 'Signed out successfully' });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get current user profile
app.get('/api/auth/me', authenticateUser, async (req, res) => {
  try {
    const { data: userProfile } = await supabase
      .from('users')
      .select(`
        *,
        user_stats (*)
      `)
      .eq('id', req.user.id)
      .single();

    res.json({
      success: true,
      user: req.user,
      profile: userProfile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function to create user profile
async function createUserProfile(userId, username) {
  try {
    console.log('Creating user profile with admin client...');
    
    // Create user profile
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        username: username,
        display_name: username
      })
      .select()
      .single();
    
    if (userError) {
      console.error('Error creating user:', userError);
      throw userError;
    }
    
    console.log('User created successfully:', user);
    
    // Create user stats
    const { data: stats, error: statsError } = await supabaseAdmin
      .from('user_stats')
      .insert({
        user_id: userId
      })
      .select()
      .single();
    
    if (statsError) {
      console.error('Error creating user stats:', statsError);
      throw statsError;
    }
    
    console.log('User stats created successfully:', stats);
    return { user, stats };
  } catch (error) {
    console.error('createUserProfile error:', error);
    throw error;
  }
}

// Create Game
app.post('/api/games', authenticateUser, async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user.id;

    // User should already exist from auth endpoint
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'User profile not found. Please log out and sign in again.' 
      });
    }

    // Generate unique game code
    const gameCode = await generateUniqueGameCode();

    // Create game
    const { data: game, error: gameError } = await supabase
      .from('games')
      .insert({
        code: gameCode,
        host_id: userId,
        status: 'waiting',
        current_round: 0,
        max_rounds: 7
      })
      .select()
      .single();

    if (gameError) throw gameError;

    // Create player (host)
    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({
        user_id: userId,
        game_id: game.id,
        score: 0,
        is_host: true,
        is_connected: true
      })
      .select(`
        *,
        users:user_id (username, display_name, avatar_url)
      `)
      .single();

    if (playerError) throw playerError;

    // Get game with players for response
    const { data: gameWithPlayers } = await supabase
      .from('games')
      .select(`
        *,
        players (
          *,
          users:user_id (username, display_name, avatar_url)
        )
      `)
      .eq('id', game.id)
      .single();

    res.json({
      success: true,
      gameCode: game.code,
      playerId: player.id,
      game: gameWithPlayers,
      player
    });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Join Game
app.post('/api/games/:gameCode/join', authenticateUser, async (req, res) => {
  try {
    const { gameCode } = req.params;
    const { username } = req.body;
    const userId = req.user.id;

    // User should already exist from auth endpoint
    // If not, that means there's an auth issue
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'User profile not found. Please log out and sign in again.' 
      });
    }

    // Find game
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select(`
        *,
        players (
          *,
          users:user_id (username, display_name, avatar_url)
        )
      `)
      .eq('code', gameCode)
      .single();

    if (gameError || !game) {
      return res.status(404).json({ success: false, error: 'Game not found' });
    }

    if (game.status !== 'waiting') {
      return res.status(400).json({ success: false, error: 'Game already started' });
    }

    if (game.players.length >= (game.max_players || 8)) {
      return res.status(400).json({ success: false, error: 'Game is full' });
    }

    // Check if user already in game
    const existingPlayer = game.players.find(p => p.user_id === userId);
    if (existingPlayer) {
      return res.status(400).json({ success: false, error: 'Already in this game' });
    }

    // Create player
    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({
        user_id: userId,
        game_id: game.id,
        score: 0,
        is_host: false,
        is_connected: true
      })
      .select(`
        *,
        users:user_id (username, display_name, avatar_url)
      `)
      .single();

    if (playerError) throw playerError;

    // Get updated game with all players
    const { data: updatedGame } = await supabase
      .from('games')
      .select(`
        *,
        players (
          *,
          users:user_id (username, display_name, avatar_url)
        )
      `)
      .eq('id', game.id)
      .single();

    res.json({
      success: true,
      playerId: player.id,
      game: updatedGame,
      player
    });
  } catch (error) {
    console.error('Error joining game:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Socket.io Events with Supabase
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_game', async ({ gameCode, userId }) => {
    try {
      socket.join(gameCode);
      socket.gameCode = gameCode;
      socket.userId = userId;
      
      // Update player connection status
      await supabase
        .from('players')
        .update({ is_connected: true })
        .eq('user_id', userId)
        .eq('game_id', (
          await supabase
            .from('games')
            .select('id')
            .eq('code', gameCode)
            .single()
        ).data?.id);

      // Get updated game with players
      const { data: game } = await supabase
        .from('games')
        .select(`
          *,
          players (
            *,
            users:user_id (username, display_name, avatar_url)
          )
        `)
        .eq('code', gameCode)
        .single();

      socket.to(gameCode).emit('player_joined', {
        players: game.players
      });
    } catch (error) {
      console.error('Join game error:', error);
      socket.emit('error', { message: 'Failed to join game' });
    }
  });

  socket.on('start_game', async () => {
    try {
      const { gameCode, userId } = socket;
      
      // Get game and check if user is host
      const { data: game } = await supabase
        .from('games')
        .select(`
          *,
          players (
            *,
            users:user_id (username, display_name, avatar_url)
          )
        `)
        .eq('code', gameCode)
        .single();

      const player = game.players.find(p => p.user_id === userId);
      
      if (!game || !player || !player.is_host) {
        return socket.emit('error', { message: 'Unauthorized' });
      }

      const connectedPlayers = game.players.filter(p => p.is_connected);
      if (connectedPlayers.length < 3) {
        return socket.emit('error', { message: 'Need at least 3 players' });
      }

      // Get random meme cards for each player
      const { data: allMemes } = await supabase
        .from('meme_cards')
        .select('*')
        .limit(100);

      // Get random prompt
      const { data: prompts } = await supabase
        .from('prompts')
        .select('*')
        .eq('is_turkish', true);
      
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

      // Update game status and create first round
      await supabase
        .from('games')
        .update({ 
          status: 'in_progress',
          current_round: 1,
          started_at: new Date().toISOString()
        })
        .eq('id', game.id);

      // Create first round
      console.log('🎯 Creating round with prompt:', randomPrompt);
      console.log('🎯 Game ID:', game.id);
      
      const { data: gameRound, error: roundError } = await supabaseAdmin
        .from('game_rounds')
        .insert({
          game_id: game.id,
          round_number: 1,
          prompt_id: randomPrompt.id,
          prompt_text: randomPrompt.text,
          status: 'active'
        })
        .select()
        .single();
        
      if (roundError) {
        console.error('❌ Round creation error:', roundError);
        throw roundError;
      }
      
      console.log('✅ Round created successfully:', gameRound);

      // Distribute cards to players (for now, we'll send random cards)
      const playerCards = {};
      for (const p of connectedPlayers) {
        const randomCards = getRandomMemes(allMemes, 7);
        playerCards[p.user_id] = randomCards;
      }

      console.log('🚀 Emitting game_started with round:', gameRound);
      
      io.to(gameCode).emit('game_started', {
        game: { ...game, status: 'in_progress', current_round: 1 },
        round: gameRound,
        playerCards
      });

    } catch (error) {
      console.error('Start game error:', error);
      socket.emit('error', { message: 'Failed to start game' });
    }
  });

  socket.on('submit_card', async ({ cardId, roundId }) => {
    try {
      const { gameCode, userId } = socket;
      
      // Get player and game info
      const { data: game } = await supabase
        .from('games')
        .select('id')
        .eq('code', gameCode)
        .single();

      const { data: player } = await supabase
        .from('players')
        .select('id')
        .eq('user_id', userId)
        .eq('game_id', game.id)
        .single();

      // Submit player card
      await supabase
        .from('player_cards')
        .insert({
          player_id: player.id,
          game_id: game.id,
          round_id: roundId,
          meme_card_id: cardId
        });

      // Check if all players have submitted
      const { data: submittedCards } = await supabase
        .from('player_cards')
        .select(`
          *,
          players:player_id (
            users:user_id (username, display_name)
          ),
          meme_cards:meme_card_id (*)
        `)
        .eq('round_id', roundId);

      const { data: allPlayers } = await supabase
        .from('players')
        .select('id')
        .eq('game_id', game.id)
        .eq('is_connected', true);

      if (submittedCards.length === allPlayers.length) {
        // All players submitted, start voting
        await supabaseAdmin
          .from('game_rounds')
          .update({ 
            status: 'voting',
            voting_started_at: new Date().toISOString()
          })
          .eq('id', roundId);

        io.to(gameCode).emit('voting_started', {
          submittedCards: submittedCards.map(card => ({
            id: card.id,
            meme_card: card.meme_cards,
            player: {
              username: card.players.users.username,
              display_name: card.players.users.display_name
            }
          }))
        });
      } else {
        socket.to(gameCode).emit('card_submitted', {
          playerId: player.id,
          submittedCount: submittedCards.length,
          totalPlayers: allPlayers.length
        });
      }

    } catch (error) {
      console.error('Submit card error:', error);
      socket.emit('error', { message: 'Failed to submit card' });
    }
  });

  socket.on('submit_vote', async ({ playerCardId, roundId }) => {
    try {
      const { gameCode, userId } = socket;
      
      // Get player info
      const { data: game } = await supabase
        .from('games')
        .select('id')
        .eq('code', gameCode)
        .single();

      const { data: voter } = await supabase
        .from('players')
        .select('id')
        .eq('user_id', userId)
        .eq('game_id', game.id)
        .single();

      // Submit vote
      await supabase
        .from('votes')
        .insert({
          voter_id: voter.id,
          player_card_id: playerCardId,
          round_id: roundId
        });

      // Check if all players have voted
      const { data: allVotes } = await supabase
        .from('votes')
        .select('*')
        .eq('round_id', roundId);

      const { data: allPlayers } = await supabase
        .from('players')
        .select('id')
        .eq('game_id', game.id)
        .eq('is_connected', true);

      if (allVotes.length === allPlayers.length) {
        // All voted, calculate results
        await calculateRoundResults(roundId, gameCode);
      }

    } catch (error) {
      console.error('Submit vote error:', error);
      socket.emit('error', { message: 'Failed to submit vote' });
    }
  });

  socket.on('disconnect', async () => {
    try {
      const { gameCode, userId } = socket;
      if (gameCode && userId) {
        // Update player connection status
        await supabase
          .from('players')
          .update({ is_connected: false })
          .eq('user_id', userId);

        socket.to(gameCode).emit('player_left', { userId });
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    }
    console.log('User disconnected:', socket.id);
  });
});

// Helper function to calculate round results
async function calculateRoundResults(roundId, gameCode) {
  try {
    // Get vote counts for each player card
    const { data: voteResults } = await supabase
      .from('votes')
      .select(`
        player_card_id,
        player_cards:player_card_id (
          *,
          players:player_id (
            *,
            users:user_id (username, display_name)
          ),
          meme_cards:meme_card_id (*)
        )
      `)
      .eq('round_id', roundId);

    // Count votes for each card
    const voteCounts = {};
    voteResults.forEach(vote => {
      const cardId = vote.player_card_id;
      voteCounts[cardId] = (voteCounts[cardId] || 0) + 1;
    });

    // Find winner (most votes)
    let winnerId = null;
    let maxVotes = 0;
    
    Object.entries(voteCounts).forEach(([cardId, votes]) => {
      if (votes > maxVotes) {
        maxVotes = votes;
        const playerCard = voteResults.find(v => v.player_card_id === cardId);
        winnerId = playerCard.player_cards.player_id;
      }
    });

    // Update round with winner
    if (winnerId) {
      await supabaseAdmin
        .from('game_rounds')
        .update({ 
          status: 'completed',
          ended_at: new Date().toISOString(),
          winner_id: winnerId
        })
        .eq('id', roundId);

      // Update player score
      await supabase
        .from('players')
        .update({ score: supabase.raw('score + 1') })
        .eq('id', winnerId);
    }

    // Get updated game info
    const { data: game } = await supabase
      .from('games')
      .select(`
        *,
        players (
          *,
          users:user_id (username, display_name, avatar_url)
        )
      `)
      .eq('code', gameCode)
      .single();

    // Emit round results
    io.to(gameCode).emit('round_ended', {
      winner: voteResults.find(v => v.player_cards.player_id === winnerId)?.player_cards.players,
      results: voteResults.map(vote => ({
        card: vote.player_cards.meme_cards,
        player: vote.player_cards.players.users,
        votes: voteCounts[vote.player_card_id] || 0
      })),
      scores: game.players.map(p => ({
        player: p.users,
        score: p.score
      }))
    });

    // Check if game should end
    if (game.current_round >= game.max_rounds) {
      await endGame(game.id, gameCode);
    } else {
      // Start next round after delay
      setTimeout(() => startNextRound(game.id, gameCode), 5000);
    }

  } catch (error) {
    console.error('Calculate round results error:', error);
  }
}

// Helper function to start next round
async function startNextRound(gameId, gameCode) {
  try {
    const nextRound = await supabase
      .from('games')
      .select('current_round')
      .eq('id', gameId)
      .single();

    const newRoundNumber = (nextRound.data?.current_round || 0) + 1;

    // Get random prompt
    const { data: prompts } = await supabase
      .from('prompts')
      .select('*')
      .eq('is_turkish', true);
    
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

    // Update game round
    await supabase
      .from('games')
      .update({ current_round: newRoundNumber })
      .eq('id', gameId);

    // Create new round
    const { data: gameRound } = await supabaseAdmin
      .from('game_rounds')
      .insert({
        game_id: gameId,
        round_number: newRoundNumber,
        prompt_id: randomPrompt.id,
        prompt_text: randomPrompt.text,
        status: 'active'
      })
      .select()
      .single();

    io.to(gameCode).emit('new_round', {
      round: gameRound,
      roundNumber: newRoundNumber
    });

  } catch (error) {
    console.error('Start next round error:', error);
  }
}

// Helper function to end game
async function endGame(gameId, gameCode) {
  try {
    // Update game status
    await supabase
      .from('games')
      .update({ 
        status: 'finished',
        finished_at: new Date().toISOString()
      })
      .eq('id', gameId);

    // Get final results
    const { data: finalGame } = await supabase
      .from('games')
      .select(`
        *,
        players (
          *,
          users:user_id (username, display_name, avatar_url)
        )
      `)
      .eq('id', gameId)
      .single();

    // Find winner (highest score)
    const winner = finalGame.players.reduce((prev, current) => 
      (prev.score > current.score) ? prev : current
    );

    // Create game history record
    await supabase
      .from('game_history')
      .insert({
        game_id: gameId,
        winner_id: winner.user_id,
        total_players: finalGame.players.length,
        total_rounds: finalGame.max_rounds,
        game_duration_minutes: Math.floor(
          (new Date(finalGame.finished_at) - new Date(finalGame.started_at)) / 60000
        )
      });

    io.to(gameCode).emit('game_ended', {
      winner: winner.users,
      finalScores: finalGame.players
        .sort((a, b) => b.score - a.score)
        .map(p => ({
          player: p.users,
          score: p.score
        }))
    });

  } catch (error) {
    console.error('End game error:', error);
  }
}

// Utility function to get random memes from array
function getRandomMemes(memeArray, count) {
  const shuffled = [...memeArray].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🎮 Game server is ready!`);
}); 