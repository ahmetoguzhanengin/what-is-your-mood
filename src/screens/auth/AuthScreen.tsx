import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function AuthScreen({ navigation }: any) {
  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  const handleSignIn = () => {
    navigation.navigate('SignIn');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>What Is Your Mood?</Text>
          <Text style={styles.subtitle}>Meme Bazlı Kart Oyunu</Text>
          <Text style={styles.emoji}>😂🃏💫</Text>
          <Text style={styles.description}>
            Arkadaşlarınla en komik meme'leri seçerek eğlenceli zaman geçir!
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={handleSignUp}
          >
            <Text style={styles.primaryButtonText}>🚀 Yeni Hesap Oluştur</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={handleSignIn}
          >
            <Text style={styles.secondaryButtonText}>🔑 Giriş Yap</Text>
          </TouchableOpacity>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>🎯 Özellikler</Text>
          <Text style={styles.featuresText}>
            • Gerçek zamanlı çok oyunculu oyun{'\n'}
            • Türkçe ve İngilizce meme koleksiyonu{'\n'}
            • Skor takip sistemi ve istatistikler{'\n'}
            • Arkadaşlarınla özel oyun odaları{'\n'}
            • Her oyunda farklı sorular ve meme'ler
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
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  buttonSection: {
    marginTop: 40,
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
  featuresSection: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  featuresText: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
}); 