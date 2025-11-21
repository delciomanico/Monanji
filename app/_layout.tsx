import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
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
    <>

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
        <Stack.Screen
          name="complaint"
          options={{ 
            headerShown: false,
            presentation: 'modal',
          }}
        />
      </Stack>

    </>
  );
}
