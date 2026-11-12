import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@/theme';
import { formatTypingIndicator } from '@/utils/typing';

interface TypingIndicatorProps {
  usernames: string[];
}

export function TypingIndicator({ usernames }: TypingIndicatorProps) {
  const text = formatTypingIndicator(usernames);
  if (!text) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  text: {
    fontSize: 12,
    color: colors.muted,
    fontStyle: 'italic',
  },
});
