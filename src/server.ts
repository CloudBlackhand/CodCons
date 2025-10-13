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

// Middleware de segurança
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por janela
  message: {
    success: false,
    message: 'Muitas tentativas. Tente novamente em 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});
app.use('/api/', limiter);

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Trust proxy para obter IP real (importante para Railway)
app.set('trust proxy', 1);

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
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware de tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro não tratado:', err);
  
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    code: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
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

// Iniciar servidor com banco de dados
async function startServer() {
  try {
    // Inicializar banco de dados
    console.log('🔄 Inicializando banco de dados PostgreSQL...');
    await database.initialize();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 Servidor CDC com QR Code iniciado com sucesso!');
      console.log('='.repeat(60));
      console.log(`📍 Porta: ${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⚖️  Site CDC: http://localhost:${PORT}/cdc?token=SEU_TOKEN`);
      console.log(`🔐 Painel Admin: http://localhost:${PORT}/admin`);
      console.log(`📊 Health: http://localhost:${PORT}/api/health`);
      console.log(`🗄️  Banco: PostgreSQL conectado`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('\n🔧 Modo Desenvolvimento:');
        console.log(`   🔑 Senha admin: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
      }
      
      console.log('='.repeat(60) + '\n');
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Iniciar
startServer();

export default app;





