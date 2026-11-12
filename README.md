# ChatRoom 💬

App de chat em tempo real construído com **React Native (Expo)**, **Supabase** e **TanStack Query**, seguindo um guia de desenvolvimento passo a passo.

---

## ✨ Funcionalidades

- 🔐 Autenticação por e-mail e senha
- 🏠 Criação e listagem de salas de chat com emoji
- 💬 Mensagens em tempo real via Supabase Realtime
- 👥 Indicador de presença (quem está online na sala)
- ✍️ Indicador de digitação em tempo real
- ⚡ Envio otimista de mensagens (sem delay visual)
- 👤 Perfil editável com username
- 🗑️ Exclusão de mensagens próprias
- 🧪 29 testes automatizados (banco + unidade)

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|---|---|
| Framework mobile | React Native + Expo |
| Navegação | Expo Router (file-based) |
| Backend / Auth | Supabase (PostgreSQL + RLS) |
| Dados em cache | TanStack Query (React Query v5) |
| Formulários | Zod + react-hook-form |
| Testes de banco | PGlite (`node --test`) |
| Testes de unidade | Jest (jest-expo) |

---

## 📋 Pré-requisitos

- **Node.js 20+**
- Conta no [Supabase](https://supabase.com)
- **Expo Go** no celular, ou simulador iOS/Android

---

## 🚀 Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Criar o banco de dados no Supabase

1. Crie um projeto em [app.supabase.com](https://app.supabase.com)
2. Vá em **SQL Editor** e execute o conteúdo de `supabase/schema.sql`
   > Se aparecer o erro `relation "profiles" already exists`, rode antes:
   > ```sql
   > DROP TABLE IF EXISTS messages CASCADE;
   > DROP TABLE IF EXISTS room_members CASCADE;
   > DROP TABLE IF EXISTS rooms CASCADE;
   > DROP TABLE IF EXISTS profiles CASCADE;
   > ```
3. Vá em **Project Settings → API** e copie a **URL** e a **anon key**

### 3. Configurar variáveis de ambiente

```powershell
Copy-Item .env.example .env
```

No PowerShell do Windows, use o comando acima. Confira se `EXPO_PUBLIC_SUPABASE_URL`
e `EXPO_PUBLIC_SUPABASE_KEY` no arquivo `.env` correspondem ao seu projeto Supabase;
o Expo não carrega `.env.example` automaticamente.

Edite `.env` com seus dados:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Iniciar o app

```bash
npx expo start -c
```

Escaneie o QR code com o **Expo Go**, ou pressione:
- `i` → simulador iOS
- `a` → emulador Android
- `w` → navegador web

---

## 🧪 Testes

### Testes de unidade (Jest)

```bash
npm test
```

### Testes de banco de dados (PGlite)

```bash
node --test supabase/tests/db.test.mjs
```

> Total: **29 testes** — 12 de banco e 17 de unidade.

---

## 📁 Estrutura do projeto

```
chatroom/
├── app/                          # Rotas (Expo Router)
│   ├── _layout.tsx               # Layout raiz (providers)
│   ├── index.tsx                 # Redirect inicial
│   ├── (auth)/
│   │   ├── login.tsx             # Tela de login
│   │   └── register.tsx          # Tela de cadastro
│   └── (app)/
│       ├── (tabs)/
│       │   ├── index.tsx         # Lista de salas
│       │   └── profile.tsx       # Perfil do usuário
│       └── room/
│           ├── [id].tsx          # Chat da sala
│           └── new.tsx           # Criar nova sala
├── src/
│   ├── components/               # Componentes reutilizáveis
│   │   ├── Button.tsx
│   │   ├── Input.tsx / FormInput.tsx
│   │   ├── Card.tsx / Avatar.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── RoomCard.tsx
│   │   ├── TypingIndicator.tsx
│   │   ├── StateViews.tsx
│   │   └── Screen.tsx
│   ├── context/
│   │   └── AuthContext.tsx       # Sessão do usuário
│   ├── hooks/                    # React Query hooks
│   │   ├── useMessages.ts        # + envio otimista + realtime
│   │   ├── useRooms.ts
│   │   ├── useMyProfile.ts
│   │   ├── usePresence.ts        # Supabase Presence
│   │   └── useTypingIndicator.ts # Supabase Broadcast
│   ├── lib/
│   │   ├── supabase.ts           # Cliente + AppState refresh
│   │   └── queryClient.ts
│   ├── schemas/
│   │   └── auth.ts               # Zod schemas de formulários
│   ├── services/                 # Acesso direto ao Supabase
│   │   ├── messages.ts
│   │   ├── rooms.ts
│   │   └── profile.ts
│   ├── theme/
│   │   └── index.ts              # Cores, espaçamentos, fontes
│   ├── types/
│   │   └── index.ts              # Tipos TypeScript + PendingMessage
│   └── utils/
│       ├── avatar.ts
│       ├── errors.ts
│       ├── icons.ts
│       ├── messages.ts
│       └── typing.ts
├── supabase/
│   ├── schema.sql                # Tabelas, RLS, triggers, funções
│   └── tests/
│       └── db.test.mjs           # 12 testes com PGlite
├── __tests__/                    # 17 testes Jest
│   ├── avatar.test.ts
│   ├── messages.test.ts
│   └── typing.test.ts
├── assets/                       # Ícones e splash screen
├── .env.example
├── app.json
├── package.json
└── tsconfig.json
```

---

## 🗄️ Banco de dados

O schema (`supabase/schema.sql`) cria:

| Tabela | Descrição |
|---|---|
| `profiles` | Perfis dos usuários (sincronizado via trigger) |
| `rooms` | Salas de chat com nome, descrição e emoji |
| `room_members` | Membros de cada sala |
| `messages` | Mensagens com referência ao autor |

**Destaques do schema:**
- Row Level Security (RLS) em todas as tabelas
- Trigger `handle_new_user` cria perfil automaticamente no cadastro
- Função `is_room_member()` com `SECURITY DEFINER` evita recursão infinita no RLS
- Realtime habilitado na tabela `messages`

---

## ⚠️ Problemas conhecidos e soluções

| Problema | Solução |
|---|---|
| `relation "profiles" already exists` | Dropar as tabelas antes de rodar o schema |
| Mensagens sem nome do autor no Realtime | `getMessage(id)` busca o registro completo após cada evento INSERT |
| Token JWT expira em background | `AppState` listener chama `startAutoRefresh()` ao retornar ao app |

---

## 📄 Licença

MIT