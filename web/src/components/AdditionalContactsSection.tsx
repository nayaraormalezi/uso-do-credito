import {
  RELATIONSHIP_OPTIONS,
  createEmptyAdditionalContact,
  formatPhoneInput,
} from "../data/customer";
import { useJourney } from "../context/JourneyContext";

export function AdditionalContactsSection() {
  const {
    state,
    setAdditionalContactsEnabled,
    updateAdditionalContact,
    addAdditionalContact,
    removeAdditionalContact,
  } = useJourney();

  const enabled = state.additionalContactsEnabled;
  const contacts = state.additionalContacts;

  return (
    <section className="section-card">
      <div className="switch-row">
        <div>
          <h3>Contato adicional</h3>
          <p className="muted">
            Opcional. Ative se quiser que outra pessoa também receba
            notificações por e-mail e telefone/WhatsApp sobre o andamento.
          </p>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) =>
              setAdditionalContactsEnabled(event.target.checked)
            }
          />
          <span className="switch__track" aria-hidden="true" />
          <span className="sr-only">
            {enabled
              ? "Desativar contato adicional"
              : "Ativar contato adicional"}
          </span>
        </label>
      </div>

      {enabled && (
        <div className="additional-contacts">
          {contacts.map((contact, index) => (
            <article key={contact.id} className="additional-contact">
              <div className="additional-contact__header">
                <strong>Contato {index + 1}</strong>
                {contacts.length > 1 && (
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => removeAdditionalContact(contact.id)}
                  >
                    Remover
                  </button>
                )}
              </div>

              <div className="card-payment__form refund-account__form">
                <label className="property-field property-field--wide">
                  <span>O que essa pessoa é de você?</span>
                  <select
                    className="profile-input"
                    value={contact.relationship}
                    onChange={(event) =>
                      updateAdditionalContact(contact.id, {
                        relationship: event.target.value,
                      })
                    }
                  >
                    <option value="">Selecione o vínculo</option>
                    {RELATIONSHIP_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="property-field property-field--wide">
                  <span>Nome completo</span>
                  <input
                    className="profile-input"
                    value={contact.name}
                    onChange={(event) =>
                      updateAdditionalContact(contact.id, {
                        name: event.target.value,
                      })
                    }
                    placeholder="Nome de quem receberá as notificações"
                  />
                </label>
                <label className="property-field property-field--wide">
                  <span>E-mail</span>
                  <input
                    className="profile-input"
                    type="email"
                    value={contact.email}
                    onChange={(event) =>
                      updateAdditionalContact(contact.id, {
                        email: event.target.value,
                      })
                    }
                    placeholder="email@exemplo.com"
                  />
                </label>
                <label className="property-field property-field--wide">
                  <span>Telefone / WhatsApp</span>
                  <input
                    className="profile-input"
                    value={contact.phone}
                    onChange={(event) =>
                      updateAdditionalContact(contact.id, {
                        phone: formatPhoneInput(event.target.value),
                      })
                    }
                    placeholder="(00) 00000-0000"
                    inputMode="tel"
                  />
                </label>
              </div>
            </article>
          ))}

          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => addAdditionalContact(createEmptyAdditionalContact())}
          >
            + Adicionar outro contato
          </button>
        </div>
      )}
    </section>
  );
}
