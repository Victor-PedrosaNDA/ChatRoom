import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useMyProfile } from './useMyProfile';

const TYPING_TIMEOUT_MS = 3000;

interface TypingPayload {
  user_id: string;
  username: string;
}

// Escuta quem está digitando (Broadcast) e expõe os nomes.
// notifyTyping() deve ser chamado a cada tecla pressionada.
export function useTypingIndicator(roomId: string | undefined) {
  const { user } = useAuth();
  const { data: profile } = useMyProfile();
  const [typingMap, setTypingMap] = useState<Map<string, string>>(new Map());
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!roomId || !user) return;

    const channel = supabase.channel(`typing-${roomId}`);
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'typing' }, ({ payload }: { payload: TypingPayload }) => {
        if (payload.user_id === user.id) return; // ignora o próprio
        const { user_id, username } = payload;

        setTypingMap((prev) => {
          const next = new Map(prev);
          next.set(user_id, username);
          return next;
        });

        // Remove após o timeout de inatividade.
        const existing = timers.current.get(user_id);
        if (existing) clearTimeout(existing);
        timers.current.set(
          user_id,
          setTimeout(() => {
            setTypingMap((prev) => {
              const next = new Map(prev);
              next.delete(user_id);
              return next;
            });
            timers.current.delete(user_id);
          }, TYPING_TIMEOUT_MS),
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      timers.current.forEach(clearTimeout);
      timers.current.clear();
      channelRef.current = null;
    };
  }, [roomId, user]);

  const notifyTyping = useCallback(() => {
    if (!channelRef.current || !user || !profile) return;
    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: user.id, username: profile.username } satisfies TypingPayload,
    });
  }, [user, profile]);

  const typingUsernames = Array.from(typingMap.values());

  return { typingUsernames, notifyTyping };
}
