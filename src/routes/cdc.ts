import express from 'express';
import { validateToken } from '../middleware/tokenAuth';
import { cdcData, cdcTitulos } from '../data/cdc-data';

const router = express.Router();

// Rota de teste simples
router.get('/test', (req, res) => {
  res.send('<h1>CDC TESTE FUNCIONANDO!</h1><p>Se você vê isso, a rota CDC está funcionando!</p>');
});

router.get('/', validateToken, (req, res) => {
  res.send(generateCDCPage());
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

