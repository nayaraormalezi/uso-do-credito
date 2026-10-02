import { useEffect, useState } from "react";
import { createGuidePdfUrl, type ProductGuide } from "../data/guides";

export function GuidePreviewModal({
  guide,
  onClose,
}: {
  guide: ProductGuide | null;
  onClose: () => void;
}) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!guide) {
      setPdfUrl(null);
      return;
    }

    const url = createGuidePdfUrl(guide);
    setPdfUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [guide]);

  useEffect(() => {
    if (!guide) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [guide, onClose]);

  if (!guide || !pdfUrl) return null;

  return (
    <div
      className="preview-modal"
      role="dialog"
      aria-modal="true"
      aria-label={`Visualizar ${guide.title}`}
    >
      <div className="preview-modal__backdrop" onClick={onClose} />
      <div className="preview-modal__panel">
        <header className="preview-modal__header">
          <div>
            <p className="status-banner__label">Cartilha</p>
            <h3>{guide.title}</h3>
            <p className="muted">{guide.description}</p>
          </div>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Fechar
          </button>
        </header>

        <div className="preview-modal__body">
          <iframe title={`Visualização de ${guide.title}`} src={pdfUrl} />
        </div>
      </div>
    </div>
  );
}
