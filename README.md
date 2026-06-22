# 🦋 Central de Atendimento Embelleze

Orquestrador inteligente de atendimento de vendas com 4 agentes especializados.

## Agentes disponíveis
- 💰 **Verbas** — Comercial & Trade (60+ respostas)
- 🔄 **Trocas** — Avaria, Vencido, Baixo Giro, Fora de Linha (60+ respostas)
- ↩️ **Devolução** — Retorno de Mercadorias (60+ respostas)
- 📅 **Prorrogação** — Prazos & Vencimentos (60+ respostas)

## Como fazer deploy na Vercel

### Passo 1 — Criar conta no GitHub
Acesse https://github.com e crie uma conta (se ainda não tiver).

### Passo 2 — Criar repositório no GitHub
1. Clique em "New repository"
2. Nome: `embelleze-atendimento`
3. Clique em "Create repository"

### Passo 3 — Subir os arquivos
No terminal da sua máquina, dentro desta pasta:
```bash
git init
git add .
git commit -m "Initial commit - Central de Atendimento Embelleze"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/embelleze-atendimento.git
git push -u origin main
```

### Passo 4 — Deploy na Vercel
1. Acesse https://vercel.com e crie uma conta (pode usar o login do GitHub)
2. Clique em "Add New Project"
3. Importe o repositório `embelleze-atendimento`
4. Clique em "Deploy"
5. Aguarde ~2 minutos — pronto! ✅

Sua URL será algo como: `https://embelleze-atendimento.vercel.app`

## Rodar localmente
```bash
npm install
npm start
```

## Adicionar novas perguntas
Edite o arquivo `src/knowledge.js` e adicione novos objetos no array `qa` de cada agente:
```js
{ q: ["palavra chave", "outra palavra"], a: "Sua resposta aqui." }
```
