import express from 'express';
import { qrCodeService } from '../services/qrService';

const router = express.Router();

// Rota para validação de acesso via QR Code
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    const validation = await qrCodeService.validateAccess(code);
    
    // Log da tentativa de acesso
    await qrCodeService.logAccess(
      validation.qrCode?.id || 'unknown',
      ip,
      userAgent,
      validation.valid
    );

    if (!validation.valid) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. QR Code inválido ou desativado.',
        code: 'ACCESS_DENIED'
      });
    }

    res.json({
      success: true,
      message: 'Acesso autorizado',
      qrCode: {
        name: validation.qrCode?.name,
        description: validation.qrCode?.description
      }
    });

  } catch (error) {
    console.error('Erro na validação de acesso:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

export default router;



