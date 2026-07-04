import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/presentation/auth/auth-context';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { user, isLoading, requiresAuth, needsOnboarding } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (requiresAuth && !user && !inAuthGroup) {
      router.replace('/sign-in');
    } else if (user && inAuthGroup) {
      router.replace('/');
    } else if (user && needsOnboarding && !inOnboarding) {
      // Logado mas sem coleção → monta o álbum antes de descobrir matches.
      // (Só força a entrada; sair é decisão do usuário via "Concluir".)
      router.replace('/onboarding');
    }
  }, [user, isLoading, requiresAuth, needsOnboarding, segments, router]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="scan" options={{ presentation: 'modal', title: 'Escanear item' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <AnimatedSplashOverlay />
          <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
