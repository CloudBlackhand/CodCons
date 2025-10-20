import { v4 as uuidv4 } from 'uuid';
import pool from '../database';
import { Session } from '../types';

export class SessionService {
  static generateSessionToken(): string {
    return uuidv4().replace(/-/g, '');
  }

  static async createSession(qrcodeId: string): Promise<Session> {
    const token = this.generateSessionToken();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    try {
      const result = await pool.query(
        'INSERT INTO sessions (qrcode_id, token, expires_at) VALUES ($1, $2, $3) RETURNING *',
        [qrcodeId, token, expiresAt]
      );

      return result.rows[0] as Session;
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create session');
    }
  }

  static async validateSession(token: string): Promise<Session | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM sessions WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP',
        [token]
      );

      return result.rows.length > 0 ? result.rows[0] as Session : null;
    } catch (error) {
      console.error('Error validating session:', error);
      throw new Error('Failed to validate session');
    }
  }

  static async cleanupExpiredSessions(): Promise<void> {
    try {
      await pool.query(
        'DELETE FROM sessions WHERE expires_at <= CURRENT_TIMESTAMP'
      );
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
    }
  }

  // Cleanup expired sessions every minute
  static startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60 * 1000); // 1 minute
  }
}
