import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { FormInput } from '@/components/FormInput';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/context/AuthContext';
import { useMyProfile, useUpdateUsername } from '@/hooks/useMyProfile';
import { colors, spacing } from '@/theme';
import { friendlyError } from '@/utils/errors';

const schema = z.object({
  username: z
    .string()
    .min(3, 'Mínimo de 3 caracteres')
    .max(32, 'Máximo de 32 caracteres'),
});
type FormData = z.infer<typeof schema>;

export default function ProfileScreen() {
  const { signOut, user } = useAuth();
  const { data: profile } = useMyProfile();
  const updateUsername = useUpdateUsername();
  const [saveFeedback, setSaveFeedback] = useState<{
    message: string;
    isError: boolean;
  } | null>(null);

  const { control, handleSubmit, reset, formState } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { username: '' },
  });

  useEffect(() => {
    if (profile?.username) reset({ username: profile.username });
  }, [profile?.username, reset]);

  const submit = handleSubmit(async (values) => {
    setSaveFeedback(null);
    try {
      await updateUsername.mutateAsync(values.username);
      setSaveFeedback({ message: 'Nome atualizado!', isError: false });
    } catch (error) {
      setSaveFeedback({ message: friendlyError(error), isError: true });
    }
  });

  return (
    <Screen scroll>
      <Text style={styles.header}>Perfil</Text>

      <View style={styles.avatarRow}>
        <Avatar
          username={profile?.username ?? user?.email ?? '?'}
          color={profile?.avatarColor ?? colors.primary}
          size={72}
        />
      </View>

      <Text style={styles.email}>{user?.email}</Text>

      <FormInput control={control} name="username" label="Nome de exibição" />

      {saveFeedback ? (
        <Text style={[styles.feedback, saveFeedback.isError && styles.feedbackError]}>
          {saveFeedback.message}
        </Text>
      ) : null}

      <Button
        title="Salvar"
        onPress={submit}
        loading={formState.isSubmitting || updateUsername.isPending}
        style={styles.btn}
      />

      <Button title="Sair" variant="danger" onPress={signOut} style={styles.btn} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.lg,
  },
  avatarRow: { alignItems: 'center', marginVertical: spacing.lg },
  feedback: { color: colors.success, textAlign: 'center', marginBottom: spacing.sm },
  feedbackError: { color: colors.danger },
  email: {
    textAlign: 'center',
    color: colors.muted,
    marginBottom: spacing.lg,
    fontSize: 15,
  },
  btn: { marginTop: spacing.sm },
});
