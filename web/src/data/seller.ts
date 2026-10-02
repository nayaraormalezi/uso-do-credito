import type { SellerData } from "../types";
import { formatCep } from "./property";

export const EMPTY_SELLER_DATA: SellerData = {
  type: "pf",
  name: "",
  cpf: "",
  maritalStatus: "",
  phone: "",
  email: "",
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  bank: "",
  agency: "",
  account: "",
  accountType: "",
};

export const MARITAL_STATUS_OPTIONS = [
  "Solteiro(a)",
  "Casado(a)",
  "Divorciado(a)",
  "Viúvo(a)",
  "União estável",
] as const;

export function formatPhone(value: string) {
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

export function isSellerDataComplete(seller: SellerData) {
  const cpfDigits = seller.cpf.replace(/\D/g, "");
  return (
    seller.type === "pf" &&
    seller.name.trim().length >= 3 &&
    cpfDigits.length === 11 &&
    seller.maritalStatus.trim().length > 0 &&
    seller.phone.replace(/\D/g, "").length >= 10 &&
    seller.email.includes("@") &&
    seller.cep.replace(/\D/g, "").length === 8 &&
    seller.street.trim().length >= 2 &&
    seller.number.trim().length >= 1 &&
    seller.neighborhood.trim().length >= 2 &&
    seller.city.trim().length >= 2 &&
    seller.state.trim().length === 2 &&
    seller.bank.trim().length >= 2 &&
    seller.agency.trim().length >= 1 &&
    seller.account.trim().length >= 2 &&
    (seller.accountType === "corrente" || seller.accountType === "poupanca")
  );
}

export { formatCep };
