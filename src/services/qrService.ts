import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { database } from '../database';
import { QRCode as QRCodeType } from '../types';

export class QRCodeService {
  async generateQRCode(name: string, description?: string): Promise<QRCodeType> {
    const code = uuidv4();
    
    const qrCodeData = await database.createQRCode({
      name,
      description,
      code,
      isActive: true
    });

    return qrCodeData;
  }

  async generateQRCodeImage(qrCodeId: string): Promise<string> {
    const qrCode = await database.getQRCode(qrCodeId);
    if (!qrCode) {
      throw new Error('QR Code não encontrado');
    }

    // Gera URL para o site CDC com token
    const url = `${process.env.BASE_URL || 'http://localhost:3000'}/cdc?token=${qrCode.code}`;
    
    try {
      const qrImage = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      return qrImage;
    } catch (error) {
      throw new Error('Erro ao gerar imagem do QR Code');
    }
  }

  // Método auxiliar para obter URL de acesso do CDC
  getAccessUrl(code: string): string {
    return `${process.env.BASE_URL || 'http://localhost:3000'}/cdc?token=${code}`;
  }

  async validateAccess(code: string): Promise<{ valid: boolean; qrCode?: QRCodeType }> {
    const qrCode = await database.getQRCodeByCode(code);

    if (!qrCode) {
      return { valid: false };
    }

    if (!qrCode.isActive) {
      return { valid: false, qrCode };
    }

    return { valid: true, qrCode };
  }

  async getAllQRCodes(): Promise<QRCodeType[]> {
    return database.getAllQRCodes();
  }

  async updateQRCode(id: string, updates: Partial<QRCodeType>): Promise<QRCodeType | null> {
    return database.updateQRCode(id, updates);
  }

  async deleteQRCode(id: string): Promise<boolean> {
    return database.deleteQRCode(id);
  }

  async toggleQRCodeStatus(id: string): Promise<QRCodeType | null> {
    return database.toggleQRCodeStatus(id);
  }

  async logAccess(qrCodeId: string, ip: string, userAgent: string, success: boolean): Promise<void> {
    await database.logAccess({
      qrCodeId,
      ip,
      userAgent,
      success
    });
  }

  async getStats() {
    return database.getStats();
  }
}

export const qrCodeService = new QRCodeService();




