import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
  Share,
} from 'react-native';
import { useGame } from '../../context/GameContext';

type PlayerItemProps = {
  player: any;
  isHost: boolean;
};

function PlayerItem({ player, isHost }: PlayerItemProps) {
  return (
    <View style={styles.playerItem}>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{player.username}</Text>
        {player.is_host && <Text style={styles.hostBadge}>👑 Host</Text>}
      </View>
      <View style={[
        styles.playerStatus, 
        { backgroundColor: player.is_connected ? '#10B981' : '#EF4444' }
      ]}>
        <Text style={styles.statusText}>
          {player.is_connected ? 'Bağlı' : 'Bağlantı Kesildi'}
        </Text>
      </View>
    </View>
  );
}

export default function LobbyScreen({ navigation, route }: any) {
  const { gameCode } = route.params;
  const { state, startGame, leaveGame } = useGame();
  const [canStart, setCanStart] = useState(false);

  useEffect(() => {
    // Check if game can start (minimum 3 players)
    const connectedPlayers = state.players.filter(p => p.is_connected);
    setCanStart(connectedPlayers.length >= 3);
  }, [state.players]);

  // Navigate to game when game starts
  useEffect(() => {
    if (state.gamePhase === 'card_selection') {
      console.log('Game started! Navigating to Game screen...');
      navigation.navigate('Game');
    }
  }, [state.gamePhase, navigation]);

  const handleStartGame = () => {
    if (!canStart) {
      Alert.alert('Uyarı', 'Oyunu başlatmak için en az 3 oyuncu gerekli');
      return;
    }
    startGame();
    navigation.navigate('Game');
  };

  const handleLeaveGame = () => {
    Alert.alert(
      'Oyundan Ayrıl',
      'Oyundan ayrılmak istediğinden emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Ayrıl', 
          style: 'destructive',
          onPress: () => {
            leaveGame();
            navigation.navigate('Home');
          }
        },
      ]
    );
  };

  const handleShareGameCode = async () => {
    try {
      await Share.share({
        message: `"What Is Your Mood?" oyununa katıl! 🎮\n\nOyun Kodu: ${gameCode}\n\nEğlenceli meme savaşına hazır mısın? 😂`,
        title: 'Oyuna Katıl!',
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const isHost = state.currentPlayer?.is_host || false;
  const connectedPlayers = state.players.filter(p => p.is_connected);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Oyun Lobisi</Text>
          <View style={styles.gameCodeContainer}>
            <Text style={styles.gameCodeLabel}>Oyun Kodu:</Text>
            <Text style={styles.gameCode}>{gameCode}</Text>
          </View>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleShareGameCode}
          >
            <Text style={styles.shareButtonText}>📋 Kodu Paylaş</Text>
          </TouchableOpacity>
        </View>

        {/* Players List */}
        <View style={styles.playersSection}>
          <View style={styles.playersHeader}>
            <Text style={styles.playersTitle}>
              Oyuncular ({connectedPlayers.length}/8)
            </Text>
            <Text style={styles.minPlayersNote}>
              {connectedPlayers.length < 3 
                ? `Başlamak için ${3 - connectedPlayers.length} oyuncu daha gerekli`
                : 'Oyun başlatılabilir! 🎉'
              }
            </Text>
          </View>

          <FlatList
            data={state.players}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PlayerItem player={item} isHost={isHost} />
            )}
            style={styles.playersList}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Game Rules */}
        <View style={styles.rulesSection}>
          <Text style={styles.rulesTitle}>🎯 Oyun Kuralları</Text>
          <Text style={styles.rulesText}>
            • 7 tur oynanacak{'\n'}
            • Her turda bir durum/soru gösterilir{'\n'}
            • Elinizden en uygun meme'i seçin{'\n'}
            • Diğer oyuncuların kartlarını oylayın{'\n'}
            • En çok oy alan oyuncu puan kazanır!
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          {isHost ? (
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.startButton, 
                !canStart && styles.disabledButton
              ]} 
              onPress={handleStartGame}
              disabled={!canStart}
            >
              <Text style={[
                styles.startButtonText,
                !canStart && styles.disabledButtonText
              ]}>
                🚀 Oyunu Başlat
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.waitingContainer}>
              <Text style={styles.waitingText}>
                Host'un oyunu başlatmasını bekliyorsun...
              </Text>
              <Text style={styles.waitingEmoji}>⏳</Text>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.button, styles.leaveButton]} 
            onPress={handleLeaveGame}
          >
            <Text style={styles.leaveButtonText}>❌ Oyundan Ayrıl</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  gameCodeContainer: {
    backgroundColor: '#374151',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  gameCodeLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  gameCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    letterSpacing: 2,
  },
  shareButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  playersSection: {
    flex: 1,
    marginBottom: 20,
  },
  playersHeader: {
    marginBottom: 15,
  },
  playersTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  minPlayersNote: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  playersList: {
    flex: 1,
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  hostBadge: {
    fontSize: 12,
    color: '#FCD34D',
    fontWeight: '500',
  },
  playerStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rulesSection: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  rulesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  rulesText: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  buttonSection: {
    paddingBottom: 20,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#10B981',
  },
  disabledButton: {
    backgroundColor: '#6B7280',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
  leaveButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  waitingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  waitingText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 10,
  },
  waitingEmoji: {
    fontSize: 32,
  },
}); 