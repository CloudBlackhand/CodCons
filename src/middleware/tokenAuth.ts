import { Request, Response, NextFunction } from 'express';

interface TokenRequest extends Request {
  qrCode?: any;
}

export const validateToken = async (req: TokenRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.query.token as string;

    if (!token) {
      return res.status(401).send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Acesso Negado - CDC</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .error { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
            h1 { color: #e74c3c; margin-bottom: 20px; }
            p { color: #666; margin-bottom: 20px; }
            .qr-icon { font-size: 4rem; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="error">
            <div class="qr-icon">🔒</div>
            <h1>Acesso Negado</h1>
            <p>Token de acesso não fornecido.</p>
            <p>Para acessar o Código de Defesa do Consumidor, você precisa de um QR Code válido.</p>
          </div>
        </body>
        </html>
      `);
    }

    // Por enquanto, aceitar qualquer token para testar
    console.log('Token recebido:', token);
    req.qrCode = { id: 'test', name: 'Teste' };
    next();

  } catch (error) {
    console.error('Erro na validação do token:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Erro - CDC</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
          .error { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
          h1 { color: #e74c3c; margin-bottom: 20px; }
          p { color: #666; margin-bottom: 20px; }
          .qr-icon { font-size: 4rem; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="error">
          <div class="qr-icon">⚠️</div>
          <h1>Erro Interno</h1>
          <p>Ocorreu um erro ao validar o token.</p>
          <p>Tente novamente mais tarde.</p>
        </div>
      </body>
      </html>
    `);
  }
};