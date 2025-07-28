import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useGame } from '../../context/GameContext';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { createGame, joinGame, state } = useGame();

  const handleCreateGame = async () => {
    if (!username.trim()) {
      Alert.alert('Hata', 'Lütfen kullanıcı adınızı girin');
      return;
    }

    try {
      const newGameCode = await createGame(username.trim());
      navigation.navigate('Lobby', { gameCode: newGameCode });
    } catch (error) {
      Alert.alert('Hata', 'Oyun oluşturulurken bir hata oluştu');
    }
  };

  const handleJoinGame = async () => {
    if (!username.trim()) {
      Alert.alert('Hata', 'Lütfen kullanıcı adınızı girin');
      return;
    }

    if (!gameCode.trim()) {
      Alert.alert('Hata', 'Lütfen oyun kodunu girin');
      return;
    }

    try {
      await joinGame(gameCode.trim().toUpperCase(), username.trim());
      navigation.navigate('Lobby', { gameCode: gameCode.trim().toUpperCase() });
    } catch (error) {
      Alert.alert('Hata', 'Oyuna katılırken bir hata oluştu');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>What Is Your Mood?</Text>
          <Text style={styles.subtitle}>Meme Bazlı Kart Oyunu</Text>
          <Text style={styles.emoji}>😂🃏💫</Text>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Kullanıcı Adın</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Adını gir..."
            placeholderTextColor="#9CA3AF"
            maxLength={20}
          />

          {isJoining && (
            <>
              <Text style={styles.inputLabel}>Oyun Kodu</Text>
              <TextInput
                style={styles.input}
                value={gameCode}
                onChangeText={setGameCode}
                placeholder="ABCD123"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
                maxLength={7}
              />
            </>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          {!isJoining ? (
            <>
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]} 
                onPress={handleCreateGame}
              >
                <Text style={styles.primaryButtonText}>🎮 Yeni Oyun Oluştur</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]} 
                onPress={() => setIsJoining(true)}
              >
                <Text style={styles.secondaryButtonText}>🔗 Oyuna Katıl</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]} 
                onPress={handleJoinGame}
              >
                <Text style={styles.primaryButtonText}>🚀 Oyuna Katıl</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]} 
                onPress={() => {
                  setIsJoining(false);
                  setGameCode('');
                }}
              >
                <Text style={styles.secondaryButtonText}>⬅️ Geri Dön</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>🎯 Nasıl Oynanır?</Text>
          <Text style={styles.infoText}>
            • 3-8 oyuncu ile oynayın{'\n'}
            • Her tura bir soru gelir{'\n'}
            • En komik meme'i seçin{'\n'}
            • Diğer oyuncuları oylarınız{'\n'}
            • En çok oy alan kazanır!
          </Text>
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
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
  },
  inputSection: {
    marginTop: 40,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4B5563',
  },
  buttonSection: {
    marginTop: 20,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#8B5CF6',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  infoSection: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
}); 