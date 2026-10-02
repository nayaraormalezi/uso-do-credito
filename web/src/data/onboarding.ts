import type { ViewId } from "../types";

export interface OnboardingStep {
  id: string;
  number: string;
  title: string;
  before: string;
  improvements: string[];
  where: string;
  whereLabel: string;
  targetView?: ViewId;
  badge?: string;
}

export const ONBOARDING_STORAGE_KEY = "uso-credito-onboarding-seen-v2";

export const ONBOARDING_TITLE = "USO DO CRÉDITO — JORNADA PRIVATE";
export const ONBOARDING_SUBTITLE =
  "Como é hoje e quais melhorias/oportunidades devem ser construídas";
export const ONBOARDING_OBJECTIVE =
  "OBJETIVO: Reduzir esforço, antecipar orientações e dar previsibilidade ao cliente e ao gerente durante toda a jornada.";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "prep",
    number: "01",
    title: "Preparação",
    before:
      "Cliente e gerente iniciam sem uma visão completa. Regras, custos, documentos e bens aceitos são descobertos durante o processo.",
    improvements: [
      "Disponibilização de um passo a passo sobre o uso do crédito e as principais regras de documentação.",
      "Inclusão de uma cartilha com orientações sobre o processo.",
      "Inclusão de um bot para suporte rápido e esclarecimento de dúvidas.",
    ],
    where: "Etapa Orientações + botão flutuante Dúvidas rápidas + Central de ajuda.",
    whereLabel: "Ver orientações",
    targetView: "preparation",
  },
  {
    id: "identificacao",
    number: "02",
    title: "Identificação",
    before:
      "O cliente não é identificado automaticamente como Private dentro da plataforma, dificultando o direcionamento para a jornada diferenciada.",
    improvements: [
      "Identificação do cliente Private na plataforma.",
      "Direcionamento para uma experiência de segmento.",
      "Deixar mais claro quem vai acompanhar o processo em nome do cliente.",
    ],
    where:
      "Home (caminho do gerente), cotas, confirmação e acompanhamento — card do gerente.",
    whereLabel: "Ir para o início",
    targetView: "hub",
  },
  {
    id: "abertura",
    number: "03",
    title: "Abertura do processo",
    before:
      "A identificação do gerente responsável e o direcionamento das avisos de pendências não ficam claros durante a solicitação.",
    improvements: [
      "Maior clareza sobre o gerente responsável pelo acompanhamento.",
      "Sinalizações nos documentos que possuem prazo de validade ou regras específicas.",
      "Leitura automática de documentos — OCR + IA validação.",
      "Validação no momento do envio (Opção do cliente visualizar o doc inserido).",
    ],
    where:
      "Etapa Documentos — status de validade, análise e modal de visualização.",
    whereLabel: "Ver documentos",
    targetView: "documents",
  },
  {
    id: "regras-tokens",
    number: "04",
    title: "Regras e tokens",
    before:
      "O acesso ao Workflow exige token ou biometria, gerando atrito mesmo quando a validação reforçada pode não ser necessária.",
    improvements: [
      "Simplificação do uso de token ou biometria ou retirada do recurso. Analisar os critérios de risco e segurança.",
    ],
    where: "Entrada pelo Início, sem etapa intermediária de token.",
    whereLabel: "Ir para o início",
    targetView: "hub",
  },
  {
    id: "tarifas",
    number: "05",
    title: "Comunicação das tarifas",
    before:
      "As tarifas, os valores estimados e os débitos realizados na carta de crédito não são apresentados de forma simples e centralizada.",
    improvements: [
      "Apresentação mais clara das tarifas, dos valores estimados e dos possíveis débitos na carta de crédito.",
      "Possibilidade de outras formas de pagamento.",
      "API para cálculo prévio dos valores.",
    ],
    where: "Etapa Custos — valor das tarifas, composição e opções de pagamento.",
    whereLabel: "Ver custos",
    targetView: "costs",
  },
  {
    id: "vistoria",
    number: "06",
    title: "Vistoria",
    before:
      "Mais opções de datas e horários, principalmente para vistorias de veículos pesados.",
    improvements: [
      "Ampliação das opções de datas e horários.",
      "Mais facilidade para realizar o agendamento.",
      "Analisar a possibilidade de SLA diferenciado.",
      'Avaliar a possibilidade de dispensar a vistoria para clientes que utilizam o crédito com frequência e que são clientes "confiáveis".',
    ],
    where: "Etapa Vistoria na jornada digital.",
    whereLabel: "Ver vistoria",
    targetView: "inspection",
  },
  {
    id: "tracking",
    number: "07",
    title: "Tracking das etapas",
    before:
      "A comunicação das etapas do bem, cliente e vendedor não tem clareza sobre próximas etapas, responsáveis e prazos.",
    improvements: [
      "Visualização das etapas concluídas e dos próximos passos de acompanhamento.",
    ],
    where: "Minhas solicitações + detalhe do uso do crédito (timeline).",
    whereLabel: "Ver solicitações",
    targetView: "requests",
  },
  {
    id: "acionamentos",
    number: "08",
    title: "Central de acionamentos / Acompanhamento do processo",
    before:
      "Comunicação de pendências e ações necessárias ao cliente e ao economiário.",
    improvements: [
      "Comunicação direcionada: mensagens que são alinhadas às necessidades do cliente/economiário serem enviadas pelo canal de maior aderência (Whatsapp), considerando o responsável pelo acompanhamento do processo.",
      "Central de acionamentos: reunir em um único lugar de forma visível todas as pendências que exigem ação do cliente/economiário.",
    ],
    where:
      "Home (Acompanhe suas solicitações), Minhas solicitações e sino de notificações.",
    whereLabel: "Ver solicitações",
    targetView: "requests",
  },
  {
    id: "pagamento-bem",
    number: "09",
    title: "Pagamento do bem",
    before:
      "As ordens de pagamento são processadas apenas uma vez ao dia, aumentando o tempo de espera, especialmente na sexta-feira.",
    improvements: [
      "Possibilidade de ampliar a frequência das ordens de pagamento.",
      "Redução do tempo de espera, principalmente para solicitações finalizadas às sextas-feiras.",
    ],
    where: "Timeline no detalhe da solicitação (etapa Pagamento).",
    whereLabel: "Ver solicitações",
    targetView: "requests",
  },
  {
    id: "comprovante",
    number: "10",
    title: "Comprovante de pagamento",
    before:
      "O comprovante é enviado por e-mail após a sensibilização de pagamento, sem consulta imediata no Workflow.",
    improvements: [
      "Disponibilização do comprovante diretamente no Workflow.",
    ],
    where: "Detalhe da solicitação concluída — baixar comprovante.",
    whereLabel: "Ver solicitações",
    targetView: "requests",
  },
  {
    id: "novas-solicitacoes",
    number: "11",
    title: "Novas solicitações",
    badge: "OPORTUNIDADE",
    before:
      "Ao retornar à esteira, o cliente precisa reenviar toda a documentação, inclusive documentos já validados e ainda vigentes.",
    improvements: [
      "Reaproveitamento de documentos ainda válidos.",
      "Solicitação apenas dos documentos vencidos.",
      "Clique de aceite.",
    ],
    where: "Documentos (reuso) + Custos (conta para depósito).",
    whereLabel: "Ver custos",
    targetView: "costs",
  },
  {
    id: "suporte",
    number: "12",
    title: "Suporte",
    badge: "Novo - Em andamento",
    before: "Apoio a REDE Private (Daiane e Fabiana).",
    improvements: [
      "Acompanhamento mais proativo durante a jornada.",
      "Antecipação de possíveis pendências e apoio ao cliente e ao gerente até a conclusão.",
      "Acionamentos por TEAMS para solicitação de apoio.",
    ],
    where: "Botão ? no header, ⓘ nas tarifas e assistente Dúvidas rápidas.",
    whereLabel: "Abrir Central de ajuda",
    targetView: "help",
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
