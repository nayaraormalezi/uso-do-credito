import { MANAGER, QUOTAS, quotaLabel } from "../data/journey";
import { useJourney } from "../context/JourneyContext";
import { ManagerInfoCard } from "../components/ManagerInfoCard";
import { StatusBanner } from "../components/StatusBanner";

export function ManagerConfirmView() {
  const { state, back, confirmManagerRequest } = useJourney();
  const selected = QUOTAS.filter((q) => state.selectedQuotaIds.includes(q.id));

  return (
    <div className="main-panel">
      <StatusBanner
        label="Confirmação"
        title={`Solicitar a ${MANAGER.name}`}
        text={`Revise as cotas selecionadas antes de enviar. ${MANAGER.name} será responsável por conduzir o início do processo.`}
      />

      <ManagerInfoCard />

      <section className="section-card">
        <h2>Cotas selecionadas</h2>
        <div className="stack">
          {selected.map((quota) => (
            <div className="list-item" key={quota.id}>
              <div>
                <strong>✓ {quotaLabel(quota.id)}</strong>
                <p className="muted">Crédito disponível: {quota.credit}</p>
              </div>
              <span className="pill pill--success">{quota.status}</span>
            </div>
          ))}
        </div>
        <div className="callout">
          <p>
            {MANAGER.name} conduzirá o início do processo dessas cotas. Você
            poderá acompanhar o andamento a qualquer momento.
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
          onClick={confirmManagerRequest}
        >
          Solicitar a {MANAGER.name.split(" ")[0]}
        </button>
      </div>
    </div>
  );
}
