import { EMPTY_CARD_PAYMENT, EMPTY_REFUND_ACCOUNT } from "./costs";
import { applyVaultToCatalog } from "./customer";
import { cloneCatalog } from "./documents";
import { STEPS } from "./journey";
import {
  EMPTY_PROPERTY_ADDRESS,
  clonePropertyCatalog,
} from "./property";
import { EMPTY_SELLER_DATA } from "./seller";
import type {
  CreditUse,
  CreditUseSnapshot,
  DocumentItem,
  JourneyState,
  ViewId,
} from "../types";

function cloneDocs(docs: DocumentItem[]): DocumentItem[] {
  return docs.map((doc) => ({
    ...doc,
    extractedFields: doc.extractedFields?.map((field) => ({ ...field })),
    rejection: doc.rejection ? { ...doc.rejection } : undefined,
    file: doc.file ? { ...doc.file } : undefined,
    previousFile: doc.previousFile ? { ...doc.previousFile } : undefined,
    requirements: { ...doc.requirements },
  }));
}

export const FILLABLE_VIEWS: ViewId[] = [
  "quotas",
  "managerConfirm",
  "preparation",
  "personalData",
  "documents",
  "property",
  "inspection",
  "seller",
  "costs",
  "summary",
];

export function isFillableView(view: ViewId) {
  return FILLABLE_VIEWS.includes(view);
}

export function stepLabel(view: ViewId): string {
  const step = STEPS.find((item) => item.id === view);
  if (step) return step.shortLabel === "Imóvel" ? "Dados do imóvel" : step.label;
  switch (view) {
    case "documents":
      return "Documentação";
    case "quotas":
      return "Seleção de cotas";
    case "summary":
      return "Revisão";
    default:
      return "Solicitação";
  }
}

export function formatSavedAt(date = new Date()): string {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatLastUpdateLabel(date = new Date()): string {
  const time = formatSavedAt(date);
  return `Hoje, ${time}`;
}

export function docsProgress(documents: DocumentItem[]) {
  const total = documents.filter((d) => d.required).length || documents.length;
  const done = documents.filter((d) =>
    ["approved", "needs_human", "uploaded"].includes(d.status),
  ).length;
  const missing = Math.max(total - done, 0);
  return { done, total, missing };
}

export function progressForView(
  view: ViewId,
  documents: DocumentItem[],
): { detail?: string; hint?: string; stepLabel: string } {
  const label = stepLabel(view);
  if (view === "documents") {
    const { done, total, missing } = docsProgress(documents);
    return {
      stepLabel: label,
      detail: `${done} de ${total} documentos enviados`,
      hint:
        missing > 0
          ? `Faltam ${missing} documento${missing > 1 ? "s" : ""} para concluir esta etapa.`
          : "Documentação pronta para continuar.",
    };
  }
  return {
    stepLabel: label,
    detail: `Etapa atual: ${label}`,
    hint: "Você parou nesta etapa.",
  };
}

export function snapshotFromState(
  state: Pick<
    JourneyState,
    | "selectedQuotaIds"
    | "documents"
    | "selectedDocumentId"
    | "reuseAccepted"
    | "feePaymentMethod"
    | "cardPayment"
    | "feePaymentInstrument"
    | "refundAccount"
    | "additionalContactsEnabled"
    | "additionalContacts"
    | "propertyType"
    | "usesFgts"
    | "propertyAddress"
    | "propertyAddressConfirmed"
    | "propertyDocuments"
    | "selectedPropertyDocumentId"
    | "seller"
  >,
): CreditUseSnapshot {
  return {
    selectedQuotaIds: [...state.selectedQuotaIds],
    documents: cloneDocs(state.documents),
    selectedDocumentId: state.selectedDocumentId,
    reuseAccepted: state.reuseAccepted,
    feePaymentMethod: state.feePaymentMethod,
    cardPayment: { ...state.cardPayment },
    feePaymentInstrument: state.feePaymentInstrument
      ? { ...state.feePaymentInstrument }
      : null,
    refundAccount: { ...state.refundAccount },
    additionalContactsEnabled: state.additionalContactsEnabled,
    additionalContacts: state.additionalContacts.map((contact) => ({
      ...contact,
    })),
    propertyType: state.propertyType,
    usesFgts: state.usesFgts,
    propertyAddress: { ...state.propertyAddress },
    propertyAddressConfirmed: state.propertyAddressConfirmed,
    propertyDocuments: cloneDocs(state.propertyDocuments),
    selectedPropertyDocumentId: state.selectedPropertyDocumentId,
    seller: { ...state.seller },
  };
}

export function createIncompleteDraft(
  path: "cliente" | "gerente",
  id?: string,
): CreditUse {
  const now = new Date();
  const draftId = id ?? `draft-${now.getTime()}`;
  const catalog = applyVaultToCatalog(cloneCatalog());
  const progress = progressForView("quotas", catalog);
  return {
    id: draftId,
    quotaIds: [],
    conduction: path,
    status: "em_preenchimento",
    protocol: "",
    createdAt: now.toLocaleDateString("pt-BR"),
    currentStepLabel: progress.stepLabel,
    owner: "cliente",
    statusMessage: progress.hint ?? "Você parou nesta etapa.",
    clientActionNeeded: true,
    phase: "preenchimento",
    lastView: "quotas",
    lastUpdatedLabel: formatLastUpdateLabel(now),
    progressDetail: progress.detail,
    progressHint: progress.hint,
    snapshot: snapshotFromState({
      selectedQuotaIds: [],
      documents: catalog,
      selectedDocumentId: catalog[0]?.id ?? null,
      reuseAccepted: null,
      feePaymentMethod: null,
      cardPayment: { ...EMPTY_CARD_PAYMENT },
      feePaymentInstrument: null,
      refundAccount: { ...EMPTY_REFUND_ACCOUNT },
      additionalContactsEnabled: false,
      additionalContacts: [],
      propertyType: null,
      usesFgts: null,
      propertyAddress: { ...EMPTY_PROPERTY_ADDRESS },
      propertyAddressConfirmed: false,
      propertyDocuments: clonePropertyCatalog(),
      selectedPropertyDocumentId: clonePropertyCatalog()[0]?.id ?? null,
      seller: { ...EMPTY_SELLER_DATA },
    }),
    timeline: [
      {
        id: "p1",
        title: "Início",
        description: "Você iniciou o uso do crédito.",
        meta: "Concluído",
        state: "completed",
        owner: "cliente",
      },
      {
        id: "p2",
        title: "Seleção da cota",
        description: "Selecione as cotas para continuar.",
        meta: "Em andamento",
        state: "current",
        owner: "cliente",
      },
      {
        id: "p3",
        title: "Documentação",
        description: "Envio e validação dos documentos.",
        meta: "Próxima etapa",
        state: "upcoming",
        owner: "cliente",
      },
      {
        id: "p4",
        title: "Análise",
        description: "Análise após o envio da solicitação.",
        meta: "Próxima etapa",
        state: "upcoming",
        owner: "caixa",
      },
      {
        id: "p5",
        title: "Conclusão",
        description: "Encerramento do uso do crédito.",
        meta: "Próxima etapa",
        state: "upcoming",
        owner: "caixa",
      },
    ],
  };
}

export function patchDraftProgress(
  use: CreditUse,
  view: ViewId,
  snapshot: CreditUseSnapshot,
): CreditUse {
  const progress = progressForView(view, snapshot.documents);
  const now = new Date();
  const timeline = use.timeline.map((step) => {
    if (step.id === "p2") {
      return {
        ...step,
        state:
          snapshot.selectedQuotaIds.length > 0
            ? ("completed" as const)
            : view === "quotas"
              ? ("current" as const)
              : ("upcoming" as const),
        meta:
          snapshot.selectedQuotaIds.length > 0 ? "Concluído" : step.meta,
      };
    }
    if (step.id === "p3") {
      const { done, total } = docsProgress(snapshot.documents);
      const onDocs = view === "documents";
      const pastDocs =
        [
          "property",
          "inspection",
          "seller",
          "costs",
          "summary",
        ] as ViewId[];
      const completed = pastDocs.includes(view) && done >= total;
      return {
        ...step,
        title: "Documentação",
        description: onDocs
          ? `${done} de ${total} documentos enviados`
          : step.description,
        meta: completed
          ? "Concluído"
          : onDocs
            ? `${done}/${total}`
            : step.meta,
        state: completed
          ? ("completed" as const)
          : onDocs
            ? ("current" as const)
            : snapshot.selectedQuotaIds.length > 0
              ? ("upcoming" as const)
              : ("upcoming" as const),
      };
    }
    return step;
  });

  return {
    ...use,
    quotaIds: snapshot.selectedQuotaIds,
    phase: "preenchimento",
    status: "em_preenchimento",
    clientActionNeeded: true,
    lastView: view,
    lastUpdatedLabel: formatLastUpdateLabel(now),
    currentStepLabel: progress.stepLabel,
    statusMessage: progress.hint ?? "Você parou nesta etapa.",
    progressDetail: progress.detail,
    progressHint: progress.hint,
    snapshot,
    timeline,
  };
}

export function isResumable(use: CreditUse) {
  return (
    use.phase === "preenchimento" ||
    (use.clientActionNeeded && use.status !== "concluido")
  );
}

export function isTrackable(use: CreditUse) {
  return use.phase !== "preenchimento";
}

/** Demo: solicitação incompleta parada em documentação (2/5) */
export function buildDemoIncompleteDraft(): CreditUse {
  const documents = cloneCatalog().map((doc) => {
    if (doc.id === "doc-id") {
      return {
        ...doc,
        status: "approved" as const,
        analyzedAt: "Hoje, 10:20",
        validityStatus: "valid" as const,
        hint: "Documento enviado e confirmado",
      };
    }
    if (doc.id === "doc-address") {
      return {
        ...doc,
        status: "approved" as const,
        analyzedAt: "Hoje, 10:28",
        validityStatus: "valid" as const,
        hint: "Documento enviado e confirmado",
        previousFile: undefined,
      };
    }
    return { ...doc, status: "pending" as const };
  });

  const snapshot = snapshotFromState({
    selectedQuotaIds: ["q3"],
    documents,
    selectedDocumentId: "doc-income",
    reuseAccepted: true,
    feePaymentMethod: null,
    cardPayment: { ...EMPTY_CARD_PAYMENT },
    feePaymentInstrument: null,
    refundAccount: { ...EMPTY_REFUND_ACCOUNT },
    additionalContactsEnabled: false,
    additionalContacts: [],
    propertyType: null,
    usesFgts: null,
    propertyAddress: { ...EMPTY_PROPERTY_ADDRESS },
    propertyAddressConfirmed: false,
    propertyDocuments: clonePropertyCatalog(),
    selectedPropertyDocumentId: clonePropertyCatalog()[0]?.id ?? null,
    seller: { ...EMPTY_SELLER_DATA },
  });

  const base = createIncompleteDraft("cliente", "use-demo-draft");
  return patchDraftProgress(
    {
      ...base,
      protocol: "",
      createdAt: "01/10/2026",
    },
    "documents",
    snapshot,
  );
}
