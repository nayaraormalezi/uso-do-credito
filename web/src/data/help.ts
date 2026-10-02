export type HelpSection = "home" | "faq" | "guides";

export type FaqTopicId =
  | "uso-do-credito"
  | "documentos"
  | "imovel"
  | "tarifas"
  | "vistoria"
  | "pagamento"
  | "prazos"
  | "gerente";

export interface FaqQuestion {
  id: string;
  question: string;
  /** Conteúdo oficial a ser inserido posteriormente */
  answerPlaceholder: string;
}

export interface FaqTopic {
  id: FaqTopicId;
  title: string;
  description: string;
  questions: FaqQuestion[];
}

export interface HelpGuide {
  id: string;
  title: string;
  description: string;
  category: string;
  updatedAt: string;
  format: string;
}

export const FAQ_TOPICS: FaqTopic[] = [
  {
    id: "uso-do-credito",
    title: "Uso do crédito",
    description: "Dúvidas gerais sobre o processo de uso do crédito.",
    questions: [
      {
        id: "uso-1",
        question: "O que é o uso do crédito?",
        answerPlaceholder: "Conteúdo oficial a ser inserido.",
      },
      {
        id: "uso-2",
        question: "Como escolher entre fazer pelo digital ou com o gerente?",
        answerPlaceholder: "Conteúdo oficial a ser inserido.",
      },
    ],
  },
  {
    id: "documentos",
    title: "Documentos",
    description: "Envio, validade e análise de documentos.",
    questions: [
      {
        id: "doc-1",
        question: "Quais documentos podem ser solicitados?",
        answerPlaceholder: "Conteúdo oficial a ser inserido.",
      },
      {
        id: "doc-2",
        question: "Posso reaproveitar documentos já enviados?",
        answerPlaceholder: "Conteúdo oficial a ser inserido.",
      },
    ],
  },
  {
    id: "imovel",
    title: "Imóvel",
    description: "Endereço, matrícula e documentos do imóvel.",
    questions: [
      {
        id: "imovel-1",
        question: "Quais informações do imóvel preciso informar?",
        answerPlaceholder: "Conteúdo oficial a ser inserido.",
      },
    ],
  },
  {
    id: "tarifas",
    title: "Tarifas",
    description: "Regras e tarifas aplicáveis ao uso do crédito.",
    questions: [
      {
        id: "tarifa-1",
        question: "Quais tarifas podem ser cobradas durante o uso do crédito?",
        answerPlaceholder: "Conteúdo oficial a ser inserido.",
      },
      {
        id: "tarifa-2",
        question: "Quando uma tarifa é cobrada?",
        answerPlaceholder: "Conteúdo oficial a ser inserido.",
      },
      {
        id: "tarifa-3",
        question: "Como são calculados os valores?",
        answerPlaceholder: "Conteúdo oficial a ser inserido.",
      },
      {
        id: "tarifa-4",
        question: "Quais custos podem estar envolvidos?",
        answerPlaceholder: "Conteúdo oficial a ser inserido.",
      },
    ],
  },
  {
    id: "vistoria",
    title: "Vistoria",
    description: "Quando a vistoria é necessária e como acompanha-la.",
    questions: [
      {
        id: "vistoria-1",
        question: "Quando a vistoria é necessária?",
        answerPlaceholder: "Conteúdo oficial a ser inserido.",
      },
    ],
  },
  {
    id: "pagamento",
    title: "Pagamento",
    description: "Formas de pagamento e comprovantes.",
    questions: [
      {
        id: "pagamento-1",
        question: "Como acompanho o pagamento do bem?",
        answerPlaceholder: "Conteúdo oficial a ser inserido.",
      },
    ],
  },
  {
    id: "prazos",
    title: "Prazos",
    description: "Prazos de análise, envio e validade de documentos.",
    questions: [
      {
        id: "prazos-1",
        question: "Quais prazos posso acompanhar durante o processo?",
        answerPlaceholder: "Conteúdo oficial a ser inserido.",
      },
    ],
  },
  {
    id: "gerente",
    title: "Gerente e atendimento",
    description: "Quando o gerente conduz e como pedir apoio.",
    questions: [
      {
        id: "gerente-1",
        question: "Como funciona a condução pelo gerente?",
        answerPlaceholder: "Conteúdo oficial a ser inserido.",
      },
    ],
  },
];

export const HELP_GUIDES: HelpGuide[] = [
  {
    id: "guide-uso-imobiliario",
    title: "Orientações para uso do crédito imobiliário",
    description:
      "Material oficial com documentos, etapas e orientações para utilizar seu crédito.",
    category: "Uso do crédito",
    updatedAt: "A definir",
    format: "PDF",
  },
  {
    id: "guide-documentos",
    title: "Cartilha de documentos",
    description:
      "Material oficial sobre documentos que podem ser solicitados durante o processo.",
    category: "Documentos",
    updatedAt: "A definir",
    format: "PDF",
  },
];

export function findFaqTopic(id: FaqTopicId | null) {
  if (!id) return null;
  return FAQ_TOPICS.find((topic) => topic.id === id) ?? null;
}
