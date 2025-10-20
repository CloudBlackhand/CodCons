# 🔍 Como Verificar Variáveis no Railway

## 📋 Passos para Verificar Variáveis

### 1. Acessar Dashboard Railway
- Vá para: https://railway.app/dashboard
- Faça login na sua conta

### 2. Selecionar o Projeto
- Procure pelo projeto: `206dd7c9-a766-4cbc-87cc-db029e67f166`
- Ou procure por "qr-code-access-system" ou "CodCons"

### 3. Verificar Variáveis
1. **Clique no seu projeto**
2. **Vá para a aba "Variables"** (ou "Settings" → "Variables")
3. **Verifique se estas variáveis estão configuradas:**

## ✅ **Variáveis que DEVEM estar configuradas:**

### **PostgreSQL (já configuradas automaticamente):**
- ✅ `DATABASE_URL` - Conexão principal do banco
- ✅ `PGHOST` - Host do PostgreSQL
- ✅ `PGPORT` - Porta (5432)
- ✅ `PGDATABASE` - Nome do banco
- ✅ `PGUSER` - Usuário do banco
- ✅ `PGPASSWORD` - Senha do banco

### **Sistema (você precisa adicionar):**
- ❌ `NODE_ENV` = `production`
- ❌ `SESSION_SECRET` = `sua-chave-secreta-forte`
- ❌ `SITE_URL` = `https://seu-app.railway.app/site`
- ❌ `ADMIN_URL` = `https://seu-app.railway.app`

## 🔧 **Como Adicionar Variáveis Faltantes:**

1. **Na página de Variables**
2. **Clique em "Add Variable"**
3. **Adicione uma por vez:**

```
Nome: NODE_ENV
Valor: production

Nome: SESSION_SECRET
Valor: BpiFGrsLBBzNeKOkmEiOyDESmMzOyMBv_secret_2024

Nome: SITE_URL
Valor: https://seu-app.railway.app/site

Nome: ADMIN_URL
Valor: https://seu-app.railway.app
```

## 🎯 **URL do Seu App:**

Para encontrar a URL correta do seu app:
1. **No dashboard do Railway**
2. **Clique no serviço principal** (não no PostgreSQL)
3. **Vá para "Settings"**
4. **Procure por "Domains"** ou "URL"
5. **Copie a URL** (algo como: `https://app-name-production.up.railway.app`)

## 🚀 **Após Configurar:**

1. **Railway fará deploy automático**
2. **Sistema se conectará ao PostgreSQL**
3. **Tabelas serão criadas automaticamente**
4. **Sistema estará 100% funcional**

## 📱 **Teste Final:**

Após configurar tudo, teste:
- **Health Check**: `https://sua-url.railway.app/health`
- **Admin Panel**: `https://sua-url.railway.app/admin`
- **Site**: `https://sua-url.railway.app/site`

## 🆘 **Se Algo Não Funcionar:**

1. Verifique se todas as variáveis estão configuradas
2. Confirme se o PostgreSQL addon está ativo
3. Verifique os logs do Railway
4. Teste o health check primeiro
