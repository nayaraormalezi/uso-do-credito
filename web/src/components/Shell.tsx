import { useState, type ReactNode } from "react";
import { MANAGER, STEPS } from "../data/journey";
import { hasSeenOnboarding } from "../data/onboarding";
import { isFillableView } from "../data/progress";
import { useJourney } from "../context/JourneyContext";
import { HomeVisualPanel } from "./HomeVisualPanel";
import { NotificationBell } from "./NotificationBell";
import { OnboardingTour } from "./OnboardingTour";
import {
  AutosaveIndicator,
  ExitConfirmModal,
  SaveAndExitButton,
} from "./SaveProgressBar";
import { UserMenu } from "./UserMenu";
import { FloatingChatbot } from "./FloatingChatbot";
import type { ViewId } from "../types";

function statusLabel(
  status: ReturnType<ReturnType<typeof useJourney>["stepStatus"]>,
) {
  switch (status) {
    case "completed":
      return "Concluída";
    case "current":
      return "Etapa atual";
    case "pending":
      return "Atenção necessária";
    default:
      return "Próxima";
  }
}

function stepMeta(stepId: ViewId, status: string) {
  if (stepId === "hub") {
    return status === "current" ? "Como deseja iniciar?" : "Concluída";
  }
  if (stepId === "quotas") {
    return status === "current" || status === "upcoming"
      ? "Selecione suas cotas"
      : statusLabel(status as never);
  }
  return statusLabel(status as never);
}

export function Shell({ children }: { children: ReactNode }) {
  const { state, goTo, stepStatus, requestExit, openHelp, closeHelp, closeProfile } =
    useJourney();
  const [onboardingOpen, setOnboardingOpen] = useState(
    () => !hasSeenOnboarding(),
  );

  const path = state.conductionPath;
  const isHub = state.view === "hub";
  const isRequests = state.view === "requests";
  const isHelp = state.view === "help";
  const isProfile = state.view === "profile";
  const inJourney = !isHub && !isRequests && !isHelp && !isProfile;
  const showJourneyNav = inJourney;
  const showSaveBar = isFillableView(state.view);

  const journeySteps = STEPS.filter((step) => {
    if (
      step.id === "hub" ||
      step.id === "creditUseDetail" ||
      step.id === "tracking" ||
      step.id === "requests" ||
      step.id === "help" ||
      step.id === "profile"
    ) {
      return false;
    }
    if (!path) return step.id === "quotas";
    const paths = step.paths ?? ["all"];
    return paths.includes("all") || paths.includes(path);
  });

  const bodyClass = [
    "app-body",
    isHub ? "app-body--home" : "",
    isRequests || isHelp || isProfile ? "app-body--requests" : "",
    !isHub ? "app-body--no-rail" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const goHome = () => {
    if (isHelp) {
      closeHelp();
      return;
    }
    if (isProfile) {
      closeProfile();
      return;
    }
    if (showSaveBar || state.activeDraftId) {
      requestExit();
      return;
    }
    goTo("hub");
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__brand">
          <button
            className="app-header__logo-btn"
            type="button"
            onClick={goHome}
            aria-label="CAIXA Consórcio — Ir para o início"
          >
            <img
              className="app-header__logo"
              src="/caixa-consorcio-logo.png"
              alt="CAIXA Consórcio"
            />
          </button>
          <h1 className="app-header__title">Uso do crédito</h1>
        </div>
        <div className="app-header__meta">
          <NotificationBell />
          {inJourney && path === "gerente" && (
            <span className="pill" title={MANAGER.role}>
              {MANAGER.name} conduz
            </span>
          )}
          {inJourney && path === "cliente" && (
            <span className="pill">Você conduz</span>
          )}
          {inJourney && state.protocol && (
            <span className="pill pill--info">Protocolo {state.protocol}</span>
          )}
          <UserMenu />
          <button
            type="button"
            className={`onboarding-trigger${onboardingOpen ? " is-active" : ""}`}
            title="Onboarding das melhorias"
            aria-label="Abrir onboarding das melhorias"
            aria-expanded={onboardingOpen}
            onClick={() => setOnboardingOpen(true)}
          >
            Melhorias
          </button>
          <button
            className={`help-icon${isHelp ? " is-active" : ""}`}
            type="button"
            title="Central de ajuda"
            aria-label="Central de ajuda"
            aria-current={isHelp ? "page" : undefined}
            onClick={() => openHelp({ section: "home" })}
          >
            ?
          </button>
        </div>
      </header>

      <div className={bodyClass}>
        {isHub && <HomeVisualPanel />}

        {showJourneyNav && (
          <nav className="app-nav" aria-label="Etapas da jornada">
            <div className="nav-section">
              <p className="action-group__title">Jornada</p>
              <ol className="stepper">
                <li>
                  <button
                    type="button"
                    className="stepper__item is-completed"
                    onClick={() =>
                      showSaveBar || state.activeDraftId
                        ? requestExit()
                        : goTo("hub")
                    }
                  >
                    <span className="stepper__dot">✓</span>
                    <span>
                      <div className="stepper__label">Início</div>
                      <div className="stepper__meta">Hub</div>
                    </span>
                  </button>
                </li>
                {journeySteps.map((step, index) => {
                  const status = stepStatus(step.id);
                  const reachable =
                    status === "completed" ||
                    status === "current" ||
                    status === "pending" ||
                    state.submitted;

                  return (
                    <li key={step.id}>
                      <button
                        type="button"
                        className={`stepper__item is-${status}`}
                        disabled={!reachable && status === "upcoming"}
                        onClick={() => goTo(step.id as ViewId)}
                      >
                        <span className="stepper__dot">
                          {status === "completed"
                            ? "✓"
                            : String(index + 1).padStart(2, "0")}
                        </span>
                        <span>
                          <div className="stepper__label">{step.shortLabel}</div>
                          <div className="stepper__meta">
                            {stepMeta(step.id, status)}
                          </div>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="nav-section nav-section--follow">
              <p className="action-group__title">Acompanhamento</p>
              <button
                type="button"
                className={`nav-link${
                  state.view === "requests" ||
                  state.view === "creditUseDetail" ||
                  state.view === "tracking"
                    ? " is-current"
                    : ""
                }`}
                onClick={() =>
                  showSaveBar || state.activeDraftId
                    ? requestExit()
                    : goTo("requests")
                }
              >
                <span className="nav-link__label">Minhas solicitações</span>
                <span className="nav-link__meta">
                  {state.creditUses.length === 0
                    ? "Histórico e andamento"
                    : state.creditUses.length === 1
                      ? "1 solicitação"
                      : `${state.creditUses.length} solicitações`}
                </span>
              </button>
            </div>
          </nav>
        )}

        <main className={`app-main${isHub ? " app-main--home" : ""}`}>
          {children}
          {showSaveBar && (
            <div className="save-exit-dock">
              <AutosaveIndicator />
              <SaveAndExitButton />
            </div>
          )}
        </main>
        <ExitConfirmModal />
        <FloatingChatbot />
        <OnboardingTour
          open={onboardingOpen}
          onClose={() => setOnboardingOpen(false)}
        />
      </div>
    </div>
  );
}
