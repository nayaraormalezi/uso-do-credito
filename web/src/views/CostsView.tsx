import { useEffect, useMemo } from "react";
import {
  FEE_PAYMENT_OPTIONS,
  canContinueFeePayment,
  estimateOperationCosts,
  feeDebitOnLetterLabel,
  formatCardExpiry,
  formatCardNumber,
  refundHolderFromCustomer,
} from "../data/costs";
import { useJourney } from "../context/JourneyContext";
import { StatusBanner } from "../components/StatusBanner";
import { FieldLabelWithInfo } from "../components/InfoTooltip";

export function CostsView() {
  const {
    state,
    setFeePaymentMethod,
    updateCardPayment,
    updateRefundAccount,
    next,
    back,
    openHelp,
  } = useJourney();
  const holder = refundHolderFromCustomer();
  const costs = useMemo(
    () => estimateOperationCosts(state.selectedQuotaIds),
    [state.selectedQuotaIds],
  );
  const account = {
    ...state.refundAccount,
    holderName: holder.holderName,
    document: holder.document,
  };
  const canContinue = canContinueFeePayment(
    state.feePaymentMethod,
    state.cardPayment,
    account,
  );

  useEffect(() => {
    if (
      state.refundAccount.holderName !== holder.holderName ||
      state.refundAccount.document !== holder.document
    ) {
      updateRefundAccount({});
    }
  }, [
    holder.document,
    holder.holderName,
    state.refundAccount.document,
    state.refundAccount.holderName,
    updateRefundAccount,
  ]);

  return (
    <div className="main-panel">
      <StatusBanner
        label="Custos da operação"
        title="Tarifas, valores e formas de pagamento"
        text="Veja de forma centralizada os valores da operação e como as tarifas podem ser pagas — inclusive com débito na carta, boleto, Pix ou cartão de crédito."
      />

      <section className="section-card">
        <h2>Valores da operação</h2>
        <div className="grid-2">
          <div className="kv">
            <span>Crédito utilizado</span>
            <strong>{costs.creditTotalLabel}</strong>
          </div>
          <div className="kv">
            <span>Valor do bem (referência)</span>
            <strong>{costs.assetValueLabel}</strong>
          </div>
          <div className="kv">
            <span>Tarifas estimadas</span>
            <strong>{costs.feesTotalLabel}</strong>
          </div>
          <div className="kv">
            <span>Possíveis débitos na carta</span>
            <strong>
              {feeDebitOnLetterLabel(
                state.feePaymentMethod,
                costs.feesTotalLabel,
              )}
            </strong>
          </div>
        </div>

        <div className="cost-breakdown">
          <h3>Composição estimada das tarifas</h3>
          <div className="cost-breakdown__rows">
            <div className="cost-breakdown__row">
              <span>Avaliação / vistoria</span>
              <strong>{costs.evaluationFeeLabel}</strong>
            </div>
            <div className="cost-breakdown__row">
              <span>Despesas de registro (estimativa)</span>
              <strong>{costs.registryFeeLabel}</strong>
            </div>
            <div className="cost-breakdown__row">
              <span>Taxa de análise da operação</span>
              <strong>{costs.analysisFeeLabel}</strong>
            </div>
            <div className="cost-breakdown__row cost-breakdown__row--total">
              <span>Total estimado</span>
              <strong>{costs.feesTotalLabel}</strong>
            </div>
          </div>
          <p className="muted cost-breakdown__note">{costs.disclaimer}</p>
        </div>
      </section>

      <section className="section-card">
        <h3>
          <FieldLabelWithInfo
            label="Entenda as regras e tarifas aplicáveis."
            actionLabel="Consultar regras de tarifas →"
            onAction={() =>
              openHelp({ section: "faq", faqTopic: "tarifas" })
            }
          >
            Pagamento das tarifas
          </FieldLabelWithInfo>
        </h3>
        <p className="fee-total">
          <span className="fee-total__label">Valor das tarifas</span>
          <strong className="fee-total__value">{costs.feesTotalLabel}</strong>
        </p>
        <div className="stack">
          {FEE_PAYMENT_OPTIONS.map((option) => (
            <label
              key={option.id}
              className={`choice ${
                state.feePaymentMethod === option.id ? "is-selected" : ""
              }`}
            >
              <input
                type="radio"
                name="fee"
                checked={state.feePaymentMethod === option.id}
                onChange={() => setFeePaymentMethod(option.id)}
              />
              <div>
                <strong>{option.title}</strong>
                <p className="muted">
                  {option.description(costs.feesTotalLabel)}
                </p>
              </div>
            </label>
          ))}
        </div>

        {state.feePaymentMethod === "cartao" && (
          <div className="card-payment">
            <h4>Dados do cartão de crédito</h4>
            <p className="muted">
              Preencha os dados para autorizar o pagamento de{" "}
              {costs.feesTotalLabel}.
            </p>
            <div className="card-payment__form">
              <label className="property-field property-field--wide">
                <span>Nome impresso no cartão</span>
                <input
                  value={state.cardPayment.holderName}
                  onChange={(e) =>
                    updateCardPayment({ holderName: e.target.value })
                  }
                  placeholder="Como está no cartão"
                  autoComplete="cc-name"
                />
              </label>
              <label className="property-field property-field--wide">
                <span>Número do cartão</span>
                <input
                  value={state.cardPayment.number}
                  onChange={(e) =>
                    updateCardPayment({
                      number: formatCardNumber(e.target.value),
                    })
                  }
                  placeholder="0000 0000 0000 0000"
                  inputMode="numeric"
                  autoComplete="cc-number"
                />
              </label>
              <label className="property-field">
                <span>Validade</span>
                <input
                  value={state.cardPayment.expiry}
                  onChange={(e) =>
                    updateCardPayment({
                      expiry: formatCardExpiry(e.target.value),
                    })
                  }
                  placeholder="MM/AA"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                />
              </label>
              <label className="property-field">
                <span>CVV</span>
                <input
                  value={state.cardPayment.cvv}
                  onChange={(e) =>
                    updateCardPayment({
                      cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                    })
                  }
                  placeholder="000"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                />
              </label>
            </div>
          </div>
        )}

        {(state.feePaymentMethod === "pix" ||
          state.feePaymentMethod === "boleto") && (
          <p className="muted fee-payment-hint">
            Na tela de confirmação você verá o{" "}
            {state.feePaymentMethod === "pix" ? "Pix" : "boleto"} para concluir
            o pagamento das tarifas.
          </p>
        )}
      </section>

      <section className="section-card">
        <h3>Sobra de crédito e reembolso</h3>
        <p className="muted">
          Informe a conta em que você prefere receber eventual sobra de crédito
          ou reembolso de despesas.
        </p>

        <div className="card-payment__form refund-account__form">
          <label className="property-field property-field--wide">
            <span>Banco</span>
            <input
              value={account.bank}
              onChange={(e) => updateRefundAccount({ bank: e.target.value })}
              placeholder="Nome ou código do banco"
            />
          </label>
          <label className="property-field">
            <span>Agência</span>
            <input
              value={account.agency}
              onChange={(e) =>
                updateRefundAccount({
                  agency: e.target.value.replace(/[^\d-]/g, "").slice(0, 8),
                })
              }
              placeholder="0000"
              inputMode="numeric"
            />
          </label>
          <label className="property-field">
            <span>Conta</span>
            <input
              value={account.account}
              onChange={(e) =>
                updateRefundAccount({
                  account: e.target.value.replace(/[^\dxX-]/g, "").slice(0, 16),
                })
              }
              placeholder="00000-0"
            />
          </label>
          <label className="property-field property-field--wide">
            <span>Tipo de conta</span>
            <div className="refund-account__types">
              <label
                className={`choice choice--inline ${
                  account.accountType === "corrente" ? "is-selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="account-type"
                  checked={account.accountType === "corrente"}
                  onChange={() =>
                    updateRefundAccount({ accountType: "corrente" })
                  }
                />
                <span>Conta corrente</span>
              </label>
              <label
                className={`choice choice--inline ${
                  account.accountType === "poupanca" ? "is-selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="account-type"
                  checked={account.accountType === "poupanca"}
                  onChange={() =>
                    updateRefundAccount({ accountType: "poupanca" })
                  }
                />
                <span>Poupança</span>
              </label>
            </div>
          </label>
          <label className="property-field property-field--wide">
            <span>Nome do titular</span>
            <input
              value={account.holderName}
              readOnly
              className="is-readonly"
              aria-readonly="true"
            />
          </label>
          <label className="property-field property-field--wide">
            <span>CPF do titular</span>
            <input
              value={account.document}
              readOnly
              className="is-readonly"
              aria-readonly="true"
            />
          </label>
          <p className="muted refund-account__holder-note">
            Nome e CPF são do consorciado e não podem ser alterados nesta etapa.
          </p>
        </div>
      </section>

      <div className="footer-actions">
        <button type="button" className="btn btn--ghost" onClick={back}>
          Voltar
        </button>
        <button
          type="button"
          className="btn btn--primary"
          disabled={!canContinue}
          onClick={next}
        >
          Continuar para resumo
        </button>
      </div>
    </div>
  );
}
