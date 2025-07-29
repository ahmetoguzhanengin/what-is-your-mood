import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useGame } from '../../context/GameContext';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2;

type MemeCardProps = {
  card: any;
  isSelected: boolean;
  onSelect: (cardId: string) => void;
  disabled?: boolean;
};

function MemeCard({ card, isSelected, onSelect, disabled }: MemeCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.memeCard,
        isSelected && styles.selectedCard,
        disabled && styles.disabledCard,
      ]}
      onPress={() => !disabled && onSelect(card.id)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: card.image_url }}
        style={styles.memeImage}
        contentFit="cover"
        placeholder="📷"
      />
      <Text style={styles.memeTitle} numberOfLines={2}>
        {card.title}
      </Text>
    </TouchableOpacity>
  );
}

type PromptCardProps = {
  prompt: string;
  round: number;
  maxRounds: number;
};

function PromptCard({ prompt, round, maxRounds }: PromptCardProps) {
  return (
    <View style={styles.promptCard}>
      <View style={styles.promptHeader}>
        <Text style={styles.roundText}>Tur {round}/{maxRounds}</Text>
        <Text style={styles.promptLabel}>DURUM:</Text>
      </View>
      <Text style={styles.promptText}>{prompt}</Text>
    </View>
  );
}

export default function GameScreen({ navigation }: any) {
  const { state, submitCard, submitVote, leaveGame } = useGame();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 second timer

  useEffect(() => {
    // Timer countdown
    if (state.gamePhase === 'card_selection' && timeLeft > 0 && !hasSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, state.gamePhase, hasSubmitted]);

  useEffect(() => {
    // Reset state when new round starts
    if (state.gamePhase === 'card_selection') {
      setSelectedCard(null);
      setHasSubmitted(false);
      setTimeLeft(60);
    }
  }, [state.gamePhase]);

  const handleCardSelect = (cardId: string) => {
    if (hasSubmitted) return;
    setSelectedCard(cardId);
  };

  const handleSubmitCard = () => {
    if (!selectedCard) {
      Alert.alert('Hata', 'Lütfen bir kart seçin!');
      return;
    }

    submitCard(selectedCard);
    setHasSubmitted(true);
  };

  const handleVote = (playerCardId: string) => {
    submitVote(playerCardId);
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

  const renderCardSelectionPhase = () => (
    <>
      {/* Prompt */}
      <PromptCard 
        prompt="Pazartesi sabahı alarm çaldığında ruh halim:" 
        round={state.currentGame?.current_round || 1}
        maxRounds={state.currentGame?.max_rounds || 7}
      />

      {/* Timer */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>
          {hasSubmitted ? '✅ Kartın gönderildi!' : `⏰ ${timeLeft}s`}
        </Text>
      </View>

      {/* Player Cards */}
      <Text style={styles.sectionTitle}>Kartlarını Seç:</Text>
      <FlatList
        data={state.playerCards}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <MemeCard
            card={item}
            isSelected={selectedCard === item.id}
            onSelect={handleCardSelect}
            disabled={hasSubmitted}
          />
        )}
        style={styles.cardsList}
        contentContainerStyle={styles.cardsContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Submit Button */}
      {!hasSubmitted && (
        <TouchableOpacity 
          style={[styles.submitButton, !selectedCard && styles.disabledButton]}
          onPress={handleSubmitCard}
          disabled={!selectedCard}
        >
          <Text style={styles.submitButtonText}>🚀 Kartı Gönder</Text>
        </TouchableOpacity>
      )}
    </>
  );

  const renderVotingPhase = () => (
    <>
      {/* Prompt */}
      <PromptCard 
        prompt="Pazartesi sabahı alarm çaldığında ruh halim:" 
        round={state.currentGame?.current_round || 1}
        maxRounds={state.currentGame?.max_rounds || 7}
      />

      <Text style={styles.sectionTitle}>En Komik Kartı Seç:</Text>
      
      <FlatList
        data={state.submittedCards}
        keyExtractor={(item, index) => `submitted-${index}`}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.votingCard}
            onPress={() => handleVote(item.id)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: item.card.image_url }}
              style={styles.memeImage}
              contentFit="cover"
            />
            <Text style={styles.memeTitle} numberOfLines={2}>
              {item.card.title}
            </Text>
          </TouchableOpacity>
        )}
        style={styles.cardsList}
        contentContainerStyle={styles.cardsContainer}
        showsVerticalScrollIndicator={false}
      />
    </>
  );

  const renderResultsPhase = () => (
    <View style={styles.resultsContainer}>
      <Text style={styles.resultsTitle}>🎉 Tur Sonuçları</Text>
      <Text style={styles.resultsText}>Sonuçlar gösteriliyor...</Text>
    </View>
  );

  const renderGameEndedPhase = () => (
    <View style={styles.resultsContainer}>
      <Text style={styles.resultsTitle}>🏆 Oyun Bitti!</Text>
      <Text style={styles.resultsText}>Final sonuçları gösteriliyor...</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.gameTitle}>What Is Your Mood?</Text>
        <TouchableOpacity onPress={handleLeaveGame} style={styles.leaveButton}>
          <Text style={styles.leaveButtonText}>❌</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {state.gamePhase === 'card_selection' && renderCardSelectionPhase()}
        {state.gamePhase === 'voting' && renderVotingPhase()}
        {state.gamePhase === 'results' && renderResultsPhase()}
        {state.gamePhase === 'game_ended' && renderGameEndedPhase()}
      </View>

      {/* Players Status */}
      <View style={styles.playersStatus}>
        <Text style={styles.playersStatusText}>
          👥 {state.players.filter(p => p.is_connected).length} oyuncu aktif
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  leaveButton: {
    padding: 8,
  },
  leaveButtonText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  promptCard: {
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roundText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  promptLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  promptText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  cardsList: {
    flex: 1,
  },
  cardsContainer: {
    paddingBottom: 20,
  },
  memeCard: {
    width: cardWidth,
    marginRight: 10,
    marginBottom: 15,
    backgroundColor: '#374151',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#8B5CF6',
    backgroundColor: '#4C1D95',
  },
  disabledCard: {
    opacity: 0.6,
  },
  votingCard: {
    width: cardWidth,
    marginRight: 10,
    marginBottom: 15,
    backgroundColor: '#374151',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  memeImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#4B5563',
  },
  memeTitle: {
    padding: 10,
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#6B7280',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  resultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  resultsText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  playersStatus: {
    backgroundColor: '#374151',
    paddingVertical: 10,
    alignItems: 'center',
  },
  playersStatusText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
}); 