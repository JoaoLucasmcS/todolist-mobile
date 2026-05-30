import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../src/store/useAuthStore';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const sessionToken = useAuthStore((s) => s.sessionToken);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;

    const first = segments[0];
    const inAuthScreen = first === 'login' || first === 'signup';
    const isAuthenticated = !!sessionToken;

    if (!isAuthenticated && !inAuthScreen) {
      router.replace('/login');
    } else if (isAuthenticated && inAuthScreen) {
      router.replace('/(tabs)');
    }
  }, [hydrated, sessionToken, segments, router]);

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="task/[id]" options={{ title: 'Detalhes da Tarefa' }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
