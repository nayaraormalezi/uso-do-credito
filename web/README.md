# Uso do Crédito — Imobiliário (Desktop)

Protótipo navegável da jornada de Uso do Crédito Imobiliário em desktop, evoluindo a jornada APP do Figma com as oportunidades do board de CX Private.

## Como rodar

```bash
cd web
npm install
npm run dev
```

Abra o endereço indicado no terminal (geralmente `http://localhost:5173`).

## Escopo P0

Fluxo feliz de **Aquisição**:

Hub → Preparação → Cotas → Dados → Documentos → Imóvel → Vistoria → Vendedor → Custos → Resumo → Acompanhamento

## Arquitetura UX

- Shell de 3 colunas: stepper | conteúdo | central de acionamentos
- Badge Private + card do gerente
- Pendências acionáveis com CTA
- Reuso de documentos válidos
- Tracking pós-envio com papéis (cliente / CAIXA / gerente)
