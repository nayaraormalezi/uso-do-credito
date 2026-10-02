import { useJourney } from "../context/JourneyContext";
import { isFillableView } from "../data/progress";

export function AutosaveIndicator() {
  const { state } = useJourney();
  if (!isFillableView(state.view) || !state.activeDraftId) return null;

  let label = "";
  if (state.saveStatus === "saving") label = "Salvando...";
  else if (state.saveStatus === "saved" && state.lastSavedAt) {
    label = `✓ Salvo agora · ${state.lastSavedAt}`;
  } else if (state.lastSavedAt) {
    label = `Último salvamento: ${state.lastSavedAt}`;
  }

  if (!label) return null;

  return (
    <p className="autosave-indicator" aria-live="polite">
      {label}
    </p>
  );
}

export function SaveAndExitButton() {
  const { saveAndExit } = useJourney();

  return (
    <button type="button" className="btn btn--ghost" onClick={saveAndExit}>
      Salvar e sair
    </button>
  );
}

export function ExitConfirmModal() {
  const { state, saveAndExit, cancelExit, continueFilling } = useJourney();
  if (!state.exitConfirmOpen) return null;

  return (
    <div className="modal-backdrop" role="presentation">
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-confirm-title"
      >
        <h2 id="exit-confirm-title">Salvar seu progresso?</h2>
        <p className="muted">
          Você fez alterações que ainda não foram salvas. Salve para continuar
          de onde parou depois.
        </p>
        <div className="modal-card__actions">
          <div className="footer-actions" style={{ justifyContent: "flex-end" }}>
            <button type="button" className="btn btn--ghost" onClick={continueFilling}>
              Continuar preenchendo
            </button>
            <button type="button" className="btn btn--primary" onClick={saveAndExit}>
              Salvar e sair
            </button>
          </div>
          <button type="button" className="btn-link" onClick={cancelExit}>
            Sair sem salvar
          </button>
        </div>
      </div>
    </div>
  );
}

export function SaveFeedbackBanner() {
  const { state, dismissSaveFeedback } = useJourney();
  if (!state.saveFeedback) return null;

  return (
    <div className="save-feedback" role="status">
      <div>
        <strong>{state.saveFeedback.title}</strong>
        <p className="muted">{state.saveFeedback.message}</p>
      </div>
      <button
        type="button"
        className="btn btn--ghost btn--compact"
        onClick={dismissSaveFeedback}
        aria-label="Fechar"
      >
        Fechar
      </button>
    </div>
  );
}
