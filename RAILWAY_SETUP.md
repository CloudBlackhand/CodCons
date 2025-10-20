# 🚄 Configuração do Railway

## Projeto Railway ID
```
206dd7c9-a766-4cbc-87cc-db029e67f166
```

## 📋 Passos para Conectar ao Railway

### 1. Instalar Railway CLI

**Opção A - Via npm (se Node.js estiver instalado):**
```bash
npm install -g @railway/cli
```

**Opção B - Via Chocolatey (Windows):**
```bash
choco install railway-cli
```

**Opção C - Download Manual:**
1. Acesse: https://railway.app/cli
2. Baixe o executável para Windows
3. Adicione ao PATH do sistema

### 2. Conectar ao Projeto
```bash
railway login
railway link -p 206dd7c9-a766-4cbc-87cc-db029e67f166
```

### 3. Configurar Variáveis de Ambiente
```bash
# Configurar variáveis necessárias
railway variables set NODE_ENV=production
railway variables set SESSION_SECRET=your-secret-key-here
railway variables set SITE_URL=https://seu-app.railway.app/site
railway variables set ADMIN_URL=https://seu-app.railway.app
```

### 4. Adicionar PostgreSQL
```bash
railway add postgresql
```

### 5. Deploy
```bash
railway up
```

## 🔧 Configuração Manual via Dashboard

Se não conseguir usar o CLI, configure manualmente no dashboard:

1. **Acesse**: https://railway.app/dashboard
2. **Selecione o projeto**: ID `206dd7c9-a766-4cbc-87cc-db029e67f166`
3. **Adicione PostgreSQL addon**
4. **Configure variáveis de ambiente**:
   - `NODE_ENV=production`
   - `SESSION_SECRET=sua-chave-secreta-forte`
   - `SITE_URL=https://seu-app.railway.app/site`
   - `ADMIN_URL=https://seu-app.railway.app`
5. **Deploy**: Conecte o repositório Git e faça push

## 📁 Arquivos de Configuração

O projeto já está configurado com:
- ✅ `railway.json` - Configuração de build
- ✅ `Procfile` - Comando de start
- ✅ `package.json` - Scripts de build
- ✅ `env.example` - Exemplo de variáveis

## 🚀 URLs após Deploy

- **Admin Panel**: `https://seu-app.railway.app/admin`
- **Site Protegido**: `https://seu-app.railway.app/site`
- **API**: `https://seu-app.railway.app/api`
- **Health Check**: `https://seu-app.railway.app/health`

## 🔍 Verificação

Após o deploy, teste:
1. Acesse `/health` - deve retornar status ok
2. Acesse `/admin` - painel administrativo
3. Crie um QR code
4. Teste o fluxo completo

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs: `railway logs`
2. Confirme variáveis: `railway variables`
3. Verifique build: `railway status`
