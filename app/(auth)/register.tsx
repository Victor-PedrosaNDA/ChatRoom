import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, Text } from 'react-native';
import { Button } from '@/components/Button';
import { FormInput } from '@/components/FormInput';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/context/AuthContext';
import { registerSchema } from '@/schemas/auth';
import type { RegisterFormData } from '@/schemas/auth';
import { colors, spacing } from '@/theme';
import { friendlyError } from '@/utils/errors';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const { control, handleSubmit, formState } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirm: '' },
  });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    setNotice(null);
    try {
      const { needsConfirmation } = await signUp(
        values.name,
        values.email,
        values.password,
      );
      if (needsConfirmation) {
        setNotice(
          'Conta criada. Verifique seu e-mail para confirmar o cadastro e depois entre.',
        );
      }
    } catch (error) {
      setFormError(friendlyError(error));
    }
  });

  return (
    <Screen scroll>
      <Text style={styles.title}>Criar conta</Text>
      <Text style={styles.subtitle}>Leva menos de um minuto.</Text>

      <FormInput
        control={control}
        name="name"
        label="Nome"
        placeholder="Seu nome"
        autoComplete="name"
      />
      <FormInput
        control={control}
        name="email"
        label="E-mail"
        placeholder="voce@email.com"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      <FormInput
        control={control}
        name="password"
        label="Senha"
        placeholder="Mínimo de 6 caracteres"
        secureTextEntry
      />
      <FormInput
        control={control}
        name="confirm"
        label="Confirmar senha"
        placeholder="Repita a senha"
        secureTextEntry
      />

      {formError ? <Text style={styles.error}>{formError}</Text> : null}
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      <Button title="Criar conta" onPress={submit} loading={formState.isSubmitting} />

      <Link href="/(auth)/login" style={styles.link}>
        Já tem conta? <Text style={styles.linkStrong}>Entrar</Text>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', color: colors.text, marginTop: spacing.lg },
  subtitle: { fontSize: 15, color: colors.muted, marginBottom: spacing.lg, marginTop: 4 },
  error: { color: colors.danger, marginBottom: spacing.md, textAlign: 'center' },
  notice: { color: colors.success, marginBottom: spacing.md, textAlign: 'center' },
  link: { marginTop: spacing.lg, textAlign: 'center', color: colors.muted, fontSize: 15 },
  linkStrong: { color: colors.primary, fontWeight: '700' },
});
