export interface QRCode {
  id: string;
  code: string;
  name: string;
  status: 'active' | 'blocked';
  created_at: Date;
  updated_at: Date;
}

export interface Session {
  id: string;
  qrcode_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
}

export interface CreateQRCodeRequest {
  name: string;
}

export interface UpdateQRCodeStatusRequest {
  status: 'active' | 'blocked';
}

export interface QRCodeWithImage extends QRCode {
  qrImage: string; // base64 image
  accessUrl: string;
}
