import { creditUseCardMeta, creditUseTitle } from "../data/creditUseDisplay";
import { MANAGER } from "../data/journey";
import { isResumable } from "../data/progress";
import { useJourney } from "../context/JourneyContext";
import { RequestCardMeta } from "../components/RequestCardMeta";
import { SaveFeedbackBanner } from "../components/SaveProgressBar";
import type { CreditUse } from "../types";

const HOME_CARD_LIMIT = 3;

function isDone(use: CreditUse) {
  return use.status === "concluido" || use.phase === "concluido";
}

function isInProgress(use: CreditUse) {
  return !isDone(use);
}

function sortForHome(uses: CreditUse[]) {
  return [...uses].sort((a, b) => {
    const rank = (use: CreditUse) => {
      if (isResumable(use)) return 0;
      if (isInProgress(use)) return 1;
      return 2;
    };
    return rank(a) - rank(b);
  });
}

export function HubView() {
  const { state, choosePath, goTo, openCreditUse, resumeCreditUse } =
    useJourney();
  const uses = state.creditUses;
  const resumable = [...uses.filter(isResumable)].sort((a, b) => {
    const rank = (use: CreditUse) => {
      if (use.phase === "preenchimento") return 0;
      if (use.clientActionNeeded) return 1;
      return 2;
    };
    return rank(a) - rank(b);
  });
  const inProgress = uses.filter(isInProgress);
  const completed = uses.filter(isDone);
  const primaryContinue = resumable[0] ?? null;
  const accompanyPool = primaryContinue
    ? uses.filter((use) => use.id !== primaryContinue.id)
    : uses;
  const homeCards = sortForHome(accompanyPool).slice(0, HOME_CARD_LIMIT);

  return (
    <div className="home-panel">
      <SaveFeedbackBanner />

      {primaryContinue && (
        <div
          className="continue-banner"
          role="status"
          aria-labelledby="continue-title"
        >
          <span className="continue-banner__icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5v3l3-3-3-3v3a7 7 0 1 0 7 7h-2a5 5 0 1 1-5-5Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <div className="continue-banner__body">
            <p id="continue-title" className="continue-banner__title">
              Continue de onde parou
            </p>
            <p className="continue-banner__meta">
              {creditUseTitle(primaryContinue)}
              {" · "}
              {creditUseCardMeta(primaryContinue).categoryLabel}
              {" · "}
              {primaryContinue.currentStepLabel}
              {primaryContinue.progressDetail
                ? ` · ${primaryContinue.progressDetail}`
                : ""}
            </p>
            {primaryContinue.progressHint && (
              <p className="continue-banner__hint">
                {primaryContinue.progressHint}
              </p>
            )}
          </div>
          <div className="continue-banner__actions">
            {resumable.length > 1 && (
              <button
                type="button"
                className="btn-link"
                onClick={() => goTo("requests")}
              >
                Ver solicitações
              </button>
            )}
            <button
              type="button"
              className="btn btn--primary btn--compact"
              onClick={() => resumeCreditUse(primaryContinue.id)}
            >
              Continuar →
            </button>
          </div>
        </div>
      )}

      <section className="home-welcome">
        <p className="home-welcome__greeting">Olá, {state.customerName}!</p>
        <h2>
          {resumable.length > 0
            ? "Como você deseja iniciar um novo uso do crédito?"
            : "Como você deseja iniciar o uso do seu crédito?"}
        </h2>
        <p className="muted">
          Você pode fazer pelo digital ou pedir que seu gerente conduza o
          processo. Em ambos os casos, você acompanha tudo por aqui.
        </p>
      </section>

      <div className="path-grid">
        <article className="path-card path-card--digital">
          <div className="path-card__icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="4"
                width="18"
                height="12"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M8 20h8M12 16v4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h3>Quero fazer pelo digital</h3>
          <p className="muted">
            Você conduz o processo com orientações em cada etapa, de forma
            simples e segura.
          </p>
          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={() => choosePath("cliente")}
          >
            Começar pelo digital →
          </button>
        </article>

        <article className="path-card">
          <div className="path-card__icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle
                cx="9"
                cy="8"
                r="3"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <circle
                cx="16"
                cy="9"
                r="2.5"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M3.5 18c.8-2.4 2.8-3.8 5.5-3.8s4.7 1.4 5.5 3.8M13 14.4c1.5-.5 3.2-.3 4.6.8.9.7 1.5 1.7 1.9 2.8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h3>Quero que meu gerente faça por mim</h3>
          <p className="muted">
            <strong>{MANAGER.name}</strong> conduz o processo e você acompanha
            cada etapa por aqui.
          </p>
          <p className="path-card__manager muted">{MANAGER.role}</p>
          <button
            type="button"
            className="btn btn--secondary btn--block"
            onClick={() => choosePath("gerente")}
          >
            Solicitar a {MANAGER.name.split(" ")[0]} →
          </button>
        </article>
      </div>

      <section className="accompany-block" aria-labelledby="accompany-title">
        <div className="accompany-block__header">
          <div className="accompany-block__intro">
            <h2 id="accompany-title">Acompanhe suas solicitações</h2>
            {uses.length === 0 ? (
              <p className="muted">
                Quando você iniciar um uso do crédito, poderá acompanhar o
                andamento por aqui.
              </p>
            ) : (
              <>
                <p className="muted">
                  Consulte o andamento dos usos de crédito que você já iniciou,
                  incluindo solicitações em andamento e concluídas.
                </p>
                <p className="requests-summary">
                  {inProgress.length > 0 && (
                    <span>
                      {inProgress.length} em andamento
                      {completed.length > 0 ? " · " : ""}
                    </span>
                  )}
                  {completed.length > 0 && (
                    <span>
                      {completed.length} concluída
                      {completed.length > 1 ? "s" : ""}
                    </span>
                  )}
                </p>
              </>
            )}
          </div>
          {uses.length > 0 && (
            <button
              type="button"
              className="btn-link"
              onClick={() => goTo("requests")}
            >
              Ver todas as solicitações →
            </button>
          )}
        </div>

        {uses.length > 0 && (
          <div className="home-request-grid">
            {homeCards.map((use) => {
              const meta = creditUseCardMeta(use);
              const resumableUse = isResumable(use);
              const done = isDone(use);
              return (
                <article
                  key={use.id}
                  className={`home-request${done ? " home-request--done" : ""}`}
                >
                  <div className="home-request__top">
                    <div>
                      <strong>{meta.categoryLabel}</strong>
                    </div>
                    {resumableUse ? (
                      <span className="pill pill--danger">⚠ Ação necessária</span>
                    ) : done ? (
                      <span className="pill pill--success">✓ Concluída</span>
                    ) : (
                      <span className="pill pill--info">Em andamento</span>
                    )}
                  </div>

                  <RequestCardMeta use={use} />

                  <div
                    className={`home-request__body${
                      resumableUse ? " request-alert" : ""
                    }`}
                  >
                    <p className="home-request__step">
                      {done ? "Processo finalizado" : use.currentStepLabel}
                      {use.progressDetail && !done
                        ? ` — ${use.progressDetail}`
                        : ""}
                    </p>
                    <p className="muted">
                      {done
                        ? use.statusMessage
                        : use.progressHint ?? use.statusMessage}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn--secondary btn--block"
                    onClick={() =>
                      resumableUse
                        ? resumeCreditUse(use.id)
                        : openCreditUse(use.id)
                    }
                  >
                    {resumableUse
                      ? "Continuar solicitação →"
                      : done
                        ? "Ver detalhes →"
                        : "Ver acompanhamento →"}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
