import express from 'express';
import { qrCodeService } from '../services/qrService';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// Middleware de autenticação para todas as rotas admin
router.use(requireAuth);

// Listar todos os QR Codes
router.get('/qr-codes', async (req, res) => {
  try {
    const qrCodes = await qrCodeService.getAllQRCodes();
    res.json({
      success: true,
      data: qrCodes
    });
  } catch (error) {
    console.error('Erro ao listar QR Codes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Criar novo QR Code
router.post('/qr-codes', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Nome é obrigatório'
      });
    }

    const qrCode = await qrCodeService.generateQRCode(name, description);
    
    res.status(201).json({
      success: true,
      data: qrCode,
      message: 'QR Code criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar QR Code:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Gerar imagem do QR Code
router.get('/qr-codes/:id/image', async (req, res) => {
  try {
    const { id } = req.params;
    const qrImage = await qrCodeService.generateQRCodeImage(id);
    
    res.json({
      success: true,
      data: {
        image: qrImage,
        qrCodeId: id
      }
    });
  } catch (error) {
    console.error('Erro ao gerar imagem do QR Code:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Atualizar QR Code
router.put('/qr-codes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (isActive !== undefined) updates.isActive = isActive;

    const updatedQRCode = await qrCodeService.updateQRCode(id, updates);

    if (!updatedQRCode) {
      return res.status(404).json({
        success: false,
        message: 'QR Code não encontrado'
      });
    }

    res.json({
      success: true,
      data: updatedQRCode,
      message: 'QR Code atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar QR Code:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Alternar status do QR Code (ativar/desativar)
router.patch('/qr-codes/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedQRCode = await qrCodeService.toggleQRCodeStatus(id);

    if (!updatedQRCode) {
      return res.status(404).json({
        success: false,
        message: 'QR Code não encontrado'
      });
    }

    res.json({
      success: true,
      data: updatedQRCode,
      message: `QR Code ${updatedQRCode.isActive ? 'ativado' : 'desativado'} com sucesso`
    });
  } catch (error) {
    console.error('Erro ao alternar status do QR Code:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Deletar QR Code
router.delete('/qr-codes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await qrCodeService.deleteQRCode(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'QR Code não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'QR Code deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar QR Code:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Estatísticas
router.get('/stats', async (req, res) => {
  try {
    const stats = await qrCodeService.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;







