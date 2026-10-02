import { useEffect, useId, useState } from "react";
import {
  ONBOARDING_STEPS,
  markOnboardingSeen,
  type OnboardingStep,
} from "../data/onboarding";
import { useJourney } from "../context/JourneyContext";

export function OnboardingTour({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { goTo, openHelp } = useJourney();
  const [index, setIndex] = useState(0);
  const titleId = useId();
  const step = ONBOARDING_STEPS[index];
  const total = ONBOARDING_STEPS.length;
  const isFirst = index === 0;
  const isLast = index === total - 1;

  useEffect(() => {
    if (open) setIndex(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        markOnboardingSeen();
        onClose();
      }
      if (event.key === "ArrowRight") {
        setIndex((value) => {
          if (value >= total - 1) {
            markOnboardingSeen();
            onClose();
            return value;
          }
          return value + 1;
        });
      }
      if (event.key === "ArrowLeft") {
        setIndex((value) => Math.max(value - 1, 0));
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, total]);

  if (!open || !step) return null;

  const finish = () => {
    markOnboardingSeen();
    onClose();
  };

  const goNext = () => {
    if (isLast) finish();
    else setIndex((value) => Math.min(value + 1, total - 1));
  };

  const goPrev = () => {
    setIndex((value) => Math.max(value - 1, 0));
  };

  const goToWhere = (item: OnboardingStep) => {
    markOnboardingSeen();
    onClose();
    if (item.targetView === "help") {
      openHelp({ section: "home" });
      return;
    }
    if (item.targetView) goTo(item.targetView);
  };

  return (
    <div className="onboarding" role="presentation">
      <div className="onboarding__backdrop" />
      <div
        className="onboarding__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="onboarding__header">
          <div>
            <p className="status-banner__label">Uso do crédito · Jornada Private</p>
            <h2 id={titleId}>Onde as melhorias foram aplicadas</h2>
            <p className="muted">
              Um tour navegável pelas 12 oportunidades do quadro — do “como é
              hoje” ao que você encontra neste protótipo.
            </p>
          </div>
          <button type="button" className="btn btn--ghost" onClick={finish}>
            Pular
          </button>
        </header>

        <div className="onboarding__progress" aria-hidden="true">
          {ONBOARDING_STEPS.map((item, stepIndex) => (
            <button
              key={item.id}
              type="button"
              className={`onboarding__dot${
                stepIndex === index
                  ? " is-current"
                  : stepIndex < index
                    ? " is-done"
                    : ""
              }`}
              onClick={() => setIndex(stepIndex)}
              aria-label={`Ir para etapa ${item.number}`}
            />
          ))}
        </div>

        <div className="onboarding__body">
          <div className="onboarding__step-meta">
            <span className="onboarding__number">{step.number}</span>
            <div>
              <h3>{step.title}</h3>
              <p className="onboarding__highlight">{step.highlight}</p>
            </div>
            <span className="onboarding__counter">
              {index + 1} / {total}
            </span>
          </div>

          <div className="onboarding__compare">
            <article className="onboarding__card onboarding__card--before">
              <p className="onboarding__card-label">Como é hoje</p>
              <p>{step.before}</p>
            </article>
            <article className="onboarding__card onboarding__card--after">
              <p className="onboarding__card-label">Melhoria aplicada</p>
              <p>{step.improvement}</p>
            </article>
          </div>

          <div className="onboarding__where">
            <p className="onboarding__card-label">Onde ver no sistema</p>
            <p>{step.where}</p>
            {step.targetView && (
              <button
                type="button"
                className="btn-link"
                onClick={() => goToWhere(step)}
              >
                {step.whereLabel} →
              </button>
            )}
          </div>
        </div>

        <footer className="onboarding__footer">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={goPrev}
            disabled={isFirst}
          >
            Anterior
          </button>
          <div className="onboarding__footer-actions">
            {!isLast && (
              <button type="button" className="btn-link" onClick={finish}>
                Ir para o sistema
              </button>
            )}
            <button type="button" className="btn btn--primary" onClick={goNext}>
              {isLast ? "Começar a usar" : "Próxima melhoria"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
