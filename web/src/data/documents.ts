import type {
  AnalysisStepId,
  DocumentItem,
  ExtractedField,
  RejectionCode,
  RejectionInfo,
} from "../types";

/** Accepted types from Figma C7 · Documentos aceitos */
export const DOCUMENT_CATALOG: DocumentItem[] = [
  {
    id: "doc-id",
    name: "Documento de identificação",
    required: true,
    status: "reusable",
    requirements: {
      whyNeeded:
        "Utilizamos este documento para confirmar sua identidade durante o processo de uso do crédito.",
      acceptedTypes: [
        "RG",
        "CNH",
        "RNE",
        "CIN",
        "Passaporte",
        "Carteira de Identidade Funcional",
        "Carteira de Identidade Profissional",
      ],
      validityLabel: "Sem prazo de validade",
      validityAttention:
        "O documento de identificação não possui prazo de validade para este processo. Envie uma versão legível e completa.",
      formatsLabel: null,
      maxSizeLabel: null,
      tipsAccepted: [
        "Documento legível e completo",
        "Dados visíveis (nome e documento)",
        "Foto sem cortes",
      ],
      tipsRejected: [
        "Foto ilegível ou cortada",
        "Documento incompleto",
        "Dados não visíveis",
      ],
    },
    previousFile: {
      issuedAt: undefined,
      validUntil: undefined,
      validityStatus: "valid",
    },
    identifiedType: "Documento de identificação",
    validityStatus: "valid",
    hint: "Documento ainda válido de solicitação anterior",
  },
  {
    id: "doc-address",
    name: "Comprovante de endereço",
    required: true,
    status: "pending",
    requirements: {
      whyNeeded:
        "Utilizamos este documento para confirmar o endereço informado no cadastro.",
      acceptedTypes: [
        "Contas de consumo (água, luz, gás ou telefone)",
        "Extrato bancário",
        "Correspondência de órgão oficial",
        "Contrato de aluguel",
        "Declaração de residência",
      ],
      validityLabel: "Emitido há no máximo 45 dias",
      validityAttention:
        "O comprovante de endereço precisa ter sido emitido nos últimos 45 dias.",
      formatsLabel: null,
      maxSizeLabel: null,
      tipsAccepted: [
        "Documento legível",
        "Nome e endereço visíveis",
        "Emitido nos últimos 45 dias",
      ],
      tipsRejected: [
        "Documento com mais de 45 dias",
        "Foto ilegível",
        "Documento incompleto ou cortado",
      ],
    },
  },
  {
    id: "doc-income",
    name: "Comprovante de renda",
    required: true,
    status: "pending",
    requirements: {
      whyNeeded:
        "Utilizamos este documento para validar sua capacidade financeira durante o processo de uso do crédito.",
      acceptedTypes: [
        "Holerite / contracheque",
        "Extrato de benefício (INSS)",
        "DECORE",
        "Declaração de Imposto de Renda (IRPF)",
        "Extrato do FGTS",
        "Pró-labore",
        "Comprovante de renda MEI",
        "Comprovante de rendimento de aplicações",
        "Extrato de previdência privada",
      ],
      validityLabel: "Emitido há no máximo 90 dias",
      validityAttention:
        "O comprovante de renda precisa ter sido emitido nos últimos 90 dias.",
      formatsLabel: null,
      maxSizeLabel: null,
      tipsAccepted: [
        "Comprovante legível",
        "Dados do titular visíveis",
        "Emitido nos últimos 90 dias",
      ],
      tipsRejected: [
        "Documento com mais de 90 dias",
        "Arquivo ilegível",
        "Tipo diferente do solicitado",
      ],
    },
  },
  {
    id: "doc-civil",
    name: "Certidão de estado civil",
    required: true,
    status: "pending",
    requirements: {
      whyNeeded:
        "Utilizamos este documento para confirmar informações do seu estado civil no cadastro.",
      acceptedTypes: [
        "Certidão de nascimento",
        "Certidão de casamento",
        "Escritura de união estável (quando aplicável)",
      ],
      validityLabel: "Sem prazo de validade",
      validityAttention:
        "A certidão de estado civil não possui prazo de validade para este processo. Envie o tipo compatível com o cadastro.",
      formatsLabel: null,
      maxSizeLabel: null,
      tipsAccepted: [
        "Certidão legível",
        "Tipo compatível com o cadastro",
        "Dados do consorciado visíveis",
      ],
      tipsRejected: [
        "Documento incorreto para o estado civil",
        "Imagem ilegível",
        "Documento incompleto",
      ],
    },
  },
];

export const ANALYSIS_STEPS: {
  id: AnalysisStepId;
  label: string;
  message: string;
}[] = [
  {
    id: "receiving",
    label: "Recebendo",
    message: "Documento recebido. Preparando a análise automática.",
  },
  {
    id: "reading",
    label: "Lendo",
    message: "Estamos lendo o conteúdo do arquivo enviado.",
  },
  {
    id: "identifying",
    label: "Identificando",
    message: "Identificando o tipo de documento.",
  },
  {
    id: "extracting",
    label: "Extraindo",
    message: "Extraindo as informações relevantes deste documento.",
  },
  {
    id: "validating",
    label: "Validando",
    message:
      "Conferindo se o documento atende aos requisitos necessários.",
  },
];

export const REJECTION_COPY: Record<RejectionCode, Omit<RejectionInfo, "code">> =
  {
    expired: {
      title: "Não conseguimos aprovar este documento",
      reason: "Este documento está fora do período de validade aceito.",
      howToFix:
        "Envie um novo documento emitido dentro do período aceito para este tipo.",
    },
    illegible: {
      title: "Não conseguimos aprovar este documento",
      reason: "Não conseguimos ler algumas informações da imagem.",
      howToFix:
        "Envie uma nova foto ou arquivo com boa iluminação, sem cortes e com o texto legível.",
    },
    incomplete: {
      title: "Não conseguimos aprovar este documento",
      reason: "Está faltando uma página ou informação necessária.",
      howToFix:
        "Envie o documento completo, incluindo todas as páginas ou faces necessárias.",
    },
    wrong_type: {
      title: "Não conseguimos aprovar este documento",
      reason: "Este arquivo não corresponde ao documento solicitado.",
      howToFix:
        "Envie um arquivo que corresponda a um dos tipos aceitos para esta solicitação.",
    },
    divergent_data: {
      title: "Não conseguimos aprovar este documento",
      reason:
        "As informações do documento não correspondem aos dados cadastrados.",
      howToFix:
        "Confira se o documento é do titular correto ou atualize os dados cadastrais antes de reenviar.",
    },
    unidentified: {
      title: "Não conseguimos aprovar este documento",
      reason: "Não conseguimos identificar o tipo de documento.",
      howToFix:
        "Envie novamente um arquivo nítido do tipo solicitado na lista de documentos aceitos.",
    },
    missing_required: {
      title: "Não conseguimos aprovar este documento",
      reason:
        "Não encontramos uma informação necessária para validar este documento.",
      howToFix:
        "Envie um documento em que a informação obrigatória esteja visível e legível.",
    },
    duplicate: {
      title: "Este documento já foi enviado",
      reason: "Identificamos que este arquivo já consta na solicitação.",
      howToFix:
        "Se precisar substituir, envie uma versão atualizada. Caso contrário, continue com os demais documentos.",
    },
  };

function createDocumentPreviewDataUrl(doc: DocumentItem) {
  const title = doc.name.replace(/[<>&]/g, "");
  const type = (doc.identifiedType ?? "Documento").replace(/[<>&]/g, "");
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="860" viewBox="0 0 640 860">
  <rect width="640" height="860" fill="#f0f2f2"/>
  <rect x="48" y="40" width="544" height="780" rx="12" fill="#ffffff" stroke="#e4e8e9"/>
  <rect x="80" y="88" width="180" height="24" rx="6" fill="#005ca9"/>
  <text x="96" y="106" fill="#ffffff" font-family="Arial, sans-serif" font-size="14" font-weight="700">CAIXA</text>
  <text x="80" y="170" fill="#22292e" font-family="Arial, sans-serif" font-size="24" font-weight="700">${title}</text>
  <text x="80" y="210" fill="#525f66" font-family="Arial, sans-serif" font-size="16">${type}</text>
  <rect x="80" y="250" width="420" height="14" rx="7" fill="#e4e8e9"/>
  <rect x="80" y="280" width="360" height="14" rx="7" fill="#e4e8e9"/>
  <rect x="80" y="310" width="390" height="14" rx="7" fill="#e4e8e9"/>
  <rect x="80" y="360" width="200" height="120" rx="10" fill="#e5f2fc" stroke="#c9e2f5"/>
  <text x="100" y="430" fill="#005ca9" font-family="Arial, sans-serif" font-size="14">Leitura OCR disponível</text>
  <rect x="80" y="520" width="440" height="14" rx="7" fill="#e4e8e9"/>
  <rect x="80" y="550" width="300" height="14" rx="7" fill="#e4e8e9"/>
  <rect x="80" y="580" width="360" height="14" rx="7" fill="#e4e8e9"/>
  <text x="80" y="740" fill="#64747a" font-family="Arial, sans-serif" font-size="13">Documento de solicitação anterior</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function buildReuseConfirmItem(
  doc: DocumentItem,
  getFields: (docId: string) => ExtractedField[] = fieldsForDocument,
) {
  const hasFile = Boolean(doc.file?.previewUrl);
  const mime = doc.file?.mimeType ?? "";
  const fileName = doc.file?.name ?? "";
  const previewUrl = hasFile
    ? doc.file!.previewUrl
    : createDocumentPreviewDataUrl(doc);
  const previewKind: "image" | "pdf" | "placeholder" = hasFile
    ? mime.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(fileName)
      ? "image"
      : mime === "application/pdf" || /\.pdf$/i.test(fileName)
        ? "pdf"
        : "image"
    : "image";

  return {
    id: doc.id,
    name: doc.name,
    detail: doc.requirements.validityLabel ?? undefined,
    identifiedType: doc.identifiedType ?? doc.name,
    previewUrl,
    previewKind,
    ocrFields: doc.extractedFields?.length
      ? doc.extractedFields
      : getFields(doc.id),
  };
}

export function fieldsForDocument(docId: string): ExtractedField[] {
  switch (docId) {
    case "doc-address":
      return [
        {
          id: "name",
          label: "Nome",
          value: "Maria Silva Santos",
          confidence: "high",
          editable: true,
        },
        {
          id: "address",
          label: "Endereço",
          value: "Rua Exemplo, 100 — São Paulo/SP",
          confidence: "low",
          editable: true,
        },
        {
          id: "issuedAt",
          label: "Data de emissão",
          value: "15/09/2026",
          confidence: "high",
          editable: true,
        },
      ];
    case "doc-income":
      return [
        {
          id: "name",
          label: "Nome",
          value: "Maria Silva Santos",
          confidence: "high",
          editable: true,
        },
        {
          id: "docType",
          label: "Tipo identificado",
          value: "Holerite / contracheque",
          confidence: "high",
          editable: false,
        },
        {
          id: "issuedAt",
          label: "Data de emissão",
          value: "01/09/2026",
          confidence: "high",
          editable: true,
        },
        {
          id: "amount",
          label: "Valor identificado",
          value: "A configurar / conforme documento",
          confidence: "low",
          editable: true,
        },
      ];
    case "doc-civil":
      return [
        {
          id: "name",
          label: "Nome",
          value: "Maria Silva Santos",
          confidence: "high",
          editable: true,
        },
        {
          id: "docType",
          label: "Tipo identificado",
          value: "Certidão de casamento",
          confidence: "high",
          editable: false,
        },
        {
          id: "registry",
          label: "Cartório / registro",
          value: "Não confirmado completamente",
          confidence: "low",
          editable: true,
        },
      ];
    case "doc-id":
    default:
      return [
        {
          id: "name",
          label: "Nome",
          value: "Maria Silva Santos",
          confidence: "high",
          editable: true,
        },
        {
          id: "documentNumber",
          label: "Número do documento",
          value: "***.***.***-**",
          confidence: "high",
          editable: true,
        },
        {
          id: "issuedAt",
          label: "Data de emissão / validade",
          value: "Conforme documento",
          confidence: "low",
          editable: true,
        },
      ];
  }
}

export function detectDemoOutcome(
  fileName: string,
): "approve_review" | "reject_expired" | "reject_illegible" | "needs_human" {
  const lower = fileName.toLowerCase();
  if (lower.includes("vencido") || lower.includes("expired")) {
    return "reject_expired";
  }
  if (
    lower.includes("escuro") ||
    lower.includes("ilegivel") ||
    lower.includes("illegible") ||
    lower.includes("blur")
  ) {
    return "reject_illegible";
  }
  if (lower.includes("humano") || lower.includes("manual")) {
    return "needs_human";
  }
  return "approve_review";
}

export function cloneCatalog(): DocumentItem[] {
  return DOCUMENT_CATALOG.map((doc) => ({
    ...doc,
    requirements: {
      ...doc.requirements,
      acceptedTypes: [...doc.requirements.acceptedTypes],
      tipsAccepted: [...doc.requirements.tipsAccepted],
      tipsRejected: [...doc.requirements.tipsRejected],
    },
    previousFile: doc.previousFile ? { ...doc.previousFile } : undefined,
    extractedFields: doc.extractedFields
      ? doc.extractedFields.map((f) => ({ ...f }))
      : undefined,
  }));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function nowLabel(): string {
  const d = new Date();
  const date = d.toLocaleDateString("pt-BR");
  const time = d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} · ${time}`;
}
