import { Request, Response, NextFunction } from 'express';
import { qrCodeService } from '../services/qrService';

interface TokenAuthRequest extends Request {
  qrCode?: any;
  tokenValid?: boolean;
}

/**
 * Middleware para validar tokens de acesso ao CDC
 * O token deve ser fornecido via query parameter ?token=UUID
 * Valida se o token existe, está ativo e registra o acesso
 */
export const validateToken = async (req: TokenAuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.query.token as string;

    // Validação 1: Token fornecido
    if (!token) {
      return res.status(403).send(getErrorPage('Token não fornecido', 'É necessário escanear o QR Code para acessar este conteúdo.'));
    }

    // Validação 2: Formato do token (UUID v4)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      console.warn(`⚠️  Tentativa de acesso com token inválido: ${token.substring(0, 10)}...`);
      return res.status(403).send(getErrorPage('Token Inválido', 'O formato do token é inválido.'));
    }

    // Validação 3: Rate limiting por token
    // (implementação básica - em produção usar Redis)
    const tokenKey = `token_${token}`;
    const now = Date.now();
    // Aqui seria ideal usar Redis, mas por enquanto validamos no serviço

    // Validar o token através do serviço de QR Code
    const validation = await qrCodeService.validateAccess(token);

    if (!validation.valid || !validation.qrCode) {
      // Registrar tentativa de acesso falha
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      
      await qrCodeService.logAccess(
        validation.qrCode?.id || 'unknown',
        ip,
        userAgent,
        false
      );

      // Log de segurança para monitoramento
      console.warn(`❌ Acesso negado - Token: ${token.substring(0, 8)}... | IP: ${ip} | UA: ${userAgent.substring(0, 50)}`);

      // Delay intencional para dificultar ataques de força bruta
      await new Promise(resolve => setTimeout(resolve, 1000));

      return res.status(403).send(getErrorPage(
        'Acesso Negado', 
        'QR Code inválido, expirado ou desativado. Por favor, obtenha um novo QR Code válido.'
      ));
    }

    // Token válido - registrar acesso bem-sucedido
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    
    await qrCodeService.logAccess(
      validation.qrCode.id,
      ip,
      userAgent,
      true
    );

    // Log de sucesso para monitoramento
    console.log(`✅ Acesso concedido - QR: ${validation.qrCode.name} | Token: ${token.substring(0, 8)}... | IP: ${ip}`);

    // Adicionar dados do QR Code à requisição
    req.qrCode = validation.qrCode;
    req.tokenValid = true;

    next();
  } catch (error) {
    console.error('Erro na validação de token:', error);
    res.status(500).send(getErrorPage(
      'Erro Interno',
      'Ocorreu um erro ao validar seu acesso. Por favor, tente novamente.'
    ));
  }
};

/**
 * Gera página de erro HTML estilizada
 */
function getErrorPage(titulo: string, mensagem: string): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${titulo} - Código de Defesa do Consumidor</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Georgia', 'Times New Roman', serif;
                background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                padding: 20px;
            }
            .error-container {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 15px;
                padding: 40px;
                max-width: 600px;
                text-align: center;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .error-icon {
                font-size: 4rem;
                margin-bottom: 20px;
            }
            h1 {
                font-size: 2rem;
                margin-bottom: 20px;
                font-weight: 600;
            }
            p {
                font-size: 1.1rem;
                line-height: 1.6;
                opacity: 0.9;
            }
            .home-link {
                display: inline-block;
                margin-top: 30px;
                padding: 12px 24px;
                background: rgba(255, 255, 255, 0.2);
                color: white;
                text-decoration: none;
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.3);
                transition: all 0.3s ease;
            }
            .home-link:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
            }
        </style>
    </head>
    <body>
        <div class="error-container">
            <div class="error-icon">🔒</div>
            <h1>${titulo}</h1>
            <p>${mensagem}</p>
            <a href="/" class="home-link">Voltar à Página Inicial</a>
        </div>
    </body>
    </html>
  `;
}

