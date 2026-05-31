# 🧪 Guia de Teste Rápido - Loja Digital

## ⚡ Teste em 5 Minutos

### Passo 1: Configurar Stripe (2 min)

1. **Obtenha sua chave de teste do Stripe:**
   - Acesse: https://dashboard.stripe.com/test/apikeys
   - Copie a "Secret key" (começa com `sk_test_...`)

2. **Configure no Supabase:**
   - Vá para: Supabase Dashboard → Settings → Edge Functions → Secrets
   - Adicione: `STRIPE_SECRET_KEY` = `sk_test_xxx...`

3. **Configure o Webhook:**
   - Vá para: https://dashboard.stripe.com/test/webhooks
   - Clique em "Add endpoint"
   - URL: `https://[SEU_PROJECT_ID].supabase.co/functions/v1/make-server-bdae3ab6/webhook-stripe`
   - Selecione evento: `checkout.session.completed`
   - Salve

### Passo 2: Criar Conta de Teste (30 seg)

1. Acesse a loja: `https://edilianodesigner.com.br/?section=store`
2. Clique em "Entrar / Cadastrar"
3. Preencha:
   - Nome: Teste Usuario
   - Email: teste@exemplo.com
   - Senha: teste123456
4. Clique em "Criar Conta"

### Passo 3: Testar Pagamento (1 min)

1. **Clique em "Assinar Agora"** (botão verde)

2. **Será redirecionado para o Stripe**

3. **Preencha com dados de teste:**
   ```
   Número do cartão: 4242 4242 4242 4242
   Data de validade: 12/25
   CVV: 123
   CEP: 12345
   Nome: Teste Usuario
   ```

4. **Clique em "Pagar"**

5. **Aguarde o redirecionamento**

### Passo 4: Verificar Sucesso (30 seg)

✅ **Você deve ver:**
- Página de "Pagamento Confirmado"
- Badge "Premium Ativo" na loja
- Contador de downloads: "0/5"

✅ **Nos logs do Supabase:**
```
[Stripe Checkout] Session created successfully: cs_test_...
[Stripe Webhook] ✓ Subscription activated for user ...
```

### Passo 5: Criar e Testar Paleta (1 min)

1. **Acesse o admin:**
   - URL: `/?admin=store`
   - Senha padrão: `#Edydzn51122`

2. **Criar Nova Paleta:**
   - Clique em "Novo Item"
   - Título: `Cores do Pôr do Sol`
   - Categoria: `Paletas`
   - Cores:
     ```
     #FF6B6B
     #FFD93D
     #6BCB77
     #4ECDC4
     #95E1D3
     ```
   - Marque: ☑ Grátis
   - Salve

3. **Visualizar na Loja:**
   - Volte para `/?section=store`
   - Veja sua paleta
   - Clique nela
   - Copie as cores

## 🎯 Checklist de Funcionamento

### ✅ Sistema de Autenticação
- [ ] Consegui criar conta
- [ ] Consegui fazer login
- [ ] Vejo meu email no topo da loja

### ✅ Sistema de Pagamento
- [ ] Consegui clicar em "Assinar Agora"
- [ ] Fui redirecionado para o Stripe
- [ ] Consegui preencher os dados
- [ ] Fui redirecionado de volta após pagar
- [ ] Vejo "Premium Ativo" na loja
- [ ] Vejo contador "0/5 downloads"

### ✅ Sistema de Paletas
- [ ] Consegui criar uma paleta no admin
- [ ] Vejo a paleta na loja
- [ ] Consigo abrir o modal da paleta
- [ ] Consigo copiar as cores

### ✅ Sistema de Downloads
- [ ] Consigo baixar item gratuito
- [ ] Contador aumenta após download
- [ ] Limite de 5 downloads funciona

## 🐛 Resolução de Problemas

### Problema: "Stripe não configurado"

**Causa:** Variável de ambiente não configurada

**Solução:**
1. Vá para Supabase Dashboard
2. Settings → Edge Functions → Secrets
3. Adicione `STRIPE_SECRET_KEY` com sua chave de teste

### Problema: Webhook não funciona

**Sintomas:**
- Pagamento completa no Stripe
- Mas assinatura não ativa no sistema
- Logs mostram: "Transaction not found"

**Solução:**
1. Verifique se webhook está configurado no Stripe
2. URL deve ser exatamente: `https://[PROJECT_ID].supabase.co/functions/v1/make-server-bdae3ab6/webhook-stripe`
3. Evento selecionado: `checkout.session.completed`
4. Teste o webhook no Stripe Dashboard (botão "Send test webhook")

### Problema: "Sessão expirada"

**Causa:** Token de autenticação expirou

**Solução:**
1. Faça logout
2. Faça login novamente
3. Tente a ação novamente

### Problema: Paleta não aparece

**Causa:** Categoria incorreta ou item não salvo

**Solução:**
1. Verifique se salvou o item
2. Categoria deve ser exatamente: `Paletas`
3. Recarregue a página da loja
4. Limpe o cache do navegador (Ctrl+Shift+R)

## 📊 Logs para Verificar

### Frontend (Console do navegador - F12)

**Ao fazer checkout:**
```javascript
[StorePage] Starting Stripe checkout...
[StorePage] Stripe response: { success: true, url: "https://checkout.stripe.com/..." }
```

**Após pagamento:**
```javascript
[PaymentSuccess] Starting verification
[PaymentSuccess] Session ID: cs_test_...
[PaymentSuccess] Status response: { success: true, status: "completed" }
```

### Backend (Supabase → Logs → Edge Functions)

**Ao criar checkout:**
```
[Stripe Checkout] User: teste@exemplo.com, Type: subscription
[Stripe Checkout] Creating session with 1 items
[Stripe Checkout] Session created successfully: cs_test_a1b2c3...
[Stripe Checkout] Checkout URL: https://checkout.stripe.com/...
```

**Quando webhook é chamado:**
```
[Stripe Webhook] Received request
[Stripe Webhook] Event type: checkout.session.completed, ID: evt_...
[Stripe Webhook] Payment completed for session: cs_test_a1b2c3...
[Stripe Webhook] Processing: UserId=..., Type=subscription
[Stripe Webhook] ✓ Subscription activated for user ... until 2026-03-31...
[Stripe Webhook] ✓ Transaction cs_test_... marked as completed
```

## 🎉 Teste Completo em 30 Segundos

Execute este script de teste rápido:

1. **Abra o console (F12)**
2. **Cole e execute:**

```javascript
// Teste 1: Verificar API da loja
fetch('https://[PROJECT_ID].supabase.co/functions/v1/make-server-bdae3ab6/store/items', {
  headers: { 'Authorization': 'Bearer [ANON_KEY]' }
})
.then(r => r.json())
.then(d => console.log('✅ API funcionando:', d.items?.length, 'itens'))
.catch(e => console.error('❌ Erro na API:', e));

// Teste 2: Verificar autenticação
supabase.auth.getSession()
.then(({data: {session}}) => {
  if (session) {
    console.log('✅ Usuário logado:', session.user.email);
  } else {
    console.log('⚠️ Nenhum usuário logado');
  }
});
```

## ✨ Tudo Funcionou?

Se você completou todos os testes acima e viu os ✅, parabéns! 

Sua loja está **100% funcional** e pronta para:

1. 🎨 Adicionar conteúdo (itens, paletas)
2. 💰 Começar a vender
3. 📊 Monitorar vendas no Stripe Dashboard
4. 🚀 Lançar para o público

---

**Tempo total de teste:** ~5 minutos
**Dificuldade:** Fácil
**Próximo passo:** Adicionar conteúdo real e configurar modo produção
