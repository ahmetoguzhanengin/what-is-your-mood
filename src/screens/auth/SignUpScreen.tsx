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

export default function SignUpScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signUp } = useAuth();

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Hata', 'E-posta adresinizi girin');
      return false;
    }
    
    if (!email.includes('@')) {
      Alert.alert('Hata', 'Geçerli bir e-posta adresi girin');
      return false;
    }
    
    if (!username.trim()) {
      Alert.alert('Hata', 'Kullanıcı adınızı girin');
      return false;
    }
    
    if (username.length < 3) {
      Alert.alert('Hata', 'Kullanıcı adı en az 3 karakter olmalı');
      return false;
    }
    
    if (!password) {
      Alert.alert('Hata', 'Şifrenizi girin');
      return false;
    }
    
    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalı');
      return false;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return false;
    }
    
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await signUp(email, password, username);
      Alert.alert(
        'Başarılı!', 
        'Hesabınız oluşturuldu. E-posta adresinizi kontrol ederek hesabınızı doğrulayın.',
        [
          { text: 'Tamam', onPress: () => navigation.navigate('SignIn') }
        ]
      );
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Hesap oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    navigation.navigate('SignIn');
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
              <Text style={styles.title}>Hesap Oluştur</Text>
              <Text style={styles.subtitle}>
                Meme savaşlarına katılmak için hesap oluştur
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
                <Text style={styles.label}>Kullanıcı Adı</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="kullaniciadi"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={20}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Şifre</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="En az 6 karakter"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Şifre Tekrar</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Şifrenizi tekrar girin"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonSection}>
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton, loading && styles.disabledButton]} 
                onPress={handleSignUp}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? 'Hesap oluşturuluyor...' : '🚀 Hesap Oluştur'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]} 
                onPress={handleSignIn}
              >
                <Text style={styles.secondaryButtonText}>
                  Zaten hesabın var mı? Giriş yap
                </Text>
              </TouchableOpacity>
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
}); 