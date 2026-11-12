import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { LoadingView } from '@/components/StateViews';

export default function AppLayout() {
  const { session, loading } = useAuth();

  if (loading) return <LoadingView />;
  if (!session) return <Redirect href="/(auth)/login" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="room/[id]"
        options={{
          headerShown: true,
          headerBackTitle: 'Salas',
          headerTitle: '',
        }}
      />
      <Stack.Screen
        name="room/new"
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Nova Sala',
        }}
      />
    </Stack>
  );
}
