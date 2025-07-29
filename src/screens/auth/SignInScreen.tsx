import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function SignInScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Hata', 'E-posta adresinizi girin');
      return false;
    }
    
    if (!email.includes('@')) {
      Alert.alert('Hata', 'Geçerli bir e-posta adresi girin');
      return false;
    }
    
    if (!password) {
      Alert.alert('Hata', 'Şifrenizi girin');
      return false;
    }
    
    return true;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await signIn(email, password);
      navigation.navigate('Home');
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Giriş yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Şifre Sıfırlama',
      'Şifrenizi sıfırlamak için e-posta adresinizi girin',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Gönder', onPress: () => console.log('Password reset requested') }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Hoş Geldin!</Text>
              <Text style={styles.subtitle}>
                Meme savaşlarına devam etmek için giriş yap
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-posta</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="ornek@email.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Şifre</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Şifrenizi girin"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>
                  Şifreni unuttun mu?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Buttons */}
            <View style={styles.buttonSection}>
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton, loading && styles.disabledButton]} 
                onPress={handleSignIn}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? 'Giriş yapılıyor...' : '🔑 Giriş Yap'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]} 
                onPress={handleSignUp}
              >
                <Text style={styles.secondaryButtonText}>
                  Hesabın yok mu? Hemen oluştur
                </Text>
              </TouchableOpacity>
            </View>

            {/* Quick Access Info */}
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>💡 İpucu</Text>
              <Text style={styles.infoText}>
                Hesap oluşturduktan sonra e-posta adresinizi doğrulamayı unutmayın!
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  form: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
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
  forgotPasswordText: {
    fontSize: 14,
    color: '#8B5CF6',
    textAlign: 'right',
    marginTop: 8,
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
  },
  disabledButton: {
    backgroundColor: '#6B7280',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  infoSection: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 20,
    marginTop: 30,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 18,
  },
}); 