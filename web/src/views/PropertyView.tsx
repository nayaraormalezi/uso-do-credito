import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { ANALYSIS_STEPS, buildReuseConfirmItem } from "../data/documents";
import {
  fieldsForPropertyDocument,
  isAddressComplete,
} from "../data/property";
import { useJourney } from "../context/JourneyContext";
import { StatusBanner } from "../components/StatusBanner";
import { DocumentPreviewModal } from "../components/DocumentPreviewModal";
import { ReuseConfirmModal } from "../components/ReuseConfirmModal";
import type { DocStatus, DocumentItem } from "../types";

function statusMeta(status: DocStatus): {
  icon: string;
  label: string;
  tone: string;
} {
  switch (status) {
    case "approved":
      return { icon: "✓", label: "Aprovado", tone: "success" };
    case "reusable":
      return { icon: "↻", label: "Disponível para reuso", tone: "success" };
    case "analyzing":
      return { icon: "◷", label: "Em análise", tone: "info" };
    case "review":
      return { icon: "!", label: "Confirme os dados", tone: "warning" };
    case "rejected":
      return { icon: "⚠", label: "Não aprovado", tone: "danger" };
    case "needs_human":
      return { icon: "◷", label: "Em análise adicional", tone: "info" };
    case "uploaded":
      return { icon: "◷", label: "Enviado", tone: "info" };
    default:
      return { icon: "○", label: "Pendente", tone: "neutral" };
  }
}

function isDocComplete(doc: DocumentItem) {
  return doc.status === "approved" || doc.status === "needs_human";
}

export function PropertyView() {
  const {
    state,
    setPropertyType,
    setUsesFgts,
    updatePropertyAddress,
    lookupPropertyCep,
    confirmPropertyAddress,
    selectPropertyDocument,
    uploadPropertyDocumentFile,
    reusePropertyDocument,
    updatePropertyExtractedField,
    confirmPropertyExtractedData,
    next,
    back,
  } = useJourney();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [reuseDocId, setReuseDocId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const address = state.propertyAddress;
  const docs = state.propertyDocuments;
  const selected =
    docs.find((d) => d.id === state.selectedPropertyDocumentId) ?? docs[0];

  const requiredDocs = docs.filter((d) => d.required);
  const approvedRequired = requiredDocs.filter(isDocComplete).length;
  const addressOk =
    state.propertyAddressConfirmed && isAddressComplete(address);
  const docsOk =
    requiredDocs.length === 0 ||
    requiredDocs.every((d) => isDocComplete(d));
  const canContinue =
    addressOk &&
    docsOk &&
    state.propertyType !== null &&
    state.usesFgts !== null;

  const analysisIndex = useMemo(() => {
    if (!selected?.analysisStep) return -1;
    return ANALYSIS_STEPS.findIndex((s) => s.id === selected.analysisStep);
  }, [selected?.analysisStep]);

  const onCepBlur = () => {
    const digits = address.cep.replace(/\D/g, "");
    if (digits.length === 8) void lookupPropertyCep(address.cep);
  };

  const triggerUpload = () => fileInputRef.current?.click();

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selected) {
      uploadPropertyDocumentFile(selected.id, file);
    }
    event.target.value = "";
  };

  return (
    <div className="main-panel property-panel">
      <StatusBanner
        label="Dados do imóvel"
        title="Dados do imóvel"
        text="Informe o endereço do imóvel e envie os documentos necessários para continuar com o uso do seu crédito."
      />

      <section className="section-card">
        <h2>Endereço do imóvel</h2>
        <p className="muted">
          Preencha o CEP para completar automaticamente os campos possíveis.
        </p>

        <div className="property-form">
          <label className="property-field property-field--cep">
            <span>CEP</span>
            <input
              value={address.cep}
              onChange={(e) => updatePropertyAddress({ cep: e.target.value })}
              onBlur={onCepBlur}
              placeholder="00000-000"
              inputMode="numeric"
            />
          </label>
          <label className="property-field property-field--wide">
            <span>Logradouro</span>
            <input
              value={address.street}
              onChange={(e) => updatePropertyAddress({ street: e.target.value })}
              placeholder="Rua, avenida..."
            />
          </label>
          <label className="property-field">
            <span>Número</span>
            <input
              value={address.number}
              onChange={(e) => updatePropertyAddress({ number: e.target.value })}
              placeholder="Nº"
            />
          </label>
          <label className="property-field">
            <span>Complemento</span>
            <input
              value={address.complement}
              onChange={(e) =>
                updatePropertyAddress({ complement: e.target.value })
              }
              placeholder="Apto, bloco..."
            />
          </label>
          <label className="property-field">
            <span>Bairro</span>
            <input
              value={address.neighborhood}
              onChange={(e) =>
                updatePropertyAddress({ neighborhood: e.target.value })
              }
            />
          </label>
          <label className="property-field">
            <span>Cidade</span>
            <input
              value={address.city}
              onChange={(e) => updatePropertyAddress({ city: e.target.value })}
            />
          </label>
          <label className="property-field property-field--uf">
            <span>Estado</span>
            <input
              value={address.state}
              onChange={(e) =>
                updatePropertyAddress({
                  state: e.target.value.toUpperCase().slice(0, 2),
                })
              }
              placeholder="UF"
              maxLength={2}
            />
          </label>
        </div>

        <div className="row" style={{ marginTop: 16 }}>
          {state.propertyAddressConfirmed ? (
            <span className="pill pill--success">✓ Endereço confirmado</span>
          ) : (
            <button
              type="button"
              className="btn btn--secondary"
              disabled={!isAddressComplete(address)}
              onClick={confirmPropertyAddress}
            >
              Confirmar endereço
            </button>
          )}
        </div>
      </section>

      <section className="section-card">
        <h3>Tipo do imóvel</h3>
        <div className="stack">
          {(
            [
              ["residencial", "Residencial"],
              ["comercial", "Comercial"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className={`choice ${state.propertyType === value ? "is-selected" : ""}`}
            >
              <input
                type="radio"
                name="propertyType"
                checked={state.propertyType === value}
                onChange={() => setPropertyType(value)}
              />
              <strong>{label}</strong>
            </label>
          ))}
        </div>
      </section>

      <section className="section-card">
        <h3>FGTS</h3>
        <p className="muted">Você vai usar o FGTS nesta operação?</p>
        <div className="stack">
          <label
            className={`choice ${state.usesFgts === true ? "is-selected" : ""}`}
          >
            <input
              type="radio"
              name="fgts"
              checked={state.usesFgts === true}
              onChange={() => setUsesFgts(true)}
            />
            <strong>Sim, vou usar o FGTS</strong>
          </label>
          <label
            className={`choice ${state.usesFgts === false ? "is-selected" : ""}`}
          >
            <input
              type="radio"
              name="fgts"
              checked={state.usesFgts === false}
              onChange={() => setUsesFgts(false)}
            />
            <strong>Não vou usar o FGTS</strong>
          </label>
        </div>
      </section>

      <section className="section-card">
        <div className="row row--between">
          <div>
            <h2>Documentos do imóvel</h2>
            <p className="muted">
              Envie os documentos abaixo para que possamos analisar o imóvel.
            </p>
          </div>
          <span className="pill pill--info">
            {approvedRequired} de {requiredDocs.length} documentos aprovados
          </span>
        </div>

        <div className="property-docs">
          <aside className="property-docs__list" aria-label="Documentos do imóvel">
            {docs.map((doc) => {
              const meta = statusMeta(doc.status);
              const active = doc.id === selected?.id;
              return (
                <button
                  key={doc.id}
                  type="button"
                  className={`property-docs__item tone-${meta.tone}${
                    active ? " is-active" : ""
                  }`}
                  onClick={() => selectPropertyDocument(doc.id)}
                >
                  <span className="property-docs__status" aria-hidden>
                    {meta.icon}
                  </span>
                  <span>
                    <strong>{doc.name}</strong>
                    <small>
                      {doc.required ? "Obrigatório" : "Opcional"} · {meta.label}
                    </small>
                    {doc.requirements.validityLabel && (
                      <small className="property-docs__validity">
                        {doc.requirements.validityLabel}
                      </small>
                    )}
                  </span>
                </button>
              );
            })}
          </aside>

          {selected && (
            <div className="property-docs__detail">
              <div className="row row--between">
                <div>
                  <p className="status-banner__label">
                    {selected.required ? "Obrigatório" : "Opcional"}
                  </p>
                  <h3>{selected.name}</h3>
                </div>
                <span
                  className={`pill ${
                    selected.status === "approved"
                      ? "pill--success"
                      : selected.status === "rejected"
                        ? "pill--danger"
                        : "pill--info"
                  }`}
                >
                  {statusMeta(selected.status).label}
                </span>
              </div>

              <p className="muted">{selected.requirements.whyNeeded}</p>

              {selected.requirements.validityAttention && (
                <div className="callout">
                  <p>
                    <strong>Validade — </strong>
                    {selected.requirements.validityAttention}
                  </p>
                </div>
              )}

              {selected.status === "reusable" && (
                <div className="callout" style={{ background: "var(--color-highlight-bg)" }}>
                  <p>
                    <strong>Encontramos um documento válido enviado anteriormente.</strong>{" "}
                    Confirme validade e dados antes de reaproveitar.
                  </p>
                  <div className="row" style={{ marginTop: 12 }}>
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={() => setReuseDocId(selected.id)}
                    >
                      Usar documento
                    </button>
                    <button
                      type="button"
                      className="btn btn--secondary"
                      onClick={triggerUpload}
                    >
                      Enviar outro
                    </button>
                  </div>
                </div>
              )}

              {selected.status === "pending" && (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={triggerUpload}
                >
                  Enviar documento
                </button>
              )}

              {selected.status === "analyzing" && (
                <div className="stack">
                  <p>
                    <strong>Documento recebido</strong>
                  </p>
                  <p className="muted">
                    {selected.analysisMessage ?? "Analisando documento..."}
                  </p>
                  <ol className="docs-analysis">
                    {ANALYSIS_STEPS.map((step, index) => (
                      <li
                        key={step.id}
                        className={
                          index < analysisIndex
                            ? "is-done"
                            : index === analysisIndex
                              ? "is-current"
                              : ""
                        }
                      >
                        {step.label}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {selected.status === "review" && selected.extractedFields && (
                <div className="stack">
                  <p>
                    <strong>Identificamos estas informações no documento.</strong>
                  </p>
                  <div className="property-extracted">
                    {selected.extractedFields.map((field) => (
                      <label key={field.id} className="property-field">
                        <span>
                          {field.label}
                          {field.confidence === "low" ? " (revise)" : ""}
                        </span>
                        <input
                          value={field.value}
                          disabled={field.editable === false}
                          onChange={(e) =>
                            updatePropertyExtractedField(
                              selected.id,
                              field.id,
                              e.target.value,
                            )
                          }
                        />
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => confirmPropertyExtractedData(selected.id)}
                  >
                    Confirmar informações
                  </button>
                </div>
              )}

              {selected.status === "approved" && (
                <div className="stack">
                  <div className="callout" style={{ background: "var(--color-success-bg)" }}>
                    <p>
                      <strong>✓ Documento aprovado</strong>
                      <br />
                      Documento válido e legível
                      {selected.analyzedAt ? ` · ${selected.analyzedAt}` : ""}.
                    </p>
                  </div>
                  {selected.file && (
                    <button
                      type="button"
                      className="btn btn--secondary"
                      onClick={() => setPreviewOpen(true)}
                    >
                      Ver documento
                    </button>
                  )}
                </div>
              )}

              {selected.status === "rejected" && selected.rejection && (
                <div className="stack">
                  <div className="callout" style={{ background: "var(--color-danger-bg)" }}>
                    <p>
                      <strong>⚠ Documento não aprovado</strong>
                      <br />
                      Motivo: {selected.rejection.reason}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={triggerUpload}
                  >
                    Enviar novo documento
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,application/pdf"
                hidden
                onChange={onFileChange}
              />
            </div>
          )}
        </div>
      </section>

      <DocumentPreviewModal
        document={previewOpen ? selected ?? null : null}
        onClose={() => setPreviewOpen(false)}
      />

      <ReuseConfirmModal
        open={reuseDocId !== null}
        title="Confirmar reaproveitamento do documento"
        description="Visualize o documento e a leitura OCR. Confirme que a validade e os dados continuam corretos antes de reaproveitar."
        items={
          reuseDocId
            ? (() => {
                const doc = docs.find((item) => item.id === reuseDocId);
                return doc
                  ? [
                      buildReuseConfirmItem(doc, fieldsForPropertyDocument),
                    ]
                  : [];
              })()
            : []
        }
        onCancel={() => setReuseDocId(null)}
        onConfirm={() => {
          if (reuseDocId) reusePropertyDocument(reuseDocId);
          setReuseDocId(null);
        }}
      />

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
          Continuar
        </button>
      </div>
    </div>
  );
}
