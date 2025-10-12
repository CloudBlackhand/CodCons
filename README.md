# Sistema de Controle de Acesso QR Code - Código de Defesa do Consumidor

Sistema completo de controle de acesso via QR Codes para proteger o site do Código de Defesa do Consumidor (Lei nº 8.078/1990). Desenvolvido para ser hospedado no Railway.

## 🚀 Funcionalidades

- ✅ Site completo do CDC com todos os artigos da Lei 8.078/1990
- ✅ Geração de QR Codes únicos para acesso ao CDC
- ✅ Controle de acesso (ativar/revogar QR Codes)
- ✅ Validação a cada requisição (necessário escanear após F5 ou bloqueio)
- ✅ Interface administrativa completa
- ✅ Navegação por Títulos e Capítulos do CDC
- ✅ Busca por número de artigo ou palavra-chave
- ✅ Logs detalhados de acesso e estatísticas
- ✅ Design jurídico moderno com fontes serifadas
- ✅ Pronto para deploy no Railway

## 🛠️ Tecnologias

- **Backend**: Node.js + TypeScript + Express
- **QR Codes**: Biblioteca `qrcode`
- **Banco de Dados**: Inicialmente em memória (depois PostgreSQL)
- **Deploy**: Railway
- **Segurança**: Helmet, CORS, Rate Limiting

## 📦 Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp env.example .env
```

4. Execute em desenvolvimento:
```bash
npm run dev
```

5. Para produção:
```bash
npm run build
npm start
```

## 🔧 Configuração

### Variáveis de Ambiente

```env
PORT=3000
NODE_ENV=production
ADMIN_PASSWORD=sua_senha_segura_aqui
JWT_SECRET=sua_chave_secreta_jwt
DATABASE_URL=postgresql://user:password@host:port/database
```

### Deploy no Railway

1. Conecte seu repositório ao Railway
2. Configure as variáveis de ambiente
3. Adicione um banco PostgreSQL (opcional)
4. Deploy automático!

## 📱 Como Usar

### 1. Acessar o Painel Admin
- URL: `https://seu-dominio.railway.app/admin`
- Senha padrão: `admin123` (altere em produção!)

### 2. Criar QR Codes para Acesso ao CDC
- No painel admin, clique em "Novo QR Code"
- Digite nome (ex: "QR Atendente 1") e descrição opcional
- Clique em "Criar QR Code"
- O sistema gerará automaticamente:
  - Um token único (UUID)
  - QR Code que aponta para `/cdc?token=UUID`
  - URL completa visível no painel

### 3. Gerenciar Acesso
- **Testar Acesso**: Clique no botão "🔗 Testar Acesso" para abrir o site CDC
- **Ativar/Desativar**: Use o botão para revogar ou restaurar acesso
- **Gerar Imagem**: Crie QR Code para impressão
- **Deletar**: Remova QR Codes desnecessários

### 4. Usar o QR Code
- Escaneie o QR Code com celular/tablet
- Será redirecionado para o site do CDC
- Navegue pelos artigos, busque por palavras-chave
- **Importante**: Ao dar F5 ou bloquear a tela, é necessário escanear o QR Code novamente

### 5. Site do CDC
- **Navegação**: Use a sidebar para navegar por Títulos e Capítulos
- **Busca**: Digite número do artigo (ex: "art 18", "42") ou palavra-chave
- **Resultados**: Artigos encontrados são destacados com highlight
- **Design**: Tipografia serifada, design clean e moderno

## 🔐 API Endpoints

### CDC (Site Principal)
- `GET /cdc?token=UUID` - Site do Código de Defesa do Consumidor (requer token válido)

### Acesso
- `GET /api/access/:code` - Validar QR Code (API JSON)

### Admin (Requer autenticação)
- `GET /api/admin/qr-codes` - Listar todos os QR Codes
- `POST /api/admin/qr-codes` - Criar novo QR Code
- `PUT /api/admin/qr-codes/:id` - Atualizar QR Code
- `PATCH /api/admin/qr-codes/:id/toggle` - Ativar/Desativar
- `DELETE /api/admin/qr-codes/:id` - Deletar QR Code
- `GET /api/admin/qr-codes/:id/image` - Gerar imagem do QR Code
- `GET /api/admin/stats` - Estatísticas do sistema

### Web
- `GET /` - Página inicial
- `GET /admin` - Painel administrativo
- `GET /api/health` - Health check

## 📊 Estrutura do Projeto

```
src/
├── data/             # Dados estruturados do CDC
│   └── cdc-data.ts   # Todos os artigos do CDC em JSON
├── database/         # Gerenciamento de dados
│   └── index.ts      # Banco em memória
├── middleware/       # Middlewares
│   ├── auth.ts       # Autenticação admin
│   └── tokenAuth.ts  # Validação de tokens CDC
├── routes/           # Rotas da API e web
│   ├── access.ts     # API de validação
│   ├── admin.ts      # Painel administrativo API
│   ├── cdc.ts        # Site do CDC
│   └── web.ts        # Páginas web
├── services/         # Lógica de negócio
│   └── qrService.ts  # Geração e validação de QR Codes
├── types/            # Tipos TypeScript
│   └── index.ts      # Interfaces e tipos
└── server.ts         # Servidor principal
```

## 🔒 Segurança

- **Validação de Token**: Cada acesso ao CDC requer token válido
- **Sessão Volátil**: Token deve ser revalidado após F5 ou bloqueio de tela
- **Revogação Instantânea**: Admin pode desativar QR Codes a qualquer momento
- **Autenticação Admin**: Senha obrigatória para área administrativa
- **Rate Limiting**: 100 requisições por 15 minutos por IP
- **Headers Seguros**: Helmet configurado para proteção
- **Logs Detalhados**: Registro de todos os acessos (IP, User-Agent, timestamp)
- **Validação Server-Side**: Toda validação acontece no backend

## 📈 Funcionalidades Implementadas

- ✅ Site completo do CDC com Lei 8.078/1990
- ✅ Sistema de tokens para acesso controlado
- ✅ Validação a cada requisição (anti-persistência)
- ✅ Interface moderna com tipografia serifada
- ✅ Busca por artigo e palavra-chave
- ✅ Navegação por Títulos e Capítulos
- ✅ Painel admin com gestão de QR Codes
- ✅ Logs de acesso detalhados

## 📈 Melhorias Futuras

1. **Banco PostgreSQL**: Migrar de memória para PostgreSQL para persistência
2. **Mais Artigos CDC**: Adicionar artigos 21-119 completos
3. **JWT**: Implementar autenticação JWT para admin
4. **Notificações**: Alertas de acesso em tempo real via WebSocket
5. **Relatórios**: Dashboard com gráficos de uso
6. **Multi-idioma**: Suporte para outros idiomas
7. **PWA**: Transformar em Progressive Web App

## 🐛 Troubleshooting

### Acesso Negado ao CDC
1. **Token Inválido**: Verifique se o QR Code está ativo no painel admin
2. **QR Code Revogado**: Confirme se não foi desativado recentemente
3. **URL Incorreta**: Certifique-se de que a URL contém `?token=UUID`
4. **Verifique Logs**: Acesse `/api/admin/stats` para ver tentativas de acesso

### Site CDC não carrega
1. **Escaneie Novamente**: Após F5, é necessário escanear o QR Code novamente
2. **Token Expirado**: Gere um novo QR Code no painel admin
3. **Verifique Conectividade**: Confirme conexão com a internet

### Erro de autenticação no Admin
1. Confirme a senha de admin (padrão: `admin123`)
2. Verifique as variáveis de ambiente (`ADMIN_PASSWORD`)
3. Teste em modo desenvolvimento

### Problemas no Railway
1. Verifique as variáveis de ambiente no dashboard
2. Confirme se o build foi concluído com sucesso
3. Verifique os logs do Railway
4. Teste a rota `/api/health` para verificar se o servidor está respondendo

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do sistema
2. Teste localmente primeiro
3. Confirme as configurações do Railway

---

**Desenvolvido para Railway** 🚂



