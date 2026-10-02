import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ANALYSIS_STEPS,
  REJECTION_COPY,
  cloneCatalog,
  detectDemoOutcome,
  fieldsForDocument,
  formatFileSize,
  nowLabel,
} from "../data/documents";
import {
  CLIENT_ORDER,
  CUSTOMER_NAME,
  INITIAL_DOCUMENTS,
  MANAGER_ORDER,
  QUOTAS,
  buildActions,
  createClientCreditUse,
  createManagerCreditUses,
} from "../data/journey";
import {
  DEMO_CREDIT_USES,
  DEMO_NOTIFICATIONS,
} from "../data/notifications";
import {
  createIncompleteDraft,
  formatSavedAt,
  isFillableView,
  patchDraftProgress,
  snapshotFromState,
} from "../data/progress";
import {
  EMPTY_PROPERTY_ADDRESS,
  INITIAL_PROPERTY_DOCUMENTS,
  clonePropertyCatalog,
  detectPropertyDemoOutcome,
  fieldsForPropertyDocument,
  formatCep,
  isAddressComplete,
  lookupCep,
  propertyRejectionExpired,
} from "../data/property";
import {
  EMPTY_CARD_PAYMENT,
  EMPTY_REFUND_ACCOUNT,
  createFeePaymentInstrument,
  estimateOperationCosts,
  refundHolderFromCustomer,
} from "../data/costs";
import {
  applyVaultToCatalog,
  createEmptyAdditionalContact,
  saveJourneyDocumentToVault,
} from "../data/customer";
import { EMPTY_SELLER_DATA } from "../data/seller";
import type {
  ActionItem,
  AdditionalContact,
  AnalysisStepId,
  CardPaymentData,
  ConductionPath,
  DocumentItem,
  FeePaymentMethod,
  HelpOpenOptions,
  JourneyState,
  PropertyAddress,
  RefundAccountData,
  SellerData,
  ViewId,
} from "../types";

interface JourneyContextValue {
  state: JourneyState;
  actions: ActionItem[];
  goTo: (view: ViewId) => void;
  next: () => void;
  back: () => void;
  choosePath: (path: Exclude<ConductionPath, null>) => void;
  beginNewUse: () => void;
  cancelNewUse: () => void;
  toggleQuota: (id: string) => void;
  confirmManagerRequest: () => void;
  openCreditUse: (id: string) => void;
  resumeCreditUse: (id: string) => void;
  saveAndExit: () => void;
  requestExit: () => void;
  cancelExit: () => void;
  continueFilling: () => void;
  dismissSaveFeedback: () => void;
  openHelp: (options?: HelpOpenOptions) => void;
  closeHelp: () => void;
  openProfile: () => void;
  closeProfile: () => void;
  toggleNotifications: (open?: boolean) => void;
  openNotification: (id: string) => void;
  markAllNotificationsRead: () => void;
  setReuseAccepted: (value: boolean) => void;
  selectDocument: (id: string) => void;
  uploadDocumentFile: (id: string, file: File) => void;
  reuseDocument: (id: string) => void;
  updateExtractedField: (docId: string, fieldId: string, value: string) => void;
  confirmExtractedData: (docId: string) => void;
  openPreview: (docId: string) => void;
  closePreview: () => void;
  setPropertyType: (value: "residencial" | "comercial") => void;
  setUsesFgts: (value: boolean) => void;
  updatePropertyAddress: (patch: Partial<PropertyAddress>) => void;
  lookupPropertyCep: (cep: string) => Promise<void>;
  confirmPropertyAddress: () => void;
  selectPropertyDocument: (id: string) => void;
  uploadPropertyDocumentFile: (id: string, file: File) => void;
  reusePropertyDocument: (id: string) => void;
  updatePropertyExtractedField: (
    docId: string,
    fieldId: string,
    value: string,
  ) => void;
  confirmPropertyExtractedData: (docId: string) => void;
  setFeePaymentMethod: (value: FeePaymentMethod) => void;
  updateCardPayment: (patch: Partial<CardPaymentData>) => void;
  updateRefundAccount: (patch: Partial<RefundAccountData>) => void;
  updateSeller: (patch: Partial<SellerData>) => void;
  setAdditionalContactsEnabled: (value: boolean) => void;
  updateAdditionalContact: (
    id: string,
    patch: Partial<AdditionalContact>,
  ) => void;
  addAdditionalContact: (contact: AdditionalContact) => void;
  removeAdditionalContact: (id: string) => void;
  submitRequest: () => void;
  stepStatus: (id: ViewId) => "completed" | "current" | "upcoming" | "pending";
}

function persistDraftInState(
  prev: JourneyState,
  view: ViewId = prev.view,
): JourneyState {
  if (!prev.activeDraftId || !isFillableView(view)) return prev;
  const snapshot = snapshotFromState(prev);
  const savedAt = formatSavedAt();
  return {
    ...prev,
    isDirty: false,
    saveStatus: "saved",
    lastSavedAt: savedAt,
    creditUses: prev.creditUses.map((use) =>
      use.id === prev.activeDraftId
        ? patchDraftProgress(use, view, snapshot)
        : use,
    ),
  };
}

const JourneyContext = createContext<JourneyContextValue | null>(null);

const initialState: JourneyState = {
  view: "hub",
  mode: "solicitation",
  isPrivate: true,
  customerName: CUSTOMER_NAME,
  conductionPath: null,
  selectedQuotaIds: [],
  creditUses: DEMO_CREDIT_USES,
  activeCreditUseId: null,
  activeDraftId: null,
  startingNewUse: false,
  notifications: DEMO_NOTIFICATIONS,
  notificationsOpen: false,
  documents: applyVaultToCatalog(INITIAL_DOCUMENTS),
  selectedDocumentId: INITIAL_DOCUMENTS[0]?.id ?? null,
  previewDocumentId: null,
  reuseOffered: true,
  reuseAccepted: null,
  submitted: false,
  protocol: null,
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
  propertyDocuments: INITIAL_PROPERTY_DOCUMENTS,
  selectedPropertyDocumentId: INITIAL_PROPERTY_DOCUMENTS[0]?.id ?? null,
  inspectionNeeded: true,
  sellerIncluded: true,
  seller: { ...EMPTY_SELLER_DATA },
  saveStatus: "idle",
  lastSavedAt: null,
  saveFeedback: null,
  exitConfirmOpen: false,
  isDirty: false,
  helpReturnView: null,
  helpSection: "home",
  helpFaqTopic: null,
  profileReturnView: null,
};

function patchDoc(
  docs: DocumentItem[],
  id: string,
  patch: Partial<DocumentItem>,
): DocumentItem[] {
  return docs.map((doc) => (doc.id === id ? { ...doc, ...patch } : doc));
}

function applyReuse(
  docs: DocumentItem[],
  accepted: boolean | null,
): DocumentItem[] {
  if (accepted !== true) return docs;
  return docs.map((doc) =>
    doc.status === "reusable"
      ? {
          ...doc,
          status: "approved",
          analyzedAt: nowLabel(),
          hint: "Documento reaproveitado após confirmação de validade e dados",
          validityStatus: "valid",
        }
      : doc,
  );
}

function revokePreview(doc?: DocumentItem) {
  if (doc?.file?.previewUrl?.startsWith("blob:")) {
    URL.revokeObjectURL(doc.file.previewUrl);
  }
}

function orderFor(path: ConductionPath) {
  return path === "gerente" ? MANAGER_ORDER : CLIENT_ORDER;
}

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<JourneyState>(initialState);
  const analysisTimers = useRef<Record<string, number[]>>({});
  const autosaveTimer = useRef<number | null>(null);

  const clearAnalysisTimers = useCallback((id: string) => {
    const timers = analysisTimers.current[id] ?? [];
    timers.forEach((t) => window.clearTimeout(t));
    analysisTimers.current[id] = [];
  }, []);

  const goTo = (view: ViewId) => {
    setState((prev) => {
      const withDraft =
        prev.activeDraftId && isFillableView(prev.view)
          ? persistDraftInState(prev, prev.view)
          : prev;
      const trackingViews = [
        "tracking",
        "creditUseDetail",
        "documents",
        "requests",
      ];
      const staysInTracking =
        withDraft.mode === "tracking" && trackingViews.includes(view);
      return {
        ...withDraft,
        view,
        mode:
          view === "tracking" ||
          view === "creditUseDetail" ||
          view === "requests" ||
          staysInTracking
            ? "tracking"
            : "solicitation",
        notificationsOpen: false,
        exitConfirmOpen: false,
        selectedDocumentId:
          view === "documents"
            ? withDraft.selectedDocumentId ??
              withDraft.documents[0]?.id ??
              null
            : withDraft.selectedDocumentId,
      };
    });
  };

  const choosePath = (path: Exclude<ConductionPath, null>) => {
    setState((prev) => {
      const draft = createIncompleteDraft(path);
      const catalog = applyVaultToCatalog(cloneCatalog());
      return {
        ...prev,
        conductionPath: path,
        startingNewUse: false,
        selectedQuotaIds: [],
        submitted: false,
        protocol: null,
        view: "quotas",
        mode: "solicitation",
        documents: catalog,
        selectedDocumentId: catalog[0]?.id ?? null,
        reuseAccepted: null,
        reuseOffered: true,
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
        activeDraftId: draft.id,
        activeCreditUseId: draft.id,
        creditUses: [draft, ...prev.creditUses],
        saveStatus: "saved",
        lastSavedAt: formatSavedAt(),
        isDirty: false,
        saveFeedback: null,
        exitConfirmOpen: false,
      };
    });
  };

  const beginNewUse = () => {
    setState((prev) => ({
      ...prev,
      view: "hub",
      mode: "solicitation",
      conductionPath: null,
      startingNewUse: true,
      selectedQuotaIds: [],
      submitted: false,
      protocol: null,
      activeCreditUseId: null,
      activeDraftId: null,
    }));
  };

  const cancelNewUse = () => {
    setState((prev) => ({
      ...prev,
      startingNewUse: false,
      view: "hub",
      mode: "solicitation",
      conductionPath: null,
    }));
  };

  const next = () => {
    setState((prev) => {
      const order = orderFor(prev.conductionPath);
      if (prev.view === "hub") return { ...prev, view: "quotas" };
      const idx = order.indexOf(prev.view as (typeof order)[number]);
      if (idx === -1) return prev;
      if (idx === order.length - 1) return prev;
      const nextView = order[idx + 1];
      const saved = persistDraftInState(prev, prev.view);
      return {
        ...saved,
        view: nextView,
        mode: "solicitation",
        isDirty: true,
      };
    });
  };

  const saveAndExit = useCallback(() => {
    setState((prev) => {
      let nextState = prev.activeDraftId
        ? persistDraftInState(prev, prev.view)
        : prev;

      if (!prev.activeDraftId && prev.activeCreditUseId && isFillableView(prev.view)) {
        const savedAt = formatSavedAt();
        nextState = {
          ...nextState,
          lastSavedAt: savedAt,
          saveStatus: "saved",
          isDirty: false,
          creditUses: nextState.creditUses.map((use) =>
            use.id === prev.activeCreditUseId
              ? {
                  ...use,
                  lastView: prev.view,
                  lastUpdatedLabel: `Hoje, ${savedAt}`,
                  currentStepLabel: use.currentStepLabel,
                  clientActionNeeded: true,
                }
              : use,
          ),
        };
      }

      return {
        ...nextState,
        view: "hub",
        mode: "solicitation",
        activeDraftId: null,
        activeCreditUseId: null,
        conductionPath: null,
        exitConfirmOpen: false,
        notificationsOpen: false,
        saveFeedback: {
          title: "Seu progresso foi salvo.",
          message: "Você pode continuar de onde parou quando quiser.",
        },
      };
    });
  }, []);

  const requestExit = useCallback(() => {
    setState((prev) => {
      if (!prev.activeDraftId || !isFillableView(prev.view)) {
        return {
          ...prev,
          view: "hub",
          mode: "solicitation",
          conductionPath: null,
          activeDraftId: null,
          exitConfirmOpen: false,
        };
      }
      if (prev.isDirty) {
        return { ...prev, exitConfirmOpen: true };
      }
      const saved = persistDraftInState(prev, prev.view);
      return {
        ...saved,
        view: "hub",
        mode: "solicitation",
        activeDraftId: null,
        activeCreditUseId: null,
        conductionPath: null,
        exitConfirmOpen: false,
        saveFeedback: {
          title: "Seu progresso foi salvo.",
          message: "Você pode continuar de onde parou quando quiser.",
        },
      };
    });
  }, []);

  const cancelExit = useCallback(() => {
    setState((prev) => ({
      ...prev,
      view: "hub",
      mode: "solicitation",
      activeDraftId: null,
      activeCreditUseId: null,
      conductionPath: null,
      exitConfirmOpen: false,
      isDirty: false,
      saveStatus: "idle",
      saveFeedback: null,
    }));
  }, []);

  const continueFilling = useCallback(() => {
    setState((prev) => ({ ...prev, exitConfirmOpen: false }));
  }, []);

  const dismissSaveFeedback = useCallback(() => {
    setState((prev) => ({ ...prev, saveFeedback: null }));
  }, []);

  const openHelp = useCallback((options?: HelpOpenOptions) => {
    setState((prev) => {
      const section = options?.section ?? "home";
      const faqTopic =
        options?.faqTopic === undefined
          ? section === "faq"
            ? prev.helpFaqTopic
            : null
          : options.faqTopic;
      return {
        ...prev,
        view: "help",
        helpReturnView:
          prev.view === "help" ? prev.helpReturnView : prev.view,
        helpSection: section,
        helpFaqTopic: faqTopic,
        notificationsOpen: false,
      };
    });
  }, []);

  const closeHelp = useCallback(() => {
    setState((prev) => ({
      ...prev,
      view: prev.helpReturnView ?? "hub",
      helpReturnView: null,
      helpSection: "home",
      helpFaqTopic: null,
    }));
  }, []);

  const openProfile = useCallback(() => {
    setState((prev) => ({
      ...prev,
      view: "profile",
      profileReturnView:
        prev.view === "profile" ? prev.profileReturnView : prev.view,
      notificationsOpen: false,
    }));
  }, []);

  const closeProfile = useCallback(() => {
    setState((prev) => ({
      ...prev,
      view: prev.profileReturnView ?? "hub",
      profileReturnView: null,
    }));
  }, []);

  const resumeCreditUse = useCallback((id: string) => {
    setState((prev) => {
      const use = prev.creditUses.find((item) => item.id === id);
      if (!use) return prev;

      if (use.phase === "preenchimento" && use.snapshot) {
        const snap = use.snapshot;
        return {
          ...prev,
          view: use.lastView,
          mode: "solicitation",
          conductionPath: use.conduction,
          selectedQuotaIds: snap.selectedQuotaIds,
          documents: snap.documents,
          selectedDocumentId:
            snap.selectedDocumentId ?? snap.documents[0]?.id ?? null,
          reuseAccepted: snap.reuseAccepted,
          feePaymentMethod: snap.feePaymentMethod,
          cardPayment: snap.cardPayment
            ? { ...snap.cardPayment }
            : { ...EMPTY_CARD_PAYMENT },
          feePaymentInstrument: snap.feePaymentInstrument
            ? { ...snap.feePaymentInstrument }
            : null,
          refundAccount: {
            ...(snap.refundAccount
              ? { ...snap.refundAccount }
              : { ...EMPTY_REFUND_ACCOUNT }),
            ...refundHolderFromCustomer(),
          },
          additionalContactsEnabled: snap.additionalContactsEnabled ?? false,
          additionalContacts: snap.additionalContacts?.length
            ? snap.additionalContacts.map((contact) => ({ ...contact }))
            : [],
          propertyType: snap.propertyType,
          usesFgts: snap.usesFgts,
          propertyAddress: snap.propertyAddress
            ? { ...snap.propertyAddress }
            : { ...EMPTY_PROPERTY_ADDRESS },
          propertyAddressConfirmed: snap.propertyAddressConfirmed ?? false,
          propertyDocuments: snap.propertyDocuments?.length
            ? snap.propertyDocuments
            : clonePropertyCatalog(),
          selectedPropertyDocumentId:
            snap.selectedPropertyDocumentId ??
            snap.propertyDocuments?.[0]?.id ??
            clonePropertyCatalog()[0]?.id ??
            null,
          seller: snap.seller
            ? { ...snap.seller }
            : { ...EMPTY_SELLER_DATA },
          activeDraftId: use.id,
          activeCreditUseId: use.id,
          submitted: false,
          protocol: use.protocol || null,
          saveFeedback: null,
          exitConfirmOpen: false,
          notificationsOpen: false,
          saveStatus: "saved",
          lastSavedAt: formatSavedAt(),
          isDirty: false,
        };
      }

      // Solicitação enviada com ação do cliente → etapa exata
      return {
        ...prev,
        activeCreditUseId: id,
        activeDraftId: null,
        view: use.lastView === "hub" ? "documents" : use.lastView,
        mode:
          use.lastView === "documents" || use.clientActionNeeded
            ? "solicitation"
            : "tracking",
        protocol: use.protocol || prev.protocol,
        conductionPath: use.conduction,
        selectedQuotaIds: use.quotaIds,
        submitted: true,
        notificationsOpen: false,
        saveFeedback: null,
        documents:
          use.clientActionNeeded
            ? prev.documents.map((doc) =>
                doc.id === "doc-address"
                  ? {
                      ...doc,
                      status: "rejected" as const,
                      rejection: {
                        code: "expired" as const,
                        ...REJECTION_COPY.expired,
                      },
                      hint: "Envie o comprovante de endereço para continuar",
                    }
                  : doc,
              )
            : prev.documents,
        selectedDocumentId: use.clientActionNeeded
          ? "doc-address"
          : prev.selectedDocumentId,
      };
    });
  }, []);

  const back = () => {
    setState((prev) => {
      if (prev.view === "help") {
        return {
          ...prev,
          view: prev.helpReturnView ?? "hub",
          helpReturnView: null,
          helpSection: "home",
          helpFaqTopic: null,
        };
      }
      if (prev.view === "profile") {
        return {
          ...prev,
          view: prev.profileReturnView ?? "hub",
          profileReturnView: null,
        };
      }
      if (prev.view === "quotas") {
        if (prev.activeDraftId) {
          return { ...prev, exitConfirmOpen: true };
        }
        return {
          ...prev,
          view: "hub",
          conductionPath: null,
          selectedQuotaIds: [],
        };
      }
      if (
        prev.view === "creditUseDetail" ||
        prev.view === "tracking" ||
        prev.view === "requests"
      ) {
        return {
          ...prev,
          view: prev.view === "creditUseDetail" ? "requests" : "hub",
          mode: prev.view === "creditUseDetail" ? "tracking" : "solicitation",
          activeCreditUseId: null,
        };
      }
      if (prev.view === "managerSuccess") {
        return { ...prev, view: "hub", mode: "solicitation" };
      }
      const order = orderFor(prev.conductionPath);
      const idx = order.indexOf(prev.view as (typeof order)[number]);
      if (idx <= 0) {
        if (prev.activeDraftId) {
          return { ...prev, exitConfirmOpen: true };
        }
        return { ...prev, view: "hub", conductionPath: null };
      }
      const saved = persistDraftInState(prev, prev.view);
      return { ...saved, view: order[idx - 1] };
    });
  };

  // Autosave enquanto o cliente preenche
  useEffect(() => {
    if (!state.activeDraftId || !isFillableView(state.view)) return;

    if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current);

    setState((prev) =>
      prev.activeDraftId
        ? { ...prev, isDirty: true, saveStatus: "saving" }
        : prev,
    );

    autosaveTimer.current = window.setTimeout(() => {
      setState((prev) => {
        if (!prev.activeDraftId || !isFillableView(prev.view)) return prev;
        return persistDraftInState(prev, prev.view);
      });
    }, 900);

    return () => {
      if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current);
    };
  }, [
    state.activeDraftId,
    state.view,
    state.selectedQuotaIds,
    state.documents,
    state.reuseAccepted,
    state.feePaymentMethod,
    state.propertyType,
    state.usesFgts,
    state.selectedDocumentId,
    state.propertyAddress,
    state.propertyAddressConfirmed,
    state.propertyDocuments,
    state.selectedPropertyDocumentId,
  ]);

  const toggleQuota = (id: string) => {
    setState((prev) => {
      const exists = prev.selectedQuotaIds.includes(id);
      if (exists) {
        return {
          ...prev,
          selectedQuotaIds: prev.selectedQuotaIds.filter((q) => q !== id),
        };
      }

      const target = QUOTAS.find((q) => q.id === id);
      if (!target) return prev;

      // Multi-select only within the same category
      if (prev.selectedQuotaIds.length > 0) {
        const selectedCategory = QUOTAS.find(
          (q) => q.id === prev.selectedQuotaIds[0],
        )?.category;
        if (selectedCategory && target.category !== selectedCategory) {
          return prev;
        }
      }

      return {
        ...prev,
        selectedQuotaIds: [...prev.selectedQuotaIds, id],
      };
    });
  };

  const confirmManagerRequest = () => {
    setState((prev) => {
      const uses = createManagerCreditUses(prev.selectedQuotaIds);
      const withoutDraft = prev.activeDraftId
        ? prev.creditUses.filter((use) => use.id !== prev.activeDraftId)
        : prev.creditUses;
      return {
        ...prev,
        creditUses: [...uses, ...withoutDraft],
        view: "managerSuccess",
        mode: "solicitation",
        activeCreditUseId: uses[0]?.id ?? null,
        activeDraftId: null,
        saveStatus: "idle",
        isDirty: false,
      };
    });
  };

  const openCreditUse = (id: string, options?: { preferAction?: boolean }) => {
    setState((prev) => {
      const use = prev.creditUses.find((item) => item.id === id);
      const goToAction =
        options?.preferAction &&
        use?.clientActionNeeded &&
        use.conduction === "cliente";
      return {
        ...prev,
        activeCreditUseId: id,
        view: goToAction ? "documents" : "creditUseDetail",
        mode: "tracking",
        notificationsOpen: false,
        protocol: use?.protocol ?? prev.protocol,
        conductionPath: use?.conduction ?? prev.conductionPath,
        selectedQuotaIds: use?.quotaIds ?? prev.selectedQuotaIds,
        submitted: use?.conduction === "cliente",
        documents:
          use?.conduction === "cliente" && use.clientActionNeeded
            ? prev.documents.map((doc) =>
                doc.id === "doc-address"
                  ? {
                      ...doc,
                      status: "rejected" as const,
                      rejection: {
                        code: "expired" as const,
                        ...REJECTION_COPY.expired,
                      },
                      hint: "Envie o comprovante de endereço para continuar",
                    }
                  : doc,
              )
            : prev.documents,
        selectedDocumentId:
          use?.conduction === "cliente" && use.clientActionNeeded
            ? "doc-address"
            : prev.selectedDocumentId,
      };
    });
  };

  const toggleNotifications = (open?: boolean) => {
    setState((prev) => ({
      ...prev,
      notificationsOpen:
        typeof open === "boolean" ? open : !prev.notificationsOpen,
    }));
  };

  const markAllNotificationsRead = () => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((item) => ({
        ...item,
        read: true,
      })),
    }));
  };

  const openNotification = (id: string) => {
    setState((prev) => {
      const notification = prev.notifications.find((item) => item.id === id);
      if (!notification) return { ...prev, notificationsOpen: false };

      const use = notification.creditUseId
        ? prev.creditUses.find((item) => item.id === notification.creditUseId)
        : null;

      const preferDocuments =
        notification.type === "action" &&
        use?.clientActionNeeded &&
        use.conduction === "cliente";

      const nextView =
        notification.ctaView ??
        (preferDocuments ? "documents" : "creditUseDetail");

      return {
        ...prev,
        notifications: prev.notifications.map((item) =>
          item.id === id ? { ...item, read: true } : item,
        ),
        notificationsOpen: false,
        activeCreditUseId: notification.creditUseId ?? prev.activeCreditUseId,
        view: nextView,
        mode:
          nextView === "hub" || nextView === "quotas"
            ? "solicitation"
            : "tracking",
        protocol: use?.protocol ?? prev.protocol,
        conductionPath: use?.conduction ?? prev.conductionPath,
        selectedQuotaIds: use?.quotaIds ?? prev.selectedQuotaIds,
        submitted: use?.conduction === "cliente" ? true : prev.submitted,
        documents:
          preferDocuments
            ? prev.documents.map((doc) =>
                doc.id === "doc-address"
                  ? {
                      ...doc,
                      status: "rejected" as const,
                      rejection: {
                        code: "expired" as const,
                        ...REJECTION_COPY.expired,
                      },
                      hint: "Envie o comprovante de endereço para continuar",
                    }
                  : doc,
              )
            : prev.documents,
        selectedDocumentId: preferDocuments
          ? "doc-address"
          : prev.selectedDocumentId,
      };
    });
  };

  const setReuseAccepted = (value: boolean) => {
    setState((prev) => ({
      ...prev,
      reuseAccepted: value,
      documents: applyReuse(prev.documents, value),
    }));
  };

  const selectDocument = (id: string) => {
    setState((prev) => ({ ...prev, selectedDocumentId: id }));
  };

  const runAnalysisPipeline = useCallback(
    (docId: string, fileName: string) => {
      clearAnalysisTimers(docId);
      const outcome = detectDemoOutcome(fileName);
      const timers: number[] = [];

      ANALYSIS_STEPS.forEach((step, index) => {
        const timer = window.setTimeout(() => {
          setState((prev) => ({
            ...prev,
            documents: patchDoc(prev.documents, docId, {
              status: "analyzing",
              analysisStep: step.id,
              analysisMessage: step.message,
            }),
          }));
        }, index * 700);
        timers.push(timer);
      });

      const finishTimer = window.setTimeout(() => {
        setState((prev) => {
          const current = prev.documents.find((d) => d.id === docId);
          if (!current?.file) return prev;

          if (outcome === "reject_expired") {
            return {
              ...prev,
              documents: patchDoc(prev.documents, docId, {
                status: "rejected",
                analysisStep: undefined,
                analysisMessage: undefined,
                analyzedAt: nowLabel(),
                identifiedType: current.name,
                rejection: { code: "expired", ...REJECTION_COPY.expired },
                extractedFields: undefined,
              }),
            };
          }

          if (outcome === "reject_illegible") {
            return {
              ...prev,
              documents: patchDoc(prev.documents, docId, {
                status: "rejected",
                analysisStep: undefined,
                analysisMessage: undefined,
                analyzedAt: nowLabel(),
                identifiedType: undefined,
                rejection: { code: "illegible", ...REJECTION_COPY.illegible },
                extractedFields: undefined,
              }),
            };
          }

          if (outcome === "needs_human") {
            const nextDocs = patchDoc(prev.documents, docId, {
              status: "needs_human",
              analysisStep: undefined,
              analysisMessage:
                "Documento recebido. Uma análise adicional será necessária.",
              analyzedAt: nowLabel(),
              identifiedType: current.name,
              extractedFields: fieldsForDocument(docId),
              rejection: undefined,
            });
            const saved = nextDocs.find((d) => d.id === docId);
            if (saved) saveJourneyDocumentToVault(saved);
            return {
              ...prev,
              documents: nextDocs,
            };
          }

          return {
            ...prev,
            documents: patchDoc(prev.documents, docId, {
              status: "review",
              analysisStep: undefined,
              analysisMessage:
                "Encontramos estas informações no documento. Confira antes de continuar.",
              analyzedAt: nowLabel(),
              identifiedType: current.name,
              extractedFields: fieldsForDocument(docId),
              rejection: undefined,
              issuedAt:
                fieldsForDocument(docId).find((f) => f.id === "issuedAt")
                  ?.value ?? undefined,
            }),
          };
        });
      }, ANALYSIS_STEPS.length * 700 + 200);
      timers.push(finishTimer);
      analysisTimers.current[docId] = timers;
    },
    [clearAnalysisTimers],
  );

  const uploadDocumentFile = (id: string, file: File) => {
    clearAnalysisTimers(id);
    const previewUrl = URL.createObjectURL(file);

    setState((prev) => {
      const previous = prev.documents.find((d) => d.id === id);
      revokePreview(previous);
      return {
        ...prev,
        selectedDocumentId: id,
        documents: patchDoc(prev.documents, id, {
          status: "analyzing",
          analysisStep: "receiving" as AnalysisStepId,
          analysisMessage: ANALYSIS_STEPS[0].message,
          rejection: undefined,
          extractedFields: undefined,
          analyzedAt: undefined,
          identifiedType: undefined,
          file: {
            name: file.name,
            sizeLabel: formatFileSize(file.size),
            mimeType: file.type || "application/octet-stream",
            previewUrl,
            uploadedAt: nowLabel(),
          },
        }),
      };
    });

    runAnalysisPipeline(id, file.name);
  };

  const reuseDocument = (id: string) => {
    setState((prev) => ({
      ...prev,
      selectedDocumentId: id,
      documents: patchDoc(prev.documents, id, {
        status: "approved",
        analyzedAt: nowLabel(),
        validityStatus: "valid",
        hint: "Documento reaproveitado após confirmação de validade e dados",
        identifiedType: prev.documents.find((d) => d.id === id)?.name,
        rejection: undefined,
      }),
    }));
  };

  const updateExtractedField = (
    docId: string,
    fieldId: string,
    value: string,
  ) => {
    setState((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) => {
        if (doc.id !== docId || !doc.extractedFields) return doc;
        return {
          ...doc,
          extractedFields: doc.extractedFields.map((field) =>
            field.id === fieldId
              ? { ...field, value, confidence: "high" as const }
              : field,
          ),
        };
      }),
    }));
  };

  const confirmExtractedData = (docId: string) => {
    setState((prev) => {
      const documents = patchDoc(prev.documents, docId, {
        status: "approved",
        analysisMessage: "Documento analisado automaticamente e confirmado.",
        analyzedAt: nowLabel(),
        validityStatus: "valid",
        rejection: undefined,
        hint: "Documento enviado e salvo para reaproveitamento",
      });
      const saved = documents.find((d) => d.id === docId);
      if (saved) saveJourneyDocumentToVault(saved);
      return { ...prev, documents };
    });
  };

  const openPreview = (docId: string) => {
    setState((prev) => ({ ...prev, previewDocumentId: docId }));
  };

  const closePreview = () => {
    setState((prev) => ({ ...prev, previewDocumentId: null }));
  };

  const setPropertyType = (value: "residencial" | "comercial") => {
    setState((prev) => ({ ...prev, propertyType: value }));
  };

  const setUsesFgts = (value: boolean) => {
    setState((prev) => ({ ...prev, usesFgts: value }));
  };

  const updatePropertyAddress = (patch: Partial<PropertyAddress>) => {
    setState((prev) => ({
      ...prev,
      propertyAddressConfirmed: false,
      propertyAddress: {
        ...prev.propertyAddress,
        ...patch,
        cep:
          patch.cep !== undefined
            ? formatCep(patch.cep)
            : prev.propertyAddress.cep,
      },
    }));
  };

  const lookupPropertyCep = async (cep: string) => {
    const result = await lookupCep(cep);
    if (!result) return;
    setState((prev) => ({
      ...prev,
      propertyAddressConfirmed: false,
      propertyAddress: {
        ...prev.propertyAddress,
        ...result,
        number: prev.propertyAddress.number,
        complement: prev.propertyAddress.complement,
      },
    }));
  };

  const confirmPropertyAddress = () => {
    setState((prev) => {
      if (!isAddressComplete(prev.propertyAddress)) return prev;
      return { ...prev, propertyAddressConfirmed: true };
    });
  };

  const selectPropertyDocument = (id: string) => {
    setState((prev) => ({ ...prev, selectedPropertyDocumentId: id }));
  };

  const runPropertyAnalysisPipeline = useCallback(
    (docId: string, fileName: string) => {
      clearAnalysisTimers(docId);
      const outcome = detectPropertyDemoOutcome(fileName);
      const timers: number[] = [];

      ANALYSIS_STEPS.forEach((step, index) => {
        const timer = window.setTimeout(() => {
          setState((prev) => ({
            ...prev,
            propertyDocuments: patchDoc(prev.propertyDocuments, docId, {
              status: "analyzing",
              analysisStep: step.id,
              analysisMessage: step.message,
            }),
          }));
        }, index * 700);
        timers.push(timer);
      });

      const finishTimer = window.setTimeout(() => {
        setState((prev) => {
          const current = prev.propertyDocuments.find((d) => d.id === docId);
          if (!current?.file) return prev;

          if (outcome === "reject_expired") {
            return {
              ...prev,
              propertyDocuments: patchDoc(prev.propertyDocuments, docId, {
                status: "rejected",
                analysisStep: undefined,
                analysisMessage: undefined,
                analyzedAt: nowLabel(),
                identifiedType: current.name,
                rejection: propertyRejectionExpired(),
                extractedFields: undefined,
              }),
            };
          }

          return {
            ...prev,
            propertyDocuments: patchDoc(prev.propertyDocuments, docId, {
              status: "review",
              analysisStep: undefined,
              analysisMessage:
                "Identificamos estas informações no documento. Confira antes de continuar.",
              analyzedAt: nowLabel(),
              identifiedType: current.name,
              extractedFields: fieldsForPropertyDocument(docId),
              rejection: undefined,
            }),
          };
        });
      }, ANALYSIS_STEPS.length * 700 + 200);
      timers.push(finishTimer);
      analysisTimers.current[docId] = timers;
    },
    [clearAnalysisTimers],
  );

  const uploadPropertyDocumentFile = (id: string, file: File) => {
    clearAnalysisTimers(id);
    const previewUrl = URL.createObjectURL(file);

    setState((prev) => {
      const previous = prev.propertyDocuments.find((d) => d.id === id);
      revokePreview(previous);
      return {
        ...prev,
        selectedPropertyDocumentId: id,
        propertyDocuments: patchDoc(prev.propertyDocuments, id, {
          status: "analyzing",
          analysisStep: "receiving" as AnalysisStepId,
          analysisMessage: ANALYSIS_STEPS[0].message,
          rejection: undefined,
          extractedFields: undefined,
          analyzedAt: undefined,
          identifiedType: undefined,
          file: {
            name: file.name,
            sizeLabel: formatFileSize(file.size),
            mimeType: file.type || "application/octet-stream",
            previewUrl,
            uploadedAt: nowLabel(),
          },
        }),
      };
    });

    runPropertyAnalysisPipeline(id, file.name);
  };

  const reusePropertyDocument = (id: string) => {
    setState((prev) => ({
      ...prev,
      selectedPropertyDocumentId: id,
      propertyDocuments: patchDoc(prev.propertyDocuments, id, {
        status: "approved",
        analyzedAt: nowLabel(),
        validityStatus: "valid",
        hint: "Documento reaproveitado após confirmação de validade e dados",
        identifiedType: prev.propertyDocuments.find((d) => d.id === id)?.name,
        rejection: undefined,
      }),
    }));
  };

  const updatePropertyExtractedField = (
    docId: string,
    fieldId: string,
    value: string,
  ) => {
    setState((prev) => ({
      ...prev,
      propertyDocuments: prev.propertyDocuments.map((doc) => {
        if (doc.id !== docId || !doc.extractedFields) return doc;
        return {
          ...doc,
          extractedFields: doc.extractedFields.map((field) =>
            field.id === fieldId
              ? { ...field, value, confidence: "high" as const }
              : field,
          ),
        };
      }),
    }));
  };

  const confirmPropertyExtractedData = (docId: string) => {
    setState((prev) => ({
      ...prev,
      propertyDocuments: patchDoc(prev.propertyDocuments, docId, {
        status: "approved",
        analysisMessage: "Documento analisado automaticamente e confirmado.",
        analyzedAt: nowLabel(),
        validityStatus: "valid",
        rejection: undefined,
      }),
    }));
  };

  const setFeePaymentMethod = (value: FeePaymentMethod) => {
    setState((prev) => {
      const amountLabel = estimateOperationCosts(prev.selectedQuotaIds)
        .feesTotalLabel;
      const instrument =
        value === "pix" || value === "boleto"
          ? createFeePaymentInstrument(value, amountLabel)
          : null;
      return {
        ...prev,
        feePaymentMethod: value,
        feePaymentInstrument: instrument,
        cardPayment:
          value === "cartao" ? prev.cardPayment : { ...EMPTY_CARD_PAYMENT },
      };
    });
  };

  const updateCardPayment = (patch: Partial<CardPaymentData>) => {
    setState((prev) => ({
      ...prev,
      cardPayment: { ...prev.cardPayment, ...patch },
    }));
  };

  const updateRefundAccount = (patch: Partial<RefundAccountData>) => {
    const holder = refundHolderFromCustomer();
    setState((prev) => ({
      ...prev,
      refundAccount: {
        ...prev.refundAccount,
        ...patch,
        // Titular e CPF sempre do consorciado logado
        holderName: holder.holderName,
        document: holder.document,
      },
    }));
  };

  const updateSeller = (patch: Partial<SellerData>) => {
    setState((prev) => ({
      ...prev,
      seller: { ...prev.seller, ...patch },
      isDirty: true,
    }));
  };

  const setAdditionalContactsEnabled = (value: boolean) => {
    setState((prev) => ({
      ...prev,
      additionalContactsEnabled: value,
      additionalContacts: value
        ? prev.additionalContacts.length > 0
          ? prev.additionalContacts
          : [createEmptyAdditionalContact()]
        : [],
    }));
  };

  const updateAdditionalContact = (
    id: string,
    patch: Partial<AdditionalContact>,
  ) => {
    setState((prev) => ({
      ...prev,
      additionalContacts: prev.additionalContacts.map((contact) =>
        contact.id === id ? { ...contact, ...patch } : contact,
      ),
    }));
  };

  const addAdditionalContact = (contact: AdditionalContact) => {
    setState((prev) => ({
      ...prev,
      additionalContactsEnabled: true,
      additionalContacts: [...prev.additionalContacts, contact],
    }));
  };

  const removeAdditionalContact = (id: string) => {
    setState((prev) => {
      const next = prev.additionalContacts.filter(
        (contact) => contact.id !== id,
      );
      return {
        ...prev,
        additionalContacts:
          next.length > 0 ? next : [createEmptyAdditionalContact()],
      };
    });
  };

  const submitRequest = () => {
    setState((prev) => {
      const protocol = `2024${Date.now().toString().slice(-14)}`;
      const use = createClientCreditUse(prev.selectedQuotaIds, protocol);
      const withoutDraft = prev.activeDraftId
        ? prev.creditUses.filter((item) => item.id !== prev.activeDraftId)
        : prev.creditUses;
      return {
        ...prev,
        submitted: true,
        protocol,
        creditUses: [use, ...withoutDraft],
        activeCreditUseId: use.id,
        activeDraftId: null,
        view: "creditUseDetail",
        mode: "tracking",
        saveStatus: "idle",
        isDirty: false,
        documents: prev.documents.map((doc) =>
          doc.id === "doc-income"
            ? {
                ...doc,
                status: "rejected",
                rejection: { code: "expired", ...REJECTION_COPY.expired },
                hint: "Pendência após análise: envie uma versão dentro do período aceito",
              }
            : doc.status === "uploaded" || doc.status === "review"
              ? { ...doc, status: "needs_human" }
              : doc,
        ),
      };
    });
  };

  const stepStatus = (id: ViewId) => {
    const activeView =
      state.view === "help"
        ? (state.helpReturnView ?? "hub")
        : state.view === "profile"
          ? (state.profileReturnView ?? "hub")
          : state.view;

    if (id === "hub") return activeView === "hub" ? "current" : "completed";
    if (id === "requests" || id === "tracking" || id === "creditUseDetail") {
      if (
        activeView === "requests" ||
        activeView === "tracking" ||
        activeView === "creditUseDetail"
      ) {
        return "current";
      }
      if (state.creditUses.length > 0 || state.submitted) return "completed";
      return "upcoming";
    }

    const order = orderFor(state.conductionPath);
    const currentIdx = order.indexOf(activeView as (typeof order)[number]);
    const stepIdx = order.indexOf(id as (typeof order)[number]);

    if (
      activeView === "tracking" ||
      activeView === "creditUseDetail" ||
      activeView === "requests" ||
      state.submitted
    ) {
      if (stepIdx >= 0) return "completed";
      return "upcoming";
    }
    if (stepIdx === -1) return "upcoming";
    if (activeView === "hub" || state.conductionPath === null) return "upcoming";
    if (stepIdx < currentIdx) return "completed";
    if (stepIdx === currentIdx) {
      if (
        id === "documents" &&
        state.documents.some((d) =>
          ["pending", "rejected", "review", "reusable"].includes(d.status),
        )
      ) {
        return "pending";
      }
      return "current";
    }
    return "upcoming";
  };

  const activeUse =
    state.creditUses.find((u) => u.id === state.activeCreditUseId) ?? null;

  const actions = useMemo(
    () =>
      buildActions({
        view: state.view,
        submitted: state.submitted,
        documents: state.documents,
        feePaymentMethod: state.feePaymentMethod,
        conductionPath: state.conductionPath,
        activeUse,
      }),
    [state, activeUse],
  );

  const value: JourneyContextValue = {
    state,
    actions,
    goTo,
    next,
    back,
    choosePath,
    beginNewUse,
    cancelNewUse,
    toggleQuota,
    confirmManagerRequest,
    openCreditUse,
    resumeCreditUse,
    saveAndExit,
    requestExit,
    cancelExit,
    continueFilling,
    dismissSaveFeedback,
    openHelp,
    closeHelp,
    openProfile,
    closeProfile,
    toggleNotifications,
    openNotification,
    markAllNotificationsRead,
    setReuseAccepted,
    selectDocument,
    uploadDocumentFile,
    reuseDocument,
    updateExtractedField,
    confirmExtractedData,
    openPreview,
    closePreview,
    setPropertyType,
    setUsesFgts,
    updatePropertyAddress,
    lookupPropertyCep,
    confirmPropertyAddress,
    selectPropertyDocument,
    uploadPropertyDocumentFile,
    reusePropertyDocument,
    updatePropertyExtractedField,
    confirmPropertyExtractedData,
    setFeePaymentMethod,
    updateCardPayment,
    updateRefundAccount,
    updateSeller,
    setAdditionalContactsEnabled,
    updateAdditionalContact,
    addAdditionalContact,
    removeAdditionalContact,
    submitRequest,
    stepStatus,
  };

  return (
    <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>
  );
}

export function useJourney() {
  const ctx = useContext(JourneyContext);
  if (!ctx) throw new Error("useJourney must be used within JourneyProvider");
  return ctx;
}
