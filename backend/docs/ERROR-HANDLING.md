# Error Handling - Magic3T Backend

Este documento descreve o sistema de tratamento de erros do backend.

---

## Visão Geral

O backend utiliza dois tipos principais de erros:

| Tipo | Classe | Propósito |
|------|--------|-----------|
| **Response Error** | `ErrorResponseException` | Erros esperados que devem ser comunicados ao cliente |
| **Unexpected Error** | `UnexpectedError` | Erros inesperados (panic) que são logados mas ocultados do cliente |

---

## Response Error (`ErrorResponseException`)

Representa erros **esperados** que devem ser enviados ao cliente com um código identificável.

### Localização
- Classe: `backend/src/common/errors/response-error.ts`
- Filter: `backend/src/common/filters/response-error.filter.ts`

### Estrutura

```typescript
class ErrorResponseException<T extends string = string> extends Error {
  errorCode: T        // Código único identificando o erro (ex: 'user-not-found')
  httpStatus: number  // Status HTTP (ex: 404, 400, 401)
  metadata?: any      // Dados adicionais sobre o erro
}
```

### Como Usar

```typescript
import { respondError } from '@/common'

// Em qualquer service, controller ou guard:
function getUser(id: string) {
  const user = await userRepository.getById(id)
  if (!user) {
    respondError('user-not-found', 404)  // Lança ErrorResponseException
  }
  return user
}

// Com metadata adicional:
respondError('validation-failed', 400, { field: 'email', reason: 'invalid format' })
```

### Resposta ao Cliente

O `ResponseErrorFilter` captura a exceção e envia a resposta apropriada:

**HTTP Response:**
```json
// Status: 404
{
  "errorCode": "user-not-found",
  "metadata": null
}
```

**WebSocket Response:**
```typescript
// Evento: 'error'
{
  "errorCode": "user-not-found",
  "metadata": null
}
```

### Tipo Compartilhado

O formato de resposta é tipado em `@magic3t/api-types`:

```typescript
type ErrorResponse<T extends string = string> = {
  errorCode: T
  metadata?: unknown
}
```

---

## Unexpected Error (`UnexpectedError`)

Representa erros **inesperados** (similar a um "panic") onde o servidor encontrou um estado que não deveria acontecer.

### Localização
- Classe: `backend/src/common/errors/unexpected-error.ts`
- Filter: `backend/src/common/filters/unexpected-error.filter.ts`

### Estrutura

```typescript
class UnexpectedError extends Error {
  message: string   // Mensagem descritiva (para logs)
  metadata?: any    // Dados adicionais para debugging
}
```

### Como Usar

```typescript
import { unexpected } from '@/common'

// Situação que nunca deveria acontecer:
function processMatch(match: Match) {
  if (!match.players) {
    unexpected('Match has no players', { matchId: match.id })
  }
}

// Assertiva simples:
const config = await configRepository.getBotConfig(botId)
if (!config) {
  unexpected('Bot config not found in database')  // Isso é um bug, não erro do usuário
}
```

### Comportamento

1. **Loga o erro** no servidor (com stack trace completo)
2. **Oculta detalhes** do cliente (segurança)
3. Retorna resposta genérica

**HTTP Response:**
```json
// Status: 500
{
  "errorCode": "internal-server-error",
  "description": "An unexpected error occurred on the server."
}
```

**WebSocket Response:**
```typescript
// Evento: 'error'
{
  "errorCode": "internal-server-error",
  "description": "An unexpected error occurred on the server."
}
```

---

## Filters (Exception Filters)

Os filters do NestJS interceptam exceções e formatam as respostas.

### ResponseErrorFilter

```typescript
@Catch(ErrorResponseException)
class ResponseErrorFilter implements ExceptionFilter {
  // Captura apenas ErrorResponseException
  // Envia error.response ao cliente
  // Respeita error.httpStatus
}
```

### UnexpectedErrorFilter

```typescript
@Catch()  // Captura QUALQUER exceção não tratada
class UnexpectedErrorFilter implements ExceptionFilter {
  // Loga o erro no console
  // Envia resposta genérica 500 ao cliente
  // Funciona como "catch-all" de segurança
}
```

### ThrottlingFilter

```typescript
@Catch(ThrottlerException)
class ThrottlingFilter implements ExceptionFilter {
  // Captura exceções de rate limiting
  // Retorna resposta 429 Too Many Requests
  // Funciona tanto para HTTP quanto WebSocket
}
```

**Localização:** `backend/src/common/filters/throttling.filter.ts`

### Ordem de Execução

```
Exceção lançada
       │
       ▼
┌──────────────────────────┐
│ É ThrottlerException?    │
└────────────┬─────────────┘
             │
     Sim     │     Não
       ▼     │       ▼
┌────────────┐  ┌──────────────────────────┐
│ Throttling │  │ É ErrorResponseException? │
│ Filter     │  └────────────┬─────────────┘
└────────────┘             │
       │             Sim     │     Não
       ▼               ▼     │       ▼
   Resposta      ┌────────────┐  ┌────────────────────┐
   429           │ Response   │  │ UnexpectedError    │
                 │ ErrorFilter│  │ Filter (catch-all) │
                 └────────────┘  └────────────────────┘
                       │                 │
                       ▼                 ▼
                   Resposta          Log + Resposta
                   com código        genérica 500
                   específico
```

---

## Quando Usar Cada Tipo

### Use `respondError()` quando:
- ✅ O usuário fez algo errado (input inválido)
- ✅ Recurso não encontrado (404)
- ✅ Usuário não autorizado (401, 403)
- ✅ Conflito de estado (ex: já está em partida)
- ✅ Qualquer erro que o cliente precisa saber especificamente

### Use `unexpected()` quando:
- ✅ Estado inconsistente no banco de dados
- ✅ Configuração faltando que deveria existir
- ✅ Bug no código (situação "impossível")
- ✅ Falha em dependência externa crítica
- ✅ Qualquer situação que indica problema no servidor, não no cliente

---

## Exemplos de Códigos de Erro Comuns

| Código | Status | Contexto |
|--------|--------|----------|
| `unauthorized` | 401 | Token ausente ou inválido |
| `user-not-found` | 404 | Usuário não existe |
| `nickname-taken` | 409 | Nickname já em uso |
| `already-in-game` | 409 | Tentou entrar na fila estando em partida |
| `not-in-match` | 400 | Ação de partida sem estar em uma |
| `invalid-choice` | 400 | Escolha inválida no jogo |
| `bot-not-found` | 404 | Bot solicitado não existe |
| `not-implemented` | 501 | Feature não implementada ainda |

---

## Integração com o Frontend

O frontend deve tratar erros baseando-se no `errorCode`:

```typescript
try {
  await api.user.register({ nickname })
} catch (error) {
  if (error.errorCode === 'nickname-taken') {
    showError('Este nickname já está em uso')
  } else {
    showError('Erro desconhecido')
  }
}
```

Para WebSockets, escutar o evento `'error'`:

```typescript
socket.on('error', (error: ErrorResponse) => {
  console.error('Server error:', error.errorCode)
})
```
