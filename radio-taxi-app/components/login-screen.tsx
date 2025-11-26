import React from 'react';
import { SafeAreaView, View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import * as Api from '../utils/api';

interface LoginScreenProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onLogin: () => void;
}

export function LoginScreen({ email, setEmail, password, setPassword, onLogin }: LoginScreenProps) {
  const inputBg = useThemeColor({ light: '#fff', dark: '#1e1f20' }, 'background');
  const inputTextColor = useThemeColor({}, 'text');
  const inputBorder = useThemeColor({ light: '#ccc', dark: '#333' }, 'background');
  const placeholderColor = useThemeColor({ light: '#666', dark: '#9a9a9a' }, 'text');

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Radio Taxi</Text>
      <Text style={styles.subtitle}>Sign in to request rides</Text>
      <View
        style={{
          marginHorizontal: 12,
          marginBottom: 12,
          padding: 8,
          backgroundColor: inputBorder,
          borderRadius: 4,
        }}
      >
        <Text style={{ fontSize: 11, color: placeholderColor }}>Server: {Api.API_BASE}</Text>
        <Text style={{ fontSize: 10, color: placeholderColor, marginTop: 4 }}>
          If using physical device, set EXPO_PUBLIC_API_URL to your machine&apos;s IP
        </Text>
      </View>
      <TextInput
        style={[styles.input, { backgroundColor: inputBg, color: inputTextColor, borderColor: inputBorder }]}
        placeholder="Email"
        placeholderTextColor={placeholderColor}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={[styles.input, { backgroundColor: inputBg, color: inputTextColor, borderColor: inputBorder }]}
        placeholder="Password"
        placeholderTextColor={placeholderColor}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <View style={{ marginHorizontal: 12, marginTop: 8 }}>
        <Button title="Login" onPress={onLogin} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', margin: 12, textAlign: 'center' },
  subtitle: { fontSize: 14, marginHorizontal: 12, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, margin: 12, borderRadius: 4 },
});
