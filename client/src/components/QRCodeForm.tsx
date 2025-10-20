import { useState, FC, FormEvent } from 'react';
import { apiClient, CreateQRCodeRequest } from '../api/client';

interface QRCodeFormProps {
  onQRCodeCreated: () => void;
}

export const QRCodeForm: FC<QRCodeFormProps> = ({ onQRCodeCreated }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data: CreateQRCodeRequest = { name: name.trim() };
      await apiClient.createQRCode(data);
      
      setName('');
      onQRCodeCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar QR code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qr-card" style={{ marginBottom: '30px' }}>
      <h3>Criar Novo QR Code</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nome do QR Code:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Entrada Principal, Área VIP, etc."
            disabled={loading}
          />
        </div>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading || !name.trim()}
        >
          {loading ? 'Criando...' : 'Criar QR Code'}
        </button>
      </form>
    </div>
  );
};
