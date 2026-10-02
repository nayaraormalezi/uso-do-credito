import {
  CUSTOMER_PROFILE,
  formatCustomerAddress,
} from "../data/customer";
import { useJourney } from "../context/JourneyContext";
import { AdditionalContactsSection } from "../components/AdditionalContactsSection";
import { StatusBanner } from "../components/StatusBanner";

export function PersonalDataView() {
  const { next, back } = useJourney();
  const profile = CUSTOMER_PROFILE;

  return (
    <div className="main-panel">
      <StatusBanner
        label="Dados cadastrais"
        title="Confira seus dados"
        text="Valide as informações cadastrais antes de seguir. Se o endereço estiver desatualizado, atualize-o no fluxo de cadastro."
      />

      <section className="section-card">
        <h2>Dados do consorciado</h2>
        <div className="grid-2">
          <div className="kv">
            <span>Nome</span>
            <strong>{profile.fullName}</strong>
          </div>
          <div className="kv">
            <span>CPF</span>
            <strong>{profile.cpf}</strong>
          </div>
          <div className="kv">
            <span>E-mail</span>
            <strong>{profile.email}</strong>
          </div>
          <div className="kv">
            <span>Telefone</span>
            <strong>{profile.phone}</strong>
          </div>
          <div className="kv">
            <span>Endereço</span>
            <strong>{formatCustomerAddress(profile)}</strong>
          </div>
          <div className="kv">
            <span>Estado civil</span>
            <strong>{profile.maritalStatus}</strong>
          </div>
        </div>
        <div className="callout">
          <p>
            Se precisar corrigir dados cadastrais, use a atualização cadastral.
            As informações do consorciado devem originar-se desse cadastro.
          </p>
        </div>
      </section>

      <AdditionalContactsSection />

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
