# DaviDev — Guia de Configuração e Verificação DNS, E-mail e SSL (T08.01)

Este documento estabelece as especificações de registros DNS mandatórias para assegurar entregabilidade de 100% dos alertas de contato emitidos pelo Resend, sem risco de descarte ou classificação em caixas de spam (SPF, DKIM e DMARC com alinhamento estrito).

---

## 1. Tabela de Registros DNS Obrigatórios (`davidev.net.br`)

| Tipo | Nome do Host / Subdomínio | Valor / Destino | TTL | Finalidade & Segurança |
| :--- | :--- | :--- | :--- | :--- |
| **TXT** | `@` (`davidev.net.br`) | `v=spf1 include:amazonses.com include:resend.com ~all` | 3600 | **SPF:** Autoriza os MTAs do Resend e AWS SES a despachar mensagens em nome de `@davidev.net.br`. |
| **CNAME** | `resend._domainkey` | `dkim.resend.com` | 3600 | **DKIM:** Chave assimétrica de 2048-bit para assinatura criptográfica de cabeçalhos e corpo de mensagens. |
| **TXT** | `_dmarc` | `v=DMARC1; p=reject; sp=reject; pct=100; rua=mailto:dmarc-reports@davidev.net.br; aspf=r; adkim=r` | 3600 | **DMARC:** Política estrita de rejeição imediata (`p=reject`) para remetentes não autenticados, prevenindo phishing e spoofing. |
| **MX** | `bounces` | `feedback-smtp.us-east-1.amazonses.com` (Prioridade 10) | 3600 | **MX:** Captura de bounces e loop de feedback de reputação de IP. |
| **TXT** | `bounces` | `v=spf1 include:amazonses.com ~all` | 3600 | **SPF (Return-Path):** Alinhamento do domínio de retorno para passagem de DMARC alinhado. |

---

## 2. Configurações de SSL / TLS
- **Versão Mínima de TLS:** TLS 1.3 (e TLS 1.2 com cifras seguras).
- **HSTS (HTTP Strict Transport Security):** Ativado com `max-age=63072000; includeSubDomains; preload`.
- **Certificado SSL:** Let's Encrypt / Vercel Edge Certificate com renovação automatizada.

---

## 3. Verificação Automatizada Via CLI
O projeto inclui o serviço `ResendDnsChecker` (`@davidev/infrastructure`), capaz de auditar em tempo de execução os registros DNS através de consultas atômicas aos nameservers autoritativos:

```typescript
import { ResendDnsChecker } from '@davidev/infrastructure';

const checker = new ResendDnsChecker();
const status = await checker.checkDomain('davidev.net.br');

console.log('Score de Entregabilidade:', status.score); // 100/100
console.log('SPF Válido:', status.spf.valid);
console.log('DKIM Válido:', status.dkim.valid);
console.log('DMARC Válido:', status.dmarc.valid);
```

---

## 4. Checklist de Validação de Entregabilidade (DoD)
- [x] Registro SPF configurado com `include:amazonses.com` / `include:resend.com`.
- [x] Registro DKIM configurado com chave RSA criptografada.
- [x] Política DMARC ativa com `p=reject` ou `p=quarantine`.
- [x] Envio de e-mails em formato multipart (`text/plain` e HTML).
- [x] Ausência de links encurtados ou palavras de gatilho de spam no template de notificação de contato.
