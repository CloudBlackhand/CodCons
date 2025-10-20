import { Router, Request, Response } from 'express';
import { QRService } from '../services/qrService';
import { CreateQRCodeRequest, UpdateQRCodeStatusRequest } from '../types';

const router = Router();

// GET /api/admin/qrcodes - Listar todos os QR codes
router.get('/qrcodes', async (req: Request, res: Response) => {
  try {
    const qrCodes = await QRService.getAllQRCodes();
    res.json({ success: true, data: qrCodes });
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch QR codes' 
    });
  }
});

// POST /api/admin/qrcodes - Criar novo QR code
router.post('/qrcodes', async (req: Request, res: Response) => {
  try {
    const { name }: CreateQRCodeRequest = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }

    const qrCode = await QRService.createQRCode(name.trim());
    res.status(201).json({ success: true, data: qrCode });
  } catch (error) {
    console.error('Error creating QR code:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create QR code' 
    });
  }
});

// PUT /api/admin/qrcodes/:id/status - Atualizar status do QR code
router.put('/qrcodes/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status }: UpdateQRCodeStatusRequest = req.body;

    if (!status || !['active', 'blocked'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be either "active" or "blocked"'
      });
    }

    const qrCode = await QRService.updateQRCodeStatus(id, status);
    res.json({ success: true, data: qrCode });
  } catch (error) {
    console.error('Error updating QR code status:', error);
    if (error instanceof Error && error.message === 'QR code not found') {
      return res.status(404).json({
        success: false,
        error: 'QR code not found'
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update QR code status' 
    });
  }
});

// DELETE /api/admin/qrcodes/:id - Deletar QR code
router.delete('/qrcodes/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await QRService.deleteQRCode(id);
    res.json({ success: true, message: 'QR code deleted successfully' });
  } catch (error) {
    console.error('Error deleting QR code:', error);
    if (error instanceof Error && error.message === 'QR code not found') {
      return res.status(404).json({
        success: false,
        error: 'QR code not found'
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete QR code' 
    });
  }
});

export default router;