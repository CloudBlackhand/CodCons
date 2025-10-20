import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import pool from '../database';
import { QRCode as QRCodeType, QRCodeWithImage } from '../types';

export class QRService {
  static generateUniqueCode(): string {
    return uuidv4().replace(/-/g, '').substring(0, 16);
  }

  static async generateQRCodeImage(url: string): Promise<string> {
    try {
      const qrImage = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrImage;
    } catch (error) {
      console.error('Error generating QR code image:', error);
      throw new Error('Failed to generate QR code image');
    }
  }

  static async createQRCode(name: string): Promise<QRCodeWithImage> {
    const code = this.generateUniqueCode();
    const accessUrl = `${process.env.ADMIN_URL || 'http://localhost:3000'}/api/access/scan/${code}`;
    
    try {
      const result = await pool.query(
        'INSERT INTO qrcodes (code, name, status) VALUES ($1, $2, $3) RETURNING *',
        [code, name, 'active']
      );

      const qrCode = result.rows[0] as QRCodeType;
      const qrImage = await this.generateQRCodeImage(accessUrl);

      return {
        ...qrCode,
        qrImage,
        accessUrl
      };
    } catch (error) {
      console.error('Error creating QR code:', error);
      throw new Error('Failed to create QR code');
    }
  }

  static async getAllQRCodes(): Promise<QRCodeWithImage[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM qrcodes ORDER BY created_at DESC'
      );

      const qrCodes = await Promise.all(
        result.rows.map(async (qrCode: QRCodeType) => {
          const accessUrl = `${process.env.ADMIN_URL || 'http://localhost:3000'}/api/access/scan/${qrCode.code}`;
          const qrImage = await this.generateQRCodeImage(accessUrl);
          
          return {
            ...qrCode,
            qrImage,
            accessUrl
          };
        })
      );

      return qrCodes;
    } catch (error) {
      console.error('Error fetching QR codes:', error);
      throw new Error('Failed to fetch QR codes');
    }
  }

  static async updateQRCodeStatus(id: string, status: 'active' | 'blocked'): Promise<QRCodeType> {
    try {
      const result = await pool.query(
        'UPDATE qrcodes SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [status, id]
      );

      if (result.rows.length === 0) {
        throw new Error('QR code not found');
      }

      return result.rows[0] as QRCodeType;
    } catch (error) {
      console.error('Error updating QR code status:', error);
      throw new Error('Failed to update QR code status');
    }
  }

  static async deleteQRCode(id: string): Promise<void> {
    try {
      const result = await pool.query(
        'DELETE FROM qrcodes WHERE id = $1',
        [id]
      );

      if (result.rowCount === 0) {
        throw new Error('QR code not found');
      }
    } catch (error) {
      console.error('Error deleting QR code:', error);
      throw new Error('Failed to delete QR code');
    }
  }

  static async validateQRCode(code: string): Promise<QRCodeType | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM qrcodes WHERE code = $1 AND status = $2',
        [code, 'active']
      );

      return result.rows.length > 0 ? result.rows[0] as QRCodeType : null;
    } catch (error) {
      console.error('Error validating QR code:', error);
      throw new Error('Failed to validate QR code');
    }
  }
}
