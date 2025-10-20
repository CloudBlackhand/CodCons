# 🎯 Sistema de Gerenciamento de QR Codes

Sistema completo para criação, gerenciamento e controle de acesso via QR codes com sessões temporárias de 5 minutos.

## 🚀 Características

- **Painel Administrativo**: Interface React para gerenciar QR codes
- **Controle de Acesso**: QR codes geram sessões temporárias de 5 minutos
- **Site Protegido**: Área restrita com validação de sessão em tempo real
- **Deploy Railway**: Configurado para deploy automático no Railway
- **PostgreSQL**: Banco de dados robusto para armazenar dados
- **TypeScript**: Código tipado e seguro

## 🏗️ Arquitetura

### Backend (Node.js + Express + TypeScript)
- API REST para CRUD de QR codes
- Sistema de validação e geração de sessões
- Integração com PostgreSQL
- Limpeza automática de sessões expiradas

### Frontend (React + Vite + TypeScript)
- Painel administrativo responsivo
- Geração e download de QR codes
- Interface intuitiva para gerenciamento

### Site de Acesso
- Página protegida com validação de sessão
- Timer em tempo real para sessão ativa
- Interface moderna e responsiva

## 📋 Fluxo de Funcionamento

1. **Admin cria QR code** → Sistema gera código único + imagem QR
2. **Usuário escaneia QR** → Redirecionamento para site com sessão de 5min
3. **Site valida sessão** → Acesso liberado enquanto sessão ativa
4. **Sessão expira** → Acesso negado automaticamente

## 🛠️ Tecnologias

- **Backend**: Node.js, Express, TypeScript, PostgreSQL
- **Frontend**: React, Vite, TypeScript, Axios
- **QR Codes**: qrcode library
- **Deploy**: Railway
- **Banco**: PostgreSQL (Railway addon)

## 🚀 Deploy no Railway

### 1. Preparação
```bash
# Clone o repositório
git clone <seu-repo>
cd qr-code-access-system

# Instale dependências
npm run install:all
```

### 2. Configuração Railway

1. **Crie novo projeto no Railway**
2. **Adicione PostgreSQL addon**
3. **Configure variáveis de ambiente**:

```env
DATABASE_URL=<automático do Railway PostgreSQL>
NODE_ENV=production
SESSION_SECRET=<sua-chave-secreta>
SITE_URL=https://seu-app.railway.app/site
ADMIN_URL=https://seu-app.railway.app
```

### 3. Deploy
```bash
# Push para o repositório conectado ao Railway
git push origin main
```

## 🏃‍♂️ Desenvolvimento Local

### Pré-requisitos
- Node.js 18+
- PostgreSQL
- npm ou yarn

### Setup
```bash
# Instalar dependências
npm run install:all

# Configurar variáveis de ambiente
cp env.example .env
# Edite o .env com suas configurações

# Iniciar PostgreSQL local
# Crie um banco de dados

# Executar em desenvolvimento
npm run dev
```

### URLs Locais
- **Admin Panel**: http://localhost:3000/admin
- **Site Protegido**: http://localhost:3000/site
- **API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

## 📁 Estrutura do Projeto

```
├── src/                    # Backend TypeScript
│   ├── database/          # Configuração PostgreSQL
│   ├── routes/            # Rotas da API
│   ├── services/          # Lógica de negócio
│   ├── types/             # Definições TypeScript
│   └── server.ts          # Servidor principal
├── client/                # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── api/          # Cliente API
│   │   └── App.tsx       # App principal
│   └── vite.config.ts    # Config Vite
├── public/site/          # Site protegido
├── railway.json          # Config Railway
├── Procfile             # Comando de start
└── package.json         # Dependências
```

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento (backend + frontend)
npm run build        # Build completo
npm run build:client # Build apenas frontend
npm run build:server # Build apenas backend
npm start           # Iniciar em produção
```

## 🔒 Segurança

- Sessões temporárias de 5 minutos
- Validação de tokens únicos
- Limpeza automática de sessões expiradas
- Códigos QR únicos e não previsíveis
- Controle de status (ativo/bloqueado)

## 📱 Uso

### Painel Admin
1. Acesse `/admin`
2. Crie novos QR codes
3. Gerencie status (liberar/bloquear)
4. Baixe imagens dos QR codes
5. Delete QR codes desnecessários

### Acesso via QR Code
1. Usuário escaneia QR code
2. Redirecionamento automático para site
3. Sessão de 5 minutos iniciada
4. Timer em tempo real
5. Acesso negado após expiração

## 🐛 Troubleshooting

### Problemas comuns:
- **Erro de conexão DB**: Verifique DATABASE_URL
- **QR codes não funcionam**: Verifique SITE_URL
- **Build falha**: Execute `npm run install:all`

### Logs Railway:
```bash
railway logs
```

## 📄 Licença

MIT License - Use livremente para seus projetos!

---

**Desenvolvido para Railway** 🚄 | **Simples, Rápido, Eficiente** ⚡
