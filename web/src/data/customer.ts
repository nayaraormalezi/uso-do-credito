import type { AdditionalContact, DocumentItem } from "../types";

export interface CustomerProfile {
  firstName: string;
  fullName: string;
  cpf: string;
  email: string;
  phone: string;
  birthDate: string;
  maritalStatus: string;
  address: {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
  };
  consorcio: {
    clientSince: string;
    segment: string;
    relationship: string;
  };
}

export interface VaultDocument {
  id: string;
  name: string;
  typeLabel: string;
  uploadedAt: string;
  validityLabel: string;
  validityStatus: "valid" | "expiring" | "expired";
  reusable: boolean;
  fileName?: string;
}

const VAULT_STORAGE_KEY = "caixa-uso-credito-vault-v1";
export const VAULT_UPDATED_EVENT = "caixa-vault-updated";

/** Documentos da jornada que devem ir para o cofre ao serem enviados. */
export const VAULT_JOURNEY_DOC_IDS = [
  "doc-address",
  "doc-income",
  "doc-civil",
] as const;

export const JOURNEY_TO_VAULT_ID: Record<string, string> = {
  "doc-id": "vault-id",
  "doc-address": "vault-address",
  "doc-income": "vault-income",
  "doc-civil": "vault-civil",
};

export const RELATIONSHIP_OPTIONS = [
  "Cônjuge / companheiro(a)",
  "Filho(a)",
  "Pai / mãe",
  "Irmão / irmã",
  "Procurador(a)",
  "Outro",
] as const;

export const CUSTOMER_PROFILE: CustomerProfile = {
  firstName: "Maria",
  fullName: "Maria Silva Santos",
  cpf: "123.456.789-00",
  email: "maria.silva@email.com",
  phone: "(11) 98888-0000",
  birthDate: "14/03/1988",
  maritalStatus: "Casado(a)",
  address: {
    street: "Rua das Palmeiras",
    number: "100",
    complement: "Apto 42",
    neighborhood: "Jardim América",
    city: "São Paulo",
    state: "SP",
    cep: "01415-000",
  },
  consorcio: {
    clientSince: "2019",
    segment: "Private",
    relationship: "Consorciada contemplada",
  },
};

export function createEmptyAdditionalContact(): AdditionalContact {
  return {
    id: `contact-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    relationship: "",
    name: "",
    email: "",
    phone: "",
  };
}

/** Documentos já enviados e elegíveis a reaproveitamento. */
export const VAULT_DOCUMENTS: VaultDocument[] = [
  {
    id: "vault-id",
    name: "Documento de identificação",
    typeLabel: "CNH",
    uploadedAt: "12/06/2025",
    validityLabel: "Sem prazo de validade",
    validityStatus: "valid",
    reusable: true,
  },
  {
    id: "vault-civil",
    name: "Certidão de estado civil",
    typeLabel: "Certidão de casamento",
    uploadedAt: "03/02/2024",
    validityLabel: "Sem prazo de validade",
    validityStatus: "valid",
    reusable: true,
  },
  {
    id: "vault-income",
    name: "Comprovante de renda",
    typeLabel: "Holerite",
    uploadedAt: "18/08/2026",
    validityLabel: "Emitido há no máximo 90 dias",
    validityStatus: "valid",
    reusable: true,
  },
  {
    id: "vault-address",
    name: "Comprovante de endereço",
    typeLabel: "Conta de luz",
    uploadedAt: "02/07/2026",
    validityLabel: "Emitido há no máximo 45 dias",
    validityStatus: "expired",
    reusable: false,
  },
];

export function formatCustomerAddress(profile: CustomerProfile = CUSTOMER_PROFILE) {
  const { street, number, complement, neighborhood, city, state, cep } =
    profile.address;
  const line1 = `${street}, ${number}${complement ? ` — ${complement}` : ""}`;
  return `${line1} · ${neighborhood} · ${city}/${state} · CEP ${cep}`;
}

export function reusableVaultDocuments() {
  return loadVaultDocuments().filter((doc) => doc.reusable);
}

function todayLabel() {
  return new Date().toLocaleDateString("pt-BR");
}

function cloneVaultDefaults(): VaultDocument[] {
  return VAULT_DOCUMENTS.map((doc) => ({ ...doc }));
}

export function loadVaultDocuments(): VaultDocument[] {
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    if (!raw) return cloneVaultDefaults();
    const parsed = JSON.parse(raw) as VaultDocument[];
    if (!Array.isArray(parsed)) return cloneVaultDefaults();
    return VAULT_DOCUMENTS.map((base) => {
      const saved = parsed.find((item) => item.id === base.id);
      return saved ? { ...base, ...saved } : { ...base };
    });
  } catch {
    return cloneVaultDefaults();
  }
}

export function persistVaultDocuments(docs: VaultDocument[]) {
  try {
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(docs));
    window.dispatchEvent(new Event(VAULT_UPDATED_EVENT));
  } catch {
    // ignore quota / private mode
  }
}

export function updateVaultDocument(
  vaultId: string,
  patch: Partial<VaultDocument>,
) {
  const next = loadVaultDocuments().map((doc) =>
    doc.id === vaultId ? { ...doc, ...patch } : doc,
  );
  persistVaultDocuments(next);
  return next;
}

function vaultValidityLabel(vaultId: string, fallback: string) {
  if (vaultId === "vault-address") return "Emitido há no máximo 45 dias";
  if (vaultId === "vault-income") return "Emitido há no máximo 90 dias";
  return fallback;
}

/** Persiste comprovante de endereço, renda e certidão de estado civil no cofre. */
export function saveJourneyDocumentToVault(doc: DocumentItem) {
  if (
    !VAULT_JOURNEY_DOC_IDS.includes(
      doc.id as (typeof VAULT_JOURNEY_DOC_IDS)[number],
    )
  ) {
    return;
  }
  if (
    doc.status !== "approved" &&
    doc.status !== "needs_human" &&
    doc.status !== "uploaded"
  ) {
    return;
  }

  const vaultId = JOURNEY_TO_VAULT_ID[doc.id];
  if (!vaultId) return;

  const current = loadVaultDocuments().find((item) => item.id === vaultId);
  updateVaultDocument(vaultId, {
    typeLabel:
      doc.identifiedType ||
      doc.file?.name ||
      current?.typeLabel ||
      doc.name,
    uploadedAt: todayLabel(),
    validityStatus: "valid",
    reusable: true,
    validityLabel: vaultValidityLabel(
      vaultId,
      current?.validityLabel ?? "Sem prazo de validade",
    ),
    fileName: doc.file?.name,
  });
}

/** Aplica documentos válidos do cofre ao catálogo da jornada (reaproveitamento). */
export function applyVaultToCatalog(docs: DocumentItem[]): DocumentItem[] {
  const vault = loadVaultDocuments();
  return docs.map((doc) => {
    const vaultId = JOURNEY_TO_VAULT_ID[doc.id];
    if (!vaultId) return doc;
    const saved = vault.find((item) => item.id === vaultId);
    if (!saved?.reusable) return doc;
    if (
      doc.file ||
      [
        "approved",
        "analyzing",
        "review",
        "rejected",
        "needs_human",
        "uploaded",
      ].includes(doc.status)
    ) {
      return doc;
    }
    return {
      ...doc,
      status: "reusable" as const,
      validityStatus: "valid" as const,
      identifiedType: saved.typeLabel,
      previousFile: {
        issuedAt: undefined,
        validUntil: undefined,
        validityStatus: "valid" as const,
      },
      hint: "Documento ainda válido de envio anterior",
    };
  });
}

export function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}
