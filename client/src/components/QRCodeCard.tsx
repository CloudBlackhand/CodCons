import { FC } from 'react';
import { QRCode } from '../api/client';

interface QRCodeCardProps {
  qrCode: QRCode;
  onUpdateStatus: (id: string, status: 'active' | 'blocked') => void;
  onDelete: (id: string) => void;
}

export const QRCodeCard: FC<QRCodeCardProps> = ({ qrCode, onUpdateStatus, onDelete }) => {
  const handleStatusToggle = () => {
    const newStatus = qrCode.status === 'active' ? 'blocked' : 'active';
    onUpdateStatus(qrCode.id, newStatus);
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja deletar este QR code?')) {
      onDelete(qrCode.id);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('URL copiada para a área de transferência!');
    }).catch(() => {
      alert('Erro ao copiar URL');
    });
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = qrCode.qrImage;
    link.download = `qr-code-${qrCode.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="qr-card">
      <h3>📱 {qrCode.name}</h3>
      
      <div className="qr-image">
        <img src={qrCode.qrImage} alt={`QR Code para ${qrCode.name}`} style={{ maxWidth: '200px' }} />
      </div>

      <div className="qr-info">
        <p>
          <strong>Status:</strong> 
          <span className={`status-badge status-${qrCode.status}`}>
            {qrCode.status === 'active' ? '✅ Ativo' : '🚫 Bloqueado'}
          </span>
        </p>
        <p><strong>🔑 Código:</strong> {qrCode.code}</p>
        <p><strong>📅 Criado:</strong> {new Date(qrCode.created_at).toLocaleString('pt-BR')}</p>
      </div>

      <div className="qr-actions">
        <button 
          className={`btn ${qrCode.status === 'active' ? 'btn-warning' : 'btn-success'}`}
          onClick={handleStatusToggle}
        >
          {qrCode.status === 'active' ? '🚫 Bloquear' : '✅ Liberar'}
        </button>
        
        <button 
          className="btn btn-primary"
          onClick={() => copyToClipboard(qrCode.accessUrl)}
        >
          📋 Copiar URL
        </button>
        
        <button 
          className="btn btn-primary"
          onClick={downloadQRCode}
        >
          💾 Baixar QR
        </button>
        
        <button 
          className="btn btn-danger"
          onClick={handleDelete}
        >
          🗑️ Apagar
        </button>
      </div>
    </div>
  );
};
