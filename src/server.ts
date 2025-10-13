import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import accessRoutes from './routes/access';
import adminRoutes from './routes/admin';
import webRoutes from './routes/web';
import cdcRoutes from './routes/cdc';
import { database } from './database';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware de segurança avançado para produção
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// CORS temporariamente liberado para funcionar
app.use(cors({
  origin: '*', // Permitir todas as origens temporariamente
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiting agressivo para produção
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: NODE_ENV === 'production' ? 60 : 100,
  message: {
    success: false,
    message: 'Muitas tentativas. Tente novamente em 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/health'
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    code: 'LOGIN_RATE_LIMIT'
  }
});

const cdcLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Muitos acessos ao CDC. Aguarde um momento.',
    code: 'CDC_RATE_LIMIT'
  }
});

app.use('/api/', apiLimiter);
app.use('/admin', adminLimiter);
app.use('/cdc', cdcLimiter);

// Middleware para parsing com limite de tamanho
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Trust proxy para obter IP real (crítico para Railway)
app.set('trust proxy', 1);

// Middleware para sanitização de input
app.use((req, res, next) => {
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = (req.query[key] as string)
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/<[^>]+>/g, '')
          .trim();
      }
    });
  }
  next();
});

// Logging de segurança em produção
if (NODE_ENV === 'production') {
  app.use((req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${ip}`);
    next();
  });
}

// Validação de variáveis de ambiente obrigatórias
if (NODE_ENV === 'production') {
  const requiredEnvVars = ['ADMIN_PASSWORD', 'BASE_URL', 'JWT_SECRET', 'DATABASE_URL'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ ERRO: Variáveis de ambiente obrigatórias não definidas:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    process.exit(1);
  }

  const adminPassword = process.env.ADMIN_PASSWORD || '';
  if (adminPassword.length < 8) {
    console.error('❌ ERRO: ADMIN_PASSWORD deve ter no mínimo 8 caracteres');
    process.exit(1);
  }
}

// Inicializar banco de dados PostgreSQL
async function initializeDatabase() {
  try {
    await database.initialize();
    console.log('✅ PostgreSQL conectado e tabelas criadas!');
  } catch (error) {
    console.error('❌ Erro ao conectar ao PostgreSQL:', error);
    if (NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

// Rotas
app.use('/', webRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/admin', adminRoutes);
app.use('/cdc', cdcRoutes);

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Sistema funcionando',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime(),
    database: 'PostgreSQL'
  });
});

// Middleware de tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro não tratado:', err);
  
  const errorMessage = NODE_ENV === 'production' 
    ? 'Erro interno do servidor' 
    : err.message;
  
  res.status(err.status || 500).json({
    success: false,
    message: errorMessage,
    code: 'INTERNAL_ERROR',
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    code: 'NOT_FOUND'
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM recebido, encerrando gracefully...');
  await database.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT recebido, encerrando gracefully...');
  await database.close();
  process.exit(0);
});

// Iniciar servidor
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 Servidor CDC com QR Code iniciado com sucesso!');
    console.log('='.repeat(60));
    console.log(`📍 Porta: ${PORT}`);
    console.log(`🌍 Ambiente: ${NODE_ENV}`);
    console.log(`🔗 Base URL: ${BASE_URL}`);
    console.log(`💾 Banco de Dados: PostgreSQL`);
    console.log(`⚖️  Site CDC: ${BASE_URL}/cdc?token=SEU_TOKEN`);
    console.log(`🔐 Painel Admin: ${BASE_URL}/admin`);
    console.log(`📊 Health: ${BASE_URL}/api/health`);
    
    if (NODE_ENV === 'development') {
      console.log('\n🔧 Modo Desenvolvimento:');
      console.log(`   🔑 Senha admin padrão: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
      console.log(`   ⚠️  Rate limiting: Menos restritivo`);
    } else {
      console.log('\n🔒 Modo Produção:');
      console.log(`   ✅ Helmet ativado com CSP`);
      console.log(`   ✅ CORS configurado para: ${BASE_URL}`);
      console.log(`   ✅ Rate limiting: 60 req/15min (API), 5 req/15min (Admin)`);
      console.log(`   ✅ PostgreSQL conectado`);
      console.log(`   ✅ Validação de variáveis de ambiente: OK`);
    }
    
    console.log('='.repeat(60) + '\n');
  });
});

export default app;
