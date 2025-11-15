import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

export const resetOnboarding = async () => {
  try {
    await SecureStore.deleteItemAsync('hasSeenOnboarding');
    Alert.alert('Sucesso', 'Onboarding resetado! Reinicie o app.');
  } catch (error) {
    Alert.alert('Erro', 'Não foi possível resetar o onboarding.');
  }
};