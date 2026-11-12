import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/theme';
import type { IconName } from '@/utils/icons';
import { Button } from './Button';

export function LoadingView() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.center}>
      <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
      <Text style={styles.errorText}>{message ?? 'Algo deu errado.'}</Text>
      {onRetry ? <Button title="Tentar novamente" onPress={onRetry} /> : null}
    </View>
  );
}

interface EmptyStateProps {
  icon: IconName;
  title: string;
  message?: string;
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <View style={styles.center}>
      <Ionicons name={icon} size={56} color={colors.border} />
      <Text style={styles.emptyTitle}>{title}</Text>
      {message ? <Text style={styles.emptyMessage}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  errorText: { fontSize: 15, color: colors.danger, textAlign: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center' },
  emptyMessage: { fontSize: 14, color: colors.muted, textAlign: 'center' },
});
