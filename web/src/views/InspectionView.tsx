import { useJourney } from "../context/JourneyContext";
import { StatusBanner } from "../components/StatusBanner";

export function InspectionView() {
  const { next, back } = useJourney();

  return (
    <div className="main-panel">
      <StatusBanner
        label="Vistoria"
        title="Vistoria do imóvel"
        text="Agende a vistoria com mais clareza de opções. Regras de SLA diferenciado ou dispensa para clientes frequentes dependem de definição de negócio e não foram inventadas neste protótipo."
      />

      <section className="section-card">
        <h2>Agendamento</h2>
        <p className="muted">
          Amplie as opções de data e horário disponíveis. Selecione uma
          preferência para continuar.
        </p>
        <div className="grid-2">
          {[
            "Qui, 02/10 · 09h–12h",
            "Qui, 02/10 · 14h–17h",
            "Sex, 03/10 · 09h–12h",
            "Sex, 03/10 · 14h–17h",
            "Seg, 06/10 · 09h–12h",
            "Seg, 06/10 · 14h–17h",
          ].map((slot) => (
            <label className="choice" key={slot}>
              <input type="radio" name="inspection" />
              <strong>{slot}</strong>
            </label>
          ))}
        </div>
      </section>

      <section className="section-card">
        <h3>O que acontece depois</h3>
        <p className="muted">
          Após o agendamento, o status da vistoria aparece no acompanhamento da
          solicitação, com alerta quando houver ação necessária.
        </p>
      </section>

      <div className="footer-actions">
        <button type="button" className="btn btn--ghost" onClick={back}>
          Voltar
        </button>
        <button type="button" className="btn btn--primary" onClick={next}>
          Continuar
        </button>
      </div>
    </div>
  );
}
