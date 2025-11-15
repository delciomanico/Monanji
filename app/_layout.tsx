import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

   useEffect(() => {
    // Esconder o splash screen o mais rápido possível
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
    };
    
    hideSplash();
  }, []);


  useEffect(() => {
    async function prepare() {
      try {
        
        setTimeout(() => {
            router.replace('/loading'); 
        }, 100);

      } catch (e) {
        console.warn(e);
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 100);
      }
    }

    prepare();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DefaultTheme : DefaultTheme}>

      <Stack>
        <Stack.Screen
          name="loading/index"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="personDetail/index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="report/index"
          options={{ headerShown: false }}
        />
         
      </Stack>
     
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
