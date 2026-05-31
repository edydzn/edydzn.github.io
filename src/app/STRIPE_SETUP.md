# Configuração do Stripe - Loja Digital Ediliano Designer

## ⚠️ IMPORTANTE - Configuração Obrigatória

Para que os pagamentos funcionem corretamente, você DEVE configurar o webhook do Stripe.

### 1. Acesse o Dashboard do Stripe

Vá para: https://dashboard.stripe.com/webhooks

### 2. Adicione um Novo Endpoint

Clique em **"Add endpoint"** e configure:

**URL do Webhook:**
```
https://[SEU_PROJECT_ID].supabase.co/functions/v1/make-server-bdae3ab6/webhook-stripe
```

Substitua `[SEU_PROJECT_ID]` pelo ID do seu projeto Supabase.

**Eventos a Ouvir:**
Selecione o evento:
- `checkout.session.completed`

### 3. Teste a Integração

#### Modo de Teste (Development)

1. Use cartões de teste do Stripe:
   - **Sucesso:** `4242 4242 4242 4242`
   - **Falha:** `4000 0000 0000 0002`
   - **CVV:** Qualquer 3 dígitos (ex: 123)
   - **Data:** Qualquer data futura (ex: 12/25)
   - **CEP:** Qualquer CEP (ex: 12345)

2. Monitore os logs do webhook no Dashboard do Stripe
3. Verifique os logs do servidor Supabase:
   ```bash
   # Acesse os logs em:
   https://supabase.com/dashboard/project/[PROJECT_ID]/logs/edge-functions
   ```

### 4. Variáveis de Ambiente Necessárias

Certifique-se de que as seguintes variáveis estão configuradas no Supabase:

- ✅ `STRIPE_SECRET_KEY` - Sua chave secreta do Stripe (começa com `sk_test_` ou `sk_live_`)
- `STRIPE_WEBHOOK_SECRET` (Opcional mas recomendado) - Para validar assinaturas de webhook

### 5. Verificação de Funcionamento

#### Logs Importantes:

Procure por estas mensagens nos logs:

**✅ Sucesso:**
```
[Stripe Checkout] Session created successfully: cs_test_...
[Stripe Webhook] Event type: checkout.session.completed
[Stripe Webhook] ✓ Subscription activated for user ...
```

**❌ Erros Comuns:**

1. **"STRIPE_SECRET_KEY not configured"**
   - Adicione a chave do Stripe nas variáveis de ambiente

2. **"Transaction not found for session"**
   - O webhook foi chamado mas a transação não existe
   - Verifique se o checkout foi criado corretamente

3. **"Erro ao criar sessão de pagamento"**
   - Verifique sua chave do Stripe
   - Confirme que está usando a chave correta (test vs live)

### 6. Fluxo de Pagamento

```
1. Usuário clica em "Assinar Agora"
   ↓
2. Frontend chama /store/checkout/stripe
   ↓
3. Backend cria sessão do Stripe e salva transação pendente
   ↓
4. Usuário é redirecionado para checkout do Stripe
   ↓
5. Usuário preenche dados do cartão
   ↓
6. Stripe processa pagamento
   ↓
7. Stripe chama webhook /webhook-stripe
   ↓
8. Backend ativa assinatura do usuário
   ↓
9. Usuário é redirecionado para /pagamento-efetivado
   ↓
10. Frontend verifica status e mostra confirmação
```

### 7. Categorias da Loja

A loja suporta as seguintes categorias:

- **PSD** - Arquivos Photoshop
- **Mockups** - Mockups para apresentação
- **Paletas** - Paletas de cores e gradientes CSS (não requerem imagem)
- **Vetores** - Arquivos vetoriais
- **3D** - Modelos 3D
- **Outros** - Outras categorias

### 8. Itens Gratuitos vs Premium

#### Itens Gratuitos (`isFree: true`)
- ✅ Requerem apenas **login**
- ✅ Sem limite de downloads
- ✅ Não exigem pagamento

#### Itens Premium (`isFree: false`)
- 🔒 Requerem **assinatura ativa** OU **compra individual**
- 🔒 Com assinatura: 5 downloads por dia
- 🔒 Sem assinatura: compra individual (R$ 10,00 por item)

### 9. Sistema de Paletas

As paletas são um tipo especial de item que:
- ✅ **NÃO requerem imagem** (opcional)
- ✅ **NÃO requerem arquivo** (opcional)
- ✅ Armazenam cores em formato array: `["#FF0000", "#00FF00"]`
- ✅ Armazenam gradientes CSS: `"linear-gradient(45deg, #FF0000, #00FF00)"`

Exemplo de paleta:
```json
{
  "title": "Sunset Vibes",
  "category": "Paletas",
  "description": "Cores quentes inspiradas no pôr do sol",
  "colors": ["#FF6B6B", "#FFD93D", "#6BCB77"],
  "gradient": "linear-gradient(135deg, #FF6B6B 0%, #FFD93D 50%, #6BCB77 100%)",
  "isFree": true
}
```

### 10. Modo de Produção

Antes de ir para produção:

1. **Troque para chave live do Stripe:**
   - Substitua `sk_test_...` por `sk_live_...`

2. **Configure webhook secret:**
   - Adicione `STRIPE_WEBHOOK_SECRET` para validar assinaturas

3. **Teste completamente:**
   - Faça um pagamento real de teste (pode ser reembolsado depois)
   - Verifique se o webhook é chamado corretamente
   - Confirme que a assinatura é ativada

4. **Monitore:**
   - Fique de olho nos logs do Stripe Dashboard
   - Configure alertas para webhooks falhados

### 11. Suporte

Em caso de problemas:

1. Verifique os logs do Supabase Edge Functions
2. Verifique os logs do Stripe Dashboard
3. Teste com cartões de teste
4. Confirme que todas as variáveis de ambiente estão configuradas
5. Verifique se o webhook está ativo e respondendo

---

**Data de criação:** 01/03/2026
**Versão:** 1.0
**Documentado por:** Assistente AI
