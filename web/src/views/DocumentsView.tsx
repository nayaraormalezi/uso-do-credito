import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { ANALYSIS_STEPS, buildReuseConfirmItem } from "../data/documents";
import { useJourney } from "../context/JourneyContext";
import type { DocStatus, DocumentItem } from "../types";
import { DocumentPreviewModal } from "../components/DocumentPreviewModal";
import { ReuseConfirmModal } from "../components/ReuseConfirmModal";

function statusMeta(status: DocStatus): { icon: string; label: string; tone: string } {
  switch (status) {
    case "approved":
      return { icon: "✓", label: "Aprovado", tone: "success" };
    case "reusable":
      return { icon: "✓", label: "Válido para reuso", tone: "success" };
    case "analyzing":
      return { icon: "◷", label: "Analisando", tone: "info" };
    case "review":
      return { icon: "!", label: "Confirme os dados", tone: "warning" };
    case "rejected":
      return { icon: "!", label: "Ação necessária", tone: "danger" };
    case "needs_human":
      return { icon: "◷", label: "Em análise adicional", tone: "info" };
    case "uploaded":
      return { icon: "◷", label: "Recebido", tone: "info" };
    default:
      return { icon: "○", label: "Pendente", tone: "danger" };
  }
}

function isActionNeeded(doc: DocumentItem) {
  return ["pending", "rejected", "reusable", "review"].includes(doc.status);
}

function isComplete(doc: DocumentItem) {
  return doc.status === "approved" || doc.status === "needs_human";
}

function Configurable({ label }: { label: string }) {
  return (
    <span className="pill" title="Regra de negócio a configurar">
      {label}
    </span>
  );
}

export function DocumentsView() {
  const {
    state,
    next,
    back,
    goTo,
    selectDocument,
    uploadDocumentFile,
    reuseDocument,
    setReuseAccepted,
    updateExtractedField,
    confirmExtractedData,
    openPreview,
    closePreview,
  } = useJourney();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [reusePending, setReusePending] = useState<
    null | { kind: "bulk" } | { kind: "single"; docId: string }
  >(null);
  const selected =
    state.documents.find((d) => d.id === state.selectedDocumentId) ??
    state.documents[0];

  const completedCount = state.documents.filter(isComplete).length;
  const total = state.documents.length;
  const progress = total === 0 ? 0 : Math.round((completedCount / total) * 100);
  const actionDocs = state.documents.filter(isActionNeeded);

  const analysisIndex = useMemo(() => {
    if (!selected?.analysisStep) return -1;
    return ANALYSIS_STEPS.findIndex((s) => s.id === selected.analysisStep);
  }, [selected?.analysisStep]);

  const triggerUpload = () => fileInputRef.current?.click();

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selected) {
      uploadDocumentFile(selected.id, file);
    }
    event.target.value = "";
  };

  if (!selected) {
    return (
      <div className="main-panel">
        <p className="muted">Nenhum documento disponível nesta solicitação.</p>
      </div>
    );
  }

  const meta = statusMeta(selected.status);
  const reusableDocs = state.documents.filter((doc) => doc.status === "reusable");
  const reuseItems =
    reusePending?.kind === "bulk"
      ? reusableDocs.map((doc) => buildReuseConfirmItem(doc))
      : reusePending?.kind === "single"
        ? (() => {
            const doc = state.documents.find(
              (item) => item.id === reusePending.docId,
            );
            return doc ? [buildReuseConfirmItem(doc)] : [];
          })()
        : [];

  const confirmReuse = () => {
    if (!reusePending) return;
    if (reusePending.kind === "bulk") setReuseAccepted(true);
    else reuseDocument(reusePending.docId);
    setReusePending(null);
  };

  return (
    <div className="docs-workspace">
      <header className="docs-workspace__header">
        <div>
          <p className="status-banner__label">Documentação do consorciado</p>
          <h2>Documentação</h2>
          <p className="muted">
            {completedCount} de {total} documentos concluídos
          </p>
        </div>
        <div className="docs-progress">
          <div className="docs-progress__track" aria-hidden>
            <div
              className="docs-progress__fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="muted">{progress}%</span>
        </div>
      </header>

      {state.reuseOffered && state.reuseAccepted === null && !state.submitted && (
        <section className="section-card docs-reuse-banner">
          <div>
            <h3>Reaproveitar documentos válidos?</h3>
            <p className="muted">
              Encontramos documentos ainda válidos de solicitações anteriores.
              Antes de reutilizar, confirme que a validade e os dados
              continuam corretos.
            </p>
          </div>
          <div className="row">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setReusePending({ kind: "bulk" })}
            >
              Reaproveitar válidos
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setReuseAccepted(false)}
            >
              Enviar tudo novamente
            </button>
          </div>
        </section>
      )}

      {state.submitted && actionDocs.length > 0 && (
        <section className="docs-action-strip">
          <div>
            <strong>Ação necessária</strong>
            <p className="muted">
              {actionDocs[0].name}
              {actionDocs[0].rejection
                ? ` — ${actionDocs[0].rejection.reason}`
                : actionDocs[0].status === "review"
                  ? " — confirme as informações identificadas"
                  : " — envio ou confirmação pendente"}
            </p>
          </div>
          <button
            type="button"
            className="btn btn--danger"
            onClick={() => selectDocument(actionDocs[0].id)}
          >
            Resolver agora
          </button>
        </section>
      )}

      <div className="docs-layout">
        <aside className="docs-list" aria-label="Lista de documentos">
          {state.documents.map((doc) => {
            const itemMeta = statusMeta(doc.status);
            const active = doc.id === selected.id;
            return (
              <button
                key={doc.id}
                type="button"
                className={`docs-list__item ${active ? "is-active" : ""} tone-${itemMeta.tone}`}
                onClick={() => selectDocument(doc.id)}
              >
                <span className={`docs-list__icon tone-${itemMeta.tone}`}>
                  {itemMeta.icon}
                </span>
                <span className="docs-list__text">
                  <strong>{doc.name}</strong>
                  <span>{itemMeta.label}</span>
                </span>
              </button>
            );
          })}

          <div className="docs-next-steps">
            <p className="action-group__title">Próximas etapas</p>
            <p className="muted">
              Após a conclusão dos documentos, seguiremos para as informações do
              imóvel e demais etapas do processo.
            </p>
          </div>
        </aside>

        <section className="docs-detail section-card" aria-live="polite">
          <div className="row row--between">
            <div>
              <p className="status-banner__label">
                {selected.required ? "Obrigatório" : "Opcional"}
              </p>
              <h2>{selected.name}</h2>
            </div>
            <span className={`pill pill--${meta.tone === "warning" ? "danger" : meta.tone === "info" ? "info" : meta.tone === "success" ? "success" : "danger"}`}>
              {meta.label}
            </span>
          </div>

          {/* Guidance before upload */}
          {(selected.status === "pending" ||
            selected.status === "rejected" ||
            selected.status === "reusable") && (
            <div className="stack">
              {selected.status === "rejected" && selected.rejection && (
                <div className="docs-rejection">
                  <h3>{selected.rejection.title}</h3>
                  <div className="kv">
                    <span>Motivo</span>
                    <strong>{selected.rejection.reason}</strong>
                  </div>
                  <div className="kv">
                    <span>Como resolver</span>
                    <strong>{selected.rejection.howToFix}</strong>
                  </div>
                  <button
                    type="button"
                    className="btn btn--danger"
                    onClick={triggerUpload}
                  >
                    Enviar novo documento
                  </button>
                </div>
              )}

              <div className="docs-block">
                <h3>Por que precisamos?</h3>
                <p className="muted">{selected.requirements.whyNeeded}</p>
              </div>

              <div className="docs-block">
                <h3>Documento aceito</h3>
                <ul className="docs-bullets">
                  {selected.requirements.acceptedTypes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="docs-block docs-validity">
                <h3>Validade</h3>
                {selected.requirements.validityAttention ? (
                  <div className="callout">
                    <p>
                      <strong>Atenção — </strong>
                      {selected.requirements.validityAttention}
                    </p>
                  </div>
                ) : (
                  <Configurable label="Período de validade a configurar" />
                )}
              </div>

              <div className="grid-2">
                <div className="docs-block">
                  <h3>Formato</h3>
                  {selected.requirements.formatsLabel ? (
                    <p className="muted">{selected.requirements.formatsLabel}</p>
                  ) : (
                    <Configurable label="Formatos a configurar (ex.: PDF, JPG, PNG)" />
                  )}
                </div>
                <div className="docs-block">
                  <h3>Tamanho máximo</h3>
                  {selected.requirements.maxSizeLabel ? (
                    <p className="muted">{selected.requirements.maxSizeLabel}</p>
                  ) : (
                    <Configurable label="Tamanho máximo a configurar" />
                  )}
                </div>
              </div>

              <div className="grid-2">
                <div className="docs-tips docs-tips--ok">
                  <strong>Envie assim</strong>
                  <ul>
                    {selected.requirements.tipsAccepted.map((tip) => (
                      <li key={tip}>✓ {tip}</li>
                    ))}
                  </ul>
                </div>
                <div className="docs-tips docs-tips--bad">
                  <strong>Evite</strong>
                  <ul>
                    {selected.requirements.tipsRejected.map((tip) => (
                      <li key={tip}>✕ {tip}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {selected.status === "reusable" && (
                <div className="docs-block docs-reuse-card">
                  <strong>Este documento ainda está válido</strong>
                  <p className="muted">
                    Para reutilizá-lo, confirme que a validade e os dados do
                    documento continuam corretos.
                  </p>
                  <div className="row">
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={() =>
                        setReusePending({ kind: "single", docId: selected.id })
                      }
                    >
                      Usar documento existente
                    </button>
                    <button
                      type="button"
                      className="btn btn--secondary"
                      onClick={triggerUpload}
                    >
                      Enviar outro arquivo
                    </button>
                  </div>
                </div>
              )}

              {selected.status === "pending" && (
                <div className="footer-actions" style={{ justifyContent: "flex-start" }}>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={triggerUpload}
                  >
                    Enviar documento
                  </button>
                </div>
              )}

              <p className="muted" style={{ fontSize: 13 }}>
                Dica do protótipo: use nomes de arquivo com{" "}
                <code>vencido</code>, <code>escuro</code> ou <code>humano</code>{" "}
                para simular recusa, ilegibilidade ou análise adicional.
              </p>
            </div>
          )}

          {/* Analyzing */}
          {selected.status === "analyzing" && (
            <div className="stack">
              <div className="status-banner">
                <p className="status-banner__label">Análise automática</p>
                <p className="status-banner__title">Analisando seu documento…</p>
                <p className="status-banner__text">
                  {selected.analysisMessage ??
                    "Estamos conferindo as informações e verificando se o documento atende aos requisitos."}
                </p>
              </div>

              <ol className="docs-analysis-steps">
                {ANALYSIS_STEPS.map((step, index) => {
                  const done = analysisIndex > index;
                  const current = analysisIndex === index;
                  return (
                    <li
                      key={step.id}
                      className={
                        done ? "is-done" : current ? "is-current" : ""
                      }
                    >
                      <span>{done ? "✓" : current ? "…" : "○"}</span>
                      <div>
                        <strong>{step.label}</strong>
                        <p>{step.message}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>

              {selected.file && (
                <div className="docs-file-chip">
                  <div>
                    <strong>{selected.file.name}</strong>
                    <p className="muted">
                      {selected.file.sizeLabel} · enviado em{" "}
                      {selected.file.uploadedAt}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => openPreview(selected.id)}
                  >
                    Visualizar documento
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Review extracted data */}
          {selected.status === "review" && (
            <div className="stack">
              <div className="status-banner">
                <p className="status-banner__label">Documento analisado automaticamente</p>
                <p className="status-banner__title">
                  Encontramos estas informações no documento
                </p>
                <p className="status-banner__text">
                  Revise os dados identificados. Campos com atenção precisam da
                  sua confirmação.
                </p>
              </div>

              {selected.identifiedType && (
                <div className="kv">
                  <span>Documento identificado</span>
                  <strong>{selected.identifiedType}</strong>
                </div>
              )}

              <div className="docs-fields">
                {selected.extractedFields?.map((field) => (
                  <label
                    key={field.id}
                    className={`docs-field ${field.confidence === "low" ? "is-low" : ""}`}
                  >
                    <span className="docs-field__label">
                      {field.label}
                      {field.confidence === "low" && (
                        <span className="pill pill--danger">
                          Confira esta informação
                        </span>
                      )}
                    </span>
                    {field.editable === false ? (
                      <strong>{field.value}</strong>
                    ) : (
                      <input
                        value={field.value}
                        onChange={(e) =>
                          updateExtractedField(
                            selected.id,
                            field.id,
                            e.target.value,
                          )
                        }
                      />
                    )}
                    {field.confidence === "low" && (
                      <span className="muted" style={{ fontSize: 13 }}>
                        Não conseguimos confirmar completamente este dado.
                      </span>
                    )}
                  </label>
                ))}
              </div>

              {selected.file && (
                <div className="docs-file-chip">
                  <div>
                    <strong>{selected.file.name}</strong>
                    <p className="muted">
                      Enviado em {selected.file.uploadedAt}
                      {selected.analyzedAt
                        ? ` · analisado em ${selected.analyzedAt}`
                        : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => openPreview(selected.id)}
                  >
                    Visualizar documento
                  </button>
                </div>
              )}

              <div className="footer-actions" style={{ justifyContent: "flex-start" }}>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => confirmExtractedData(selected.id)}
                >
                  Confirmar dados e concluir
                </button>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={triggerUpload}
                >
                  Enviar outro arquivo
                </button>
              </div>
            </div>
          )}

          {/* Approved */}
          {selected.status === "approved" && (
            <div className="stack">
              <div className="status-banner" style={{ background: "var(--color-success-bg)" }}>
                <p className="status-banner__label">Resultado</p>
                <p className="status-banner__title">✓ Documento aprovado</p>
                <p className="status-banner__text">
                  Seu documento foi validado e está tudo certo.
                </p>
              </div>

              <div className="grid-2">
                <div className="kv">
                  <span>Data de envio</span>
                  <strong>{selected.file?.uploadedAt ?? "Reutilizado"}</strong>
                </div>
                <div className="kv">
                  <span>Data de análise</span>
                  <strong>{selected.analyzedAt ?? "—"}</strong>
                </div>
                <div className="kv">
                  <span>Validade</span>
                  <strong>
                    {selected.validityStatus === "valid"
                      ? "✓ Válido"
                      : selected.validUntil
                        ? `Válido até ${selected.validUntil}`
                        : "Conforme regra do documento"}
                  </strong>
                </div>
                <div className="kv">
                  <span>Tipo</span>
                  <strong>{selected.identifiedType ?? selected.name}</strong>
                </div>
              </div>

              {selected.extractedFields && selected.extractedFields.length > 0 && (
                <div className="docs-block">
                  <h3>Informações identificadas</h3>
                  <div className="grid-2">
                    {selected.extractedFields.map((field) => (
                      <div className="kv" key={field.id}>
                        <span>{field.label}</span>
                        <strong>{field.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="row">
                {selected.file && (
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => openPreview(selected.id)}
                  >
                    Visualizar documento
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={triggerUpload}
                >
                  Substituir documento
                </button>
              </div>
            </div>
          )}

          {/* Needs human */}
          {selected.status === "needs_human" && (
            <div className="stack">
              <div className="status-banner status-banner--waiting">
                <p className="status-banner__label">Documento recebido</p>
                <p className="status-banner__title">Estamos analisando seu documento</p>
                <p className="status-banner__text">
                  O arquivo foi recebido. Uma análise adicional será necessária.
                  Você não precisa enviar novamente neste momento.
                </p>
              </div>
              {selected.file && (
                <div className="docs-file-chip">
                  <div>
                    <strong>{selected.file.name}</strong>
                    <p className="muted">Enviado em {selected.file.uploadedAt}</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => openPreview(selected.id)}
                  >
                    Visualizar documento
                  </button>
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,application/pdf"
            hidden
            onChange={onFileChange}
          />
        </section>
      </div>

      <div className="footer-actions">
        <button type="button" className="btn btn--ghost" onClick={back}>
          Voltar
        </button>
        {state.submitted ? (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => goTo("tracking")}
          >
            Voltar ao acompanhamento
          </button>
        ) : (
          <button
            type="button"
            className="btn btn--primary"
            disabled={
              state.documents.some((d) =>
                ["pending", "rejected", "analyzing", "review", "reusable"].includes(
                  d.status,
                ),
              )
            }
            onClick={next}
          >
            Continuar
          </button>
        )}
      </div>

      {state.previewDocumentId && (
        <DocumentPreviewModal
          document={
            state.documents.find((d) => d.id === state.previewDocumentId) ?? null
          }
          onClose={closePreview}
        />
      )}

      <ReuseConfirmModal
        open={reusePending !== null}
        title={
          reusePending?.kind === "bulk"
            ? "Confirmar reaproveitamento dos documentos"
            : "Confirmar reaproveitamento do documento"
        }
        description={
          reusePending?.kind === "bulk"
            ? "Visualize cada documento e a leitura OCR. Confirme que a validade e os dados continuam corretos antes de reaproveitar."
            : "Visualize o documento e a leitura OCR. Confirme que a validade e os dados continuam corretos antes de reaproveitar."
        }
        items={reuseItems}
        onCancel={() => setReusePending(null)}
        onConfirm={confirmReuse}
      />
    </div>
  );
}
