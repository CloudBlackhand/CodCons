# 🐘 Configuração PostgreSQL no Railway

## 📋 Passos para Adicionar PostgreSQL

### 1. Acessar Dashboard Railway
- Vá para: https://railway.app/dashboard
- Selecione seu projeto: `206dd7c9-a766-4cbc-87cc-db029e67f166`

### 2. Adicionar PostgreSQL Addon
1. Clique em **"+ New"** ou **"Add Service"**
2. Selecione **"Database"**
3. Escolha **"PostgreSQL"**
4. Aguarde a criação do banco

### 3. Verificar Variáveis de Ambiente
Após adicionar o PostgreSQL, o Railway criará automaticamente:
- ✅ `DATABASE_URL` - URL completa de conexão
- ✅ `PGHOST` - Host do banco
- ✅ `PGPORT` - Porta do banco
- ✅ `PGDATABASE` - Nome do banco
- ✅ `PGUSER` - Usuário do banco
- ✅ `PGPASSWORD` - Senha do banco

### 4. Configurar Variáveis Adicionais
Adicione estas variáveis manualmente:
- `NODE_ENV=production`
- `SESSION_SECRET=sua-chave-secreta-forte-aqui`
- `SITE_URL=https://seu-app.railway.app/site`
- `ADMIN_URL=https://seu-app.railway.app`

### 5. Deploy Automático
- O Railway fará deploy automático após adicionar o PostgreSQL
- As tabelas serão criadas automaticamente na primeira execução
- O sistema estará 100% funcional

## 🔍 Verificação

Após configurar tudo:

1. **Health Check**: `https://seu-app.railway.app/health`
2. **Admin Panel**: `https://seu-app.railway.app/admin`
3. **Site Protegido**: `https://seu-app.railway.app/site`

## 📊 Estrutura das Tabelas

O sistema criará automaticamente:

### Tabela `qrcodes`
```sql
- id (UUID) - Chave primária
- code (VARCHAR) - Código único do QR
- name (VARCHAR) - Nome descritivo
- status (VARCHAR) - 'active' ou 'blocked'
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Tabela `sessions`
```sql
- id (UUID) - Chave primária
- qrcode_id (UUID) - FK para qrcodes
- token (VARCHAR) - Token único da sessão
- expires_at (TIMESTAMP) - Expiração (5 min)
- created_at (TIMESTAMP)
```

## 🚀 Pronto!

Após seguir estes passos, seu sistema estará:
- ✅ **Funcionando** completamente
- ✅ **Conectado** ao PostgreSQL
- ✅ **Pronto** para criar QR codes
- ✅ **Pronto** para controlar acessos

## 🆘 Troubleshooting

Se algo não funcionar:
1. Verifique se `DATABASE_URL` está configurada
2. Confirme se o PostgreSQL addon está ativo
3. Verifique os logs do Railway
4. Teste o health check primeiro
