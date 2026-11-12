export function friendlyError(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
    if (msg.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
    if (msg.includes('user already registered')) return 'Este e-mail já está cadastrado.';
    if (msg.includes('network')) return 'Sem conexão. Verifique sua internet.';
    return error.message;
  }
  return 'Algo deu errado. Tente novamente.';
}
