import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  deleteMessage,
  getMessage,
  listMessages,
  sendMessage,
} from '@/services/messages';
import { useMyProfile } from './useMyProfile';
import type { Message, PendingMessage } from '@/types';

// Histórico da sala + a inscrição no Realtime.
export function useMessages(roomId: string | undefined) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['messages', roomId],
    queryFn: () => listMessages(roomId as string),
    enabled: Boolean(roomId),
  });

  useEffect(() => {
    if (!roomId) return undefined;

    const channel = supabase
      .channel(`room-messages-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const id = payload.new.id as string;
          try {
            const full = await getMessage(id);
            queryClient.setQueryData<Message[]>(['messages', roomId], (old) => {
              if (!old) return [full];
              if (old.some((m) => m.id === full.id)) return old;
              return [...old, full];
            });
          } catch {
            void queryClient.invalidateQueries({ queryKey: ['messages', roomId] });
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const id = payload.old.id as string;
          queryClient.setQueryData<Message[]>(['messages', roomId], (old) =>
            old?.filter((m) => m.id !== id),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, queryClient]);

  return query;
}

// Envia com atualização otimista.
export function useSendMessage(roomId: string) {
  const { user } = useAuth();
  const { data: profile } = useMyProfile();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: string) => {
      if (!user) throw new Error('Faça login para enviar mensagens.');
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const optimistic: PendingMessage = {
        id: tempId,
        roomId,
        userId: user.id,
        body,
        createdAt: new Date().toISOString(),
        username: profile?.username ?? 'Você',
        avatarColor: profile?.avatarColor ?? '#2563EB',
        pending: true,
      };
      queryClient.setQueryData<Message[]>(['messages', roomId], (old) => [
        ...(old ?? []),
        optimistic,
      ]);

      try {
        const real = await sendMessage(roomId, user.id, body);
        queryClient.setQueryData<Message[]>(['messages', roomId], (old) => {
          const withoutTemporary = old?.filter((message) => message.id !== tempId) ?? [];
          return withoutTemporary.some((message) => message.id === real.id)
            ? withoutTemporary
            : [...withoutTemporary, real];
        });
        return real;
      } catch (error) {
        queryClient.setQueryData<Message[]>(['messages', roomId], (old) =>
          old?.filter((m) => m.id !== tempId),
        );
        throw error;
      }
    },
  });
}

export function useDeleteMessage(roomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMessage,
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Message[]>(['messages', roomId], (old) =>
        old?.filter((m) => m.id !== id),
      );
    },
  });
}
