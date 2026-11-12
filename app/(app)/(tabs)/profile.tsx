import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { FormInput } from '@/components/FormInput';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/context/AuthContext';
import { useMyProfile, useUpdateUsername } from '@/hooks/useMyProfile';
import { colors, spacing } from '@/theme';

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

  const { control, handleSubmit, reset, formState } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { username: '' },
  });

  useEffect(() => {
    if (profile?.username) reset({ username: profile.username });
  }, [profile?.username, reset]);

  const submit = handleSubmit(async (values) => {
    try {
      await updateUsername.mutateAsync(values.username);
      Alert.alert('Sucesso', 'Nome atualizado!');
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar o nome.');
    }
  });

  return (
    <Screen scroll>
      <Text style={styles.header}>Perfil</Text>

      <View style={styles.avatarRow}>
        <Avatar name={profile?.username ?? user?.email ?? '?'} size={72} />
      </View>

      <Text style={styles.email}>{user?.email}</Text>

      <FormInput control={control} name="username" label="Nome de exibição" />

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
  email: {
    textAlign: 'center',
    color: colors.muted,
    marginBottom: spacing.lg,
    fontSize: 15,
  },
  btn: { marginTop: spacing.sm },
});
