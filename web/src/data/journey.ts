import type {
  ActionItem,
  CreditUse,
  CreditUseTimelineStep,
  DocumentItem,
  FeePaymentMethod,
  JourneyStep,
  QuotaCategory,
  QuotaOption,
} from "../types";
import { CUSTOMER_PROFILE } from "./customer";
import { cloneCatalog } from "./documents";

export const QUOTA_CATEGORY_LABELS: Record<QuotaCategory, string> = {
  imobiliario: "Imobiliário",
  veiculos_leves: "Veículos leves",
  veiculos_pesados: "Veículos pesados",
};

export const QUOTA_CATEGORY_ORDER: QuotaCategory[] = [
  "imobiliario",
  "veiculos_leves",
  "veiculos_pesados",
];

export const CUSTOMER_NAME = CUSTOMER_PROFILE.firstName;

export const STEPS: JourneyStep[] = [
  { id: "hub", label: "Início", shortLabel: "Início", mode: "entry", paths: ["all"] },
  {
    id: "quotas",
    label: "Seleção de cotas",
    shortLabel: "Cotas",
    mode: "solicitation",
    paths: ["all"],
  },
  {
    id: "managerConfirm",
    label: "Confirmar solicitação",
    shortLabel: "Confirmar",
    mode: "solicitation",
    paths: ["gerente"],
  },
  {
    id: "managerSuccess",
    label: "Solicitação enviada",
    shortLabel: "Enviado",
    mode: "solicitation",
    paths: ["gerente"],
  },
  {
    id: "preparation",
    label: "Orientações",
    shortLabel: "Orientações",
    mode: "solicitation",
    paths: ["cliente"],
  },
  {
    id: "personalData",
    label: "Dados cadastrais",
    shortLabel: "Dados",
    mode: "solicitation",
    paths: ["cliente"],
  },
  {
    id: "documents",
    label: "Documentos",
    shortLabel: "Documentos",
    mode: "solicitation",
    paths: ["cliente"],
  },
  {
    id: "property",
    label: "Dados do imóvel",
    shortLabel: "Imóvel",
    mode: "solicitation",
    paths: ["cliente"],
  },
  {
    id: "inspection",
    label: "Vistoria",
    shortLabel: "Vistoria",
    mode: "solicitation",
    paths: ["cliente"],
  },
  {
    id: "seller",
    label: "Vendedor",
    shortLabel: "Vendedor",
    mode: "solicitation",
    paths: ["cliente"],
  },
  {
    id: "costs",
    label: "Custos e tarifas",
    shortLabel: "Custos",
    mode: "solicitation",
    paths: ["cliente"],
  },
  {
    id: "summary",
    label: "Resumo e envio",
    shortLabel: "Resumo",
    mode: "solicitation",
    paths: ["cliente"],
  },
  {
    id: "requests",
    label: "Minhas solicitações",
    shortLabel: "Solicitações",
    mode: "tracking",
    paths: ["all"],
  },
  {
    id: "tracking",
    label: "Acompanhamento",
    shortLabel: "Acompanhar",
    mode: "tracking",
    paths: ["all"],
  },
  {
    id: "creditUseDetail",
    label: "Acompanhamento da cota",
    shortLabel: "Detalhe",
    mode: "tracking",
    paths: ["all"],
  },
];

/** Cliente: cotas → orientações → … → acompanhamento */
export const CLIENT_ORDER: JourneyStep["id"][] = [
  "quotas",
  "preparation",
  "personalData",
  "documents",
  "property",
  "inspection",
  "seller",
  "costs",
  "summary",
];

/** Gerente: cotas → confirmação → sucesso */
export const MANAGER_ORDER: JourneyStep["id"][] = [
  "quotas",
  "managerConfirm",
  "managerSuccess",
];

/** @deprecated use CLIENT_ORDER / MANAGER_ORDER */
export const SOLICITATION_ORDER = CLIENT_ORDER;

/** Campos alinhados ao Figma A4 (Grupo, Cota, Valor da carta, Contemplada) */
export const QUOTAS: QuotaOption[] = [
  {
    id: "q1",
    group: "123456",
    quota: "078",
    credit: "R$ 280.000,00",
    status: "Contemplada",
    category: "imobiliario",
  },
  {
    id: "q2",
    group: "123456",
    quota: "102",
    credit: "R$ 95.000,00",
    status: "Contemplada",
    category: "imobiliario",
  },
  {
    id: "q3",
    group: "654321",
    quota: "045",
    credit: "R$ 120.000,00",
    status: "Contemplada",
    category: "imobiliario",
  },
  {
    id: "q4",
    group: "778899",
    quota: "012",
    credit: "R$ 65.000,00",
    status: "Contemplada",
    category: "veiculos_leves",
  },
  {
    id: "q5",
    group: "778899",
    quota: "033",
    credit: "R$ 48.000,00",
    status: "Contemplada",
    category: "veiculos_leves",
  },
  {
    id: "q6",
    group: "990011",
    quota: "007",
    credit: "R$ 310.000,00",
    status: "Contemplada",
    category: "veiculos_pesados",
  },
  {
    id: "q7",
    group: "990011",
    quota: "021",
    credit: "R$ 245.000,00",
    status: "Contemplada",
    category: "veiculos_pesados",
  },
];

export const MANAGER = {
  name: "Ricardo Almeida",
  role: "Gerente de relacionamento · CAIXA Consórcio",
  agency: "Agência 0452",
  note: "Seu gerente conduz o início do processo e você acompanha o andamento por aqui.",
};

export const INITIAL_DOCUMENTS: DocumentItem[] = cloneCatalog();

export function docsNeedingClientAction(documents: DocumentItem[]) {
  return documents.filter((d) =>
    ["pending", "rejected", "reusable", "review"].includes(d.status),
  );
}

export function quotaLabel(quotaId: string): string {
  const q = QUOTAS.find((item) => item.id === quotaId);
  if (!q) return quotaId;
  return `Grupo ${q.group} · Cota ${q.quota}`;
}

export function quotasSummary(quotaIds: string[]): string {
  return quotaIds.map(quotaLabel).join(", ");
}

function managerTimeline(stage: "sent" | "started" | "docs"): CreditUseTimelineStep[] {
  const base: CreditUseTimelineStep[] = [
    {
      id: "sent",
      title: "Solicitação enviada",
      description: `${MANAGER.name} recebeu o pedido para iniciar o uso do crédito.`,
      meta: "Concluído",
      state: "completed",
      owner: "cliente",
    },
    {
      id: "manager",
      title: `${MANAGER.name} iniciou o atendimento`,
      description: `${MANAGER.name} está conduzindo o início do processo.`,
      meta: stage === "sent" ? "Próxima etapa" : "Concluído",
      state: stage === "sent" ? "upcoming" : "completed",
      owner: "gerente",
    },
    {
      id: "docs",
      title: "Documentação",
      description:
        stage === "docs"
          ? `${MANAGER.name} está reunindo e validando os documentos necessários.`
          : "Etapa de documentação do processo.",
      meta:
        stage === "docs"
          ? `Aguardando ${MANAGER.name.split(" ")[0]}`
          : stage === "started"
            ? "Etapa atual"
            : "Próxima etapa",
      state:
        stage === "docs" ? "current" : stage === "started" ? "current" : "upcoming",
      owner: "gerente",
    },
    {
      id: "analysis",
      title: "Análise",
      description: "Análise da solicitação pela CAIXA.",
      meta: "Próxima etapa",
      state: "upcoming",
      owner: "caixa",
    },
    {
      id: "inspection",
      title: "Vistoria",
      description: "Quando aplicável ao tipo de utilização.",
      meta: "Quando aplicável",
      state: "upcoming",
      owner: "caixa",
    },
    {
      id: "payment",
      title: "Pagamento",
      description: "Processamento do pagamento do bem.",
      meta: "Próxima etapa",
      state: "upcoming",
      owner: "caixa",
    },
    {
      id: "done",
      title: "Conclusão",
      description: "Encerramento do uso do crédito.",
      meta: "Próxima etapa",
      state: "upcoming",
      owner: "caixa",
    },
  ];
  return base;
}

export function createManagerCreditUses(quotaIds: string[]): CreditUse[] {
  const date = new Date().toLocaleDateString("pt-BR");
  const nowLabel = `Hoje, ${new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
  return quotaIds.map((quotaId, index) => {
    const stage = index === 0 ? "docs" : "sent";
    return {
      id: `use-mgr-${quotaId}-${Date.now()}-${index}`,
      quotaIds: [quotaId],
      conduction: "gerente" as const,
      status: (stage === "docs"
        ? "aguardando_gerente"
        : "solicitacao_enviada") as CreditUse["status"],
      protocol: `MGR${Date.now()}${index}`,
      createdAt: date,
      currentStepLabel:
        stage === "docs"
          ? "Documentação — Em andamento"
          : `Aguardando início por ${MANAGER.name}`,
      owner: "gerente" as const,
      statusMessage:
        stage === "docs"
          ? `${MANAGER.name} está conduzindo o processo. Neste momento, não é necessária nenhuma ação sua.`
          : `Solicitação enviada. Aguardando ${MANAGER.name} iniciar o atendimento.`,
      clientActionNeeded: false,
      phase: "acompanhamento" as const,
      lastView: "creditUseDetail" as const,
      lastUpdatedLabel: nowLabel,
      timeline: managerTimeline(stage),
    };
  });
}

export function createClientCreditUse(quotaIds: string[], protocol: string): CreditUse {
  const nowLabel = `Hoje, ${new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
  return {
    id: `use-cli-${protocol}`,
    quotaIds,
    conduction: "cliente",
    status: "pendencia",
    protocol,
    createdAt: new Date().toLocaleDateString("pt-BR"),
    currentStepLabel: "Documentação pendente",
    owner: "cliente",
    statusMessage: "Há uma pendência de documento que depende de você.",
    clientActionNeeded: true,
    phase: "acompanhamento",
    lastView: "documents",
    lastUpdatedLabel: nowLabel,
    progressDetail: "Ação necessária na documentação",
    progressHint: "Envie o comprovante de renda atualizado.",
    timeline: [
      {
        id: "t1",
        title: "Solicitação enviada",
        description: "Protocolo gerado com sucesso.",
        meta: "Concluído",
        state: "completed",
        owner: "cliente",
      },
      {
        id: "t2",
        title: "Em análise",
        description: "A CAIXA está analisando os documentos e dados enviados.",
        meta: "Em andamento",
        state: "current",
        owner: "caixa",
      },
      {
        id: "t3",
        title: "Documentação pendente",
        description: "É preciso enviar o comprovante de renda atualizado.",
        meta: "Ação necessária",
        state: "danger",
        owner: "cliente",
      },
      {
        id: "t4",
        title: "Conclusão",
        description: "A solicitação será deferida ou indeferida após a análise.",
        meta: "Prazo de até 2 dias úteis",
        state: "upcoming",
        owner: "caixa",
      },
    ],
  };
}

export const PREPARATION_STEPS = [
  {
    title: "Entenda o processo",
    text: "O uso do crédito segue etapas: dados, documentos, informações do bem, vistoria (quando aplicável), custos e envio.",
  },
  {
    title: "Prepare a documentação",
    text: "Tenha identificação, comprovante de endereço e documentos do imóvel. Documentos ainda válidos podem ser reaproveitados.",
  },
  {
    title: "Acompanhe em Minhas solicitações",
    text: "Todo o andamento fica disponível após o envio, com status, pendências e próximo passo.",
  },
  {
    title: "Conte com orientação",
    text: "Consulte a cartilha antes de iniciar e use a ajuda contextual quando tiver dúvidas sobre a etapa atual.",
  },
];

export function buildActions(params: {
  view: string;
  submitted: boolean;
  documents: DocumentItem[];
  feePaymentMethod: FeePaymentMethod | null;
  conductionPath: "cliente" | "gerente" | null;
  activeUse: CreditUse | null;
}): ActionItem[] {
  const {
    view,
    submitted,
    documents,
    feePaymentMethod,
    conductionPath,
    activeUse,
  } = params;
  const actionDocs = docsNeedingClientAction(documents);

  if (view === "creditUseDetail" && activeUse) {
    const actions: ActionItem[] = [];
    if (activeUse.clientActionNeeded) {
      actions.push({
        id: "use-client",
        owner: "cliente",
        title: "Você precisa realizar uma ação",
        description: activeUse.statusMessage,
        ctaLabel: "Ir para documentos",
        ctaView: "documents",
        deadline: "Aguardando ação",
      });
    } else if (activeUse.owner === "gerente") {
      actions.push({
        id: "use-mgr",
        owner: "gerente",
        title: "Seu gerente está conduzindo esta etapa",
        description: activeUse.statusMessage,
      });
    } else {
      actions.push({
        id: "use-caixa",
        owner: "caixa",
        title: "Estamos processando sua solicitação",
        description: activeUse.statusMessage,
      });
    }
    if (!activeUse.clientActionNeeded) {
      actions.push({
        id: "no-action",
        owner: "cliente",
        title: "Nenhuma ação sua no momento",
        description:
          "Você pode acompanhar o andamento. Avisearemos se for necessário algum envio ou confirmação.",
      });
    }
    return actions;
  }

  if (submitted || view === "tracking") {
    const income = documents.find((d) => d.id === "doc-income");
    const actions: ActionItem[] = [];
    if (
      income &&
      (income.status === "pending" ||
        income.status === "rejected" ||
        income.status === "review")
    ) {
      actions.push({
        id: "pend-income",
        owner: "cliente",
        title:
          income.status === "review"
            ? "Confirme os dados do comprovante de renda"
            : "Envie o comprovante de renda atualizado",
        description:
          income.rejection?.reason ??
          "A análise identificou pendência neste documento.",
        ctaLabel:
          income.status === "review" ? "Revisar dados" : "Enviar documento",
        ctaView: "documents",
        deadline: "Aguardando ação",
      });
    }
    actions.push({
      id: "caixa-analise",
      owner: "caixa",
      title: "Análise da solicitação",
      description:
        "A CAIXA analisa os documentos e dados enviados. Você não precisa realizar nenhuma ação neste momento além das pendências listadas.",
    });
    actions.push({
      id: "gerente-acompanha",
      owner: "gerente",
      title: "Acompanhamento da rede Private",
      description:
        "Seu gerente pode ser acionado para apoio em pendências ou dúvidas durante o processo.",
    });
    return actions;
  }

  const actions: ActionItem[] = [];

  if (view === "hub") {
    return [];
  }

  if (view === "quotas") {
    actions.push({
      id: "select-quotas",
      owner: "cliente",
      title: "Selecione uma ou mais cotas",
      description:
        conductionPath === "gerente"
          ? "As cotas selecionadas serão encaminhadas ao seu gerente."
          : "As cotas selecionadas entrarão na sua solicitação de uso do crédito.",
    });
  }

  if (view === "managerConfirm") {
    actions.push({
      id: "confirm-mgr",
      owner: "cliente",
      title: "Confirme a solicitação ao gerente",
      description:
        "Revise as cotas e confirme para que seu gerente dê continuidade.",
      ctaLabel: "Solicitar ao gerente",
      ctaView: "managerConfirm",
    });
  }

  if (view === "preparation") {
    actions.push({
      id: "start",
      owner: "cliente",
      title: "Revise as orientações antes de continuar",
      description:
        "Isso reduz dúvidas e retrabalho nas próximas etapas da jornada.",
    });
  }

  if (
    actionDocs.length > 0 &&
    ["documents", "personalData", "property", "costs", "summary"].includes(view)
  ) {
    actions.push({
      id: "docs-pending",
      owner: "cliente",
      title: `${actionDocs.length} documento(s) com ação necessária`,
      description: actionDocs.map((d) => d.name).join(", "),
      ctaLabel: "Ir para documentos",
      ctaView: "documents",
    });
  }

  if (view === "costs" && !feePaymentMethod) {
    actions.push({
      id: "choose-fee",
      owner: "cliente",
      title: "Escolha como pagar as tarifas",
      description:
        "As tarifas podem ser pagas com desconto na carta, boleto, Pix ou cartão de crédito, conforme as opções apresentadas.",
      ctaLabel: "Definir forma de pagamento",
      ctaView: "costs",
    });
  }

  if (view === "summary") {
    actions.push({
      id: "review-send",
      owner: "cliente",
      title: "Revise e envie a solicitação",
      description: "Confira os dados e documentos antes de gerar o protocolo.",
      ctaLabel: "Ir ao resumo",
      ctaView: "summary",
    });
  }

  if (actions.length === 0) {
    actions.push({
      id: "continue",
      owner: "cliente",
      title: "Continue a etapa atual",
      description:
        "Complete as informações desta etapa para avançar. O painel lateral mostra o que depende de você.",
    });
  }

  if (conductionPath === "gerente") {
    actions.push({
      id: "mgr-path",
      owner: "gerente",
      title: "Gerente conduzirá o processo",
      description:
        "Após a confirmação, o acompanhamento fica disponível sem necessidade de preencher toda a jornada agora.",
    });
  } else {
    actions.push({
      id: "caixa-idle",
      owner: "caixa",
      title: "Aguardando envio da solicitação",
      description:
        "Enquanto a solicitação não for enviada, a CAIXA ainda não inicia a análise operacional.",
    });
  }

  return actions;
}
