import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Message } from '@/types';
import { colors, radius, spacing } from '@/theme';
import { formatMessageTime } from '@/utils/messages';
import { Avatar } from './Avatar';

interface MessageBubbleProps {
  message: Message;
  mine: boolean;
  showSender: boolean;
  pending?: boolean;
  onLongPress?: () => void;
}

export function MessageBubble({
  message,
  mine,
  showSender,
  pending,
  onLongPress,
}: MessageBubbleProps) {
  return (
    <Pressable
      onLongPress={mine ? onLongPress : undefined}
      style={[styles.row, mine && styles.rowMine]}
    >
      {!mine && (
        <View style={styles.avatarSlot}>
          {showSender ? (
            <Avatar username={message.username} color={message.avatarColor} size={32} />
          ) : null}
        </View>
      )}
      <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
        {showSender && !mine ? (
          <Text style={styles.sender}>{message.username}</Text>
        ) : null}
        <Text style={[styles.body, mine && styles.bodyMine]}>{message.body}</Text>
        <Text style={[styles.time, mine && styles.timeMine, pending && styles.pending]}>
          {pending ? 'Enviando...' : formatMessageTime(message.createdAt)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    marginVertical: 2,
  },
  rowMine: { flexDirection: 'row-reverse' },
  avatarSlot: { width: 32 },
  bubble: {
    maxWidth: '75%',
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: 2,
  },
  bubbleMine: {
    backgroundColor: colors.bubbleMine,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: colors.bubbleTheirs,
    borderBottomLeftRadius: 4,
  },
  sender: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  body: { fontSize: 15, color: colors.text, lineHeight: 20 },
  bodyMine: { color: colors.onPrimary },
  time: { fontSize: 11, color: colors.muted, alignSelf: 'flex-end' },
  timeMine: { color: 'rgba(255,255,255,0.7)' },
  pending: { fontStyle: 'italic' },
});
