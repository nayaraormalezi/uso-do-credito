import { useMemo, useState } from "react";
import {
  FEE_PAYMENT_LABELS,
  copyText,
  estimateOperationCosts,
  maskCardNumber,
  refundHolderFromCustomer,
} from "../data/costs";
import { QUOTAS } from "../data/journey";
import { useJourney } from "../context/JourneyContext";
import { StatusBanner } from "../components/StatusBanner";

export function SummaryView() {
  const { state, submitRequest, back } = useJourney();
  const refundHolder = refundHolderFromCustomer();
  const selected = QUOTAS.filter((q) => state.selectedQuotaIds.includes(q.id));
  const costs = useMemo(
    () => estimateOperationCosts(state.selectedQuotaIds),
    [state.selectedQuotaIds],
  );
  const [copied, setCopied] = useState<"pix" | "boleto" | null>(null);
  const instrument = state.feePaymentInstrument;

  const handleCopy = async (kind: "pix" | "boleto", value: string) => {
    const ok = await copyText(value);
    if (ok) {
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 2000);
    }
  };

  return (
    <div className="main-panel">
      <StatusBanner
        label="Resumo e envio"
        title="Revise antes de enviar"
        text="Confira as informações principais da aquisição. Ao enviar, o protocolo é gerado e você passa a acompanhar o processo."
      />

      <section className="section-card">
        <h2>Resumo · Aquisição</h2>
        <div className="grid-2">
          <div className="kv">
            <span>Utilização</span>
            <strong>Aquisição de imóvel</strong>
          </div>
          <div className="kv">
            <span>Tipo do imóvel</span>
            <strong>
              {state.propertyType === "comercial" ? "Comercial" : "Residencial"}
            </strong>
          </div>
          <div className="kv">
            <span>FGTS</span>
            <strong>{state.usesFgts ? "Sim" : "Não"}</strong>
          </div>
          <div className="kv">
            <span>Pagamento das tarifas</span>
            <strong>
              {state.feePaymentMethod
                ? FEE_PAYMENT_LABELS[state.feePaymentMethod]
                : "—"}
            </strong>
          </div>
          <div className="kv">
            <span>Valor das tarifas</span>
            <strong>{costs.feesTotalLabel}</strong>
          </div>
        </div>
      </section>

      {(state.feePaymentMethod === "pix" ||
        state.feePaymentMethod === "boleto") &&
        instrument && (
          <section className="section-card payment-action">
            <h3>
              {instrument.method === "pix"
                ? "Pagamento via Pix"
                : "Pagamento via boleto"}
            </h3>
            <p className="muted">
              Conclua o pagamento de{" "}
              <strong>{instrument.amountLabel}</strong> antes ou ao enviar a
              solicitação. Vencimento: {instrument.dueDate}.
            </p>

            {instrument.method === "pix" && instrument.pixCopyPaste && (
              <div className="payment-action__box">
                <div className="payment-action__qr" aria-hidden="true">
                  <span>QR Pix</span>
                </div>
                <div className="payment-action__details">
                  <span className="payment-action__label">Pix copia e cola</span>
                  <code className="payment-action__code">
                    {instrument.pixCopyPaste}
                  </code>
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() =>
                      handleCopy("pix", instrument.pixCopyPaste ?? "")
                    }
                  >
                    {copied === "pix" ? "Código copiado" : "Copiar código Pix"}
                  </button>
                </div>
              </div>
            )}

            {instrument.method === "boleto" && instrument.boletoLine && (
              <div className="payment-action__box">
                <div className="payment-action__barcode" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <div className="payment-action__details">
                  <span className="payment-action__label">Linha digitável</span>
                  <code className="payment-action__code">
                    {instrument.boletoLine}
                  </code>
                  <div className="row">
                    <button
                      type="button"
                      className="btn btn--secondary"
                      onClick={() =>
                        handleCopy("boleto", instrument.boletoLine ?? "")
                      }
                    >
                      {copied === "boleto"
                        ? "Linha copiada"
                        : "Copiar linha digitável"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

      {state.feePaymentMethod === "cartao" && (
        <section className="section-card">
          <h3>Cartão de crédito</h3>
          <div className="grid-2">
            <div className="kv">
              <span>Titular</span>
              <strong>{state.cardPayment.holderName || "—"}</strong>
            </div>
            <div className="kv">
              <span>Cartão</span>
              <strong>{maskCardNumber(state.cardPayment.number)}</strong>
            </div>
            <div className="kv">
              <span>Validade</span>
              <strong>{state.cardPayment.expiry || "—"}</strong>
            </div>
            <div className="kv">
              <span>Valor a cobrar</span>
              <strong>{costs.feesTotalLabel}</strong>
            </div>
          </div>
        </section>
      )}

      {state.feePaymentMethod === "carta" && (
        <section className="section-card">
          <h3>Desconto na carta</h3>
          <p className="muted">
            O valor de <strong>{costs.feesTotalLabel}</strong> será debitado da
            carta de crédito selecionada nesta solicitação.
          </p>
        </section>
      )}

      {state.sellerIncluded && (
        <section className="section-card">
          <h3>Vendedor</h3>
          <div className="grid-2">
            <div className="kv">
              <span>Nome</span>
              <strong>{state.seller.name || "—"}</strong>
            </div>
            <div className="kv">
              <span>CPF</span>
              <strong>{state.seller.cpf || "—"}</strong>
            </div>
            <div className="kv">
              <span>Estado civil</span>
              <strong>{state.seller.maritalStatus || "—"}</strong>
            </div>
            <div className="kv">
              <span>Banco / conta</span>
              <strong>
                {state.seller.bank
                  ? `${state.seller.bank} · Ag. ${state.seller.agency} · Conta ${state.seller.account}`
                  : "—"}
              </strong>
            </div>
          </div>
        </section>
      )}

      <section className="section-card">
        <h3>Conta para sobra ou reembolso</h3>
        <div className="grid-2">
          <div className="kv">
            <span>Banco</span>
            <strong>{state.refundAccount.bank || "—"}</strong>
          </div>
          <div className="kv">
            <span>Tipo de conta</span>
            <strong>
              {state.refundAccount.accountType === "poupanca"
                ? "Poupança"
                : state.refundAccount.accountType === "corrente"
                  ? "Conta corrente"
                  : "—"}
            </strong>
          </div>
          <div className="kv">
            <span>Agência</span>
            <strong>{state.refundAccount.agency || "—"}</strong>
          </div>
          <div className="kv">
            <span>Conta</span>
            <strong>{state.refundAccount.account || "—"}</strong>
          </div>
          <div className="kv">
            <span>Titular</span>
            <strong>{refundHolder.holderName}</strong>
          </div>
          <div className="kv">
            <span>CPF</span>
            <strong>{refundHolder.document}</strong>
          </div>
        </div>
      </section>

      <section className="section-card">
        <h3>Cotas selecionadas</h3>
        {selected.length === 0 ? (
          <p className="muted">Nenhuma cota selecionada.</p>
        ) : (
          selected.map((quota) => (
            <div className="list-item" key={quota.id}>
              <div>
                <strong>
                  Grupo {quota.group} · Cota {quota.quota}
                </strong>
                <p className="muted">{quota.credit}</p>
              </div>
              <span className="pill pill--success">{quota.status}</span>
            </div>
          ))
        )}
      </section>

      <section className="section-card">
        <h3>Documentos</h3>
        {state.documents.map((doc) => (
          <div className="list-item" key={doc.id}>
            <span>{doc.name}</span>
            <span className="pill pill--info">{doc.status}</span>
          </div>
        ))}
      </section>

      <div className="footer-actions">
        <button type="button" className="btn btn--ghost" onClick={back}>
          Voltar
        </button>
        <button type="button" className="btn btn--primary" onClick={submitRequest}>
          Enviar solicitação
        </button>
      </div>
    </div>
  );
}
