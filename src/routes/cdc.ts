import express from 'express';

const router = express.Router();

// Rota de teste simples
router.get('/test', (req, res) => {
  res.send('<h1>CDC TESTE FUNCIONANDO!</h1><p>Se você vê isso, a rota CDC está funcionando!</p>');
});

// Rota CDC SUPER SIMPLES - SEM MIDDLEWARE
router.get('/', (req, res) => {
  const token = req.query.token;
  
  if (!token) {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Acesso Negado</title></head>
      <body style="text-align: center; padding: 50px; font-family: Arial;">
        <h1>🔒 Acesso Negado</h1>
        <p>Token de acesso não fornecido.</p>
        <p>Para acessar o CDC, você precisa de um QR Code válido.</p>
      </body>
      </html>
    `);
  }

  // Site CDC SIMPLES
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Código de Defesa do Consumidor</title>
      <style>
        body { font-family: Georgia, serif; background: #fafafa; color: #2c3e50; padding: 20px; }
        .container { max-width: 1000px; margin: 0 auto; }
        h1 { color: #1e3c72; margin-bottom: 20px; }
        .article { background: white; padding: 30px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid #c9a961; }
        .article-numero { font-size: 1.3rem; font-weight: 700; color: #1e3c72; margin-bottom: 15px; }
        .article-texto { font-size: 1.1rem; line-height: 1.9; margin-bottom: 15px; text-align: justify; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>⚖️ Código de Defesa do Consumidor</h1>
        <p>Lei nº 8.078, de 11 de setembro de 1990</p>
        
        <div class="article">
          <div class="article-numero">Art. 1º</div>
          <div class="article-texto">O presente código estabelece normas de proteção e defesa do consumidor, de ordem pública e interesse social, nos termos dos arts. 5º, inciso XXXII, 170, inciso V, da Constituição Federal e art. 48 de suas Disposições Constitucionais Transitórias.</div>
        </div>

        <div class="article">
          <div class="article-numero">Art. 2º</div>
          <div class="article-texto">Consumidor é toda pessoa física ou jurídica que adquire ou utiliza produto ou serviço como destinatário final.</div>
        </div>

        <div class="article">
          <div class="article-numero">Art. 3º</div>
          <div class="article-texto">Fornecedor é toda pessoa física ou jurídica, pública ou privada, nacional ou estrangeira, bem como os entes despersonalizados, que desenvolvem atividades de produção, montagem, criação, construção, transformação, importação, exportação, distribuição ou comercialização de produtos ou prestação de serviços.</div>
        </div>

        <div class="article">
          <div class="article-numero">Art. 4º</div>
          <div class="article-texto">A Política Nacional das Relações de Consumo tem por objetivo o atendimento das necessidades dos consumidores, o respeito à sua dignidade, saúde e segurança, a proteção de seus interesses econômicos, a melhoria da sua qualidade de vida, bem como a transparência e harmonia das relações de consumo, atendidos os seguintes princípios:</div>
        </div>

        <div class="article">
          <div class="article-numero">Art. 5º</div>
          <div class="article-texto">Para os efeitos desta Lei, são considerados:</div>
        </div>

        <div class="article">
          <div class="article-numero">Art. 6º</div>
          <div class="article-texto">São direitos básicos do consumidor:</div>
        </div>

        <div class="article">
          <div class="article-numero">Art. 7º</div>
          <div class="article-texto">Os direitos previstos neste código não excluem outros decorrentes de tratados ou convenções internacionais de que o Brasil seja signatário, da legislação interna ordinária, de regulamentos expedidos pelas autoridades administrativas competentes, bem como dos que derivem dos princípios gerais do direito, analogia, costumes e equidade.</div>
        </div>

        <div class="article">
          <div class="article-numero">Art. 8º</div>
          <div class="article-texto">Os produtos e serviços colocados no mercado de consumo não acarretarão riscos à saúde ou segurança dos consumidores, exceto os considerados normais e previsíveis em decorrência de sua natureza e fruição, obrigando-se os fornecedores, em qualquer hipótese, a dar as informações necessárias e adequadas a seu respeito.</div>
        </div>

        <div class="article">
          <div class="article-numero">Art. 9º</div>
          <div class="article-texto">O fornecedor de produtos e serviços potencialmente nocivos ou perigosos à saúde ou segurança deverá informar, de maneira ostensiva e adequada, a respeito da sua nocividade ou periculosidade, sem prejuízo da adoção de outras medidas cabíveis em cada caso concreto.</div>
        </div>

        <div class="article">
          <div class="article-numero">Art. 10º</div>
          <div class="article-texto">O fornecedor não poderá colocar no mercado de consumo produto ou serviço que sabe ou deveria saber apresentar alto grau de nocividade ou periculosidade à saúde ou segurança.</div>
        </div>

        <p style="text-align: center; margin-top: 50px; color: #666;">
          <strong>Token usado:</strong> ${token}<br>
          <em>Site CDC funcionando perfeitamente!</em>
        </p>
      </div>
    </body>
    </html>
  `);
});

function generateCDCPage(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Código de Defesa do Consumidor</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: Georgia, serif; background: #fafafa; color: #2c3e50; line-height: 1.8; padding: 20px; }
.container { max-width: 1000px; margin: 0 auto; }
h1 { color: #1e3c72; margin-bottom: 10px; }
.article { background: white; padding: 30px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid #c9a961; }
.article-numero { font-size: 1.3rem; font-weight: 700; color: #1e3c72; margin-bottom: 15px; }
.article-texto { font-size: 1.1rem; line-height: 1.9; margin-bottom: 15px; text-align: justify; }
.article-paragrafo { margin-left: 25px; margin-bottom: 10px; color: #5a6c7d; }
</style>
</head>
<body>
<div class="container">
<h1>⚖️ Código de Defesa do Consumidor</h1>
<p>Lei nº 8.078, de 11 de setembro de 1990</p>
${generateArticles()}
</div>
</body>
</html>`;
}

function generateArticles(): string {
  return cdcData.map(art => {
    let html = '<div class="article">';
    html += '<div class="article-numero">Art. ' + art.numero + 'º</div>';
    html += '<div class="article-texto">' + art.texto + '</div>';
    if (art.paragrafos && art.paragrafos.length > 0) {
      art.paragrafos.forEach(p => {
        html += '<div class="article-paragrafo">' + p + '</div>';
      });
    }
    if (art.incisos && art.incisos.length > 0) {
      art.incisos.forEach(inc => {
        html += '<div class="article-paragrafo">' + inc + '</div>';
      });
    }
    html += '</div>';
    return html;
  }).join('');
}

export default router;

