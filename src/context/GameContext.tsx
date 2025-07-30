import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Game, Player, MemeCard, GameRound } from '../services/supabase';
import { socketService } from '../services/socket';
import { useAuth } from './AuthContext';

// Game State Types
type GameState = {
  currentGame: Game | null;
  players: Player[];
  currentPlayer: Player | null;
  currentRound: GameRound | null;
  playerCards: MemeCard[];
  submittedCards: any[];
  voteCount: { [cardId: string]: number }; // Oy sayaçları
  hasVoted: boolean; // Kullanıcı oy verdi mi?
  roundResults: any | null;
  gamePhase: 'lobby' | 'card_selection' | 'voting' | 'results' | 'game_ended';
  isConnected: boolean;
  loading: boolean;
  error: string | null;
};

// Actions
type GameAction =
  | { type: 'SET_GAME'; payload: Game }
  | { type: 'SET_PLAYERS'; payload: Player[] }
  | { type: 'ADD_PLAYER'; payload: Player }
  | { type: 'REMOVE_PLAYER'; payload: string }
  | { type: 'SET_CURRENT_PLAYER'; payload: Player }
  | { type: 'SET_CURRENT_ROUND'; payload: GameRound }
  | { type: 'SET_PLAYER_CARDS'; payload: MemeCard[] }
  | { type: 'SET_SUBMITTED_CARDS'; payload: any[] }
  | { type: 'ADD_VOTE'; payload: string } // Karta oy ekle
  | { type: 'SET_VOTE_COUNT'; payload: { [cardId: string]: number } } // Oy sayaçlarını set et
  | { type: 'SET_HAS_VOTED'; payload: boolean } // Kullanıcı oy verdi mi?
  | { type: 'SET_ROUND_RESULTS'; payload: any }
  | { type: 'SET_GAME_PHASE'; payload: GameState['gamePhase'] }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_GAME' };

// Initial State
const initialState: GameState = {
  currentGame: null,
  players: [],
  currentPlayer: null,
  currentRound: null,
  playerCards: [],
  submittedCards: [],
  voteCount: {},
  hasVoted: false,
  roundResults: null,
  gamePhase: 'lobby',
  isConnected: false,
  loading: false,
  error: null,
};

// Reducer
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_GAME':
      return { ...state, currentGame: action.payload };
    case 'SET_PLAYERS':
      return { ...state, players: action.payload };
    case 'ADD_PLAYER':
      return { ...state, players: [...state.players, action.payload] };
    case 'REMOVE_PLAYER':
      return { 
        ...state, 
        players: state.players.filter(p => p.id !== action.payload) 
      };
    case 'SET_CURRENT_PLAYER':
      return { ...state, currentPlayer: action.payload };
    case 'SET_CURRENT_ROUND':
      return { ...state, currentRound: action.payload };
    case 'SET_PLAYER_CARDS':
      return { ...state, playerCards: action.payload };
    case 'SET_SUBMITTED_CARDS':
      return { ...state, submittedCards: action.payload };
    case 'ADD_VOTE':
      return { 
        ...state, 
        voteCount: {
          ...state.voteCount,
          [action.payload]: (state.voteCount[action.payload] || 0) + 1
        }
      };
    case 'SET_VOTE_COUNT':
      return { ...state, voteCount: action.payload };
    case 'SET_HAS_VOTED':
      return { ...state, hasVoted: action.payload };
    case 'SET_ROUND_RESULTS':
      return { ...state, roundResults: action.payload };
    case 'SET_GAME_PHASE':
      return { ...state, gamePhase: action.payload };
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET_GAME':
      return initialState;
    default:
      return state;
  }
}

// Context
type GameContextType = {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  // Helper functions
  createGame: (username: string) => Promise<string>;
  joinGame: (gameCode: string, username: string) => Promise<void>;
  startGame: () => void;
  submitCard: (cardId: string) => void;
  submitVote: (playerCardId: string) => void;
  leaveGame: () => void;
};

const GameContext = createContext<GameContextType | null>(null);

// Provider Component
type GameProviderProps = {
  children: ReactNode;
};

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { state: authState } = useAuth();

  // API Base URL
  const API_BASE = 'http://192.168.1.110:3000/api';

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (authState.session?.access_token) {
      headers.Authorization = `Bearer ${authState.session.access_token}`;
    }
    
    return headers;
  };

  // Create Game
  const createGame = async (username: string): Promise<string> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await fetch(`${API_BASE}/games`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ username }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create game');
      }

      // Transform players data to flat structure
      const transformedPlayers = data.game.players.map((player: any) => ({
        ...player,
        username: player.users?.username || player.username,
        display_name: player.users?.display_name || player.display_name
      }));

      // Set game state
      dispatch({ type: 'SET_GAME', payload: data.game });
      dispatch({ type: 'SET_CURRENT_PLAYER', payload: data.player });
      dispatch({ type: 'SET_PLAYERS', payload: transformedPlayers });

      // Connect to socket
      await socketService.connect(data.gameCode, authState.user?.id || '');
      dispatch({ type: 'SET_CONNECTED', payload: true });

      // Setup socket listeners
      setupSocketListeners();

      // Join socket room
      socketService.joinGame(data.gameCode, authState.user?.id || '');

      return data.gameCode;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Join Game
  const joinGame = async (gameCode: string, username: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await fetch(`${API_BASE}/games/${gameCode}/join`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ username }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to join game');
      }

      // Transform players data to flat structure  
      const transformedPlayers = data.game.players.map((player: any) => ({
        ...player,
        username: player.users?.username || player.username,
        display_name: player.users?.display_name || player.display_name
      }));

      // Set game state
      dispatch({ type: 'SET_GAME', payload: data.game });
      dispatch({ type: 'SET_CURRENT_PLAYER', payload: data.player });
      dispatch({ type: 'SET_PLAYERS', payload: transformedPlayers });

      // Connect to socket
      await socketService.connect(gameCode, authState.user?.id || '');
      dispatch({ type: 'SET_CONNECTED', payload: true });

      // Setup socket listeners
      setupSocketListeners();

      // Join socket room
      socketService.joinGame(gameCode, authState.user?.id || '');
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Setup Socket Listeners
  const setupSocketListeners = () => {
    // Player joined
    socketService.onPlayerJoined((data) => {
      const transformedPlayers = data.players.map((player: any) => ({
        ...player,
        username: player.users?.username || player.username,
        display_name: player.users?.display_name || player.display_name
      }));
      dispatch({ type: 'SET_PLAYERS', payload: transformedPlayers });
    });

    // Player left
    socketService.onPlayerLeft((playerId) => {
      dispatch({ type: 'REMOVE_PLAYER', payload: playerId });
    });

    // Card submitted (progress update)
    socketService.onCardSubmitted((data) => {
      console.log('Card submitted progress:', data);
      // You can add progress indicator here later
    });

    // Vote update (real-time vote counts)
    socketService.onVoteUpdate((data) => {
      console.log('🗳️ Real-time vote update:', data);
      dispatch({ type: 'SET_VOTE_COUNT', payload: data.voteCounts });
    });

    // Voting started
    socketService.onVotingStarted((data: any) => {
      console.log('🗳️ Voting started with cards:', data);
      console.log('🗳️ submittedCards array:', data.submittedCards);
      console.log('🗳️ submittedCards length:', data.submittedCards?.length);
      
      dispatch({ type: 'SET_SUBMITTED_CARDS', payload: data.submittedCards });
      dispatch({ type: 'SET_VOTE_COUNT', payload: {} }); // Oy sayaçlarını sıfırla
      dispatch({ type: 'SET_HAS_VOTED', payload: false }); // Oy durumunu sıfırla
      dispatch({ type: 'SET_GAME_PHASE', payload: 'voting' });
    });

    // Game started
    socketService.onGameStarted((gameData) => {
      console.log('🚀 Game started event received:', gameData);
      console.log('🎯 Round data:', gameData.round);
      console.log('🃏 Player cards:', gameData.playerCards);
      
      dispatch({ type: 'SET_GAME', payload: gameData.game });
      dispatch({ type: 'SET_GAME_PHASE', payload: 'card_selection' });
      
      // Set current round
      if (gameData.round) {
        console.log('✅ Setting current round ID:', gameData.round.id);
        dispatch({ type: 'SET_CURRENT_ROUND', payload: gameData.round });
      }
      
      // Set player cards from backend response
      if (gameData.playerCards && authState.user?.id) {
        const myCards = gameData.playerCards[authState.user.id];
        if (myCards && myCards.length > 0) {
          console.log('Setting player cards:', myCards);
          dispatch({ type: 'SET_PLAYER_CARDS', payload: myCards });
        } else {
          console.log('No cards found for current user');
        }
      }
    });

    // New round
    socketService.onNewRound((data) => {
      console.log('🆕 New round started:', data);
      console.log('🃏 New round player cards:', data.playerCards);
      
      // Reset all voting state
      dispatch({ type: 'SET_CURRENT_ROUND', payload: data.round });
      dispatch({ type: 'SET_GAME_PHASE', payload: 'card_selection' });
      dispatch({ type: 'SET_SUBMITTED_CARDS', payload: [] });
      dispatch({ type: 'SET_VOTE_COUNT', payload: {} });
      dispatch({ type: 'SET_HAS_VOTED', payload: false });
      dispatch({ type: 'SET_ROUND_RESULTS', payload: null });
      
      // Set new player cards
      if (data.playerCards && authState.user?.id) {
        const myCards = data.playerCards[authState.user.id];
        if (myCards && myCards.length > 0) {
          console.log('✅ Setting new player cards for round', data.roundNumber, ':', myCards);
          dispatch({ type: 'SET_PLAYER_CARDS', payload: myCards });
        } else {
          console.log('⚠️ No cards found for current user in new round');
        }
      }
      
      console.log('🔄 Ready for round', data.roundNumber);
    });



    // Round ended
    socketService.onRoundEnded((results) => {
      console.log('🏁 Round ended results:', results);
      
      // Store round results
      dispatch({ type: 'SET_ROUND_RESULTS', payload: results });
      dispatch({ type: 'SET_GAME_PHASE', payload: 'results' });
      
      // Update player scores
      if (results.scores) {
        const updatedPlayers = state.players.map(player => {
          const scoreData = results.scores.find((s: any) => s.player.username === player.username);
          return scoreData ? { ...player, score: scoreData.score } : player;
        });
        dispatch({ type: 'SET_PLAYERS', payload: updatedPlayers });
      }
      
      console.log('⏳ Waiting for next round...');
      // Backend will emit 'new_round' after 5 seconds
    });

    // Game ended
    socketService.onGameEnded((finalResults) => {
      console.log('Game ended with final results:', finalResults);
      dispatch({ type: 'SET_ROUND_RESULTS', payload: finalResults });
      dispatch({ type: 'SET_GAME_PHASE', payload: 'game_ended' });
    });
  };

  // Start Game
  const startGame = () => {
    socketService.startGame();
  };

  // Submit Card
  const submitCard = (cardId: string) => {
    console.log('🎯 Current state.currentRound:', state.currentRound);
    const roundId = state.currentRound?.id;
    console.log('🎯 Extracted roundId:', roundId);
    
    if (roundId) {
      console.log('✅ Submitting card with roundId:', roundId);
      socketService.submitCard(cardId, roundId);
      // Remove card from player's hand
      const updatedCards = state.playerCards.filter(card => card.id !== cardId);
      dispatch({ type: 'SET_PLAYER_CARDS', payload: updatedCards });
    } else {
      console.error('❌ No current round ID for submitting card');
      console.error('❌ state.currentRound:', state.currentRound);
    }
  };

  // Submit Vote
  const submitVote = (playerCardId: string) => {
    const roundId = state.currentRound?.id;
    if (roundId && !state.hasVoted) {
      console.log('🗳️ Voting for card:', playerCardId);
      socketService.submitVote(playerCardId, roundId);
      
      // Only mark that user has voted (vote count will come from backend)
      dispatch({ type: 'SET_HAS_VOTED', payload: true });
    } else if (state.hasVoted) {
      console.warn('User has already voted');
    } else {
      console.error('No current round ID for voting');
    }
  };

  // Leave Game
  const leaveGame = () => {
    socketService.removeAllListeners();
    socketService.disconnect();
    dispatch({ type: 'SET_CONNECTED', payload: false });
    dispatch({ type: 'RESET_GAME' });
  };

  const value: GameContextType = {
    state,
    dispatch,
    createGame,
    joinGame,
    startGame,
    submitCard,
    submitVote,
    leaveGame,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

// Hook to use context
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
} 