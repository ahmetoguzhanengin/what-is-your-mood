import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private serverUrl = 'http://172.20.10.5:3000'; // Development server

  connect(gameCode: string, userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.serverUrl, {
        query: { gameCode, userId }
      });

      this.socket.on('connect', () => {
        console.log('Connected to game server');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        reject(error);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Game Events
  joinGame(gameCode: string, userId: string) {
    this.socket?.emit('join_game', { gameCode, userId });
  }

  startGame() {
    this.socket?.emit('start_game');
  }

  submitCard(cardId: string) {
    this.socket?.emit('submit_card', { cardId });
  }

  submitVote(playerCardId: string) {
    this.socket?.emit('submit_vote', { playerCardId });
  }

  // Listeners
  onPlayerJoined(callback: (player: any) => void) {
    this.socket?.on('player_joined', callback);
  }

  onPlayerLeft(callback: (playerId: string) => void) {
    this.socket?.on('player_left', callback);
  }

  onGameStarted(callback: (gameData: any) => void) {
    this.socket?.on('game_started', callback);
  }

  onNewRound(callback: (roundData: any) => void) {
    this.socket?.on('new_round', callback);
  }

  onCardSubmitted(callback: (data: any) => void) {
    this.socket?.on('card_submitted', callback);
  }

  onVotingStarted(callback: (submittedCards: any[]) => void) {
    this.socket?.on('voting_started', callback);
  }

  onVoteSubmitted(callback: (data: any) => void) {
    this.socket?.on('vote_submitted', callback);
  }

  onRoundEnded(callback: (results: any) => void) {
    this.socket?.on('round_ended', callback);
  }

  onGameEnded(callback: (finalResults: any) => void) {
    this.socket?.on('game_ended', callback);
  }

  // Remove listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export const socketService = new SocketService(); 