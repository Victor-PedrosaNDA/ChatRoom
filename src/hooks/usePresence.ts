import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

// Retorna a lista de user_ids online na sala (via Supabase Presence).
export function useRoomPresence(roomId: string | undefined): string[] {
  const { user } = useAuth();
  const [onlineIds, setOnlineIds] = useState<string[]>([]);

  useEffect(() => {
    if (!roomId || !user) return;

    const channel = supabase.channel(`presence-${roomId}`, {
      config: { presence: { key: user.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ user_id: string }>();
        const ids = Object.keys(state);
        setOnlineIds(ids);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user.id });
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [roomId, user]);

  return onlineIds;
}
