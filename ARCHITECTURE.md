# Arquitetura do Magic3T

Este documento descreve a arquitetura técnica do projeto Magic3T, um jogo multiplayer em tempo real com sistema de rating/ranking.

## Stack Tecnológico

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | React 19, TypeScript, Vite, TanStack Router, TanStack Query, Tailwind CSS |
| **Backend** | NestJS, TypeScript, WebSockets (Socket.IO) |
| **Database** | Firebase Firestore |
| **Autenticação** | Firebase Authentication (Google Provider) |
| **Monorepo** | npm Workspaces |
| **Linting** | Biome |
| **Deploy** | Render (backend), Vercel (frontend) |

---

## Estrutura de Pastas

```
Magic3T/
├── backend/                 # API NestJS
├── frontend/                # App React/Vite
├── packages/                # Bibliotecas compartilhadas
│   ├── api-types/           # Tipos de API (DTOs, eventos WebSocket)
│   ├── common-types/        # Tipos comuns (Team, Choice, Rating)
│   └── database-types/      # Tipos de entidades do banco (UserRow, MatchRow)
├── biome.json               # Configuração do linter
├── package.json             # Workspaces do monorepo
└── render.yaml              # Configuração de deploy
```

---

## Backend (`backend/`)

### Estrutura de Módulos

```
backend/src/
├── main.ts                  # Bootstrap da aplicação
├── app.module.ts            # Módulo raiz - importa todos os outros
├── app.gateway.ts           # WebSocket gateway principal
├── app.controller.ts        # Controller de health check
│
├── auth/                    # 🔐 Autenticação
│   ├── auth.module.ts       # Módulo de autenticação
│   ├── auth.service.ts      # Validação de tokens Firebase
│   ├── auth.guard.ts        # Guard para HTTP e WebSocket
│   ├── auth-request.ts      # Tipo de request autenticado
│   └── auth-socket.ts       # Tipo de socket autenticado
│
├── firebase/                # 🔥 Integração Firebase
│   ├── firebase.module.ts   # Módulo Firebase
│   └── firebase.service.ts  # Firestore + Firebase Auth Admin
│
├── database/                # 💾 Camada de dados
│   ├── database.module.ts   # Módulo do banco
│   ├── database.service.ts  # Utilitários (IDs temporais, converters)
│   ├── base-repository.ts   # Repository base abstrato
│   ├── user/                # Repository de usuários
│   ├── match/               # Repository de partidas
│   ├── config/              # Repository de configurações
│   └── crash-report/        # Repository de crash reports
│
├── match/                   # 🎮 Lógica de Partidas
│   ├── match.module.ts      # Módulo de partidas
│   ├── match.service.ts     # Criação e gerenciamento de matches
│   ├── match.controller.ts  # Endpoints REST
│   ├── match.gateway.ts     # WebSocket para partidas em tempo real
│   ├── client-sync.service.ts # Sincronização de estado com clientes
│   ├── persistance.service.ts # Persistência de resultados
│   ├── lib/                 # Lógica do jogo (Match, MatchBank)
│   ├── bots/                # Implementações de bots (Random, LMM)
│   └── events/              # Eventos internos (MatchFinishedEvent)
│
├── queue/                   # ⏳ Fila de Matchmaking
│   ├── queue.module.ts      # Módulo da fila
│   ├── queue.service.ts     # Lógica de enfileiramento
│   ├── queue.controller.ts  # Endpoints REST
│   └── queue.gateway.ts     # WebSocket para notificações
│
├── rating/                  # ⭐ Sistema de Rating/ELO
│   ├── rating.module.ts     # Módulo de rating
│   ├── rating.service.ts    # Cálculos de rating, atualização de Challengers
│   └── rating-converter.ts  # Conversão de ELO para LP/League
│
├── user/                    # 👤 Usuários
│   ├── user.module.ts       # Módulo de usuários
│   ├── user.service.ts      # Lógica de usuários
│   └── user.controller.ts   # Endpoints REST (perfil, ranking)
│
├── admin/                   # 🛡️ Administração
│   ├── admin.module.ts      # Módulo admin
│   ├── admin.guard.ts       # Guard de admin
│   └── admin.service.ts     # Operações administrativas
│
├── common/                  # 🔧 Utilitários Compartilhados
│   ├── decorators/          # Decorators customizados
│   ├── errors/              # Classes de erro
│   ├── filters/             # Exception filters
│   ├── interceptors/        # Interceptors (logging, etc.)
│   ├── pipes/               # Validation pipes
│   ├── services/            # Serviços utilitários (SocketsService)
│   └── utils/               # Funções utilitárias
│
└── types/                   # 📦 Tipos internos do backend
```

### Dependências entre Módulos

```
                    ┌─────────────────┐
                    │   AppModule     │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
    ┌─────────┐        ┌──────────┐        ┌──────────┐
    │  Auth   │◄───────│ Firebase │◄───────│ Database │
    └─────────┘        └──────────┘        └──────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
         ┌─────────┐   ┌──────────┐   ┌─────────┐
         │  Match  │◄──│  Queue   │   │  User   │
         └─────────┘   └──────────┘   └─────────┘
              │
              ▼
         ┌─────────┐
         │ Rating  │
         └─────────┘
```

---

## Frontend (`frontend/`)

### Estrutura

```
frontend/src/
├── main.tsx                 # Entry point
├── main.css                 # Estilos globais (Tailwind)
├── route-tree.gen.ts        # Rotas geradas automaticamente
│
├── routes/                  # 📍 Páginas (TanStack Router)
│   ├── __root.tsx           # Layout raiz
│   ├── index.tsx            # Home
│   ├── game.$matchId.tsx    # Tela de partida
│   ├── profile.$slug.tsx    # Perfil de usuário
│   └── ...
│
├── components/              # 🧱 Componentes React
│   ├── atoms/               # Componentes básicos (Button, Input)
│   └── ...                  # Componentes compostos
│
├── contexts/                # 🌐 Contextos React
│   ├── auth-context.tsx     # Estado de autenticação
│   ├── game-context.tsx     # Estado da partida atual
│   ├── queue.context.tsx    # Estado da fila
│   └── ...
│
├── services/                # 🔌 Comunicação com Backend
│   ├── firebase.ts          # Inicialização Firebase Client
│   └── clients/
│       ├── api-client.ts    # Clientes REST (UserApiClient, MatchApiClient)
│       └── base-api-client.ts # Cliente base com auth headers
│
├── hooks/                   # 🪝 Custom Hooks
├── lib/                     # 📚 Utilitários
├── types/                   # 📦 Tipos do frontend
└── assets/                  # 🖼️ Imagens, fontes
```

---

## Packages Compartilhados (`packages/`)

### `@magic3t/api-types`
Tipos compartilhados entre frontend e backend:
- **DTOs** de controllers (requests/responses)
- **Eventos WebSocket** (QueueServerEvents, MatchServerEvents)
- **Tipos de erro**

### `@magic3t/common-types`
Tipos de domínio do jogo:
- `Team` - Order/Chaos
- `Choice` - Escolhas do jogo (1-9)
- `Rating` - Estrutura de rating

### `@magic3t/database-types`
Tipos de entidades do Firestore:
- `UserRow` - Documento de usuário
- `MatchRow` - Documento de partida
- `BotConfig` - Configuração de bots

---

## Fluxo de Autenticação

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          FLUXO DE AUTENTICAÇÃO                           │
└──────────────────────────────────────────────────────────────────────────┘

1. LOGIN (Frontend → Firebase)
   ┌──────────┐      signInWithPopup()       ┌──────────────┐
   │ Frontend │ ────────────────────────────►│ Firebase Auth│
   │  (React) │◄──────────────────────────── │   (Google)   │
   └──────────┘      ID Token + User Info    └──────────────┘

2. CHAMADA AUTENTICADA (Frontend → Backend)
   ┌──────────┐   Authorization: Bearer <token>   ┌──────────┐
   │ Frontend │ ─────────────────────────────────►│ Backend  │
   │          │                                   │ (NestJS) │
   └──────────┘                                   └────┬─────┘
                                                       │
3. VALIDAÇÃO DO TOKEN (Backend → Firebase Admin)       │
                                                       ▼
   ┌──────────┐      verifyIdToken(token)       ┌──────────────┐
   │ Backend  │ ───────────────────────────────►│ Firebase Auth│
   │ AuthGuard│◄─────────────────────────────── │    Admin     │
   └──────────┘      { uid: "user123" }         └──────────────┘

4. ACESSO AUTORIZADO
   ┌──────────┐         Resposta                ┌──────────┐
   │ Frontend │◄───────────────────────────────│ Backend  │
   └──────────┘                                 └──────────┘
```

### Componentes Envolvidos

| Componente | Responsabilidade |
|------------|------------------|
| `frontend/services/firebase.ts` | Inicializa Firebase Client SDK |
| `frontend/lib/auth-client.ts` | Gerencia sessão, obtém tokens |
| `frontend/contexts/auth-context.tsx` | Estado de auth no React |
| `frontend/services/clients/base-api-client.ts` | Injeta token em requests |
| `backend/auth/auth.guard.ts` | Intercepta requests, valida token |
| `backend/auth/auth.service.ts` | Chama Firebase Admin para validar |
| `backend/firebase/firebase.service.ts` | Conexão com Firebase Admin |

### Headers de Autenticação

```typescript
// HTTP Requests
headers: { Authorization: `Bearer ${idToken}` }

// WebSocket Connections
socket.handshake.auth = { token: idToken }
```

---

## Fluxo de Dados Principal

### 1. Matchmaking (Fila → Partida)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           FLUXO DE MATCHMAKING                           │
└──────────────────────────────────────────────────────────────────────────┘

Player A                    Backend                    Player B
    │                          │                          │
    │──── WS: join queue ─────►│                          │
    │                          │◄──── WS: join queue ─────│
    │                          │                          │
    │                    ┌─────┴─────┐                    │
    │                    │QueueService│                   │
    │                    │ encontra   │                   │
    │                    │   match    │                   │
    │                    └─────┬─────┘                    │
    │                          │                          │
    │                    ┌─────┴─────┐                    │
    │                    │MatchService│                   │
    │                    │ cria match │                   │
    │                    └─────┬─────┘                    │
    │                          │                          │
    │◄── WS: match.found ──────┼────── WS: match.found ──►│
    │                          │                          │
```

### 2. Durante a Partida

```
Player A                    Backend                    Player B
    │                          │                          │
    │──── WS: match.move ─────►│                          │
    │                          │                          │
    │                    ┌─────┴─────┐                    │
    │                    │   Match   │                    │
    │                    │  (lib)    │                    │
    │                    │ processa  │                    │
    │                    └─────┬─────┘                    │
    │                          │                          │
    │◄── WS: match.sync ───────┼────── WS: match.sync ───►│
    │                          │                          │
    │                    [Partida termina]                │
    │                          │                          │
    │                    ┌─────┴─────┐                    │
    │                    │Persistance │                   │
    │                    │  Service   │                   │
    │                    │ salva match│                   │
    │                    └─────┬─────┘                    │
    │                          │                          │
    │                    ┌─────┴─────┐                    │
    │                    │  Rating   │                    │
    │                    │ Service   │                    │
    │                    │atualiza ELO│                   │
    │                    └─────┬─────┘                    │
    │                          │                          │
    │◄── WS: match.end ────────┼────── WS: match.end ────►│
```

---

## Comunicação em Tempo Real (WebSockets)

### Gateways

| Gateway | Namespace | Responsabilidade |
|---------|-----------|------------------|
| `AppGateway` | `/` | Conexão geral, heartbeat |
| `QueueGateway` | `/queue` | Fila de matchmaking |
| `MatchGateway` | `/match` | Partidas em tempo real |

### Eventos Principais

#### Queue Events
```typescript
// Cliente → Servidor
'queue.join'    // Entrar na fila
'queue.leave'   // Sair da fila

// Servidor → Cliente
'queue.accepted'    // Fila aceita
'queue.matchFound'  // Match encontrado
```

#### Match Events
```typescript
// Cliente → Servidor
'match.move'     // Fazer uma jogada
'match.forfeit'  // Desistir

// Servidor → Cliente
'match.sync'     // Sincronizar estado
'match.end'      // Partida terminou
```

---

## Database (Firestore)

### Collections

```
firestore/
├── users/                   # Usuários
│   └── {userId}/
│       ├── identification   # Nickname, slug
│       ├── elo              # Rating atual
│       ├── stats            # Estatísticas
│       └── role             # user | admin | bot
│
├── matches/                 # Histórico de partidas
│   └── {matchId}/
│       ├── players          # IDs dos jogadores
│       ├── result           # Resultado
│       ├── moves            # Histórico de jogadas
│       └── timestamp        # Data/hora
│
├── config/                  # Configurações globais
│   ├── rating               # Configuração do sistema de rating
│   └── bots/                # Configurações de bots
│
└── crash-reports/           # Relatórios de erro
```

---

## Sistema de Rating

O sistema usa **ELO modificado** com Leagues:

```
ELO → RatingConverter → { league, division, lp, tier }
```

### Ligas (do menor para maior)
1. Bronze
2. Silver
3. Gold
4. Platinum
5. Diamond
6. Master
7. Challenger (top players)

### Fluxo de Atualização

```
Partida termina
       │
       ▼
MatchFinishedEvent
       │
       ▼
RatingService.updateRating()
       │
       ▼
UserRepository.updateElo()
```

---

## Scripts Importantes

```bash
# Raiz do monorepo
npm install          # Instala deps de todos os workspaces
npm run lint         # Roda Biome em todo o projeto

# Backend
cd backend
npm run start:dev    # Dev server com hot reload
npm run build        # Build de produção
npm run test         # Testes com Vitest

# Frontend
cd frontend
npm run dev          # Dev server Vite
npm run build        # Build de produção
```

---

## Variáveis de Ambiente

### Backend (`.env`)
```env
FIREBASE_ADMIN_CREDENTIALS=<base64 do JSON de credenciais>
FIRESTORE_DB=<nome do database>
PORT=3000
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:3000
```

---

## Padrões e Convenções

### Naming
- **Arquivos**: `kebab-case.ts`
- **Classes/Types**: `PascalCase`
- **Funções/variáveis**: `camelCase`
- **Eventos WebSocket**: `namespace.action` (ex: `match.move`)

### Estrutura de Módulos NestJS
Cada módulo segue a estrutura:
```
module-name/
├── module-name.module.ts    # Definição do módulo
├── module-name.service.ts   # Lógica de negócio
├── module-name.controller.ts # Endpoints REST
├── module-name.gateway.ts   # WebSocket (se aplicável)
├── dtos/                    # Data Transfer Objects
├── types/                   # Tipos internos
└── index.ts                 # Exports públicos
```

### Exports
Cada pasta com `index.ts` exporta sua API pública:
```typescript
// database/index.ts
export * from './database.module'
export * from './database.service'
export * from './user'
export * from './match'
```
