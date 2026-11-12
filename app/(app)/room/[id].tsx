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
import { groupMessagesByDay, shouldGroupWithPrevious } from '@/utils/messages';
import { colors, spacing } from '@/theme';
import type { Message, PendingMessage } from '@/types';
import { friendlyError } from '@/utils/errors';

type ListItem =
  | { type: 'separator'; label: string; key: string }
  | {
      type: 'message';
      message: Message | PendingMessage;
      key: string;
      showSender: boolean;
    };

export default function RoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const navigation = useNavigation();

  const {
    data: room,
    isLoading: roomLoading,
    isError: roomError,
    refetch: refetchRoom,
  } = useRoom(id);
  const { data: messages, isLoading: msgLoading, isError, refetch } = useMessages(id);
  const { data: members } = useRoomMembers(id);
  const onlineIds = useRoomPresence(id);
  const { typingUsernames, notifyTyping } = useTypingIndicator(id);
  const sendMessage = useSendMessage(id);
  const deleteMessage = useDeleteMessage(id);
  const joinRoom = useJoinRoom();

  const [text, setText] = useState('');
  const flatRef = useRef<FlatList>(null);
  const joinAttemptedForRoom = useRef<string | null>(null);

  // Set room name in header
  useEffect(() => {
    if (room) {
      navigation.setOptions({ headerTitle: `${room.emoji ?? '💬'} ${room.name}` });
    }
  }, [room, navigation]);

  // Auto-join if not a member
  useEffect(() => {
    if (user && id && members && joinAttemptedForRoom.current !== id) {
      const isMember = members.some((member) => member.userId === user.id);
      if (!isMember) {
        joinAttemptedForRoom.current = id;
        joinRoom.mutate(id);
      }
    }
  }, [user, id, members, joinRoom]);

  const handleSend = () => {
    const content = text.trim();
    if (!content || !user) return;
    setText('');
    sendMessage.mutate(content, {
      onError: () => setText(content),
    });
  };

  const handleChangeText = (val: string) => {
    setText(val);
    if (val.trim()) notifyTyping();
  };

  if (roomLoading || msgLoading) return <LoadingView />;
  if (roomError) return <ErrorState onRetry={refetchRoom} />;
  if (joinRoom.isError) {
    return (
      <ErrorState
        message={friendlyError(joinRoom.error)}
        onRetry={() => {
          joinAttemptedForRoom.current = null;
          joinRoom.reset();
        }}
      />
    );
  }
  if (isError) return <ErrorState onRetry={refetch} />;

  // Build flat list data from grouped messages
  const sections = groupMessagesByDay(messages ?? []);
  const listData: ListItem[] = [];
  for (const section of sections) {
    listData.push({ type: 'separator', label: section.label, key: `sep-${section.label}` });
    let previous: Message | undefined;
    for (const msg of section.messages) {
      listData.push({
        type: 'message',
        message: msg,
        key: msg.id,
        showSender: !shouldGroupWithPrevious(msg, previous),
      });
      previous = msg;
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
          {(members ?? []).slice(0, 5).map((m, index) => (
            <Avatar
              key={m.userId}
              username={m.username}
              color={m.avatarColor}
              size={24}
              style={index > 0 ? styles.memberAvatarOverlap : undefined}
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
                <Text style={styles.daySepText}>{item.label}</Text>
                <View style={styles.daySepLine} />
              </View>
            );
          }
          const msg = item.message;
          const isOwn = msg.userId === user?.id;
          return (
            <MessageBubble
              message={msg}
              mine={isOwn}
              showSender={item.showSender}
              pending={'pending' in msg && msg.pending}
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
      {(sendMessage.error || deleteMessage.error) && (
        <Text style={styles.actionError}>
          {friendlyError(sendMessage.error ?? deleteMessage.error)}
        </Text>
      )}
      {typingUsernames.length > 0 && (
        <View style={styles.typing}>
          <TypingIndicator usernames={typingUsernames} />
        </View>
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
    backgroundColor: colors.surface,
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
  memberAvatars: { flexDirection: 'row', marginLeft: 'auto' },
  memberAvatarOverlap: { marginLeft: -6, borderWidth: 1.5, borderColor: colors.surface },
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
  actionError: {
    color: colors.danger,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.surface,
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
