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
  ScrollView,
} from 'react-native';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const [gameCode, setGameCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { createGame, joinGame, state } = useGame();
  const { state: authState, signOut } = useAuth();

  const userProfile = authState.profile;
  const userStats = userProfile?.user_stats?.[0];

  const handleCreateGame = async () => {
    if (!authState.isAuthenticated || !userProfile) {
      Alert.alert('Hata', 'Oyun oluşturmak için giriş yapmanız gerekli');
      return;
    }

    try {
      const newGameCode = await createGame(userProfile.username);
      navigation.navigate('Lobby', { gameCode: newGameCode });
    } catch (error) {
      Alert.alert('Hata', 'Oyun oluşturulurken bir hata oluştu');
    }
  };

  const handleJoinGame = async () => {
    if (!authState.isAuthenticated || !userProfile) {
      Alert.alert('Hata', 'Oyuna katılmak için giriş yapmanız gerekli');
      return;
    }

    if (!gameCode.trim()) {
      Alert.alert('Hata', 'Lütfen oyun kodunu girin');
      return;
    }

    try {
      await joinGame(gameCode.trim().toUpperCase(), userProfile.username);
      navigation.navigate('Lobby', { gameCode: gameCode.trim().toUpperCase() });
    } catch (error) {
      Alert.alert('Hata', 'Oyuna katılırken bir hata oluştu');
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkış Yap', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              navigation.navigate('Auth');
            } catch (error) {
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu');
            }
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Header with User Profile */}
          <View style={styles.header}>
            <View style={styles.userSection}>
              <View style={styles.userInfo}>
                <Text style={styles.welcomeText}>Hoş Geldin!</Text>
                <Text style={styles.username}>@{userProfile?.username}</Text>
              </View>
              <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                <Text style={styles.signOutText}>Çıkış</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.title}>What Is Your Mood?</Text>
            <Text style={styles.emoji}>😂🃏💫</Text>
          </View>

          {/* User Stats */}
          {userStats && (
            <View style={styles.statsSection}>
              <Text style={styles.statsTitle}>📊 İstatistiklerin</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{userStats.games_played || 0}</Text>
                  <Text style={styles.statLabel}>Oyun</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{userStats.games_won || 0}</Text>
                  <Text style={styles.statLabel}>Galibiyet</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {userStats.games_played > 0 
                      ? Math.round((userStats.games_won / userStats.games_played) * 100)
                      : 0}%
                  </Text>
                  <Text style={styles.statLabel}>Kazanma</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{userStats.total_votes_received || 0}</Text>
                  <Text style={styles.statLabel}>Oy Aldı</Text>
                </View>
              </View>
            </View>
          )}

          {/* Game Code Input for Joining */}
          {isJoining && (
            <View style={styles.inputSection}>
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
            </View>
          )}

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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 30,
  },
  userSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  signOutButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
  },
  statsSection: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 30,
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
    borderWidth: 2,
    borderColor: '#4B5563',
  },
  buttonSection: {
    marginBottom: 30,
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