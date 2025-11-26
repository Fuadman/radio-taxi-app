import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import * as Api from '../utils/api';

interface UserInfo {
  id: string;
  email: string;
  user_type?: string;
  full_name?: string;
  phone?: string;
}

export function useAuth() {
  const [email, setEmail] = useState('john.doe@example.com');
  const [password, setPassword] = useState('password123');
  const [token, setToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Load token and user info from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem('auth_token');
        const storedUserInfo = await AsyncStorage.getItem('user_info');
        if (storedToken) setToken(storedToken);
        if (storedUserInfo) setUserInfo(JSON.parse(storedUserInfo));
      } catch (e) {
        console.warn('Failed to load token', e);
      }
    })();
  }, []);

  async function login() {
    try {
      const j = await Api.login({ email, password });
      if (!j || j.error) return Alert.alert('Error', j?.error || 'login failed');
      await AsyncStorage.setItem('auth_token', j.token);
      if (j.user) {
        await AsyncStorage.setItem('user_info', JSON.stringify(j.user));
        setUserInfo(j.user);
      }
      setToken(j.token);
      Alert.alert('Logged in');
    } catch (err) {
      Alert.alert('Error', String(err));
    }
  }

  async function logout() {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_info');
    setToken(null);
    setUserInfo(null);
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    token,
    userInfo,
    login,
    logout,
  };
}
