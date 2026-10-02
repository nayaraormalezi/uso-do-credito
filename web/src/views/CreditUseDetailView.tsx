import { MANAGER, QUOTAS, quotaLabel } from "../data/journey";
import { useJourney } from "../context/JourneyContext";
import { ManagerInfoCard } from "../components/ManagerInfoCard";
import { StatusBanner } from "../components/StatusBanner";
import type { CreditUse } from "../types";

const OWNER_COPY = {
  cliente: "Você precisa realizar uma ação",
  gerente: `${MANAGER.name} está conduzindo esta etapa`,
  caixa: "Estamos processando sua solicitação",
} as const;

function isCompleted(use: CreditUse) {
  return use.status === "concluido" || use.phase === "concluido";
}

function downloadPaymentReceipt(use: CreditUse) {
  const quotas = use.quotaIds
    .map((id) => {
      const q = QUOTAS.find((item) => item.id === id);
      return q
        ? `Grupo ${q.group} · Cota ${q.quota} · ${q.credit}`
        : quotaLabel(id);
    })
    .join("\n");

  const content = [
    "CAIXA CONSÓRCIO",
    "Comprovante de pagamento — Uso do crédito",
    "========================================",
    "",
    `Protocolo: ${use.protocol || "—"}`,
    `Data da conclusão: ${use.progressDetail?.replace("Concluída em ", "") || use.createdAt}`,
    `Status: Solicitação concluída`,
    "",
    "Cotas:",
    quotas || "—",
    "",
    `Situação: ${use.statusMessage}`,
    "",
    "Este documento comprova a conclusão do uso do crédito",
    "e o pagamento do bem associado à(s) cota(s) acima.",
    "",
    "CAIXA Consórcio",
  ].join("\n");

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const protocol = use.protocol || use.id;
  link.href = url;
  link.download = `comprovante-pagamento-${protocol}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function CreditUseDetailView() {
  const { state, goTo, openCreditUse, resumeCreditUse } = useJourney();
  const use =
    state.creditUses.find((item) => item.id === state.activeCreditUseId) ??
    state.creditUses[0];

  if (!use) {
    return (
      <div className="main-panel">
        <p className="muted">Nenhuma solicitação selecionada.</p>
        <button type="button" className="btn btn--primary" onClick={() => goTo("hub")}>
          Voltar ao início
        </button>
      </div>
    );
  }

  const siblings = state.creditUses.filter((item) => item.id !== use.id);
  const completed = isCompleted(use);

  return (
    <div className="main-panel">
      <StatusBanner
        label="Acompanhamento"
        title={
          use.quotaIds.length === 1
            ? quotaLabel(use.quotaIds[0])
            : `Uso do crédito · ${use.quotaIds.length} cotas`
        }
        text={
          completed
            ? "Solicitação concluída. O comprovante de pagamento está disponível para download."
            : use.statusMessage
        }
        variant={
          use.clientActionNeeded
            ? "pending"
            : completed
              ? "success"
              : "waiting"
        }
      />

      <section className="section-card">
        <div className="row row--between">
          <div>
            <h2>Uso do crédito</h2>
            <p className="muted">Protocolo {use.protocol || "—"}</p>
          </div>
          <span
            className={`pill ${
              use.clientActionNeeded
                ? "pill--danger"
                : completed
                  ? "pill--success"
                  : "pill--info"
            }`}
          >
            {completed ? "✓ Concluída" : use.currentStepLabel}
          </span>
        </div>

        <div className="grid-2">
          {use.quotaIds.map((id) => {
            const q = QUOTAS.find((item) => item.id === id);
            return (
              <div className="kv" key={id}>
                <span>{quotaLabel(id)}</span>
                <strong>{q?.credit ?? "—"}</strong>
              </div>
            );
          })}
          <div className="kv">
            <span>Condução</span>
            <strong>
              {use.conduction === "gerente" ? MANAGER.name : "Você"}
            </strong>
          </div>
          <div className="kv">
            <span>Responsável agora</span>
            <strong>
              {completed ? "Processo finalizado" : OWNER_COPY[use.owner]}
            </strong>
          </div>
        </div>

        {use.conduction === "gerente" && (
          <div style={{ marginTop: 16 }}>
            <ManagerInfoCard compact />
          </div>
        )}

        {completed && (
          <div className="stack">
            <div className="callout" style={{ background: "var(--color-success-bg)" }}>
              <p>
                <strong>Solicitação concluída.</strong> O pagamento do bem foi
                realizado. Baixe o comprovante para guardar ou apresentar quando
                precisar.
              </p>
            </div>
            <div className="receipt-card">
              <div className="receipt-card__info">
                <span className="receipt-card__icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 3.75h7.5L19 8.25V20.25a.75.75 0 0 1-.75.75H7.75A.75.75 0 0 1 7 20.25V3.75Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14.5 3.75V8.25H19M9.5 13h5M9.5 16.5h5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div>
                  <strong>Comprovante de pagamento</strong>
                  <p className="muted">
                    Arquivo · Protocolo {use.protocol || use.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => downloadPaymentReceipt(use)}
              >
                Baixar comprovante
              </button>
            </div>
          </div>
        )}

        {!completed && !use.clientActionNeeded && (
          <div className="callout">
            <p>
              <strong>Neste momento, não é necessária nenhuma ação sua.</strong>{" "}
              {use.statusMessage}
            </p>
          </div>
        )}

        {!completed && use.clientActionNeeded && (
          <div className="footer-actions" style={{ justifyContent: "flex-start" }}>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => resumeCreditUse(use.id)}
            >
              Continuar documentação
            </button>
          </div>
        )}
      </section>

      <section className="section-card">
        <h3>Tracking das etapas</h3>
        <ul className="timeline">
          {use.timeline.map((item, index) => (
            <li key={item.id} className={`timeline__item is-${item.state}`}>
              <div className="timeline__rail">
                <div className="timeline__icon">
                  {item.state === "completed"
                    ? "✓"
                    : item.state === "danger"
                      ? "!"
                      : item.state === "current"
                        ? "●"
                        : "○"}
                </div>
                {index < use.timeline.length - 1 && (
                  <div className="timeline__line" />
                )}
              </div>
              <div className="timeline__body">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
                <span>
                  {item.meta} · {OWNER_COPY[item.owner]}
                </span>
                {item.state === "danger" && (
                  <div style={{ marginTop: 8 }}>
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={() => goTo("documents")}
                    >
                      Enviar documento
                    </button>
                  </div>
                )}
                {completed &&
                  index === use.timeline.length - 1 &&
                  item.state === "completed" && (
                    <div style={{ marginTop: 8 }}>
                      <button
                        type="button"
                        className="btn btn--secondary"
                        onClick={() => downloadPaymentReceipt(use)}
                      >
                        Baixar comprovante de pagamento
                      </button>
                    </div>
                  )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {siblings.length > 0 && (
        <section className="section-card">
          <h3>Outras cotas / solicitações</h3>
          <div className="use-cards">
            {siblings.map((item) => (
              <article className="use-card" key={item.id}>
                <div>
                  <strong>
                    {item.quotaIds.length === 1
                      ? quotaLabel(item.quotaIds[0])
                      : `${item.quotaIds.length} cotas`}
                  </strong>
                  <p className="muted">{item.currentStepLabel}</p>
                </div>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => openCreditUse(item.id)}
                >
                  Ver acompanhamento
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="footer-actions">
        <button type="button" className="btn btn--ghost" onClick={() => goTo("hub")}>
          Ir para o início
        </button>
      </div>
    </div>
  );
}
