# 🔒 Documentação de Segurança - Sistema CDC com QR Code

## Visão Geral

Este documento detalha todas as medidas de segurança implementadas no sistema para garantir acesso controlado e protegido ao Código de Defesa do Consumidor.

## 🛡️ Camadas de Segurança

### 1. Segurança de Transporte

#### HTTPS Obrigatório (Railway)
- ✅ Railway fornece HTTPS automático
- ✅ HSTS configurado (max-age: 1 ano)
- ✅ Preload HSTS habilitado
- ✅ Include subdomains ativo

#### Headers de Segurança (Helmet)
```javascript
- Content-Security-Policy (CSP)
- Strict-Transport-Security (HSTS)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
```

### 2. Controle de Acesso

#### Autenticação de Token (CDC)

**Processo de Validação:**
1. Token extraído da query string `?token=UUID`
2. Validação de formato UUID v4
3. Verificação de existência no banco de dados
4. Verificação de status ativo (`isActive = true`)
5. Registro de log de acesso
6. Delay de 1s em caso de falha (anti-brute force)

**Características:**
- ✅ Validação server-side obrigatória
- ✅ Sem persistência client-side
- ✅ Revogação instantânea
- ✅ Logs detalhados de todas tentativas

#### Autenticação Admin

**Processo:**
1. Senha fornecida via header ou body
2. Comparação com `ADMIN_PASSWORD` env var
3. Rate limiting: 5 tentativas / 15 minutos
4. Logs de tentativas de login

**Requisitos de Senha:**
- Mínimo 8 caracteres em produção
- Recomendado 16+ caracteres
- Deve conter letras, números e símbolos

### 3. Rate Limiting

#### Limites por Endpoint

| Endpoint | Limite | Janela | Propósito |
|----------|--------|--------|-----------|
| `/api/*` | 60 req | 15 min | APIs gerais |
| `/admin` | 5 req | 15 min | Login admin |
| `/cdc` | 30 req | 1 min | Acesso ao CDC |
| `/api/health` | Ilimitado | - | Healthcheck |

#### Implementação
- ✅ express-rate-limit
- ✅ Trust proxy habilitado (Railway)
- ✅ IP real capturado corretamente
- ✅ Headers padrão incluídos

### 4. Proteção contra Ataques

#### XSS (Cross-Site Scripting)
- ✅ Sanitização automática de query strings
- ✅ Remoção de tags `<script>`
- ✅ CSP configurado (inline scripts apenas necessários)
- ✅ X-XSS-Protection header

#### SQL Injection
- ✅ Banco em memória (sem SQL direto)
- ✅ Validação de tipos TypeScript
- ✅ Sem interpolação de strings em queries

#### CSRF (Cross-Site Request Forgery)
- ✅ SameSite cookies (quando implementado)
- ✅ CORS restrito à BASE_URL
- ✅ Origin validation

#### Brute Force
- ✅ Rate limiting agressivo
- ✅ Delay de 1s em falhas de autenticação
- ✅ Logs de tentativas suspeitas
- ✅ Bloqueio temporário via rate limit

#### DDoS (Distributed Denial of Service)
- ✅ Rate limiting por IP
- ✅ Railway CDN automático
- ✅ Healthcheck separado (sem rate limit)
- ✅ Graceful shutdown

### 5. Validação de Input

#### Sanitização Automática
```javascript
// Query strings
- Remoção de tags HTML
- Remoção de scripts
- Trim de espaços
- Validação de formato UUID
```

#### Validação de Tamanho
- JSON body: Máximo 1MB
- URL encoded: Máximo 1MB
- Previne memory exhaustion

### 6. Logging e Monitoramento

#### Logs de Segurança

**Eventos Registrados:**
- ✅ Todas tentativas de acesso (sucesso/falha)
- ✅ Tentativas de login admin
- ✅ Tokens inválidos ou malformados
- ✅ Rate limit violations
- ✅ Erros de servidor

**Formato dos Logs:**
```
[timestamp] METHOD /path - IP: xxx.xxx.xxx.xxx
✅ Acesso concedido - QR: Nome | Token: abc123... | IP: xxx.xxx.xxx.xxx
❌ Acesso negado - Token: xyz789... | IP: xxx.xxx.xxx.xxx | UA: User-Agent...
⚠️  Tentativa de acesso com token inválido: invalid...
```

#### Dados de Auditoria

Cada log de acesso contém:
- ✅ QR Code ID
- ✅ IP do usuário
- ✅ User-Agent completo
- ✅ Timestamp preciso
- ✅ Status (sucesso/falha)

### 7. CORS (Cross-Origin Resource Sharing)

#### Configuração Produção
```javascript
origin: [BASE_URL, BASE_URL_HTTP_VARIANT]
credentials: true
methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
```

#### Configuração Desenvolvimento
```javascript
origin: '*'  // Apenas em NODE_ENV=development
```

### 8. Variáveis de Ambiente

#### Validação no Startup

**Variáveis Obrigatórias (Produção):**
- `ADMIN_PASSWORD` (mínimo 8 caracteres)
- `BASE_URL` (URL completa do Railway)
- `JWT_SECRET` (para futuras implementações)

**Comportamento:**
- Sistema não inicia se variáveis ausentes
- Mensagem de erro clara indicando o que falta
- Exit code 1 para Railway detectar falha

### 9. Proteções Específicas do Sistema

#### QR Codes

**Características de Segurança:**
1. UUID v4 único (impossível adivinhar)
2. Validação de formato server-side
3. Revogável instantaneamente
4. Não reutilizável após revogação
5. Logs de cada uso

**Fluxo Seguro:**
```
Usuário escaneia → Sistema valida formato → 
Verifica existência → Verifica se ativo → 
Registra log → Concede/Nega acesso
```

#### Site CDC

**Proteções:**
- ✅ Validação a cada requisição (sem cache de token)
- ✅ Sessão volátil (F5 requer revalidação)
- ✅ Sem persistência em localStorage/sessionStorage
- ✅ Token visível apenas em URL (auditável)

### 10. Graceful Shutdown

#### Sinais Tratados
```javascript
SIGTERM → Encerra conexões gracefully
SIGINT → Encerra conexões gracefully
```

#### Comportamento
- Aguarda requisições em andamento
- Fecha conexões limpamente
- Previne perda de dados
- Exit code apropriado

## 🔍 Vulnerabilidades Conhecidas e Mitigações

### 1. Banco em Memória
**Vulnerabilidade:** Dados perdidos ao reiniciar  
**Mitigação:** Migrar para PostgreSQL (futuro)  
**Impacto:** Médio (QR Codes devem ser recriados)

### 2. Token Visível em URL
**Vulnerabilidade:** Token exposto em logs de navegador/proxy  
**Mitigação:** Token de uso único seria ideal (futuro)  
**Impacto:** Baixo (admin pode revogar facilmente)

### 3. Autenticação Admin Simples
**Vulnerabilidade:** Senha única sem 2FA  
**Mitigação:** Implementar JWT + 2FA (futuro)  
**Impacto:** Médio (mitigado por rate limiting)

### 4. Rate Limiting em Memória
**Vulnerabilidade:** Rate limit é por instância, não global  
**Mitigação:** Usar Redis para rate limiting compartilhado (futuro)  
**Impacto:** Baixo (Railway geralmente usa 1 instância)

## 📋 Checklist de Segurança

### Pré-Deploy
- [ ] Todas variáveis de ambiente configuradas
- [ ] ADMIN_PASSWORD forte (16+ caracteres)
- [ ] JWT_SECRET aleatório (32+ caracteres)
- [ ] BASE_URL correta
- [ ] NODE_ENV=production

### Pós-Deploy
- [ ] HTTPS funcionando (certificado válido)
- [ ] Healthcheck respondendo
- [ ] Rate limiting testado
- [ ] Login admin funcionando
- [ ] Criação de QR Code funcionando
- [ ] Validação de token funcionando
- [ ] Revogação de QR Code funcionando
- [ ] Logs sendo gerados

### Manutenção
- [ ] Monitorar logs regularmente
- [ ] Revisar tentativas de acesso falhas
- [ ] Atualizar dependências mensalmente
- [ ] Trocar ADMIN_PASSWORD trimestralmente
- [ ] Revogar QR Codes não utilizados

## 🚨 Resposta a Incidentes

### Detecção de Ataque

**Indicadores:**
1. Muitas tentativas de acesso com tokens inválidos
2. Rate limiting acionado frequentemente
3. IPs suspeitos nos logs
4. Picos anormais de tráfego

**Ação Imediata:**
1. Revogar todos QR Codes ativos
2. Trocar ADMIN_PASSWORD
3. Verificar logs detalhadamente
4. Bloquear IPs suspeitos (via Railway)
5. Aumentar rate limiting temporariamente

### Token Comprometido

**Sinais:**
- Acesso de IPs inesperados
- Padrão de uso anormal
- Múltiplos acessos simultâneos

**Resposta:**
1. Revogar QR Code imediatamente
2. Verificar logs de acesso
3. Gerar novo QR Code
4. Notificar usuários legítimos

### Tentativa de Brute Force

**Sinais:**
- Rate limiting acionado repetidamente
- Tentativas sequenciais de tokens
- Mesmo IP, múltiplos tokens

**Resposta:**
1. Logs já registram automaticamente
2. Rate limiting bloqueia automaticamente
3. Revisar padrões nos logs
4. Considerar blacklist de IP (Railway Firewall)

## 🔐 Boas Práticas

### Senhas
- Use gerador de senhas aleatórias
- Mínimo 16 caracteres
- Misture letras, números, símbolos
- Troque a cada 3 meses
- Nunca reutilize senhas

### QR Codes
- Nomeie descritivamente (ex: "Recepção - João")
- Revogue QR Codes de funcionários demitidos
- Monitore uso regularmente
- Limite de 1 QR Code por pessoa/local
- Reimprima se QR Code físico for danificado

### Monitoramento
- Revise logs semanalmente
- Configure alertas para tentativas de acesso falhas
- Monitore uso de cada QR Code
- Verifique estatísticas regularmente

### Atualizações
- Atualize dependências mensalmente
- Teste em ambiente de desenvolvimento primeiro
- Mantenha backup dos dados (quando usar PostgreSQL)
- Documente todas as mudanças

## 📚 Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Railway Security](https://docs.railway.app/reference/security)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Express Rate Limiting](https://express-rate-limit.mintlify.app/)

---

**Última atualização:** 2024  
**Responsável:** Sistema CDC QR Code  
**Classificação:** Confidencial

