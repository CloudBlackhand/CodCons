# 🚀 Deploy no Railway - Instruções Completas

## ✅ Sistema Pronto para Deploy

O sistema QR Code está **100% implementado** e pronto para deploy no Railway!

### 📋 **Status do Projeto**
- ✅ Backend Node.js + TypeScript + Express
- ✅ Frontend React + Vite 
- ✅ Site protegido com validação de sessão
- ✅ Configuração PostgreSQL
- ✅ Arquivos Railway configurados
- ✅ Git repository inicializado

## 🎯 **Deploy via Dashboard Railway (Recomendado)**

Como o Railway CLI não pôde ser instalado automaticamente, use o dashboard:

### 1. **Acesse o Railway Dashboard**
```
https://railway.app/dashboard
```

### 2. **Selecione o Projeto**
- Projeto ID: `206dd7c9-a766-4cbc-87cc-db029e67f166`

### 3. **Conecte o Repositório Git**
- Clique em "Connect GitHub Repository"
- Selecione este repositório
- Ou faça upload dos arquivos

### 4. **Adicione PostgreSQL**
- Clique em "Add Service" → "Database" → "PostgreSQL"
- O Railway criará automaticamente o `DATABASE_URL`

### 5. **Configure Variáveis de Ambiente**
Adicione estas variáveis no projeto:

```env
NODE_ENV=production
SESSION_SECRET=uma-chave-secreta-muito-forte-aqui
SITE_URL=https://seu-app.railway.app/site
ADMIN_URL=https://seu-app.railway.app
```

### 6. **Deploy Automático**
- O Railway detectará automaticamente os arquivos
- Executará o build usando `railway.json`
- Iniciará o servidor com `Procfile`

## 🔧 **Arquivos de Configuração Já Prontos**

### `railway.json`
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run install:all && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health"
  }
}
```

### `Procfile`
```
web: npm start
```

### `package.json` Scripts
```json
{
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "build:client": "cd client && npm run build",
    "build:server": "tsc",
    "start": "node dist/server.js",
    "install:all": "npm install && cd client && npm install"
  }
}
```

## 🌐 **URLs Após Deploy**

Após o deploy bem-sucedido, você terá:

- **Admin Panel**: `https://seu-app.railway.app/admin`
- **Site Protegido**: `https://seu-app.railway.app/site`  
- **API**: `https://seu-app.railway.app/api`
- **Health Check**: `https://seu-app.railway.app/health`

## 🧪 **Teste do Sistema**

1. **Verificar Health**: Acesse `/health`
2. **Painel Admin**: Acesse `/admin`
3. **Criar QR Code**: Use o painel para criar um QR code
4. **Testar Acesso**: Escaneie o QR code para testar o fluxo

## 🔄 **Deploy Manual via Git (Alternativa)**

Se preferir usar Git:

```bash
# Adicionar remote do Railway
git remote add railway https://railway.app/git/seu-projeto

# Push para deploy
git push railway main
```

## 📱 **Como Usar o Sistema**

### **Painel Admin** (`/admin`)
1. Crie QR codes com nomes personalizados
2. Gerencie status (Ativo/Bloqueado)
3. Baixe imagens dos QR codes
4. Copie URLs de acesso
5. Delete QR codes desnecessários

### **Sistema de Acesso**
1. Usuário escaneia QR code
2. Redirecionamento automático para site
3. Sessão de 5 minutos iniciada
4. Timer em tempo real
5. Acesso negado após expiração

## 🆘 **Troubleshooting**

### **Build Falha**
- Verifique se todas as dependências estão no `package.json`
- Confirme que as variáveis de ambiente estão configuradas

### **Erro de Banco**
- Verifique se PostgreSQL addon foi adicionado
- Confirme `DATABASE_URL` está configurado

### **QR Codes Não Funcionam**
- Verifique `SITE_URL` e `ADMIN_URL` nas variáveis
- Confirme que as rotas estão corretas

## 🎉 **Sistema Completo**

O sistema implementado inclui:

- ✅ **Backend robusto** com TypeScript
- ✅ **Frontend moderno** com React
- ✅ **Banco PostgreSQL** otimizado
- ✅ **Sessões temporárias** de 5 minutos
- ✅ **Interface intuitiva** para administração
- ✅ **Deploy Railway** configurado
- ✅ **Documentação completa**

**O sistema está pronto para produção!** 🚀
