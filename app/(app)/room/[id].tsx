import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/Avatar';
import { MessageBubble } from '@/components/MessageBubble';
import { TypingIndicator } from '@/components/TypingIndicator';
import { ErrorState, LoadingView } from '@/components/StateViews';
import { useAuth } from '@/context/AuthContext';
import { useDeleteMessage, useMessages, useSendMessage } from '@/hooks/useMessages';
import { useRoom, useRoomMembers, useJoinRoom } from '@/hooks/useRooms';
import { useRoomPresence } from '@/hooks/usePresence';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { groupMessagesByDay } from '@/utils/messages';
import { colors, spacing } from '@/theme';
import type { Message, PendingMessage } from '@/types';

type ListItem =
  | { type: 'separator'; date: string; key: string }
  | { type: 'message'; message: Message | PendingMessage; key: string };

export default function RoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const navigation = useNavigation();

  const { data: room, isLoading: roomLoading } = useRoom(id);
  const { data: messages, isLoading: msgLoading, isError, refetch } = useMessages(id);
  const { data: members } = useRoomMembers(id);
  const onlineIds = useRoomPresence(id);
  const { typingNames, notifyTyping } = useTypingIndicator(id);
  const sendMessage = useSendMessage(id);
  const deleteMessage = useDeleteMessage(id);
  const joinRoom = useJoinRoom();

  const [text, setText] = useState('');
  const flatRef = useRef<FlatList>(null);

  // Set room name in header
  useEffect(() => {
    if (room) {
      navigation.setOptions({ headerTitle: `${room.emoji ?? '💬'} ${room.name}` });
    }
  }, [room, navigation]);

  // Auto-join if not a member
  useEffect(() => {
    if (user && id && members) {
      const isMember = members.some((m) => m.user_id === user.id);
      if (!isMember) joinRoom.mutate({ roomId: id, userId: user.id });
    }
  }, [user, id, members]);

  const handleSend = () => {
    const content = text.trim();
    if (!content || !user) return;
    setText('');
    sendMessage.mutate({ content, userId: user.id });
  };

  const handleChangeText = (val: string) => {
    setText(val);
    if (val.trim()) notifyTyping();
  };

  if (roomLoading || msgLoading) return <LoadingView />;
  if (isError) return <ErrorState onRetry={refetch} />;

  // Build flat list data from grouped messages
  const sections = groupMessagesByDay(messages ?? []);
  const listData: ListItem[] = [];
  for (const section of sections) {
    listData.push({ type: 'separator', date: section.date, key: `sep-${section.date}` });
    for (const msg of section.messages) {
      listData.push({ type: 'message', message: msg, key: msg.id });
    }
  }

  const onlineCount = onlineIds.length;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Online count bar */}
      <View style={styles.presenceBar}>
        <View style={styles.onlineDot} />
        <Text style={styles.presenceText}>
          {onlineCount === 1 ? '1 online' : `${onlineCount} online`}
        </Text>

        {/* Member avatars */}
        <View style={styles.memberAvatars}>
          {(members ?? []).slice(0, 5).map((m) => (
            <Avatar
              key={m.user_id}
              name={m.profiles?.username ?? '?'}
              size={24}
              style={styles.memberAvatar}
            />
          ))}
          {(members?.length ?? 0) > 5 && (
            <Text style={styles.moreMembers}>+{(members?.length ?? 0) - 5}</Text>
          )}
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatRef}
        data={listData}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => {
          if (item.type === 'separator') {
            return (
              <View style={styles.daySep}>
                <View style={styles.daySepLine} />
                <Text style={styles.daySepText}>{item.date}</Text>
                <View style={styles.daySepLine} />
              </View>
            );
          }
          const msg = item.message;
          const isOwn = msg.user_id === user?.id;
          return (
            <MessageBubble
              message={msg}
              isOwn={isOwn}
              onLongPress={
                isOwn && !('pending' in msg)
                  ? () => deleteMessage.mutate(msg.id)
                  : undefined
              }
            />
          );
        }}
      />

      {/* Typing indicator */}
      {typingNames.length > 0 && (
        <TypingIndicator names={typingNames} style={styles.typing} />
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={handleChangeText}
          placeholder="Mensagem…"
          placeholderTextColor={colors.muted}
          multiline
          maxLength={1000}
          returnKeyType="default"
        />
        <Pressable
          style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  presenceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  presenceText: { color: colors.muted, fontSize: 13 },
  memberAvatars: { flexDirection: 'row', marginLeft: 'auto', gap: -6 },
  memberAvatar: { borderWidth: 1.5, borderColor: colors.card },
  moreMembers: { color: colors.muted, fontSize: 12, marginLeft: 4 },
  messageList: { padding: spacing.md, gap: 2, flexGrow: 1 },
  daySep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
    gap: spacing.sm,
  },
  daySepLine: { flex: 1, height: 1, backgroundColor: colors.border },
  daySepText: { color: colors.muted, fontSize: 12 },
  typing: { paddingHorizontal: spacing.md, paddingBottom: 4 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.border },
});
