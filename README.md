# MCP Gateway

Um gateway HTTP que agrega e expõe múltiplos servidores MCP (Model Context Protocol) através de uma única interface unificada.

## 📋 Sobre o Projeto

Este projeto implementa um **Gateway MCP** que atua como um ponto de entrada centralizado para múltiplos servidores MCP. Ele permite que clientes acessem ferramentas de diferentes servidores MCP através de uma única API, facilitando a integração e o gerenciamento de múltiplos serviços.

### Características

- 🔌 **Agregação de Múltiplos Servidores MCP**: Conecta-se a vários servidores MCP e expõe todas as ferramentas de forma unificada
- 🔐 **Suporte a Autenticação**: Suporta autenticação via Bearer Token (útil para APIs como GitHub Copilot)
- 🛠️ **Fácil Configuração**: Configuração simples através de um registro de servidores
- 📡 **Protocolo HTTP Streamable**: Utiliza o protocolo Streamable HTTP do MCP SDK
- 🚀 **TypeScript**: Totalmente tipado com TypeScript

## 🏗️ Arquitetura

```
┌─────────────┐
│   Cliente   │
│   (MCP)     │
└──────┬──────┘
       │
       │ HTTP POST/GET
       │
┌──────▼─────────────────┐
│   MCP Gateway (8001)    │
│   - Agrega ferramentas  │
│   - Proxy para servidores│
└──────┬──────────────────┘
       │
       ├─────────────┬─────────────┬──────────────┐
       │             │             │              │
┌──────▼─────┐ ┌─────▼─────┐ ┌──────────▼─────────┐
│  MCP 1     │ │  MCP 2    │ │  GitHub Copilot   │
│  (3000)    │ │  (3001)   │ │  (API Remota)     │
│            │ │           │ │  (MCP 3)          │
│  Soma      │ │  Multiplic│ │                   │
│  Subtração │ │  Divisão  │ │                   │
└────────────┘ └───────────┘ └───────────────────┘
```

## 📦 Requisitos

- Node.js >= 18
- npm ou yarn
- TypeScript 5.9+

## 🚀 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd mcp-gateway
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente (opcional):
```bash
cp .env.example .env
# Edite o arquivo .env e adicione:
# GIT_KEY=seu-token-github-aqui
```

**Ou defina a variável diretamente:**
```bash
export GIT_KEY="seu-token-github-aqui"
```

## ⚙️ Configuração

### Registro de Servidores

O gateway está configurado através do array `REGISTRY` no arquivo `gateway.ts`:

```typescript
const REGISTRY = [
    { id: '1', url: 'http://localhost:3000/mcp' },              // Local
    { id: '2', url: 'http://localhost:3001/mcp' },             // Local
    { id: '3', url: 'https://api.githubcopilot.com/mcp',      // GitHub Copilot (Remoto)
      headers: {
        Authorization: `Bearer ${process.env.GIT_KEY}`
    } },
]
```

**Para adicionar novos servidores:**
1. Adicione uma entrada no array `REGISTRY`
2. Se necessário, configure headers de autenticação
3. Reinicie o gateway

## 🎯 Como Executar

### 1. Iniciar os Servidores MCP Locais

**Terminal 1 - MCP Server 1 (Soma e Subtração):**
```bash
npx tsx mcp1.ts
```
Servidor rodando em `http://localhost:3000`

**Terminal 2 - MCP Server 2 (Multiplicação e Divisão):**
```bash
npx tsx mcp2.ts
```
Servidor rodando em `http://localhost:3001`

**Nota:** O MCP 3 (GitHub Copilot) é um serviço remoto e não precisa ser iniciado localmente. Certifique-se apenas de ter a variável `GIT_KEY` configurada.

### 2. Iniciar o Gateway

**Terminal 3 - Gateway:**
```bash
npx tsx gateway.ts
```
Gateway rodando em `http://localhost:8001`

## 📖 Como Usar

### Listar Todas as Ferramentas Disponíveis

```bash
curl -X POST http://localhost:8001/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/list",
    "params": {}
  }'
```

### Executar uma Ferramenta

**Somar dois números:**
```bash
curl -X POST http://localhost:3000/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/call",
    "params": {
      "name": "sum_number",
      "arguments": { "a": 5, "b": 3 }
    }
  }'
```

**Multiplicar dois números:**
```bash
curl -X POST http://localhost:3001/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/call",
    "params": {
      "name": "multiply_number",
      "arguments": { "a": 4, "b": 7 }
    }
  }'
```

**Subtrair dois números:**
```bash
curl -X POST http://localhost:3000/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/call",
    "params": {
      "name": "subtract_number",
      "arguments": { "a": 10, "b": 3 }
    }
  }'
```

**Dividir dois números:**
```bash
curl -X POST http://localhost:3001/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/call",
    "params": {
      "name": "divide_number",
      "arguments": { "a": 20, "b": 4 }
    }
  }'
```

## 📁 Estrutura do Projeto

```
mcp-gateway/
├── gateway.ts          # Gateway principal que agrega servidores MCP
├── mcp1.ts            # Servidor MCP 1: Soma e Subtração (porta 3000)
├── mcp2.ts            # Servidor MCP 2: Multiplicação e Divisão (porta 3001)
├── package.json        # Dependências e scripts
├── .gitignore          # Arquivos ignorados pelo Git
├── .env                # Variáveis de ambiente (não versionado)
└── README.md           # Este arquivo
```

## 🛠️ Ferramentas Disponíveis

### MCP Server 1 (Porta 3000)
- **sum_number**: Soma dois números
  - Parâmetros: `a` (number), `b` (number)
  - Retorna: `result` (number)

- **subtract_number**: Subtrai dois números
  - Parâmetros: `a` (number), `b` (number)
  - Retorna: `result` (number)

### MCP Server 2 (Porta 3001)
- **multiply_number**: Multiplica dois números
  - Parâmetros: `a` (number), `b` (number)
  - Retorna: `result` (number)

- **divide_number**: Divide dois números
  - Parâmetros: `a` (number), `b` (number)
  - Retorna: `result` (number)

## 🔧 Desenvolvimento

### Adicionar um Novo Servidor MCP

1. Crie um novo arquivo (ex: `mcp3.ts`)
2. Configure o servidor com suas ferramentas
3. Adicione a entrada no `REGISTRY` do `gateway.ts`
4. Inicie o novo servidor em uma porta diferente

### Criar uma Nova Ferramenta

Exemplo de ferramenta no servidor MCP:

```typescript
server.registerTool('minha_ferramenta', {
    title: "Minha Ferramenta",
    description: "Descrição da ferramenta",
    inputSchema: {
        param1: z.string().describe("Descrição do parâmetro"),
    },
    outputSchema: {
        result: z.string().describe("Resultado"),
    },
},
    async ({ param1 }) => {
        const output = { result: `Processado: ${param1}` };
        return {
            content: [{ type: 'text', text: JSON.stringify(output) }],
            structuredContent: output,
        }
    }
)
```

## 📚 Tecnologias Utilizadas

- **[@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/sdk)**: SDK oficial do MCP
- **[Express](https://expressjs.com/)**: Framework web para Node.js
- **[TypeScript](https://www.typescriptlang.org/)**: Superset JavaScript com tipagem estática
- **[Zod](https://zod.dev/)**: Validação de schemas TypeScript-first
- **[dotenv](https://github.com/motdotla/dotenv)**: Gerenciamento de variáveis de ambiente

## 🔒 Segurança

- ⚠️ **Não commite o arquivo `.env`** no repositório
- ⚠️ **Nunca exponha tokens de API** no código
- ✅ Use variáveis de ambiente para credenciais sensíveis
- ✅ Configure adequadamente o `.gitignore`

## 📝 Licença

ISC

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se livre para abrir issues ou pull requests.

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

**Desenvolvido com ❤️ usando Model Context Protocol**

