import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';
import { Button } from '@/components/Button';
import { FormInput } from '@/components/FormInput';
import { Screen } from '@/components/Screen';
import { useCreateRoom } from '@/hooks/useRooms';
import { colors, spacing } from '@/theme';
import { friendlyError } from '@/utils/errors';

const EMOJIS = ['💬', '🎮', '📚', '🎵', '🍕', '⚽', '🌍', '💡', '🚀', '❤️'];

const schema = z.object({
  name: z.string().min(2, 'Mínimo de 2 caracteres').max(50, 'Máximo de 50'),
  description: z.string().max(200, 'Máximo de 200 caracteres').optional(),
});
type FormData = z.infer<typeof schema>;

export default function NewRoomScreen() {
  const router = useRouter();
  const createRoom = useCreateRoom();
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit, formState } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '' },
  });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const roomId = await createRoom.mutateAsync({
        name: values.name,
        description: values.description ?? '',
        emoji,
      });
      router.replace(`/room/${roomId}`);
    } catch (error) {
      setFormError(friendlyError(error));
    }
  });

  return (
    <Screen scroll>
      <Text style={styles.section}>Ícone</Text>
      <FlatList
        data={EMOJIS}
        horizontal
        keyExtractor={(e) => e}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.emojiList}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.emojiBtn, item === emoji && styles.emojiBtnActive]}
            onPress={() => setEmoji(item)}
          >
            <Text style={styles.emojiText}>{item}</Text>
          </Pressable>
        )}
      />

      <FormInput control={control} name="name" label="Nome da sala" placeholder="ex: Estudos" />
      <FormInput
        control={control}
        name="description"
        label="Descrição (opcional)"
        placeholder="Do que se trata essa sala?"
        multiline
        numberOfLines={3}
      />

      <View style={styles.preview}>
        <Text style={styles.previewEmoji}>{emoji}</Text>
      </View>

      {formError ? <Text style={styles.error}>{formError}</Text> : null}

      <Button
        title="Criar sala"
        onPress={submit}
        loading={formState.isSubmitting || createRoom.isPending}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { fontWeight: '700', color: colors.muted, marginBottom: spacing.sm },
  emojiList: { gap: spacing.sm, marginBottom: spacing.lg },
  emojiBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiBtnActive: { borderColor: colors.primary },
  emojiText: { fontSize: 24 },
  preview: { alignItems: 'center', marginVertical: spacing.lg },
  previewEmoji: { fontSize: 64 },
  error: { color: colors.danger, marginBottom: spacing.md, textAlign: 'center' },
});
