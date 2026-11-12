import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Room } from '@/types';
import { colors, radius, spacing } from '@/theme';

interface RoomCardProps {
  room: Room;
  isMember: boolean;
  onPress: () => void;
}

export function RoomCard({ room, isMember, onPress }: RoomCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <Text style={styles.emoji}>{room.emoji}</Text>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {room.name}
          </Text>
          {isMember && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Você participa</Text>
            </View>
          )}
        </View>
        {room.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {room.description}
          </Text>
        ) : null}
        <Text style={styles.count}>{room.memberCount ?? 0} participantes</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  emoji: { fontSize: 32, lineHeight: 40 },
  info: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  name: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 },
  badge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 11, color: colors.primary, fontWeight: '600' },
  description: { fontSize: 13, color: colors.muted },
  count: { fontSize: 12, color: colors.muted },
});
