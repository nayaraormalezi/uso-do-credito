import { formatBrl, parseCreditValue } from "./costs";
import {
  MANAGER,
  QUOTA_CATEGORY_LABELS,
  QUOTAS,
  quotaLabel,
} from "./journey";
import type { CreditUse, QuotaCategory } from "../types";

export function creditUseQuotas(use: CreditUse) {
  return use.quotaIds
    .map((id) => QUOTAS.find((quota) => quota.id === id))
    .filter((quota): quota is NonNullable<typeof quota> => Boolean(quota));
}

export function creditUseCategory(use: CreditUse): QuotaCategory | null {
  return creditUseQuotas(use)[0]?.category ?? null;
}

export function creditUseCategoryLabel(use: CreditUse) {
  const category = creditUseCategory(use);
  return category ? QUOTA_CATEGORY_LABELS[category] : "Categoria não definida";
}

export function creditUseQuotaLabels(use: CreditUse) {
  const quotas = creditUseQuotas(use);
  if (quotas.length === 0) {
    return use.quotaIds.length > 0
      ? use.quotaIds.map(quotaLabel)
      : ["Nenhuma cota"];
  }
  return quotas.map((quota) => `Cota ${quota.quota}`);
}

export function creditUseQuotaSummary(use: CreditUse) {
  const labels = creditUseQuotaLabels(use);
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return labels.join(" e ");
  return `${labels.slice(0, -1).join(", ")} e ${labels[labels.length - 1]}`;
}

export function creditUseTitle(use: CreditUse) {
  const labels = creditUseQuotaLabels(use);
  if (use.quotaIds.length === 0) return "Nova solicitação";
  if (labels.length === 1) return labels[0];
  return `${labels.length} cotas`;
}

export function creditUseValueLabel(use: CreditUse) {
  const total = creditUseQuotas(use).reduce(
    (sum, quota) => sum + parseCreditValue(quota.credit),
    0,
  );
  return total > 0 ? formatBrl(total) : "—";
}

export function creditUseProtocolLabel(use: CreditUse) {
  return use.protocol?.trim() ? use.protocol : "Ainda sem protocolo";
}

export function creditUseConductionLabel(use: CreditUse) {
  return use.conduction === "gerente"
    ? `Conduzida por ${MANAGER.name}`
    : "Conduzida por você";
}

export interface CreditUseCardMeta {
  title: string;
  categoryLabel: string;
  quotaSummary: string;
  quotaLabels: string[];
  protocolLabel: string;
  createdAt: string;
  creditValueLabel: string;
  conductionLabel: string;
  accompaniedByManager: boolean;
}

export function creditUseCardMeta(use: CreditUse): CreditUseCardMeta {
  return {
    title: creditUseTitle(use),
    categoryLabel: creditUseCategoryLabel(use),
    quotaSummary: creditUseQuotaSummary(use),
    quotaLabels: creditUseQuotaLabels(use),
    protocolLabel: creditUseProtocolLabel(use),
    createdAt: use.createdAt || "—",
    creditValueLabel: creditUseValueLabel(use),
    conductionLabel: creditUseConductionLabel(use),
    accompaniedByManager: use.conduction === "gerente",
  };
}
