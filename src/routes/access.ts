import { Router, Request, Response } from 'express';
import { QRService } from '../services/qrService';
import { SessionService } from '../services/sessionService';

const router = Router();

// GET /api/access/scan/:code - Validar QR code e criar sessão
router.get('/scan/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    // Validar se o QR code existe e está ativo
    const qrCode = await QRService.validateQRCode(code);

    if (!qrCode) {
      return res.status(400).json({
        success: false,
        error: 'QR code inválido ou bloqueado'
      });
    }

    // Criar sessão de 5 minutos
    const session = await SessionService.createSession(qrCode.id);

    // Redirecionar para o site com token de sessão
    const siteUrl = process.env.SITE_URL || 'http://localhost:3000/site';
    const redirectUrl = `${siteUrl}?token=${session.token}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error processing QR code scan:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/access/verify/:token - Verificar se sessão é válida
router.get('/verify/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const session = await SessionService.validateSession(token);

    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'Sessão inválida ou expirada',
        expired: true
      });
    }

    // Calcular tempo restante
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    const timeLeft = Math.max(0, expiresAt.getTime() - now.getTime());
    const minutesLeft = Math.ceil(timeLeft / (1000 * 60));

    res.json({
      success: true,
      data: {
        valid: true,
        expiresAt: session.expires_at,
        minutesLeft: minutesLeft
      }
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

export default router;
