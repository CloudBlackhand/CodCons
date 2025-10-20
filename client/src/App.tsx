import React, { useState, useEffect } from 'react';
import { QRCode, apiClient } from './api/client';
import { QRCodeForm } from './components/QRCodeForm';
import { QRCodeCard } from './components/QRCodeCard';

function App() {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchQRCodes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getQRCodes();
      setQrCodes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar QR codes');
    } finally {
      setLoading(false);
    }
  };

  const handleQRCodeCreated = () => {
    setMessage('QR Code criado com sucesso!');
    setTimeout(() => setMessage(null), 3000);
    fetchQRCodes();
  };

  const handleUpdateStatus = async (id: string, status: 'active' | 'blocked') => {
    try {
      await apiClient.updateQRCodeStatus(id, status);
      setMessage(`QR Code ${status === 'active' ? 'liberado' : 'bloqueado'} com sucesso!`);
      setTimeout(() => setMessage(null), 3000);
      fetchQRCodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteQRCode(id);
      setMessage('QR Code apagado com sucesso!');
      setTimeout(() => setMessage(null), 3000);
      fetchQRCodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar QR code');
    }
  };

  useEffect(() => {
    fetchQRCodes();
  }, []);

  return (
    <div className="container">
      <div className="header">
        <h1>🎯 Sistema de QR Codes</h1>
        <p>Gerencie seus QR codes de acesso - criar, liberar, bloquear e apagar</p>
      </div>

      {message && (
        <div className="success">
          {message}
        </div>
      )}

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      <QRCodeForm onQRCodeCreated={handleQRCodeCreated} />

      {loading ? (
        <div className="loading">
          Carregando QR codes...
        </div>
      ) : qrCodes.length === 0 ? (
        <div className="loading">
          Nenhum QR code encontrado. Crie o primeiro acima!
        </div>
      ) : (
        <div className="qr-grid">
          {qrCodes.map((qrCode) => (
            <QRCodeCard
              key={qrCode.id}
              qrCode={qrCode}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
