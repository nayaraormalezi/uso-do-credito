export type ViewId =
  | "hub"
  | "quotas"
  | "managerConfirm"
  | "managerSuccess"
  | "preparation"
  | "personalData"
  | "documents"
  | "property"
  | "inspection"
  | "seller"
  | "costs"
  | "summary"
  | "tracking"
  | "creditUseDetail"
  | "requests"
  | "help"
  | "profile";

export type NotificationType = "action" | "update" | "completed";

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

export interface HelpOpenOptions {
  section?: HelpSection;
  faqTopic?: FaqTopicId | null;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  creditUseId?: string;
  ctaLabel?: string;
  ctaView?: ViewId;
}

export type ConductionPath = "cliente" | "gerente" | null;

export type CreditUseStatus =
  | "em_preenchimento"
  | "solicitacao_enviada"
  | "gerente_iniciou"
  | "em_andamento"
  | "aguardando_cliente"
  | "aguardando_gerente"
  | "aguardando_caixa"
  | "pendencia"
  | "concluido"
  | "atencao";

export type CreditUsePhase = "preenchimento" | "acompanhamento" | "concluido";

export interface PropertyAddress {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export type FeePaymentMethod = "carta" | "boleto" | "pix" | "cartao";

export interface CardPaymentData {
  holderName: string;
  number: string;
  expiry: string;
  cvv: string;
}

export interface FeePaymentInstrument {
  method: "pix" | "boleto";
  amountLabel: string;
  /** Pix copia e cola */
  pixCopyPaste?: string;
  /** Linha digitável do boleto */
  boletoLine?: string;
  dueDate: string;
}

export type BankAccountType = "corrente" | "poupanca";

export interface RefundAccountData {
  bank: string;
  agency: string;
  account: string;
  accountType: BankAccountType | "";
  holderName: string;
  document: string;
}

export interface AdditionalContact {
  id: string;
  relationship: string;
  name: string;
  email: string;
  phone: string;
}

export type SellerType = "pf" | "pj";

export interface SellerData {
  type: SellerType;
  name: string;
  cpf: string;
  maritalStatus: string;
  phone: string;
  email: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  bank: string;
  agency: string;
  account: string;
  accountType: BankAccountType | "";
}

export interface CreditUseSnapshot {
  selectedQuotaIds: string[];
  documents: DocumentItem[];
  selectedDocumentId: string | null;
  reuseAccepted: boolean | null;
  feePaymentMethod: FeePaymentMethod | null;
  cardPayment: CardPaymentData;
  feePaymentInstrument: FeePaymentInstrument | null;
  refundAccount: RefundAccountData;
  additionalContactsEnabled: boolean;
  additionalContacts: AdditionalContact[];
  propertyType: "residencial" | "comercial" | null;
  usesFgts: boolean | null;
  propertyAddress: PropertyAddress;
  propertyAddressConfirmed: boolean;
  propertyDocuments: DocumentItem[];
  selectedPropertyDocumentId: string | null;
  seller: SellerData;
}

export type TimelineStepState =
  | "completed"
  | "current"
  | "upcoming"
  | "danger";

export interface CreditUseTimelineStep {
  id: string;
  title: string;
  description: string;
  meta: string;
  state: TimelineStepState;
  owner: ActionOwner;
}

export interface CreditUse {
  id: string;
  quotaIds: string[];
  conduction: "cliente" | "gerente";
  status: CreditUseStatus;
  protocol: string;
  createdAt: string;
  currentStepLabel: string;
  owner: ActionOwner;
  statusMessage: string;
  clientActionNeeded: boolean;
  timeline: CreditUseTimelineStep[];
  /** preenchimento = solicitação incompleta; acompanhamento = já enviada */
  phase: CreditUsePhase;
  lastView: ViewId;
  lastUpdatedLabel: string;
  progressDetail?: string;
  progressHint?: string;
  snapshot?: CreditUseSnapshot;
}

export type SaveStatus = "idle" | "saving" | "saved";

export interface SaveFeedback {
  title: string;
  message: string;
}

export type StepStatus =
  | "not_started"
  | "current"
  | "completed"
  | "pending"
  | "waiting_caixa"
  | "waiting_manager";

export type DocStatus =
  | "pending"
  | "reusable"
  | "analyzing"
  | "review"
  | "approved"
  | "rejected"
  | "needs_human"
  | "uploaded";

export type RejectionCode =
  | "expired"
  | "illegible"
  | "incomplete"
  | "wrong_type"
  | "divergent_data"
  | "unidentified"
  | "missing_required"
  | "duplicate";

export type AnalysisStepId =
  | "receiving"
  | "reading"
  | "identifying"
  | "extracting"
  | "validating";

export type FieldConfidence = "high" | "low";

export interface ExtractedField {
  id: string;
  label: string;
  value: string;
  confidence: FieldConfidence;
  editable?: boolean;
}

export interface DocumentFile {
  name: string;
  sizeLabel: string;
  mimeType: string;
  previewUrl: string;
  uploadedAt: string;
}

export interface RejectionInfo {
  code: RejectionCode;
  title: string;
  reason: string;
  howToFix: string;
}

export interface DocumentRequirements {
  whyNeeded: string;
  acceptedTypes: string[];
  validityLabel: string | null;
  validityAttention: string | null;
  formatsLabel: string | null;
  maxSizeLabel: string | null;
  tipsAccepted: string[];
  tipsRejected: string[];
}

export interface DocumentItem {
  id: string;
  name: string;
  required: boolean;
  status: DocStatus;
  requirements: DocumentRequirements;
  previousFile?: {
    issuedAt?: string;
    validUntil?: string;
    validityStatus: "valid" | "expiring" | "expired";
  };
  file?: DocumentFile;
  analysisStep?: AnalysisStepId;
  analysisMessage?: string;
  identifiedType?: string;
  extractedFields?: ExtractedField[];
  analyzedAt?: string;
  rejection?: RejectionInfo;
  validityStatus?: "valid" | "expiring" | "expired" | "unknown";
  issuedAt?: string;
  validUntil?: string;
  hint?: string;
}

export type ActionOwner = "cliente" | "caixa" | "gerente";

export interface JourneyStep {
  id: ViewId;
  label: string;
  shortLabel: string;
  mode: "solicitation" | "tracking" | "entry";
  paths?: Array<"cliente" | "gerente" | "all">;
}

export interface ActionItem {
  id: string;
  owner: ActionOwner;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaView?: ViewId;
  deadline?: string;
}

export type QuotaCategory =
  | "imobiliario"
  | "veiculos_leves"
  | "veiculos_pesados";

export interface QuotaOption {
  id: string;
  group: string;
  quota: string;
  credit: string;
  status: string;
  category: QuotaCategory;
}

export interface JourneyState {
  view: ViewId;
  mode: "solicitation" | "tracking";
  isPrivate: boolean;
  customerName: string;
  conductionPath: ConductionPath;
  selectedQuotaIds: string[];
  creditUses: CreditUse[];
  activeCreditUseId: string | null;
  /** Draft em preenchimento ativo (salvar / continuar) */
  activeDraftId: string | null;
  startingNewUse: boolean;
  notifications: AppNotification[];
  notificationsOpen: boolean;
  documents: DocumentItem[];
  selectedDocumentId: string | null;
  previewDocumentId: string | null;
  reuseOffered: boolean;
  reuseAccepted: boolean | null;
  submitted: boolean;
  protocol: string | null;
  feePaymentMethod: FeePaymentMethod | null;
  cardPayment: CardPaymentData;
  feePaymentInstrument: FeePaymentInstrument | null;
  refundAccount: RefundAccountData;
  additionalContactsEnabled: boolean;
  additionalContacts: AdditionalContact[];
  propertyType: "residencial" | "comercial" | null;
  usesFgts: boolean | null;
  propertyAddress: PropertyAddress;
  propertyAddressConfirmed: boolean;
  propertyDocuments: DocumentItem[];
  selectedPropertyDocumentId: string | null;
  inspectionNeeded: boolean;
  sellerIncluded: boolean;
  seller: SellerData;
  saveStatus: SaveStatus;
  lastSavedAt: string | null;
  saveFeedback: SaveFeedback | null;
  exitConfirmOpen: boolean;
  isDirty: boolean;
  helpReturnView: ViewId | null;
  helpSection: HelpSection;
  helpFaqTopic: FaqTopicId | null;
  profileReturnView: ViewId | null;
}
