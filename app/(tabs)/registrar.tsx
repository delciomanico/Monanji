import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RegisterRedirectScreen() {
  const router = useRouter();

  // Redireciona automaticamente para o novo sistema de denúncias
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/complaint');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Tela de carregamento enquanto redireciona
  return (
    <View style={redirectStyles.wrapper}>
      <StatusBar style="light" backgroundColor="#1E88E5" translucent={false} />
      <SafeAreaView style={redirectStyles.safeArea} edges={['top', 'left', 'right']}>
        <LinearGradient
          colors={['#e5edf4ff', '#ffffff', '#ffffffff']}
          style={redirectStyles.container}
        >
          <View style={redirectStyles.content}>
            <View style={redirectStyles.iconContainer}>
              <Feather name="arrow-right" size={32} color="#1E88E5" />
            </View>
            <Text style={redirectStyles.redirectText}>
              Redirecionando para o novo sistema de denúncias...
            </Text>
            <TouchableOpacity 
              style={redirectStyles.manualButton}
              onPress={() => router.replace('/complaint')}
            >
              <Text style={redirectStyles.manualButtonText}>
                Clique aqui se não for redirecionado automaticamente
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    </View>
  );
}

const redirectStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#1E88E5',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#1E88E5',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(30, 136, 229, 0.1)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  redirectText: {
    fontSize: 16,
    color: '#0A0F0D',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  manualButton: {
    backgroundColor: 'rgba(30, 136, 229, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(30, 136, 229, 0.3)',
  },
  manualButtonText: {
    fontSize: 12,
    color: '#1E88E5',
    textAlign: 'center',
  },
});