import { useState } from "react";
import {
  PREPARATION_STEPS,
  QUOTA_CATEGORY_LABELS,
  QUOTAS,
} from "../data/journey";
import {
  downloadGuideContent,
  guidesForCategory,
  type ProductGuide,
} from "../data/guides";
import { useJourney } from "../context/JourneyContext";
import { GuidePreviewModal } from "../components/GuidePreviewModal";
import { StatusBanner } from "../components/StatusBanner";
import type { QuotaCategory } from "../types";

export function PreparationView() {
  const { state, next, back } = useJourney();
  const [previewGuide, setPreviewGuide] = useState<ProductGuide | null>(null);

  const selectedCategory: QuotaCategory | null =
    state.selectedQuotaIds.length > 0
      ? (QUOTAS.find((q) => q.id === state.selectedQuotaIds[0])?.category ??
        null)
      : null;

  const guides = guidesForCategory(selectedCategory);

  return (
    <div className="main-panel">
      <StatusBanner
        label="Preparação"
        title="Chegou a hora de usar o crédito"
        text="Antes de começar, confira o passo a passo e as orientações. Isso reduz dúvidas e retrabalho nas próximas etapas."
      />

      <section className="section-card">
        <h2>Passo a passo do uso do crédito</h2>
        <p className="muted">
          Regras, documentos e custos devem estar claros desde o início — não
          descobertos no meio do processo.
        </p>

        <div className="stack">
          {PREPARATION_STEPS.map((item, index) => (
            <div className="prep-item" key={item.title}>
              <div className="icon-circle">{index + 1}</div>
              <div>
                <strong>{item.title}</strong>
                <p className="muted">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-card">
        <h3>Principais regras de documentação</h3>
        <ul className="muted">
          <li>Documento de identificação: sem prazo de validade.</li>
          <li>Comprovante de endereço: emitido há no máximo 45 dias.</li>
          <li>Comprovante de renda: emitido há no máximo 90 dias.</li>
          <li>Certidão de estado civil: sem prazo de validade.</li>
          <li>
            Documentos ainda válidos de solicitações anteriores podem ser
            reaproveitados.
          </li>
        </ul>
      </section>

      <section className="section-card">
        <h3>Cartilhas orientativas</h3>
        {selectedCategory ? (
          <>
            <p className="muted">
              Materiais para o produto{" "}
              <strong>{QUOTA_CATEGORY_LABELS[selectedCategory]}</strong>, de
              acordo com a cota selecionada.
            </p>
            <div className="prep-guides">
              {guides.map((guide) => (
                <article key={guide.id} className="prep-guide">
                  <div>
                    <span className="pill">{guide.format}</span>
                    <h4>{guide.title}</h4>
                    <p className="muted">{guide.description}</p>
                  </div>
                  <div className="prep-guide__actions">
                    <button
                      type="button"
                      className="btn btn--secondary"
                      onClick={() => setPreviewGuide(guide)}
                    >
                      Visualizar
                    </button>
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={() => downloadGuideContent(guide)}
                    >
                      Baixar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <p className="muted">
            Selecione uma cota para ver as cartilhas disponíveis para o seu
            produto.
          </p>
        )}
      </section>

      <div className="footer-actions">
        <button type="button" className="btn btn--ghost" onClick={back}>
          Voltar
        </button>
        <button type="button" className="btn btn--primary" onClick={next}>
          Continuar
        </button>
      </div>

      <GuidePreviewModal
        guide={previewGuide}
        onClose={() => setPreviewGuide(null)}
      />
    </div>
  );
}
