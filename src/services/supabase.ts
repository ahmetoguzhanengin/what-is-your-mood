import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Tables Types
export type Game = {
  id: string;
  code: string;
  host_id: string;
  status: 'waiting' | 'in_progress' | 'finished';
  current_round: number;
  max_rounds: number;
  created_at: string;
  updated_at: string;
};

export type Player = {
  id: string;
  game_id: string;
  username: string;
  score: number;
  is_host: boolean;
  is_connected: boolean;
  created_at: string;
};

export type MemeCard = {
  id: string;
  image_url: string;
  title: string;
  tags: string[];
  is_turkish: boolean;
};

export type GameRound = {
  id: string;
  game_id: string;
  round_number: number;
  prompt: string;
  status: 'active' | 'voting' | 'completed';
  created_at: string;
};

export type PlayerCard = {
  id: string;
  player_id: string;
  game_id: string;
  meme_card_id: string;
  round_id: string;
  created_at: string;
};

export type Vote = {
  id: string;
  voter_id: string;
  player_card_id: string;
  round_id: string;
  created_at: string;
}; 