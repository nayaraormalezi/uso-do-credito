import { formatCpfCnpj } from "../data/costs";
import {
  EMPTY_SELLER_DATA,
  MARITAL_STATUS_OPTIONS,
  formatCep,
  formatPhone,
  isSellerDataComplete,
} from "../data/seller";
import { useJourney } from "../context/JourneyContext";
import { StatusBanner } from "../components/StatusBanner";

export function SellerView() {
  const { state, updateSeller, next, back } = useJourney();
  const seller = state.seller ?? EMPTY_SELLER_DATA;
  const canContinue = isSellerDataComplete(seller);

  return (
    <div className="main-panel">
      <StatusBanner
        label="Vendedor"
        title="Dados do vendedor"
        text="Etapa específica da aquisição. Neste protótipo, o fluxo de pessoa física está consolidado. O fluxo de vendedor pessoa jurídica ainda não está completo no Figma."
      />

      <section className="section-card">
        <h2>Tipo de vendedor</h2>
        <label className="choice is-selected">
          <input
            type="radio"
            checked={seller.type === "pf"}
            onChange={() => updateSeller({ type: "pf" })}
          />
          <div>
            <strong>Pessoa física</strong>
            <p className="muted">
              Dados, estado civil, endereço, documentos e conta.
            </p>
          </div>
        </label>
        <label className="choice is-disabled">
          <input type="radio" disabled />
          <div>
            <strong>Pessoa jurídica</strong>
            <p className="muted">Disponível em breve neste protótipo.</p>
          </div>
        </label>
      </section>

      <section className="section-card">
        <h3>Dados pessoais</h3>
        <p className="muted">
          Preencha os dados do vendedor pessoa física para continuar.
        </p>
        <div className="card-payment__form refund-account__form">
          <label className="property-field property-field--wide">
            <span>Nome completo</span>
            <input
              value={seller.name}
              onChange={(e) => updateSeller({ name: e.target.value })}
              placeholder="Nome completo do vendedor"
            />
          </label>
          <label className="property-field">
            <span>CPF</span>
            <input
              value={seller.cpf}
              onChange={(e) =>
                updateSeller({ cpf: formatCpfCnpj(e.target.value) })
              }
              placeholder="000.000.000-00"
              inputMode="numeric"
            />
          </label>
          <label className="property-field">
            <span>Estado civil</span>
            <select
              value={seller.maritalStatus}
              onChange={(e) => updateSeller({ maritalStatus: e.target.value })}
            >
              <option value="">Selecione</option>
              {MARITAL_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="property-field">
            <span>Telefone</span>
            <input
              value={seller.phone}
              onChange={(e) =>
                updateSeller({ phone: formatPhone(e.target.value) })
              }
              placeholder="(00) 00000-0000"
              inputMode="tel"
            />
          </label>
          <label className="property-field">
            <span>E-mail</span>
            <input
              type="email"
              value={seller.email}
              onChange={(e) => updateSeller({ email: e.target.value })}
              placeholder="email@exemplo.com"
            />
          </label>
        </div>
      </section>

      <section className="section-card">
        <h3>Endereço do vendedor</h3>
        <div className="property-form">
          <label className="property-field property-field--cep">
            <span>CEP</span>
            <input
              value={seller.cep}
              onChange={(e) =>
                updateSeller({ cep: formatCep(e.target.value) })
              }
              placeholder="00000-000"
              inputMode="numeric"
            />
          </label>
          <label className="property-field property-field--wide">
            <span>Logradouro</span>
            <input
              value={seller.street}
              onChange={(e) => updateSeller({ street: e.target.value })}
              placeholder="Rua, avenida..."
            />
          </label>
          <label className="property-field">
            <span>Número</span>
            <input
              value={seller.number}
              onChange={(e) => updateSeller({ number: e.target.value })}
              placeholder="Nº"
            />
          </label>
          <label className="property-field">
            <span>Complemento</span>
            <input
              value={seller.complement}
              onChange={(e) => updateSeller({ complement: e.target.value })}
              placeholder="Apto, bloco..."
            />
          </label>
          <label className="property-field">
            <span>Bairro</span>
            <input
              value={seller.neighborhood}
              onChange={(e) => updateSeller({ neighborhood: e.target.value })}
              placeholder="Bairro"
            />
          </label>
          <label className="property-field">
            <span>Cidade</span>
            <input
              value={seller.city}
              onChange={(e) => updateSeller({ city: e.target.value })}
              placeholder="Cidade"
            />
          </label>
          <label className="property-field property-field--uf">
            <span>UF</span>
            <input
              value={seller.state}
              onChange={(e) =>
                updateSeller({
                  state: e.target.value.toUpperCase().slice(0, 2),
                })
              }
              placeholder="UF"
              maxLength={2}
            />
          </label>
        </div>
      </section>

      <section className="section-card">
        <h3>Conta bancária do vendedor</h3>
        <p className="muted">
          Conta para recebimento do valor da aquisição.
        </p>
        <div className="card-payment__form refund-account__form">
          <label className="property-field property-field--wide">
            <span>Banco</span>
            <input
              value={seller.bank}
              onChange={(e) => updateSeller({ bank: e.target.value })}
              placeholder="Nome ou código do banco"
            />
          </label>
          <label className="property-field">
            <span>Agência</span>
            <input
              value={seller.agency}
              onChange={(e) =>
                updateSeller({
                  agency: e.target.value.replace(/[^\d-]/g, "").slice(0, 8),
                })
              }
              placeholder="0000"
              inputMode="numeric"
            />
          </label>
          <label className="property-field">
            <span>Conta</span>
            <input
              value={seller.account}
              onChange={(e) =>
                updateSeller({
                  account: e.target.value.replace(/[^\dxX-]/g, "").slice(0, 16),
                })
              }
              placeholder="00000-0"
            />
          </label>
          <label className="property-field property-field--wide">
            <span>Tipo de conta</span>
            <div className="refund-account__types">
              <label
                className={`choice choice--inline ${
                  seller.accountType === "corrente" ? "is-selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="seller-account-type"
                  checked={seller.accountType === "corrente"}
                  onChange={() => updateSeller({ accountType: "corrente" })}
                />
                <span>Conta corrente</span>
              </label>
              <label
                className={`choice choice--inline ${
                  seller.accountType === "poupanca" ? "is-selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="seller-account-type"
                  checked={seller.accountType === "poupanca"}
                  onChange={() => updateSeller({ accountType: "poupanca" })}
                />
                <span>Poupança</span>
              </label>
            </div>
          </label>
        </div>
        <p className="muted">
          Documentos e certidões do vendedor seguem o checklist da jornada
          original (H5–H6), apresentados aqui de forma agrupada.
        </p>
      </section>

      <div className="footer-actions">
        <button type="button" className="btn btn--ghost" onClick={back}>
          Voltar
        </button>
        <button
          type="button"
          className="btn btn--primary"
          disabled={!canContinue}
          onClick={next}
        >
          Continuar para custos
        </button>
      </div>
    </div>
  );
}
