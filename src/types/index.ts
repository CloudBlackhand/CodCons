export interface QRCode {
  id: string;
  name: string;
  description?: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
  useCount: number;
}

export interface AccessLog {
  id: string;
  qrCodeId: string;
  timestamp: Date;
  ip: string;
  userAgent?: string;
  success: boolean;
}

export interface AdminSession {
  isAuthenticated: boolean;
  loginTime?: Date;
}

