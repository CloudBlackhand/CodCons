# 🚂 Guia de Deploy no Railway - Sistema CDC com QR Code

## 📋 Pré-requisitos

- Conta no [Railway](https://railway.app)
- Repositório Git (GitHub, GitLab ou Bitbucket)
- Node.js 18+ (Railway usa automaticamente)

## 🚀 Passo a Passo do Deploy

### 1. Preparar o Repositório

```bash
# Certifique-se de que tudo está commitado
git add .
git commit -m "Preparar para deploy no Railway"
git push origin main
```

### 2. Criar Projeto no Railway

1. Acesse [railway.app](https://railway.app)
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Escolha o repositório `chatodmsdeda`
5. Railway detectará automaticamente o `railway.json` e `Procfile`

### 3. Configurar Variáveis de Ambiente

No dashboard do Railway, vá em **Variables** e adicione:

#### ✅ Variáveis Obrigatórias

```env
NODE_ENV=production
ADMIN_PASSWORD=SuaSenhaForteAqui123!
BASE_URL=https://seu-projeto.up.railway.app
JWT_SECRET=chave_secreta_longa_e_aleatoria_minimo_32_caracteres
PORT=3000
```

#### 🔐 Gerando Senhas Seguras

**ADMIN_PASSWORD** (mínimo 8 caracteres, recomendado 16+):
```bash
# Use um gerador de senhas forte
# Exemplo: K9#mP2$xL5@nQ8!vW3
```

**JWT_SECRET** (mínimo 32 caracteres):
```bash
# Gere uma string aleatória longa
# Exemplo: a8f5d2e9c4b7a3f1d6e8b2c9a5f7d3e1b4c6a8f2d9e5b7c3a6f1d8e4b9c2
```

#### ⚙️ Variáveis Opcionais

```env
DATABASE_URL=postgresql://user:pass@host:port/db  # Para PostgreSQL futuro
```

### 4. Obter URL do Projeto

Após o deploy:
1. Railway gerará automaticamente uma URL: `https://seu-projeto.up.railway.app`
2. Copie esta URL
3. Volte em **Variables**
4. Atualize `BASE_URL` com a URL correta
5. O Railway irá reiniciar automaticamente

### 5. Verificar Deploy

```bash
# Teste o healthcheck
curl https://seu-projeto.up.railway.app/api/health

# Resposta esperada:
{
  "success": true,
  "message": "Sistema funcionando",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "environment": "production",
  "uptime": 123.456
}
```

### 6. Acessar o Sistema

1. **Painel Admin**: `https://seu-projeto.up.railway.app/admin`
   - Use a senha configurada em `ADMIN_PASSWORD`

2. **Criar QR Code**: No painel admin
   - Nome: "QR Code 1"
   - Descrição: "Acesso CDC"
   - Clique em "Criar QR Code"

3. **Testar Acesso**: Clique no botão "🔗 Testar Acesso"
   - Deverá abrir o site do CDC
   - Navegue pelos artigos

## 🔒 Checklist de Segurança Pós-Deploy

### ✅ Configurações Obrigatórias

- [ ] `ADMIN_PASSWORD` alterada (não use `admin123`)
- [ ] `JWT_SECRET` configurado (string longa e aleatória)
- [ ] `BASE_URL` configurado com URL correta do Railway
- [ ] `NODE_ENV=production` definido
- [ ] Healthcheck funcionando (`/api/health` retorna 200)

### 🔐 Medidas de Segurança Ativas

O sistema já inclui automaticamente:

- ✅ **Helmet** com Content Security Policy
- ✅ **CORS** restrito à BASE_URL em produção
- ✅ **Rate Limiting**:
  - API: 60 requisições/15min
  - Admin: 5 tentativas login/15min
  - CDC: 30 requisições/min
- ✅ **HSTS** (HTTP Strict Transport Security)
- ✅ **XSS Protection** e NoSniff
- ✅ **Frameguard** (anti-iframe)
- ✅ **Sanitização** automática de inputs
- ✅ **Validação** de variáveis de ambiente no startup
- ✅ **Logging** de todas as requisições em produção

### 🛡️ Proteções Específicas do CDC

- ✅ Token validado server-side a cada requisição
- ✅ QR Codes revogáveis instantaneamente
- ✅ Sessão volátil (sem persistência em localStorage)
- ✅ Logs detalhados (IP, User-Agent, timestamp)
- ✅ Bloqueio automático de tokens inativos

## 📊 Monitoramento

### Logs do Railway

Acesse a aba **"Deployments"** > **"View Logs"** para ver:
- Requisições em tempo real
- Tentativas de acesso (sucesso/falha)
- Erros do sistema
- Rate limit violations

### Estatísticas do Sistema

Acesse (requer autenticação admin):
```
https://seu-projeto.up.railway.app/api/admin/stats
```

Retorna:
```json
{
  "success": true,
  "data": {
    "totalQRCodes": 5,
    "activeQRCodes": 3,
    "inactiveQRCodes": 2,
    "totalAccessAttempts": 150,
    "successfulAccesses": 120,
    "failedAccesses": 30
  }
}
```

## 🔧 Troubleshooting

### Erro: "Variáveis de ambiente obrigatórias não definidas"

**Causa**: Faltam variáveis no Railway

**Solução**:
1. Vá em **Variables**
2. Adicione todas as variáveis obrigatórias
3. Railway reiniciará automaticamente

### Erro: "ADMIN_PASSWORD deve ter no mínimo 8 caracteres"

**Causa**: Senha muito curta

**Solução**:
1. Gere uma senha forte (mínimo 8, recomendado 16+ caracteres)
2. Atualize `ADMIN_PASSWORD` nas Variables
3. Aguarde restart automático

### Erro 503 ou 500

**Causa**: Build falhou ou app crashou

**Solução**:
1. Verifique logs: **Deployments** > **View Logs**
2. Procure por erros de compilação TypeScript
3. Verifique se todas as dependências estão em `package.json`
4. Tente redeploy: **Settings** > **Redeploy**

### QR Code não funciona

**Causa**: BASE_URL incorreta ou token inválido

**Solução**:
1. Verifique se `BASE_URL` está correta nas Variables
2. Verifique se QR Code está ativo no painel admin
3. Teste diretamente a URL do QR Code no navegador
4. Verifique logs para ver tentativas de acesso

### Rate Limit atingido

**Causa**: Muitas requisições em curto período

**Solução**:
1. Aguarde 15 minutos
2. Se for uso legítimo, ajuste limites em `src/server.ts`
3. Redeploy após alteração

### CORS Error

**Causa**: Requisição de origem não permitida

**Solução**:
1. Verifique se `BASE_URL` está correta
2. Se usar domínio customizado, adicione-o em `allowedOrigins`
3. Em desenvolvimento local, use `NODE_ENV=development`

## 🔄 Atualizações e Manutenção

### Atualizar Código

```bash
# Faça suas alterações
git add .
git commit -m "Descrição das mudanças"
git push origin main

# Railway fará deploy automático
```

### Rollback

Se algo der errado:
1. Vá em **Deployments**
2. Encontre o deploy anterior funcional
3. Clique em **"Rollback to this version"**

### Adicionar Domínio Customizado

1. Vá em **Settings** > **Domains**
2. Clique em **"Add Domain"**
3. Configure DNS conforme instruções
4. Atualize `BASE_URL` com novo domínio

## 📈 Performance e Escalabilidade

### Recursos do Railway

Por padrão, Railway fornece:
- **vCPU**: 0.5-8 (escala automaticamente)
- **RAM**: 512MB-32GB (escala automaticamente)
- **Storage**: Ephemeral (usa banco externo para persistência)

### Recomendações

1. **Banco de Dados**: Para produção real, migre para PostgreSQL Railway
   ```bash
   # No Railway:
   # 1. Adicione "New Service" > "PostgreSQL"
   # 2. Conecte ao seu app
   # 3. Use DATABASE_URL automática
   ```

2. **Backup**: Sistema atual usa memória (dados perdidos ao restart)
   - Implemente PostgreSQL para persistência
   - Configure backups automáticos do Railway

3. **Monitoramento**: Use Railway Metrics
   - CPU e RAM usage
   - Network bandwidth
   - Request rate

## 🎯 Checklist Final

Antes de considerar o deploy concluído:

- [ ] Deploy bem-sucedido (build passou)
- [ ] Healthcheck funcionando (status 200)
- [ ] Todas as variáveis de ambiente configuradas
- [ ] BASE_URL atualizada com URL do Railway
- [ ] Senha admin alterada para senha forte
- [ ] Painel admin acessível e funcionando
- [ ] QR Code criado com sucesso
- [ ] Teste de acesso ao CDC funcionando
- [ ] Revogação de QR Code funcionando
- [ ] Rate limiting testado
- [ ] Logs sendo gerados corretamente
- [ ] Domínio customizado configurado (opcional)

## 🆘 Suporte

**Logs em tempo real:**
```bash
# Railway CLI (instale primeiro)
npm install -g @railway/cli
railway login
railway logs
```

**Dashboard Railway:**
- Metrics: https://railway.app/project/[seu-projeto]/metrics
- Logs: https://railway.app/project/[seu-projeto]/deployments
- Variables: https://railway.app/project/[seu-projeto]/variables

**Documentação Oficial:**
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

## 🎉 Deploy Concluído!

Seu sistema está agora rodando em produção com máxima segurança! 🚀

---

**Desenvolvido para Railway** 🚂  
**100% Seguro em Produção** 🔒  
**Português do Brasil** 🇧🇷

