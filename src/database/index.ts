import { Pool, PoolClient } from 'pg';
import { QRCode, AccessLog } from '../types';

// Configuração do Pool de conexões PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Classe Database com PostgreSQL
class Database {
  private initialized = false;

  // Inicializar tabelas
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const client = await pool.connect();
    try {
      // Criar tabela de QR Codes
      await client.query(`
        CREATE TABLE IF NOT EXISTS qr_codes (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          code VARCHAR(255) UNIQUE NOT NULL,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_used TIMESTAMP,
          use_count INTEGER DEFAULT 0
        )
      `);

      // Criar índices para performance
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON qr_codes(code);
        CREATE INDEX IF NOT EXISTS idx_qr_codes_is_active ON qr_codes(is_active);
      `);

      // Criar tabela de logs de acesso
      await client.query(`
        CREATE TABLE IF NOT EXISTS access_logs (
          id VARCHAR(255) PRIMARY KEY,
          qr_code_id VARCHAR(255) NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          ip VARCHAR(255),
          user_agent TEXT,
          success BOOLEAN NOT NULL,
          FOREIGN KEY (qr_code_id) REFERENCES qr_codes(id) ON DELETE CASCADE
        )
      `);

      // Criar índice para logs
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_access_logs_qr_code_id ON access_logs(qr_code_id);
        CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON access_logs(timestamp DESC);
      `);

      this.initialized = true;
      console.log('✅ Banco de dados PostgreSQL inicializado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao inicializar banco de dados:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // QR Codes
  async createQRCode(qrCode: Omit<QRCode, 'id' | 'createdAt' | 'updatedAt' | 'useCount'>): Promise<QRCode> {
    await this.initialize();
    const id = this.generateId();
    const now = new Date();

    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO qr_codes (id, name, description, code, is_active, created_at, updated_at, use_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [id, qrCode.name, qrCode.description || null, qrCode.code, qrCode.isActive, now, now, 0]
      );

      return this.mapRowToQRCode(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async getQRCode(id: string): Promise<QRCode | null> {
    await this.initialize();
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM qr_codes WHERE id = $1', [id]);
      return result.rows.length > 0 ? this.mapRowToQRCode(result.rows[0]) : null;
    } finally {
      client.release();
    }
  }

  async getAllQRCodes(): Promise<QRCode[]> {
    await this.initialize();
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM qr_codes ORDER BY created_at DESC');
      return result.rows.map(row => this.mapRowToQRCode(row));
    } finally {
      client.release();
    }
  }

  async updateQRCode(id: string, updates: Partial<QRCode>): Promise<QRCode | null> {
    await this.initialize();
    const client = await pool.connect();
    try {
      const existing = await this.getQRCode(id);
      if (!existing) return null;

      const fields: string[] = [];
      const values: any[] = [];
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

      fields.push(`updated_at = $${paramIndex++}`);
      values.push(new Date());
      values.push(id);

      const result = await client.query(
        `UPDATE qr_codes SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );

      return result.rows.length > 0 ? this.mapRowToQRCode(result.rows[0]) : null;
    } finally {
      client.release();
    }
  }

  async deleteQRCode(id: string): Promise<boolean> {
    await this.initialize();
    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM qr_codes WHERE id = $1', [id]);
      return (result.rowCount ?? 0) > 0;
    } finally {
      client.release();
    }
  }

  async toggleQRCodeStatus(id: string): Promise<QRCode | null> {
    await this.initialize();
    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE qr_codes 
         SET is_active = NOT is_active, updated_at = $1 
         WHERE id = $2 
         RETURNING *`,
        [new Date(), id]
      );
      return result.rows.length > 0 ? this.mapRowToQRCode(result.rows[0]) : null;
    } finally {
      client.release();
    }
  }

  // Access Logs
  async logAccess(log: Omit<AccessLog, 'id' | 'timestamp'>): Promise<AccessLog> {
    await this.initialize();
    const id = this.generateId();
    const now = new Date();

    const client = await pool.connect();
    try {
      // Inserir log
      const result = await client.query(
        `INSERT INTO access_logs (id, qr_code_id, timestamp, ip, user_agent, success)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [id, log.qrCodeId, now, log.ip, log.userAgent || null, log.success]
      );

      // Atualizar contador e last_used se sucesso
      if (log.success) {
        await client.query(
          `UPDATE qr_codes 
           SET use_count = use_count + 1, last_used = $1 
           WHERE id = $2`,
          [now, log.qrCodeId]
        );
      }

      return this.mapRowToAccessLog(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async getAccessLogs(qrCodeId?: string): Promise<AccessLog[]> {
    await this.initialize();
    const client = await pool.connect();
    try {
      const query = qrCodeId
        ? 'SELECT * FROM access_logs WHERE qr_code_id = $1 ORDER BY timestamp DESC'
        : 'SELECT * FROM access_logs ORDER BY timestamp DESC';
      
      const result = qrCodeId
        ? await client.query(query, [qrCodeId])
        : await client.query(query);

      return result.rows.map(row => this.mapRowToAccessLog(row));
    } finally {
      client.release();
    }
  }

  // Estatísticas
  async getStats() {
    await this.initialize();
    const client = await pool.connect();
    try {
      const [qrCodesResult, logsResult] = await Promise.all([
        client.query(`
          SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE is_active = true) as active,
            COUNT(*) FILTER (WHERE is_active = false) as inactive
          FROM qr_codes
        `),
        client.query(`
          SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE success = true) as successful,
            COUNT(*) FILTER (WHERE success = false) as failed
          FROM access_logs
        `)
      ]);

      return {
        totalQRCodes: parseInt(qrCodesResult.rows[0].total),
        activeQRCodes: parseInt(qrCodesResult.rows[0].active),
        inactiveQRCodes: parseInt(qrCodesResult.rows[0].inactive),
        totalAccessAttempts: parseInt(logsResult.rows[0].total),
        successfulAccesses: parseInt(logsResult.rows[0].successful),
        failedAccesses: parseInt(logsResult.rows[0].failed)
      };
    } finally {
      client.release();
    }
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
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastUsed: row.last_used,
      useCount: row.use_count
    };
  }

  private mapRowToAccessLog(row: any): AccessLog {
    return {
      id: row.id,
      qrCodeId: row.qr_code_id,
      timestamp: row.timestamp,
      ip: row.ip,
      userAgent: row.user_agent,
      success: row.success
    };
  }

  // Fechar pool (para graceful shutdown)
  async close(): Promise<void> {
    await pool.end();
    console.log('🔌 Pool de conexões PostgreSQL encerrado');
  }
}

export const database = new Database();

// Graceful shutdown
process.on('SIGTERM', async () => {
  await database.close();
});

process.on('SIGINT', async () => {
  await database.close();
});
