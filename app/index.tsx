import { Redirect } from 'expo-router';
import { LoadingView } from '@/components/StateViews';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) return <LoadingView />;
  if (session) return <Redirect href="/(app)/(tabs)" />;
  return <Redirect href="/(auth)/login" />;
}
