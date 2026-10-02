import { CUSTOMER_PROFILE } from "./customer";
import { QUOTAS } from "./journey";
import type {
  CardPaymentData,
  FeePaymentInstrument,
  FeePaymentMethod,
  QuotaCategory,
  RefundAccountData,
} from "../types";

export const EMPTY_CARD_PAYMENT: CardPaymentData = {
  holderName: "",
  number: "",
  expiry: "",
  cvv: "",
};

/** Titular da conta de reembolso = consorciado logado. */
export function refundHolderFromCustomer(
  profile = CUSTOMER_PROFILE,
): Pick<RefundAccountData, "holderName" | "document"> {
  return {
    holderName: profile.fullName,
    document: profile.cpf,
  };
}

export const EMPTY_REFUND_ACCOUNT: RefundAccountData = {
  bank: "",
  agency: "",
  account: "",
  accountType: "",
  ...refundHolderFromCustomer(),
};

export function formatCpfCnpj(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function isRefundAccountComplete(account: RefundAccountData) {
  const documentDigits = account.document.replace(/\D/g, "");
  return (
    account.bank.trim().length >= 2 &&
    account.agency.trim().length >= 1 &&
    account.account.trim().length >= 2 &&
    (account.accountType === "corrente" || account.accountType === "poupanca") &&
    account.holderName.trim().length >= 3 &&
    (documentDigits.length === 11 || documentDigits.length === 14)
  );
}

export const FEE_PAYMENT_OPTIONS: {
  id: FeePaymentMethod;
  title: string;
  description: (feesTotalLabel: string) => string;
}[] = [
  {
    id: "carta",
    title: "Desconto na carta de crédito",
    description: (feesTotalLabel) =>
      `As tarifas estimadas (${feesTotalLabel}) são debitadas do valor da carta. Acompanhe o impacto no saldo da operação.`,
  },
  {
    id: "boleto",
    title: "Boleto",
    description: (feesTotalLabel) =>
      `Gere o boleto no valor estimado de ${feesTotalLabel} para pagamento das tarifas, conforme opções do fluxo.`,
  },
  {
    id: "pix",
    title: "Pix",
    description: (feesTotalLabel) =>
      `Pague as tarifas estimadas (${feesTotalLabel}) via Pix, com confirmação rápida do pagamento.`,
  },
  {
    id: "cartao",
    title: "Cartão de crédito",
    description: (feesTotalLabel) =>
      `Pague as tarifas estimadas (${feesTotalLabel}) com cartão de crédito, conforme as condições disponíveis na operação.`,
  },
];

export const FEE_PAYMENT_LABELS: Record<FeePaymentMethod, string> = {
  carta: "Desconto na carta",
  boleto: "Boleto",
  pix: "Pix",
  cartao: "Cartão de crédito",
};

export function feeDebitOnLetterLabel(
  method: FeePaymentMethod | null,
  feesTotalLabel: string,
) {
  if (method === "carta") return feesTotalLabel;
  if (method === "boleto") return "R$ 0,00 (pagamento via boleto)";
  if (method === "pix") return "R$ 0,00 (pagamento via Pix)";
  if (method === "cartao") return "R$ 0,00 (pagamento via cartão)";
  return "Selecione a forma de pagamento";
}

export function parseCreditValue(creditLabel: string) {
  const digits = creditLabel.replace(/[^\d]/g, "");
  if (!digits) return 0;
  return Number(digits) / 100;
}

export function formatBrl(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export interface CostEstimate {
  creditTotal: number;
  creditTotalLabel: string;
  assetValueLabel: string;
  evaluationFee: number;
  registryFee: number;
  analysisFee: number;
  feesTotal: number;
  evaluationFeeLabel: string;
  registryFeeLabel: string;
  analysisFeeLabel: string;
  feesTotalLabel: string;
  debitOnLetterLabel: string;
  category: QuotaCategory | null;
  disclaimer: string;
}

function evaluationFeeFor(category: QuotaCategory | null) {
  switch (category) {
    case "imobiliario":
      return 890;
    case "veiculos_pesados":
      return 620;
    case "veiculos_leves":
      return 380;
    default:
      return 650;
  }
}

function analysisFeeFor(category: QuotaCategory | null) {
  switch (category) {
    case "imobiliario":
      return 350;
    case "veiculos_pesados":
      return 280;
    case "veiculos_leves":
      return 220;
    default:
      return 300;
  }
}

/** Estimativas ilustrativas para o protótipo, a partir do crédito das cotas. */
export function estimateOperationCosts(quotaIds: string[]): CostEstimate {
  const selected = QUOTAS.filter((quota) => quotaIds.includes(quota.id));
  const creditTotal = selected.reduce(
    (sum, quota) => sum + parseCreditValue(quota.credit),
    0,
  );
  const category = selected[0]?.category ?? null;
  const evaluationFee = evaluationFeeFor(category);
  const analysisFee = analysisFeeFor(category);
  const registryFee = Math.max(
    450,
    Math.min(Math.round(creditTotal * 0.0045), 4_500),
  );
  const feesTotal = evaluationFee + registryFee + analysisFee;

  return {
    creditTotal,
    creditTotalLabel: creditTotal > 0 ? formatBrl(creditTotal) : "—",
    assetValueLabel:
      creditTotal > 0 ? formatBrl(creditTotal) : "Informado na solicitação",
    evaluationFee,
    registryFee,
    analysisFee,
    feesTotal,
    evaluationFeeLabel: formatBrl(evaluationFee),
    registryFeeLabel: formatBrl(registryFee),
    analysisFeeLabel: formatBrl(analysisFee),
    feesTotalLabel: formatBrl(feesTotal),
    debitOnLetterLabel: formatBrl(feesTotal),
    category,
    disclaimer:
      "Valores estimados para esta simulação, com base nas cotas selecionadas. O valor final é confirmado antes do envio da solicitação.",
  };
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatCardNumber(value: string) {
  return onlyDigits(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

export function formatCardExpiry(value: string) {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function maskCardNumber(number: string) {
  const digits = onlyDigits(number);
  if (digits.length < 4) return "••••";
  return `•••• •••• •••• ${digits.slice(-4)}`;
}

export function isCardPaymentComplete(card: CardPaymentData) {
  const number = onlyDigits(card.number);
  const expiry = onlyDigits(card.expiry);
  const cvv = onlyDigits(card.cvv);
  return (
    card.holderName.trim().length >= 3 &&
    number.length === 16 &&
    expiry.length === 4 &&
    cvv.length >= 3
  );
}

export function canContinueFeePayment(
  method: FeePaymentMethod | null,
  card: CardPaymentData,
  refundAccount: RefundAccountData,
) {
  if (!method) return false;
  if (method === "cartao" && !isCardPaymentComplete(card)) return false;
  return isRefundAccountComplete(refundAccount);
}

function dueDateLabel(daysAhead = 3) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toLocaleDateString("pt-BR");
}

/** Instrumento de pagamento ilustrativo para o protótipo (Pix / boleto). */
export function createFeePaymentInstrument(
  method: "pix" | "boleto",
  amountLabel: string,
  seed = Date.now(),
): FeePaymentInstrument {
  const dueDate = dueDateLabel(method === "boleto" ? 3 : 1);
  const token = String(seed).slice(-10);

  if (method === "pix") {
    return {
      method: "pix",
      amountLabel,
      dueDate,
      pixCopyPaste: `00020126580014BR.GOV.BCB.PIX0136caixa-consorcio-tarifas-${token}520400005303986540${amountLabel.replace(/[^\d]/g, "")}5802BR5920CAIXA CONSORCIO6009BRASILIA62070503***6304ABCD`,
    };
  }

  const boletoCore = `23793.38128 60000.000003 00000.${token.slice(0, 5)} 1 ${token.padStart(14, "0")}`;
  return {
    method: "boleto",
    amountLabel,
    dueDate,
    boletoLine: boletoCore,
  };
}

export async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}
