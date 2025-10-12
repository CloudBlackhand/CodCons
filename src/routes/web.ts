import express from 'express';
import { qrCodeService } from '../services/qrService';
import { optionalAuth } from '../middleware/auth';

const router = express.Router();

// Página inicial
router.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sistema de Controle de Acesso QR Code</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            }
            .container { 
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                padding: 40px;
                text-align: center;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            h1 { margin-bottom: 20px; font-size: 2.5rem; }
            p { margin-bottom: 30px; font-size: 1.2rem; opacity: 0.9; }
            .btn {
                display: inline-block;
                padding: 15px 30px;
                background: rgba(255, 255, 255, 0.2);
                color: white;
                text-decoration: none;
                border-radius: 10px;
                border: 1px solid rgba(255, 255, 255, 0.3);
                font-size: 1.1rem;
                transition: all 0.3s ease;
                margin: 10px;
            }
            .btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🔐 Sistema de Acesso QR Code</h1>
            <p>Sistema de controle de acesso via QR Codes</p>
            <a href="/admin" class="btn">Painel Administrativo</a>
            <a href="/api/stats" class="btn">Estatísticas</a>
        </div>
    </body>
    </html>
  `);
});

// Painel administrativo
router.get('/admin', optionalAuth, async (req, res) => {
  const isAuthenticated = (req as any).isAuthenticated;
  
  if (!isAuthenticated) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Login - Admin</title>
          <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  min-height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
              }
              .login-container { 
                  background: rgba(255, 255, 255, 0.1);
                  backdrop-filter: blur(10px);
                  border-radius: 20px;
                  padding: 40px;
                  text-align: center;
                  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                  border: 1px solid rgba(255, 255, 255, 0.2);
                  color: white;
              }
              h1 { margin-bottom: 30px; }
              input {
                  width: 100%;
                  padding: 15px;
                  margin: 10px 0;
                  border: none;
                  border-radius: 10px;
                  background: rgba(255, 255, 255, 0.2);
                  color: white;
                  font-size: 1rem;
              }
              input::placeholder { color: rgba(255, 255, 255, 0.7); }
              button {
                  width: 100%;
                  padding: 15px;
                  margin: 20px 0;
                  border: none;
                  border-radius: 10px;
                  background: rgba(255, 255, 255, 0.3);
                  color: white;
                  font-size: 1.1rem;
                  cursor: pointer;
                  transition: all 0.3s ease;
              }
              button:hover { background: rgba(255, 255, 255, 0.4); }
          </style>
      </head>
      <body>
          <div class="login-container">
              <h1>🔐 Login Administrativo</h1>
              <form action="/admin" method="post">
                  <input type="password" name="password" placeholder="Senha de administrador" required>
                  <button type="submit">Entrar</button>
              </form>
          </div>
      </body>
      </html>
    `);
  }

  try {
    const qrCodes = await qrCodeService.getAllQRCodes();
    const stats = await qrCodeService.getStats();

    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Painel Admin - QR Code</title>
          <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  min-height: 100vh;
                  padding: 20px;
                  color: white;
              }
              .container { max-width: 1200px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 30px; }
              .stats {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                  gap: 20px;
                  margin-bottom: 30px;
              }
              .stat-card {
                  background: rgba(255, 255, 255, 0.1);
                  backdrop-filter: blur(10px);
                  border-radius: 15px;
                  padding: 20px;
                  text-align: center;
                  border: 1px solid rgba(255, 255, 255, 0.2);
              }
              .stat-number { font-size: 2rem; font-weight: bold; margin-bottom: 10px; }
              .stat-label { opacity: 0.8; }
              .qr-codes {
                  background: rgba(255, 255, 255, 0.1);
                  backdrop-filter: blur(10px);
                  border-radius: 15px;
                  padding: 20px;
                  border: 1px solid rgba(255, 255, 255, 0.2);
              }
              .qr-card {
                  background: rgba(255, 255, 255, 0.1);
                  border-radius: 10px;
                  padding: 15px;
                  margin: 10px 0;
                  border: 1px solid rgba(255, 255, 255, 0.2);
              }
              .btn {
                  padding: 8px 15px;
                  margin: 5px;
                  border: none;
                  border-radius: 5px;
                  cursor: pointer;
                  font-size: 0.9rem;
                  transition: all 0.3s ease;
              }
              .btn-primary { background: #4CAF50; color: white; }
              .btn-danger { background: #f44336; color: white; }
              .btn-warning { background: #ff9800; color: white; }
              .btn:hover { opacity: 0.8; }
              .status { 
                  display: inline-block; 
                  padding: 4px 8px; 
                  border-radius: 15px; 
                  font-size: 0.8rem; 
                  margin-left: 10px;
              }
              .status.active { background: #4CAF50; }
              .status.inactive { background: #f44336; }
              .form-group { margin: 15px 0; }
              .form-group input {
                  width: 100%;
                  padding: 10px;
                  border: none;
                  border-radius: 5px;
                  background: rgba(255, 255, 255, 0.2);
                  color: white;
                  margin-top: 5px;
              }
              .form-group input::placeholder { color: rgba(255, 255, 255, 0.7); }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>🔐 Painel Administrativo</h1>
                  <p>Gerenciamento de QR Codes</p>
              </div>

              <div class="stats">
                  <div class="stat-card">
                      <div class="stat-number">${stats.totalQRCodes}</div>
                      <div class="stat-label">Total de QR Codes</div>
                  </div>
                  <div class="stat-card">
                      <div class="stat-number">${stats.activeQRCodes}</div>
                      <div class="stat-label">QR Codes Ativos</div>
                  </div>
                  <div class="stat-card">
                      <div class="stat-number">${stats.successfulAccesses}</div>
                      <div class="stat-label">Acessos Bem-sucedidos</div>
                  </div>
                  <div class="stat-card">
                      <div class="stat-number">${stats.failedAccesses}</div>
                      <div class="stat-label">Tentativas Falhadas</div>
                  </div>
              </div>

              <div class="qr-codes">
                  <h2>📱 QR Codes</h2>
                  
                  <div class="form-group">
                      <label>Novo QR Code:</label>
                      <input type="text" id="qrName" placeholder="Nome do QR Code">
                      <input type="text" id="qrDescription" placeholder="Descrição (opcional)">
                      <button class="btn btn-primary" onclick="createQRCode()">Criar QR Code</button>
                  </div>

                  <div id="qrCodesList">
                      ${qrCodes.map(qr => {
                        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
                        const cdcUrl = `${baseUrl}/cdc?token=${qr.code}`;
                        return \`
                          <div class="qr-card">
                              <strong>\${qr.name}</strong>
                              <span class="status \${qr.isActive ? 'active' : 'inactive'}">
                                  \${qr.isActive ? 'Ativo' : 'Inativo'}
                              </span>
                              <div style="margin-top: 10px; font-size: 0.9rem; opacity: 0.8;">
                                  \${qr.description || 'Sem descrição'}
                              </div>
                              <div style="margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.05); border-radius: 5px; font-family: monospace; font-size: 0.75rem; word-break: break-all;">
                                  <strong>URL CDC:</strong><br/>
                                  <a href="${cdcUrl}" target="_blank" style="color: #667eea;">${cdcUrl}</a>
                              </div>
                              <div style="margin-top: 10px;">
                                  <button class="btn btn-primary" onclick="window.open('${cdcUrl}', '_blank')" style="background: #4CAF50;">
                                      🔗 Testar Acesso
                                  </button>
                                  <button class="btn btn-warning" onclick="toggleStatus('\${qr.id}')">
                                      \${qr.isActive ? 'Desativar' : 'Ativar'}
                                  </button>
                                  <button class="btn btn-primary" onclick="generateImage('\${qr.id}')">
                                      Gerar Imagem
                                  </button>
                                  <button class="btn btn-danger" onclick="deleteQRCode('\${qr.id}')">
                                      Deletar
                                  </button>
                              </div>
                              <div style="margin-top: 10px; font-size: 0.8rem; opacity: 0.7;">
                                  Usado \${qr.useCount} vezes | Criado: \${new Date(qr.createdAt).toLocaleDateString('pt-BR')}
                                  \${qr.lastUsed ? \` | Último uso: \${new Date(qr.lastUsed).toLocaleDateString('pt-BR')}\` : ''}
                              </div>
                          </div>
                        \`;
                      }).join('')}
                  </div>
              </div>
          </div>

          <script>
              async function createQRCode() {
                  const name = document.getElementById('qrName').value;
                  const description = document.getElementById('qrDescription').value;
                  
                  if (!name) {
                      alert('Nome é obrigatório!');
                      return;
                  }

                  try {
                      const response = await fetch('/api/admin/qr-codes', {
                          method: 'POST',
                          headers: {
                              'Content-Type': 'application/json',
                              'Authorization': 'Bearer ${process.env.ADMIN_PASSWORD || 'admin123'}'
                          },
                          body: JSON.stringify({ name, description })
                      });

                      if (response.ok) {
                          location.reload();
                      } else {
                          alert('Erro ao criar QR Code');
                      }
                  } catch (error) {
                      alert('Erro ao criar QR Code');
                  }
              }

              async function toggleStatus(id) {
                  try {
                      const response = await fetch(\`/api/admin/qr-codes/\${id}/toggle\`, {
                          method: 'PATCH',
                          headers: {
                              'Authorization': 'Bearer ${process.env.ADMIN_PASSWORD || 'admin123'}'
                          }
                      });

                      if (response.ok) {
                          location.reload();
                      } else {
                          alert('Erro ao alterar status');
                      }
                  } catch (error) {
                      alert('Erro ao alterar status');
                  }
              }

              async function deleteQRCode(id) {
                  if (!confirm('Tem certeza que deseja deletar este QR Code?')) {
                      return;
                  }

                  try {
                      const response = await fetch(\`/api/admin/qr-codes/\${id}\`, {
                          method: 'DELETE',
                          headers: {
                              'Authorization': 'Bearer ${process.env.ADMIN_PASSWORD || 'admin123'}'
                          }
                      });

                      if (response.ok) {
                          location.reload();
                      } else {
                          alert('Erro ao deletar QR Code');
                      }
                  } catch (error) {
                      alert('Erro ao deletar QR Code');
                  }
              }

              async function generateImage(id) {
                  try {
                      const response = await fetch(\`/api/admin/qr-codes/\${id}/image\`, {
                          headers: {
                              'Authorization': 'Bearer ${process.env.ADMIN_PASSWORD || 'admin123'}'
                          }
                      });

                      if (response.ok) {
                          const data = await response.json();
                          const newWindow = window.open();
                          newWindow.document.write(\`
                              <html>
                                  <head><title>QR Code - \${data.data.qrCodeId}</title></head>
                                  <body style="text-align: center; padding: 20px;">
                                      <h1>QR Code</h1>
                                      <img src="\${data.data.image}" style="max-width: 100%; border: 2px solid #ccc; border-radius: 10px;">
                                      <br><br>
                                      <button onclick="window.print()">Imprimir</button>
                                  </body>
                              </html>
                          \`);
                      } else {
                          alert('Erro ao gerar imagem');
                      }
                  } catch (error) {
                      alert('Erro ao gerar imagem');
                  }
              }
          </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Erro ao carregar painel admin:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

// Processar login
router.post('/admin', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (password === adminPassword) {
    // Em produção, use sessões ou JWT
    res.redirect('/admin');
  } else {
    res.status(401).send(`
      <script>
          alert('Senha incorreta!');
          window.history.back();
      </script>
    `);
  }
});

export default router;




