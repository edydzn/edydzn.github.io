# Deploy da Aplicacao Ediliano Designer no Deno

## Visao Geral

Esta aplicacao esta configurada para deploy no Deno Deploy ou em servidores Deno.

## Estrutura de Arquivos

```
.
├── deno.json          # Configuracao do Deno
├── server.ts          # Servidor Deno para servir arquivos estaticos
├── build.ts           # Script de build
├── dist/              # Arquivos estaticos gerados apos o build
├── src/               # Codigo fonte React
└── package.json       # Dependencias npm para desenvolvimento
```

## Como Fazer o Deploy

### Opcao 1: Deno Deploy

1. Faca o build da aplicacao:
   ```bash
   npm run build
   ```

2. Faca o deploy no [Deno Deploy](https://deno.com/deploy):
   - Conecte seu repositorio GitHub
   - Configure o projeto para usar o arquivo `server.ts`
   - Defina a variavel de ambiente `PORT` (opcional, Deno Deploy define automaticamente)

### Opcao 2: Servidor Deno Local/VPS

1. Faca o build da aplicacao:
   ```bash
   npm run build
   ```

2. Inicie o servidor Deno:
   ```bash
   deno run --allow-all --allow-env --allow-net --allow-read --allow-sys server.ts
   ```

   Ou usando o script definido em `deno.json`:
   ```bash
   deno task start
   ```

3. A aplicacao estara disponivel em `http://localhost:8000`

## Variaveis de Ambiente

As seguintes variaveis de ambiente sao necessarias:

- `PORT` (opcional): Porta do servidor (padrao: 8000)
- `VITE_SUPABASE_URL`: URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave anonima do Supabase

## Desenvolvimento Local

Para desenvolvimento local, use o Vite:

```bash
npm run dev
```

A aplicacao estara disponivel em `http://localhost:3000`

## Solucionando Problemas

### Tela em Branco apos Deploy

Se a aplicacao mostrar uma tela em branco apos o deploy:

1. Verifique os arquivos estaticos:
   - Certifique-se de que a pasta `dist/` existe
   - Verifique se o `index.html` esta presente
   - Verifique se os arquivos JS/CSS em `dist/assets/` existem

2. Verifique o console do navegador:
   - Abra o Developer Tools (F12)
   - Verifique a aba Console por erros
   - Verifique a aba Network por arquivos nao encontrados (404)

3. Verifique as variaveis de ambiente:
   - O frontend precisa das variaveis `VITE_*` para funcionar
   - Configure-as no painel do Deno Deploy

4. Verifique o arquivo `index.html`:
   - Os caminhos para os arquivos JS/CSS devem comecar com `/`
   - Certifique-se de que os nomes dos arquivos correspondem aos gerados pelo build

### Erro: "Cannot find module"

Se voce vir erros de modulo nao encontrado:

1. Faca um novo build: `npm run build`
2. Limpe o cache do Deno: `deno cache --reload server.ts`
3. Verifique se todas as dependencias estao instaladas: `npm install`

## Notas Importantes

- O servidor Deno (`server.ts`) serve arquivos estaticos da pasta `dist/`
- Todos os redirects SPA sao tratados automaticamente (retorna `index.html` para rotas nao encontradas)
- O build usa Vite com otimizacoes para producao
- Assets sao divididos em chunks para melhor performance
