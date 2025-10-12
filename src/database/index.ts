import { QRCode, AccessLog } from '../types';

// Banco de dados em memória para desenvolvimento
// Depois migraremos para PostgreSQL
class Database {
  private qrCodes: Map<string, QRCode> = new Map();
  private accessLogs: AccessLog[] = [];

  // QR Codes
  async createQRCode(qrCode: Omit<QRCode, 'id' | 'createdAt' | 'updatedAt' | 'useCount'>): Promise<QRCode> {
    const id = this.generateId();
    const now = new Date();
    
    const newQRCode: QRCode = {
      ...qrCode,
      id,
      createdAt: now,
      updatedAt: now,
      useCount: 0
    };
    
    this.qrCodes.set(id, newQRCode);
    return newQRCode;
  }

  async getQRCode(id: string): Promise<QRCode | null> {
    return this.qrCodes.get(id) || null;
  }

  async getAllQRCodes(): Promise<QRCode[]> {
    return Array.from(this.qrCodes.values());
  }

  async updateQRCode(id: string, updates: Partial<QRCode>): Promise<QRCode | null> {
    const qrCode = this.qrCodes.get(id);
    if (!qrCode) return null;

    const updatedQRCode = {
      ...qrCode,
      ...updates,
      id,
      updatedAt: new Date()
    };

    this.qrCodes.set(id, updatedQRCode);
    return updatedQRCode;
  }

  async deleteQRCode(id: string): Promise<boolean> {
    return this.qrCodes.delete(id);
  }

  async toggleQRCodeStatus(id: string): Promise<QRCode | null> {
    const qrCode = this.qrCodes.get(id);
    if (!qrCode) return null;

    return this.updateQRCode(id, { isActive: !qrCode.isActive });
  }

  // Access Logs
  async logAccess(log: Omit<AccessLog, 'id' | 'timestamp'>): Promise<AccessLog> {
    const accessLog: AccessLog = {
      ...log,
      id: this.generateId(),
      timestamp: new Date()
    };

    this.accessLogs.push(accessLog);
    
    // Atualizar contador de uso do QR Code
    const qrCode = this.qrCodes.get(log.qrCodeId);
    if (qrCode && log.success) {
      this.qrCodes.set(log.qrCodeId, {
        ...qrCode,
        lastUsed: new Date(),
        useCount: qrCode.useCount + 1
      });
    }

    return accessLog;
  }

  async getAccessLogs(qrCodeId?: string): Promise<AccessLog[]> {
    if (qrCodeId) {
      return this.accessLogs.filter(log => log.qrCodeId === qrCodeId);
    }
    return this.accessLogs;
  }

  // Utilitários
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // Estatísticas
  async getStats() {
    const qrCodes = Array.from(this.qrCodes.values());
    const logs = this.accessLogs;
    
    return {
      totalQRCodes: qrCodes.length,
      activeQRCodes: qrCodes.filter(qr => qr.isActive).length,
      inactiveQRCodes: qrCodes.filter(qr => !qr.isActive).length,
      totalAccessAttempts: logs.length,
      successfulAccesses: logs.filter(log => log.success).length,
      failedAccesses: logs.filter(log => !log.success).length
    };
  }
}

export const database = new Database();



