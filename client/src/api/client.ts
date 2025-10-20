import axios from 'axios';

const API_BASE_URL = '/api/admin';

export interface QRCode {
  id: string;
  code: string;
  name: string;
  status: 'active' | 'blocked';
  created_at: string;
  updated_at: string;
  qrImage: string;
  accessUrl: string;
}

export interface CreateQRCodeRequest {
  name: string;
}

export interface UpdateQRCodeStatusRequest {
  status: 'active' | 'blocked';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseURL = API_BASE_URL;

  async getQRCodes(): Promise<QRCode[]> {
    const response = await axios.get<ApiResponse<QRCode[]>>(`${this.baseURL}/qrcodes`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch QR codes');
  }

  async createQRCode(data: CreateQRCodeRequest): Promise<QRCode> {
    const response = await axios.post<ApiResponse<QRCode>>(`${this.baseURL}/qrcodes`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create QR code');
  }

  async updateQRCodeStatus(id: string, status: 'active' | 'blocked'): Promise<QRCode> {
    const response = await axios.put<ApiResponse<QRCode>>(`${this.baseURL}/qrcodes/${id}/status`, { status });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to update QR code status');
  }

  async deleteQRCode(id: string): Promise<void> {
    const response = await axios.delete<ApiResponse<void>>(`${this.baseURL}/qrcodes/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete QR code');
    }
  }
}

export const apiClient = new ApiClient();
