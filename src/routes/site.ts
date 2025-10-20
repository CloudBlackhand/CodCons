import { Router, Request, Response } from 'express';
import { SessionService } from '../services/sessionService';
import path from 'path';

const router = Router();

// GET /site - Página do site protegida
router.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../public/site/index.html'));
});

// GET /api/site/status - Verificar status da sessão (usado pelo frontend)
router.get('/status', async (req: Request, res: Response) => {
  try {
    const { session } = req.query;

    if (!session || typeof session !== 'string') {
      return res.status(401).json({
        success: false,
        error: 'Token de sessão não fornecido',
        expired: true
      });
    }

    const sessionData = await SessionService.validateSession(session);

    if (!sessionData) {
      return res.status(401).json({
        success: false,
        error: 'Sessão inválida ou expirada',
        expired: true
      });
    }

    // Calcular tempo restante
    const now = new Date();
    const expiresAt = new Date(sessionData.expires_at);
    const timeLeft = Math.max(0, expiresAt.getTime() - now.getTime());
    const minutesLeft = Math.ceil(timeLeft / (1000 * 60));

    res.json({
      success: true,
      data: {
        valid: true,
        expiresAt: sessionData.expires_at,
        minutesLeft: minutesLeft
      }
    });
  } catch (error) {
    console.error('Error checking site status:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

export default router;
