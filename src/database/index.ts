import { Pool, PoolClient } from 'pg';
import { QRCode, AccessLog } from '../types';

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  max: 20, // Máximo de conexões
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Event listeners para monitoramento
pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool PostgreSQL:', err);
});

pool.on('connect', () => {
  console.log('✅ Nova conexão PostgreSQL estabelecida');
});

class Database {
  private isInitialized = false;

  // Inicializar banco de dados (criar tabelas se não existirem)
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🔄 Inicializando banco de dados PostgreSQL...');
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS qr_codes (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          code VARCHAR(50) UNIQUE NOT NULL,
          is_active BOOLEAN DEFAULT true,
          use_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_used TIMESTAMP
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS access_logs (
          id VARCHAR(50) PRIMARY KEY,
          qr_code_id VARCHAR(50) NOT NULL,
          ip VARCHAR(45) NOT NULL,
          user_agent TEXT,
          success BOOLEAN NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (qr_code_id) REFERENCES qr_codes(id) ON DELETE CASCADE
        );
      `);

      // Criar índices para performance
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON qr_codes(code);
        CREATE INDEX IF NOT EXISTS idx_qr_codes_active ON qr_codes(is_active);
        CREATE INDEX IF NOT EXISTS idx_access_logs_qr_code_id ON access_logs(qr_code_id);
        CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON access_logs(timestamp);
      `);

      this.isInitialized = true;
      console.log('✅ Banco de dados PostgreSQL inicializado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao inicializar banco de dados:', error);
      throw error;
    }
  }

  // QR Codes
  async createQRCode(qrCode: Omit<QRCode, 'id' | 'createdAt' | 'updatedAt' | 'useCount'>): Promise<QRCode> {
    await this.initialize();
    
    const id = this.generateId();
    const now = new Date();

    const result = await pool.query(
      `INSERT INTO qr_codes (id, name, description, code, is_active, use_count, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 0, $6, $7)
       RETURNING *`,
      [id, qrCode.name, qrCode.description || null, qrCode.code, qrCode.isActive, now, now]
    );

    return this.mapRowToQRCode(result.rows[0]);
  }

  async getQRCode(id: string): Promise<QRCode | null> {
    await this.initialize();
    
    const result = await pool.query(
      'SELECT * FROM qr_codes WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) return null;
    return this.mapRowToQRCode(result.rows[0]);
  }

  async getQRCodeByCode(code: string): Promise<QRCode | null> {
    await this.initialize();
    
    const result = await pool.query(
      'SELECT * FROM qr_codes WHERE code = $1',
      [code]
    );

    if (result.rows.length === 0) return null;
    return this.mapRowToQRCode(result.rows[0]);
  }

  async getAllQRCodes(): Promise<QRCode[]> {
    await this.initialize();
    
    const result = await pool.query(
      'SELECT * FROM qr_codes ORDER BY created_at DESC'
    );

    return result.rows.map(row => this.mapRowToQRCode(row));
  }

  async updateQRCode(id: string, updates: Partial<QRCode>): Promise<QRCode | null> {
    await this.initialize();
    
    const qrCode = await this.getQRCode(id);
    if (!qrCode) return null;

    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(updates.description);
    }
    if (updates.isActive !== undefined) {
      fields.push(`is_active = $${paramIndex++}`);
      values.push(updates.isActive);
    }
    if (updates.lastUsed !== undefined) {
      fields.push(`last_used = $${paramIndex++}`);
      values.push(updates.lastUsed);
    }
    if (updates.useCount !== undefined) {
      fields.push(`use_count = $${paramIndex++}`);
      values.push(updates.useCount);
    }

    fields.push(`updated_at = $${paramIndex++}`);
    values.push(new Date());

    values.push(id);

    const result = await pool.query(
      `UPDATE qr_codes SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return this.mapRowToQRCode(result.rows[0]);
  }

  async deleteQRCode(id: string): Promise<boolean> {
    await this.initialize();
    
    const result = await pool.query(
      'DELETE FROM qr_codes WHERE id = $1',
      [id]
    );

    return result.rowCount !== null && result.rowCount > 0;
  }

  async toggleQRCodeStatus(id: string): Promise<QRCode | null> {
    await this.initialize();
    
    const qrCode = await this.getQRCode(id);
    if (!qrCode) return null;

    return this.updateQRCode(id, { isActive: !qrCode.isActive });
  }

  // Access Logs
  async logAccess(log: Omit<AccessLog, 'id' | 'timestamp'>): Promise<AccessLog> {
    await this.initialize();
    
    const id = this.generateId();
    const now = new Date();

    const result = await pool.query(
      `INSERT INTO access_logs (id, qr_code_id, ip, user_agent, success, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, log.qrCodeId, log.ip, log.userAgent || null, log.success, now]
    );

    // Atualizar contador de uso do QR Code
    if (log.success) {
      await pool.query(
        `UPDATE qr_codes 
         SET use_count = use_count + 1, last_used = $1 
         WHERE id = $2`,
        [now, log.qrCodeId]
      );
    }

    return this.mapRowToAccessLog(result.rows[0]);
  }

  async getAccessLogs(qrCodeId?: string): Promise<AccessLog[]> {
    await this.initialize();
    
    let query = 'SELECT * FROM access_logs';
    const values: any[] = [];

    if (qrCodeId) {
      query += ' WHERE qr_code_id = $1';
      values.push(qrCodeId);
    }

    query += ' ORDER BY timestamp DESC LIMIT 1000';

    const result = await pool.query(query, values);
    return result.rows.map(row => this.mapRowToAccessLog(row));
  }

  // Estatísticas
  async getStats() {
    await this.initialize();
    
    const qrCodesResult = await pool.query(
      'SELECT COUNT(*) as total, SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active FROM qr_codes'
    );

    const logsResult = await pool.query(
      'SELECT COUNT(*) as total, SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful FROM access_logs'
    );

    const qrStats = qrCodesResult.rows[0];
    const logStats = logsResult.rows[0];

    return {
      totalQRCodes: parseInt(qrStats.total) || 0,
      activeQRCodes: parseInt(qrStats.active) || 0,
      inactiveQRCodes: (parseInt(qrStats.total) || 0) - (parseInt(qrStats.active) || 0),
      totalAccessAttempts: parseInt(logStats.total) || 0,
      successfulAccesses: parseInt(logStats.successful) || 0,
      failedAccesses: (parseInt(logStats.total) || 0) - (parseInt(logStats.successful) || 0)
    };
  }

  // Utilitários
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private mapRowToQRCode(row: any): QRCode {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      code: row.code,
      isActive: row.is_active,
      useCount: row.use_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastUsed: row.last_used
    };
  }

  private mapRowToAccessLog(row: any): AccessLog {
    return {
      id: row.id,
      qrCodeId: row.qr_code_id,
      ip: row.ip,
      userAgent: row.user_agent,
      success: row.success,
      timestamp: row.timestamp
    };
  }

  // Fechar pool (útil para testes ou shutdown)
  async close(): Promise<void> {
    await pool.end();
    console.log('🔒 Conexões PostgreSQL fechadas');
  }
}

export const database = new Database();
