import type { FaqTopicId, HelpOpenOptions } from "../types";

export interface ChatMessage {
  id: string;
  role: "bot" | "user";
  text: string;
  helpLink?: HelpOpenOptions;
}

export interface QuickReply {
  id: string;
  label: string;
}

export const CHATBOT_WELCOME: ChatMessage = {
  id: "welcome",
  role: "bot",
  text: "Olá! Sou o assistente do uso do crédito. Posso tirar dúvidas rápidas sobre documentos, etapas, tarifas, vistoria e acompanhamento. Em que posso ajudar?",
};

export const CHATBOT_QUICK_REPLIES: QuickReply[] = [
  { id: "docs", label: "Documentos" },
  { id: "etapas", label: "Etapas do processo" },
  { id: "tarifas", label: "Tarifas" },
  { id: "gerente", label: "Gerente" },
  { id: "acompanhar", label: "Acompanhar solicitação" },
];

interface ChatIntent {
  id: string;
  keywords: string[];
  answer: string;
  helpLink?: HelpOpenOptions;
}

const INTENTS: ChatIntent[] = [
  {
    id: "documentos",
    keywords: [
      "documento",
      "documentos",
      "comprovante",
      "identidade",
      "renda",
      "endereço",
      "validade",
      "reaproveitar",
      "anexar",
      "envio",
    ],
    answer:
      "Em geral você pode precisar de identificação, comprovante de endereço (até 45 dias) e comprovante de renda (até 90 dias). Documentos ainda válidos de solicitações anteriores podem ser reaproveitados. Para a lista completa por etapa, consulte a Central de ajuda.",
    helpLink: { section: "faq", faqTopic: "documentos" },
  },
  {
    id: "etapas",
    keywords: [
      "etapa",
      "etapas",
      "processo",
      "passo",
      "como funciona",
      "começar",
      "iniciar",
      "jornada",
      "fluxo",
    ],
    answer:
      "O uso do crédito segue etapas como seleção de cotas, orientações, dados, documentos, informações do bem, custos e envio. Depois, você acompanha tudo em Minhas solicitações. Quer ver as cartilhas ou o FAQ completo?",
    helpLink: { section: "faq", faqTopic: "uso-do-credito" },
  },
  {
    id: "tarifas",
    keywords: [
      "tarifa",
      "tarifas",
      "custo",
      "custos",
      "taxa",
      "valor",
      "boleto",
      "carta",
      "débito",
    ],
    answer:
      "As tarifas estimadas aparecem na etapa de Custos da operação, com opções de pagamento por desconto na carta, boleto, Pix ou cartão de crédito. Para regras oficiais, use a Central de ajuda em Tarifas — não invento valores finais aqui.",
    helpLink: { section: "faq", faqTopic: "tarifas" as FaqTopicId },
  },
  {
    id: "imovel",
    keywords: [
      "imóvel",
      "imovel",
      "matrícula",
      "matricula",
      "endereço",
      "cep",
      "construção",
      "reforma",
      "fgts",
    ],
    answer:
      "No uso imobiliário você informa o endereço (com busca por CEP), tipo do imóvel e documentos como a matrícula, quando aplicável. Há cartilhas específicas para imóveis, construção/reforma e FGTS na preparação e na Central de ajuda.",
    helpLink: { section: "faq", faqTopic: "imovel" },
  },
  {
    id: "vistoria",
    keywords: ["vistoria", "avaliação", "laudo", "inspecao", "inspeção"],
    answer:
      "A vistoria pode ser necessária conforme o tipo de bem e a regra da operação. Quando houver, o acompanhamento mostra o status e os próximos passos. Veja mais detalhes no tema Vistoria da Central de ajuda.",
    helpLink: { section: "faq", faqTopic: "vistoria" },
  },
  {
    id: "gerente",
    keywords: [
      "gerente",
      "private",
      "conduz",
      "conduzir",
      "faz por mim",
      "atendimento",
    ],
    answer:
      "Você pode pedir para o seu gerente conduzir a solicitação. Nesse caso, a solicitação mostra o nome dele e fica marcada como conduzida pelo gerente — e você acompanha o andamento por aqui. Também é possível fazer tudo pelo digital.",
    helpLink: { section: "faq", faqTopic: "gerente" },
  },
  {
    id: "acompanhar",
    keywords: [
      "acompanhar",
      "acompanhamento",
      "protocolo",
      "status",
      "andamento",
      "solicitação",
      "solicitacao",
      "pendência",
      "pendencia",
    ],
    answer:
      "Em Minhas solicitações você vê protocolo, data, cotas, valor, categoria e se a condução é sua ou do gerente. Quando houver pendência, o card destaca a ação necessária para continuar.",
    helpLink: { section: "home" },
  },
  {
    id: "prazos",
    keywords: ["prazo", "prazos", "demora", "tempo", "quando"],
    answer:
      "Os prazos variam conforme a etapa (análise de documentos, vistoria, pagamento). Acompanhe o status da sua solicitação e as notificações para ver o que está pendente com você ou com a CAIXA.",
    helpLink: { section: "faq", faqTopic: "prazos" },
  },
  {
    id: "pagamento",
    keywords: ["pagamento", "pagar", "comprovante", "vendedor", "bem"],
    answer:
      "Após a análise, o pagamento do bem segue as etapas da solicitação. Em casos concluídos, o comprovante pode ficar disponível no detalhe do uso do crédito.",
    helpLink: { section: "faq", faqTopic: "pagamento" },
  },
  {
    id: "salvar",
    keywords: ["salvar", "rascunho", "continuar", "sair", "progresso"],
    answer:
      "Você pode salvar o progresso e continuar depois. Ao sair com alterações não salvas, o sistema pergunta se deseja salvar. Solicitações incompletas aparecem no início e em Minhas solicitações.",
  },
  {
    id: "cartilha",
    keywords: ["cartilha", "cartilhas", "orientação", "orientacao", "pdf"],
    answer:
      "As cartilhas aparecem na etapa de Orientações, conforme a categoria da cota (imobiliário, veículos leves ou pesados). Também dá para consultar materiais na Central de ajuda.",
    helpLink: { section: "guides" },
  },
];

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function answerChatQuestion(input: string): ChatMessage {
  const q = normalize(input);
  if (!q) {
    return {
      id: `bot-${Date.now()}`,
      role: "bot",
      text: "Digite sua dúvida ou escolha uma sugestão abaixo.",
    };
  }

  let best: ChatIntent | null = null;
  let bestScore = 0;

  for (const intent of INTENTS) {
    const score = intent.keywords.reduce((sum, keyword) => {
      const key = normalize(keyword);
      return q.includes(key) ? sum + key.length : sum;
    }, 0);
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }

  if (!best) {
    return {
      id: `bot-${Date.now()}`,
      role: "bot",
      text: "Não encontrei uma resposta rápida para isso. Tente perguntar sobre documentos, etapas, tarifas, vistoria, gerente ou acompanhamento — ou abra a Central de ajuda para ver o FAQ completo.",
      helpLink: { section: "home" },
    };
  }

  return {
    id: `bot-${Date.now()}-${best.id}`,
    role: "bot",
    text: best.answer,
    helpLink: best.helpLink,
  };
}

export function answerQuickReply(replyId: string): { userText: string; bot: ChatMessage } {
  const map: Record<string, string> = {
    docs: "Quais documentos preciso enviar?",
    etapas: "Como funcionam as etapas do processo?",
    tarifas: "Como funcionam as tarifas?",
    gerente: "Como funciona o acompanhamento pelo gerente?",
    acompanhar: "Como acompanho minha solicitação?",
  };
  const userText = map[replyId] ?? "Preciso de ajuda";
  return { userText, bot: answerChatQuestion(userText) };
}
