import { MANAGER } from "../data/journey";
import { useJourney } from "../context/JourneyContext";
import { ManagerInfoCard } from "../components/ManagerInfoCard";
import { StatusBanner } from "../components/StatusBanner";

export function ManagerSuccessView() {
  const { goTo, openCreditUse, state } = useJourney();
  const firstUseId = state.activeCreditUseId ?? state.creditUses[0]?.id;

  return (
    <div className="main-panel">
      <StatusBanner
        label="Solicitação enviada"
        title={`${MANAGER.name} recebeu a solicitação`}
        text={`A solicitação para iniciar o uso do crédito foi enviada para ${MANAGER.name}. Você pode acompanhar o status a qualquer momento.`}
      />

      <ManagerInfoCard />

      <section className="section-card">
        <h2>O que acontece agora?</h2>
        <ul className="docs-bullets">
          <li>
            {MANAGER.name} inicia o atendimento das cotas selecionadas.
          </li>
          <li>
            Você acompanha o progresso no acompanhamento — sem perder
            visibilidade.
          </li>
          <li>
            Se alguma ação sua for necessária, ela aparecerá com orientação e
            CTA.
          </li>
        </ul>
      </section>

      <div className="footer-actions">
        <button type="button" className="btn btn--ghost" onClick={() => goTo("hub")}>
          Ir para o início
        </button>
        <button
          type="button"
          className="btn btn--primary"
          disabled={!firstUseId}
          onClick={() => firstUseId && openCreditUse(firstUseId)}
        >
          Acompanhar solicitação
        </button>
      </div>
    </div>
  );
}
