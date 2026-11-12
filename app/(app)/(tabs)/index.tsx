import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RoomCard } from '@/components/RoomCard';
import { EmptyState, ErrorState, LoadingView } from '@/components/StateViews';
import { useMyRoomIds, useRooms } from '@/hooks/useRooms';
import { colors, spacing } from '@/theme';
import type { Room } from '@/types';

export default function RoomsScreen() {
  const router = useRouter();
  const { data: rooms, isLoading, isError, refetch } = useRooms();
  const { data: myRoomIds } = useMyRoomIds();

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <View style={styles.container}>
      <FlatList<Room>
        data={rooms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.header}>Salas</Text>}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles-outline"
            title="Nenhuma sala ainda"
            message="Crie a primeira sala usando o botão abaixo!"
          />
        }
        renderItem={({ item }) => (
          <RoomCard
            room={item}
            isMember={myRoomIds?.has(item.id) ?? false}
            onPress={() => router.push(`/room/${item.id}`)}
          />
        )}
      />

      <Pressable style={styles.fab} onPress={() => router.push('/room/new')}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, gap: spacing.sm, flexGrow: 1 },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
});
