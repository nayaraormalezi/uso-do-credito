import type { ViewId } from "../types";

export interface OnboardingStep {
  id: string;
  number: string;
  title: string;
  before: string;
  improvement: string;
  where: string;
  whereLabel: string;
  targetView?: ViewId;
  highlight?: string;
}

export const ONBOARDING_STORAGE_KEY = "uso-credito-onboarding-seen-v1";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "prep",
    number: "01",
    title: "Preparação",
    before:
      "Regras, documentos e custos apareciam só no meio do processo, gerando dúvidas e retrabalho.",
    improvement:
      "Passo a passo do uso do crédito, regras de documentação, cartilhas por produto e chatbot de dúvidas rápidas.",
    where: "Etapa Orientações + botão flutuante Dúvidas rápidas + Central de ajuda.",
    whereLabel: "Ver orientações",
    targetView: "preparation",
    highlight: "Cartilhas contextuais e assistente flutuante",
  },
  {
    id: "identificacao",
    number: "02",
    title: "Identificação",
    before:
      "O cliente Private não via com clareza quem acompanhava a solicitação.",
    improvement:
      "Experiência segmentada com o nome do gerente em evidência quando ele conduz a jornada.",
    where: "Home (caminho do gerente), cotas, confirmação e acompanhamento — card do gerente Ricardo Almeida.",
    whereLabel: "Ir para o início",
    targetView: "hub",
    highlight: "Nome do gerente visível na jornada",
  },
  {
    id: "abertura",
    number: "03",
    title: "Abertura do processo",
    before:
      "Documentos sem sinalização de validade e pouca clareza sobre o responsável.",
    improvement:
      "Validade dos documentos em destaque, leitura assistida (OCR + validação) e pré-visualização do arquivo enviado.",
    where: "Etapa Documentos — status de validade, análise e modal de visualização.",
    whereLabel: "Ver documentos",
    targetView: "documents",
    highlight: "Validade + OCR + visualizar documento",
  },
  {
    id: "regras-tokens",
    number: "04",
    title: "Regras e tokens",
    before:
      "Tokens e biometria podiam interromper o fluxo sem necessidade em todos os casos.",
    improvement:
      "Neste protótipo, o acesso à jornada ocorre sem barreiras extras de token — foco no fluxo contínuo do uso do crédito.",
    where: "Entrada pelo Início, sem etapa intermediária de token.",
    whereLabel: "Ir para o início",
    targetView: "hub",
    highlight: "Fluxo direto, sem fricção desnecessária",
  },
  {
    id: "tarifas",
    number: "05",
    title: "Comunicação das tarifas",
    before:
      "Tarifas e débitos na carta apareciam de forma dispersa e pouco previsível.",
    improvement:
      "Valores e tarifas centralizados, estimativa clara e novas formas de pagamento: Pix e cartão de crédito, além de carta e boleto.",
    where: "Etapa Custos — valor das tarifas, composição e opções de pagamento.",
    whereLabel: "Ver custos",
    targetView: "costs",
    highlight: "Pix, cartão, boleto e desconto na carta",
  },
  {
    id: "vistoria",
    number: "06",
    title: "Vistoria",
    before:
      "Agendamento limitado e pouca diferenciação por perfil de cliente.",
    improvement:
      "Etapa de vistoria na jornada, com espaço para opções de agenda e acompanhamento do status.",
    where: "Etapa Vistoria na jornada digital.",
    whereLabel: "Ver vistoria",
    targetView: "inspection",
    highlight: "Vistoria integrada à jornada",
  },
  {
    id: "tracking",
    number: "07",
    title: "Tracking das etapas",
    before:
      "Era difícil saber o que já foi concluído e o que vem a seguir.",
    improvement:
      "Acompanhamento visual com etapas concluídas, etapa atual e próximas — no detalhe da solicitação e na navegação lateral.",
    where: "Minhas solicitações + detalhe do uso do crédito (timeline).",
    whereLabel: "Ver solicitações",
    targetView: "requests",
    highlight: "Timeline e status por etapa",
  },
  {
    id: "acionamentos",
    number: "08",
    title: "Central de acionamentos",
    before:
      "Pendências espalhadas e comunicação pouco direcionada.",
    improvement:
      "Cards com ação necessária, notificações e status claros no acompanhamento — o que falta fazer fica em evidência.",
    where: "Home (Acompanhe suas solicitações), Minhas solicitações e sino de notificações.",
    whereLabel: "Ver solicitações",
    targetView: "requests",
    highlight: "Pendências e notificações centralizadas",
  },
  {
    id: "pagamento-bem",
    number: "09",
    title: "Pagamento do bem",
    before:
      "Espera longa para ordens de pagamento, especialmente em fins de semana.",
    improvement:
      "Etapa de pagamento refletida no tracking da solicitação, com status e previsibilidade do andamento.",
    where: "Timeline no detalhe da solicitação (etapa Pagamento).",
    whereLabel: "Ver solicitações",
    targetView: "requests",
    highlight: "Pagamento visível no acompanhamento",
  },
  {
    id: "comprovante",
    number: "10",
    title: "Comprovante de pagamento",
    before:
      "Comprovante só por e-mail, fora do fluxo.",
    improvement:
      "Comprovante disponível para download dentro do próprio acompanhamento, quando a solicitação está concluída.",
    where: "Detalhe da solicitação concluída — baixar comprovante.",
    whereLabel: "Ver solicitações",
    targetView: "requests",
    highlight: "Download no fluxo digital",
  },
  {
    id: "novas-solicitacoes",
    number: "11",
    title: "Novas solicitações",
    before:
      "Documentos válidos precisavam ser reenviados a cada solicitação.",
    improvement:
      "Reaproveitamento de documentos ainda válidos (opt-in) e conta para sobra de crédito / reembolso já na etapa de custos.",
    where: "Documentos (reuso) + Custos (conta para depósito).",
    whereLabel: "Ver custos",
    targetView: "costs",
    highlight: "Reuso de docs + conta de reembolso",
  },
  {
    id: "suporte",
    number: "12",
    title: "Suporte",
    before:
      "Dúvidas e pendências sem um ponto único de apoio no canal digital.",
    improvement:
      "Central de ajuda em página dedicada, tooltips com link para FAQ e chatbot flutuante para dúvidas rápidas.",
    where: "Botão ? no header, ⓘ nas tarifas e assistente Dúvidas rápidas.",
    whereLabel: "Abrir Central de ajuda",
    targetView: "help",
    highlight: "Ajuda contextual + chatbot",
  },
];

export function hasSeenOnboarding() {
  try {
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markOnboardingSeen() {
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
}
