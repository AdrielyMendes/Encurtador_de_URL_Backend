# Encurtador de Links
## 1. O que é este projeto

Este projeto é um **encurtador de links** (similar ao bit.ly) construído com **Node.js** e **Fastify** no back-end, usando **PostgreSQL** como banco de dados e **Drizzle ORM** para mapeamento. O sistema permite criar links encurtados, buscar / editar / excluir registros, redirecionar usuários ao acessar o código curto e contabilizar acessos (cliques).

Este documento explica minuciosamente cada arquivo, o fluxo de requisições, como rodar localmente, deploy, testes e também contém perguntas/resumos estilo prova para ajudar na revisão.

## 2. Objetivos de aprendizagem

- Entender arquitetura em camadas (routes → controllers → services → repositories → DB).
- Saber o fluxo de criação e redirecionamento de um link encurtado.
- Conhecer as operações SQL básicas usadas (INSERT, SELECT, UPDATE, DELETE) e como Drizzle as representa.
- Compreender validação de entrada, tratamento de erros e importância do índice exclusivo para o código curto.
- Saber configurar e rodar localmente (variáveis de ambiente, migrações, conexão DB).

## 3. Estrutura do projeto
```
src/
├── infra/
│   ├── db/
│   │   ├── database.js      # conexão com o PostgreSQL via Drizzle
│   │   └── schema.js        # definição da tabela Links (Drizzle)
│   └── ...
├── modules/
│   └── links/
│       ├── links.routes.js      # registra rotas Fastify
│       ├── links.controller.js  # recebe requisições e responde
│       ├── links.service.js     # regras de negócio / validações
│       ├── links.repository.js  # queries com Drizzle
│
├── utils/
│   └── generateCode.js          # gera códigos curtos
├── server.js                    # boot do servidor Fastify
└── package.json

```
## 4. Arquivos e explicação detalhada

### 4.1 `schema.js` (Drizzle)
```jsx
import { pgTable, uuid, text, integer } from "drizzle-orm/pg-core";

export const Links = pgTable('links', {
  id: uuid('id').defaultRandom().primaryKey(),
  legenda: text('legenda').notNull(),
  codigo: text('codigo').notNull(),
  original_url: text('original_url').notNull(),
  contagem_cliques: integer('contagem_cliques').default(0),
});

```
- `pgTable`: cria mapeamento da tabela.
- `defaultRandom()` para `id` indica geração de UUID automática (Drizzle / PostgreSQL).
- `notNull()` força colunas obrigatórias — evita registros incompletos.

**Observação:** por que `codigo` deveria ter índice único no banco (impedir colisões). Na prática: `CREATE UNIQUE INDEX idx_links_codigo ON links (codigo);` — isso garante unicidade e performance em buscas por `codigo`.

### 4.2 `generateCode.js`

```jsx
export function generateCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

```
- Gera uma string aleatória de tamanho `length` com letras e dígitos.
- Espaço de combinações com 6 caracteres: `62^6 ≈ 56,8 bilhões`.

**Pontos importantes :**

- `Math.random()` não é criptograficamente seguro.
- Deve-se verificar colisão com o banco (tentar gerar outro código caso já exista).
- Alternativa segura: `crypto.randomBytes` no Node.js.

### 4.3 `links.repository.js`

Função: executar efetivamente as queries com Drizzle / DB.

**Principais funções e o que fazem**:

- `createLinkRepository({ legenda, urlOriginal, url })`:
    - Escolhe `endereco = urlOriginal || url`.
    - Valida URL usando `new URL(endereco)` (lança exceção se inválida).
    - Gera `codigo` com `generateCode(6)`.
    - Insere no DB com `db.insert(Links).values(...).returning()` e retorna o registro.
- `readLinkRepository()` — `SELECT * FROM links`.
- `readLinkByCodeRepository(codigo)` — `SELECT * FROM links WHERE codigo = $codigo`.
- `updateLinkRepository(id, novosDados)` — `UPDATE ... WHERE id = $id RETURNING ...`.
- `deleteLinkRepository(id)` — `DELETE ... WHERE id = $id RETURNING id` (retorna boolean).
- `incrementoClicksRepository(codigo)` — `UPDATE links SET contagem_cliques = contagem_cliques + 1 WHERE codigo = $codigo RETURNING ...`.
- `originalUrlRepository(codigo)` — retorna o link para redirecionamento.

**Notas sobre retorno**: algumas funções retornam arrays (Drizzle retorna lista); o service deve pegar `[0]` ou tratar array-vazio.

### 4.4 `links.service.js`

Função: regras de negócio e validação. Não deve conter SQL.

Exemplos de responsabilidades:

- Validar parâmetros obrigatórios (ex.: legenda e url).
- Lógica de redirecionamento: obter URL original, incrementar cliques e retornar URL para controller fazer redirect.
- Tratar respostas 'não encontrado' e repassar `null` ou erros para controllers.

**Trecho importante (redirecionamento):**

```jsx
export async function redirecaoLinkService(codigo) {
  const link = await originalUrlRepository(codigo);
  if (!link) return null;
  const linkAtualizado = await incrementoClicksRepository(codigo);
  return linkAtualizado.original_url;
}

```
### 4.5 `links.controller.js`

Função: interface HTTP — recebe `req`, chama `service`, retorna `reply`.

Padrões:

- `createLinkController(req, reply)`:
    - Pega `legenda` e `url` do `req.body`.
    - Se inválido, retorna `400` com mensagem.
    - Chama `createLinkService` e retorna `201` com o objeto criado.
- `redirecaoLinkController(req, reply)`:
    - Chama `redirecaoLinkService(codigo)`.
    - Se `null`, retorna `404`.
    - Senão, `reply.redirect(302, urlOriginal)`.

### 4.6 `links.routes.js`

```jsx
export async function linksRoutes(fastify) {
  fastify.post('/links', createLinkController);
  fastify.get('/links', readLinksController);
  fastify.get('/links/:codigo', readLinkByCodeController);
  fastify.put('/links/:id', updateLinkController);
  fastify.delete('/links/:id', deleteLinkController);
  fastify.get('/:codigo', redirecaoLinkController);
}

```

### 4.7 `server.js`

```jsx
import fastify from "fastify";
import { linksRoutes } from "./modules/links/links.routes.js";

const server = fastify({ logger: true });
const port = process.env.PORT || 3000;

server.register(linksRoutes);

server.listen({ port, host: '0.0.0.0' }, (error) => {
  if (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
  console.log('Servidor rodando na porta', port);
});

```

- Tratamento de erros no `listen` e saída com `process.exit(1)`.
  
## 5. Banco de Dados — migrações e índices
Exemplo SQL de criação da tabela e índice único para `codigo`:

```sql
CREATE TABLE links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legenda text NOT NULL,
  codigo text NOT NULL UNIQUE,
  original_url text NOT NULL,
  contagem_cliques integer DEFAULT 0
);

CREATE UNIQUE INDEX idx_links_codigo ON links (codigo);

```
**Por que o índice único é importante?**

- Garante que dois encurtamentos diferentes não tenham o mesmo `codigo`.
- Acelera consultas por `codigo` (essencial para redirecionamento em alta carga).

## 6. Executando localmente

1. Clone o repositório:

```bash
git clone https://github.com/seuusuario/encurtador-backend.git
cd encurtador-backend

```

1. Instale dependências:

```bash
npm install

```

1. Crie `.env` com as variáveis:

```
DATABASE_URL=postgresql://usuario:senha@localhost:5432/nomedobanco
PORT=3000

```

1. Configure o banco (migrations Drizzle):

```bash
# Gere as migrations (se usar drizzle-kit)
npx drizzle-kit generate
# Aplique as migrations
npx drizzle-kit push

```

1. Inicie o servidor em modo desenvolvimento:

```bash
npm run dev
# ou
node src/server.js

```

1. Teste endpoints com cURL ou Postman.

## 7. Testes manuais e verificação

1. **Criar link** (POST)

```bash
curl -X POST http://localhost:3000/links \
 -H "Content-Type: application/json" \
 -d '{"legenda":"Meu site","urlOriginal":"https://meusite.com"}'

```
Verifique resposta 201 e campos retornados (`codigo`, `id`, `contagem_cliques` = 0).

1. **Listar** (GET):

```bash
curl http://localhost:3000/links

```
Confirme que o registro existe.

1. **Redirecionar** (GET): abra no navegador `http://localhost:3000/<codigo>` e confirme que o navegador é redirecionado e que `contagem_cliques` incrementou.
2. **Atualizar** (PUT):
```bash
curl -X PUT http://localhost:3000/links/<id> \
 -H "Content-Type: application/json" \
 -d '{"legenda":"Novo nome"}'

```
1. **Excluir** (DELETE):
```bash
curl -X DELETE http://localhost:3000/links/<id>

```
## 8. Boas práticas

- Separe responsabilidades (Single Responsibility Principle): cada arquivo tem uma responsabilidade única.
- Valide entradas sempre no controller/service (evita garbage-in).
- Nunca confie apenas no `Math.random()` para sistemas que exigem segurança.
- Crie índices nas colunas que serão consultadas com frequência (ex.: `codigo`).
- Garanta unicidade do `codigo` tanto na aplicação (checar antes de inserir) quanto no banco (constraint unique).
- Trate exceções: devolva códigos HTTP adequados e mensagens úteis.
- Documente API (Swagger / OpenAPI) para facilitar testes e uso por front-end.

 A responsabilidade do repository? 

 Acessar o banco e executar queries SQL (INSERT/SELECT/UPDATE/DELETE).

 Por que a rota `/:codigo` deve ficar por último? 

 Para evitar que ela capture rotas como `/links` ou `/links/:codigo` por conflito de pattern.

 Como evitar códigos duplicados? 

Ter um índice único em `codigo` no DB e, na aplicação, checar existência e regenerar em loop com limite de tentativas.

 O que faz `new URL(endereco)` em `createLinkRepository`? 

 Valida a sintaxe da URL — lança erro se inválida.

 Como contar cliques ao redirecionar? 

Executar um `UPDATE links SET contagem_cliques = contagem_cliques + 1 WHERE codigo = ? RETURNING contagem_cliques` antes do redirect.

 Qual código HTTP usar ao criar um recurso com sucesso?

  `201 Created`.

 Por que usamos `process.env.PORT`? 

 Para permitir que o provedor de hospedagem escolha a porta em produção.

## 10. Debugging e erros comuns

- Erro: `URL inválida` → Corrija o corpo da requisição para fornecer `urlOriginal` começando com `http://` ou `https://`.
- Erro: rota de redirecionamento retornando 404 → Verifique se o `codigo` existe na tabela e se a rota `/:codigo` está registrada corretamente e por último.
- Erro: colisão de `codigo` ao inserir → Garanta índice UNIQUE e implemente retry na geração do código.
- Erro: conexão com Postgres falhando → verifique `DATABASE_URL`, se o banco está rodando e se as credenciais estão corretas.

## 11. Deploy
### Back-end (Render)

1. Configure repositório no Render.
2. Defina build command (`npm install && npm run build` se houver) e start command (`node src/server.js` ou `npm start`).
3. Adicione variáveis de ambiente no painel Render (`DATABASE_URL`, `NODE_ENV`, `PORT`).
4. Habilite `health check` e configure domínio.

### Front-end (Vercel / Netlify)

1. Configure base URL da API apontando para o back-end em Render.
2. Deploy automático via GitHub/GitLab.

## 13. Resumo rápido

- Layers: Routes → Controllers → Services → Repositories → DB
- Endpoint redirecionamento: `GET /:codigo` (por último)
- Gerar código: `generateCode(6)` — checar colisão
- Contagem de cliques: UPDATE com `contagem_cliques + 1`
- Código HTTP criação: `201`
- Único índice em `codigo` para performance e unicidade

| Tema | Conceito principal |
| --- | --- |
| Fastify | Framework rápido para APIs Node.js |
| generateCode | Gera código aleatório para o link |
| Controller | Recebe e responde à requisição |
| Service | Aplica regras de negócio |
| Repository | Manipula banco de dados com Drizzle |
| Drizzle ORM | ORM leve para PostgreSQL |
| eq() | Compara valores nas consultas |
| redirect() | Redireciona o usuário para a URL original |
| contagem_cliques | Funcionalidade extra do projeto |