import { useEffect, useId, useMemo, useState } from "react";
import type { ExtractedField } from "../types";

export interface ReuseConfirmItem {
  id: string;
  name: string;
  detail?: string;
  identifiedType?: string;
  previewUrl?: string | null;
  previewKind?: "image" | "pdf" | "placeholder";
  ocrFields?: ExtractedField[];
}

function PreviewPane({ item }: { item: ReuseConfirmItem }) {
  const kind = item.previewKind ?? "placeholder";
  const url = item.previewUrl;

  if (kind === "image" && url) {
    return (
      <img
        className="reuse-confirm__preview-media"
        src={url}
        alt={`Visualização de ${item.name}`}
      />
    );
  }

  if (kind === "pdf" && url) {
    return (
      <iframe
        className="reuse-confirm__preview-media"
        title={`Visualização de ${item.name}`}
        src={url}
      />
    );
  }

  return (
    <div className="reuse-confirm__preview-placeholder" aria-hidden="true">
      <div className="reuse-confirm__doc-sheet">
        <p className="reuse-confirm__doc-sheet-title">{item.name}</p>
        <p className="reuse-confirm__doc-sheet-line" />
        <p className="reuse-confirm__doc-sheet-line" />
        <p className="reuse-confirm__doc-sheet-line reuse-confirm__doc-sheet-line--short" />
        <p className="reuse-confirm__doc-sheet-meta">
          {item.identifiedType || "Documento enviado anteriormente"}
        </p>
      </div>
      <span>Pré-visualização do documento</span>
    </div>
  );
}

export function ReuseConfirmModal({
  open,
  title = "Confirmar reaproveitamento",
  description,
  items,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title?: string;
  description: string;
  items: ReuseConfirmItem[];
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const titleId = useId();
  const [validityOk, setValidityOk] = useState(false);
  const [dataOk, setDataOk] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const canConfirm = validityOk && dataOk;

  const activeItem = useMemo(() => {
    if (!items.length) return null;
    return items.find((item) => item.id === activeId) ?? items[0];
  }, [items, activeId]);

  useEffect(() => {
    if (!open) {
      setValidityOk(false);
      setDataOk(false);
      setActiveId(null);
      return;
    }
    setActiveId(items[0]?.id ?? null);
  }, [open, items]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open || !activeItem) return null;

  return (
    <div className="modal-backdrop" role="presentation">
      <div
        className="modal-card reuse-confirm reuse-confirm--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h2 id={titleId}>{title}</h2>
        <p className="muted">{description}</p>

        {items.length > 1 && (
          <div className="reuse-confirm__tabs" role="tablist">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={item.id === activeItem.id}
                className={`reuse-confirm__tab${
                  item.id === activeItem.id ? " is-active" : ""
                }`}
                onClick={() => setActiveId(item.id)}
              >
                {item.name}
              </button>
            ))}
          </div>
        )}

        <div className="reuse-confirm__review">
          <section className="reuse-confirm__preview">
            <div className="reuse-confirm__section-head">
              <p className="reuse-confirm__section-label">Documento</p>
              <strong>{activeItem.name}</strong>
              {activeItem.detail && (
                <span className="muted">{activeItem.detail}</span>
              )}
            </div>
            <div className="reuse-confirm__preview-frame">
              <PreviewPane item={activeItem} />
            </div>
          </section>

          <section className="reuse-confirm__ocr">
            <div className="reuse-confirm__section-head">
              <p className="reuse-confirm__section-label">Leitura OCR</p>
              <strong>Dados identificados</strong>
              <span className="muted">
                Confira se as informações batem com o documento visualizado.
              </span>
            </div>
            {activeItem.identifiedType && (
              <p className="reuse-confirm__ocr-type">
                Tipo identificado: <strong>{activeItem.identifiedType}</strong>
              </p>
            )}
            <div className="reuse-confirm__ocr-fields">
              {(activeItem.ocrFields ?? []).map((field) => (
                <div key={field.id} className="reuse-confirm__ocr-field">
                  <div className="reuse-confirm__ocr-field-top">
                    <span>{field.label}</span>
                    <span
                      className={`pill ${
                        field.confidence === "high"
                          ? "pill--success"
                          : "pill--info"
                      }`}
                    >
                      {field.confidence === "high"
                        ? "Alta confiança"
                        : "Revisar"}
                    </span>
                  </div>
                  <strong>{field.value}</strong>
                </div>
              ))}
              {(activeItem.ocrFields ?? []).length === 0 && (
                <p className="muted">
                  Não há dados de OCR disponíveis para este documento neste
                  protótipo.
                </p>
              )}
            </div>
          </section>
        </div>

        <div className="reuse-confirm__checks">
          <label className="reuse-confirm__check">
            <input
              type="checkbox"
              checked={validityOk}
              onChange={(event) => setValidityOk(event.target.checked)}
            />
            <span>
              Confirmo que estes documentos ainda estão dentro do prazo de
              validade aceito para esta solicitação.
            </span>
          </label>
          <label className="reuse-confirm__check">
            <input
              type="checkbox"
              checked={dataOk}
              onChange={(event) => setDataOk(event.target.checked)}
            />
            <span>
              Confirmo que os dados dos documentos não sofreram alteração desde
              o envio anterior e que a leitura OCR está correta.
            </span>
          </label>
        </div>

        <p className="muted reuse-confirm__note">
          A validade do arquivo sozinha não é suficiente — os dados também
          precisam continuar corretos para o reaproveitamento.
        </p>

        <div className="modal-card__actions">
          <div className="footer-actions" style={{ justifyContent: "flex-end" }}>
            <button type="button" className="btn btn--ghost" onClick={onCancel}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn--primary"
              disabled={!canConfirm}
              onClick={onConfirm}
            >
              Confirmar e reaproveitar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
