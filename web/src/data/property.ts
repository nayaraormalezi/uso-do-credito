import type { DocumentItem, ExtractedField, PropertyAddress } from "../types";
import { REJECTION_COPY } from "./documents";

export const EMPTY_PROPERTY_ADDRESS: PropertyAddress = {
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};

/**
 * Lista dinâmica de documentos do imóvel.
 * Pode ser substituída/configurada conforme a operação.
 * Por ora, apenas a matrícula está definida como exemplo operacional.
 */
export const PROPERTY_DOCUMENT_CATALOG: DocumentItem[] = [
  {
    id: "prop-matricula",
    name: "Matrícula atualizada do imóvel",
    required: true,
    status: "pending",
    requirements: {
      whyNeeded:
        "Documento emitido pelo Cartório de Registro de Imóveis para confirmar a situação registral do imóvel.",
      acceptedTypes: [
        "Matrícula emitida pelo Cartório de Registro de Imóveis",
      ],
      validityLabel: "Emitida nos últimos 30 dias",
      validityAttention:
        "A matrícula precisa ter sido emitida nos últimos 30 dias.",
      formatsLabel: "PDF, JPG ou PNG",
      maxSizeLabel: "Até 10 MB",
      tipsAccepted: [
        "Documento legível e completo",
        "Emitida nos últimos 30 dias",
        "Dados do imóvel visíveis",
      ],
      tipsRejected: [
        "Matrícula com mais de 30 dias",
        "Arquivo ilegível",
        "Documento incompleto",
      ],
    },
  },
];

export function clonePropertyCatalog(): DocumentItem[] {
  return PROPERTY_DOCUMENT_CATALOG.map((doc) => ({
    ...doc,
    requirements: {
      ...doc.requirements,
      acceptedTypes: [...doc.requirements.acceptedTypes],
      tipsAccepted: [...doc.requirements.tipsAccepted],
      tipsRejected: [...doc.requirements.tipsRejected],
    },
    previousFile: doc.previousFile ? { ...doc.previousFile } : undefined,
  }));
}

export const INITIAL_PROPERTY_DOCUMENTS = clonePropertyCatalog();

export function isAddressComplete(address: PropertyAddress) {
  return Boolean(
    address.cep.replace(/\D/g, "").length === 8 &&
      address.street.trim() &&
      address.number.trim() &&
      address.neighborhood.trim() &&
      address.city.trim() &&
      address.state.trim(),
  );
}

export function formatCep(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export async function lookupCep(
  cep: string,
): Promise<Partial<PropertyAddress> | null> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!response.ok) return mockCep(digits);
    const data = (await response.json()) as {
      erro?: boolean;
      logradouro?: string;
      bairro?: string;
      localidade?: string;
      uf?: string;
    };
    if (data.erro) return mockCep(digits);
    return {
      cep: formatCep(digits),
      street: data.logradouro ?? "",
      neighborhood: data.bairro ?? "",
      city: data.localidade ?? "",
      state: data.uf ?? "",
    };
  } catch {
    return mockCep(digits);
  }
}

function mockCep(digits: string): Partial<PropertyAddress> {
  return {
    cep: formatCep(digits),
    street: "Rua das Palmeiras",
    neighborhood: "Jardim América",
    city: "São Paulo",
    state: "SP",
  };
}

export function fieldsForPropertyDocument(docId: string): ExtractedField[] {
  if (docId === "prop-matricula") {
    return [
      {
        id: "registrationNumber",
        label: "Número da matrícula",
        value: "123456",
        confidence: "high",
        editable: true,
      },
      {
        id: "registry",
        label: "Cartório",
        value: "1º Registro de Imóveis",
        confidence: "high",
        editable: true,
      },
      {
        id: "issuedAt",
        label: "Data de emissão",
        value: "15/09/2026",
        confidence: "high",
        editable: true,
      },
      {
        id: "owner",
        label: "Proprietário",
        value: "Maria Silva",
        confidence: "high",
        editable: true,
      },
    ];
  }

  return [
    {
      id: "documentType",
      label: "Tipo identificado",
      value: "Documento do imóvel",
      confidence: "high",
      editable: true,
    },
  ];
}

export function detectPropertyDemoOutcome(
  fileName: string,
): "approve" | "reject_expired" {
  const lower = fileName.toLowerCase();
  if (
    lower.includes("vencid") ||
    lower.includes("expir") ||
    lower.includes("antig")
  ) {
    return "reject_expired";
  }
  return "approve";
}

export function propertyRejectionExpired() {
  return {
    code: "expired" as const,
    ...REJECTION_COPY.expired,
    reason: "A matrícula enviada foi emitida há mais de 30 dias.",
    howToFix: "Envie uma matrícula emitida nos últimos 30 dias.",
  };
}
