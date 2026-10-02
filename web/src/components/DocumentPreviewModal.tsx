import type { DocumentItem } from "../types";

export function DocumentPreviewModal({
  document,
  onClose,
}: {
  document: DocumentItem | null;
  onClose: () => void;
}) {
  if (!document?.file) return null;

  const { file } = document;
  const isImage = file.mimeType.startsWith("image/");
  const isPdf =
    file.mimeType === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf");

  return (
    <div className="preview-modal" role="dialog" aria-modal="true" aria-label="Visualizar documento">
      <div className="preview-modal__backdrop" onClick={onClose} />
      <div className="preview-modal__panel">
        <header className="preview-modal__header">
          <div>
            <p className="status-banner__label">Documento anexado</p>
            <h3>{document.name}</h3>
            <p className="muted">
              {file.name} · {file.sizeLabel} · enviado em {file.uploadedAt}
            </p>
          </div>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Fechar
          </button>
        </header>

        <div className="preview-modal__body">
          {isImage && (
            <img src={file.previewUrl} alt={`Pré-visualização de ${document.name}`} />
          )}
          {isPdf && !isImage && (
            <iframe
              title={`Pré-visualização de ${document.name}`}
              src={file.previewUrl}
            />
          )}
          {!isImage && !isPdf && (
            <div className="preview-modal__fallback">
              <p>
                Não foi possível gerar uma pré-visualização nativa deste formato
                neste protótipo.
              </p>
              <a className="btn btn--primary" href={file.previewUrl} download={file.name}>
                Baixar arquivo anexado
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
