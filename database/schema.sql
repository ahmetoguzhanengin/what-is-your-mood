-- What Is Your Mood? - Supabase Database Schema
-- Meme Card Game Database Structure

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE game_status AS ENUM ('waiting', 'in_progress', 'finished');
CREATE TYPE round_status AS ENUM ('active', 'voting', 'completed');

-- Users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  total_games_played INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  favorite_meme_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Statistics table
CREATE TABLE public.user_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  total_votes_received INTEGER DEFAULT 0,
  total_votes_given INTEGER DEFAULT 0,
  highest_score INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0,
  favorite_category VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meme Cards table
CREATE TABLE public.meme_cards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  image_url TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_turkish BOOLEAN DEFAULT false,
  category VARCHAR(50),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id)
);

-- Game Prompts table
CREATE TABLE public.prompts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  text TEXT NOT NULL,
  category VARCHAR(50),
  is_turkish BOOLEAN DEFAULT true,
  difficulty_level INTEGER DEFAULT 1, -- 1-5
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id)
);

-- Games table
CREATE TABLE public.games (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,
  host_id UUID REFERENCES public.users(id) NOT NULL,
  status game_status DEFAULT 'waiting',
  current_round INTEGER DEFAULT 0,
  max_rounds INTEGER DEFAULT 7,
  max_players INTEGER DEFAULT 8,
  is_private BOOLEAN DEFAULT false,
  password VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE
);

-- Players table (junction table for users in games)
CREATE TABLE public.players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  is_host BOOLEAN DEFAULT false,
  is_connected BOOLEAN DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, game_id)
);

-- Game Rounds table
CREATE TABLE public.game_rounds (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  prompt_id UUID REFERENCES public.prompts(id),
  prompt_text TEXT NOT NULL, -- Stored for historical purposes
  status round_status DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  voting_started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  winner_id UUID REFERENCES public.players(id),
  UNIQUE(game_id, round_number)
);

-- Player Cards table (cards submitted by players in each round)
CREATE TABLE public.player_cards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  round_id UUID REFERENCES public.game_rounds(id) ON DELETE CASCADE,
  meme_card_id UUID REFERENCES public.meme_cards(id),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  votes_received INTEGER DEFAULT 0,
  UNIQUE(player_id, round_id)
);

-- Votes table
CREATE TABLE public.votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  voter_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  player_card_id UUID REFERENCES public.player_cards(id) ON DELETE CASCADE,
  round_id UUID REFERENCES public.game_rounds(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(voter_id, round_id) -- One vote per player per round
);

-- Game History table (for completed games)
CREATE TABLE public.game_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  winner_id UUID REFERENCES public.users(id),
  total_players INTEGER,
  total_rounds INTEGER,
  game_duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_games_code ON public.games(code);
CREATE INDEX idx_games_status ON public.games(status);
CREATE INDEX idx_games_host_id ON public.games(host_id);
CREATE INDEX idx_players_game_id ON public.players(game_id);
CREATE INDEX idx_players_user_id ON public.players(user_id);
CREATE INDEX idx_game_rounds_game_id ON public.game_rounds(game_id);
CREATE INDEX idx_player_cards_round_id ON public.player_cards(round_id);
CREATE INDEX idx_votes_round_id ON public.votes(round_id);
CREATE INDEX idx_meme_cards_tags ON public.meme_cards USING GIN(tags);
CREATE INDEX idx_meme_cards_category ON public.meme_cards(category);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read their own data and other users' public data
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- User stats policies
CREATE POLICY "Users can view all stats" ON public.user_stats FOR SELECT USING (true);
CREATE POLICY "Users can update their own stats" ON public.user_stats FOR UPDATE USING (auth.uid() = user_id);

-- Game policies
CREATE POLICY "Anyone can view games" ON public.games FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create games" ON public.games FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Game hosts can update their games" ON public.games FOR UPDATE USING (auth.uid() = host_id);

-- Player policies  
CREATE POLICY "Anyone can view players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join games" ON public.players FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Players can update their own data" ON public.players FOR UPDATE USING (auth.uid() = user_id);

-- Meme cards and prompts are public
CREATE POLICY "Anyone can view meme cards" ON public.meme_cards FOR SELECT USING (true);
CREATE POLICY "Anyone can view prompts" ON public.prompts FOR SELECT USING (true);

-- Game rounds, player cards, and votes policies
CREATE POLICY "Anyone can view game rounds" ON public.game_rounds FOR SELECT USING (true);
CREATE POLICY "Anyone can view player cards" ON public.player_cards FOR SELECT USING (true);
CREATE POLICY "Anyone can view votes" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Players can submit cards" ON public.player_cards FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Players can vote" ON public.votes FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Functions and Triggers

-- Function to update user stats after game completion
CREATE OR REPLACE FUNCTION update_user_stats_after_game()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total games played for all players
  UPDATE public.user_stats 
  SET games_played = games_played + 1,
      updated_at = NOW()
  WHERE user_id IN (
    SELECT user_id FROM public.players WHERE game_id = NEW.game_id
  );
  
  -- Update wins for the winner
  IF NEW.winner_id IS NOT NULL THEN
    UPDATE public.user_stats 
    SET games_won = games_won + 1,
        updated_at = NOW()
    WHERE user_id = (
      SELECT user_id FROM public.players WHERE id = NEW.winner_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats when game ends
CREATE TRIGGER update_stats_on_game_end
  AFTER INSERT ON public.game_history
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_after_game();

-- Function to generate unique game codes
CREATE OR REPLACE FUNCTION generate_game_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_count INTEGER;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 6));
    SELECT COUNT(*) INTO exists_count FROM public.games WHERE games.code = code;
    EXIT WHEN exists_count = 0;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON public.user_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON public.games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 