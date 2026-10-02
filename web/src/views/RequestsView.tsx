import { creditUseCardMeta } from "../data/creditUseDisplay";
import { isResumable } from "../data/progress";
import { useJourney } from "../context/JourneyContext";
import { RequestCardMeta } from "../components/RequestCardMeta";
import type { CreditUse } from "../types";

function isInProgress(use: CreditUse) {
  return use.status !== "concluido" && use.phase !== "concluido";
}

export function RequestsView() {
  const { state, goTo, openCreditUse, resumeCreditUse } = useJourney();
  const inProgress = state.creditUses.filter(isInProgress);
  const completed = state.creditUses.filter((use) => !isInProgress(use));

  return (
    <div className="main-panel">
      <section className="entry-hero">
        <p className="eyebrow">Acompanhamento</p>
        <h2>Minhas solicitações</h2>
        <p className="muted">
          Consulte o andamento dos usos de crédito que você já iniciou,
          incluindo solicitações em andamento e concluídas.
        </p>
      </section>

      {state.creditUses.length === 0 ? (
        <section className="section-card requests-empty">
          <h3>Nenhuma solicitação ainda</h3>
          <p className="muted">
            Quando você iniciar um uso do crédito, poderá acompanhar o andamento
            por aqui.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => goTo("hub")}
          >
            Iniciar uso do crédito
          </button>
        </section>
      ) : (
        <>
          <p className="requests-summary">
            {inProgress.length > 0 && (
              <span>
                {inProgress.length} em andamento
                {completed.length > 0 ? " · " : ""}
              </span>
            )}
            {completed.length > 0 && (
              <span>
                {completed.length} concluída{completed.length > 1 ? "s" : ""}
              </span>
            )}
          </p>

          {inProgress.length > 0 && (
            <section className="stack">
              <h3 className="section-heading">Em andamento</h3>
              <div className="use-cards">
                {inProgress.map((use) => (
                  <RequestCard
                    key={use.id}
                    use={use}
                    onContinue={() => resumeCreditUse(use.id)}
                    onTrack={() => openCreditUse(use.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section className="stack">
              <h3 className="section-heading">Concluídas</h3>
              <div className="use-cards">
                {completed.map((use) => (
                  <RequestCard
                    key={use.id}
                    use={use}
                    onContinue={() => resumeCreditUse(use.id)}
                    onTrack={() => openCreditUse(use.id)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <div className="footer-actions" style={{ justifyContent: "flex-start" }}>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => goTo("hub")}
        >
          Voltar ao início
        </button>
      </div>
    </div>
  );
}

function RequestCard({
  use,
  onContinue,
  onTrack,
}: {
  use: CreditUse;
  onContinue: () => void;
  onTrack: () => void;
}) {
  const meta = creditUseCardMeta(use);
  const done = use.status === "concluido" || use.phase === "concluido";
  const resumable = isResumable(use);

  return (
    <article className={`use-card${done ? " use-card--done" : ""}`}>
      <div className="stack stack--tight" style={{ flex: 1, minWidth: 280 }}>
        <div className="home-request__top">
          <strong>{meta.categoryLabel}</strong>
          {resumable ? (
            <span className="pill pill--danger">⚠ Ação necessária</span>
          ) : done ? (
            <span className="pill pill--success">✓ Concluída</span>
          ) : (
            <span className="pill pill--info">Em andamento</span>
          )}
        </div>
        <RequestCardMeta use={use} />
        {resumable ? (
          <div className="request-status request-alert">
            <span className="request-status__label">
              {use.currentStepLabel}
              {use.progressDetail ? ` — ${use.progressDetail}` : ""}
            </span>
            <span className="request-status__detail">
              {use.progressHint ?? use.statusMessage}
            </span>
          </div>
        ) : done ? (
          <div className="request-status request-status--done">
            <span className="request-status__label">✓ Solicitação concluída</span>
          </div>
        ) : (
          <div className="request-status">
            <span className="request-status__label">
              {use.currentStepLabel}
            </span>
            <span className="request-status__detail">{use.statusMessage}</span>
          </div>
        )}
      </div>
      <div className="row">
        {resumable && (
          <button type="button" className="btn btn--primary" onClick={onContinue}>
            {use.phase === "preenchimento" ? "Continuar solicitação" : "Continuar"}
          </button>
        )}
        <button type="button" className="btn btn--secondary" onClick={onTrack}>
          {done ? "Ver solicitação" : "Ver acompanhamento"}
        </button>
      </div>
    </article>
  );
}
