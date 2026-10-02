import { useEffect, useMemo, useState } from "react";
import {
  MANAGER,
  QUOTAS,
  QUOTA_CATEGORY_LABELS,
  QUOTA_CATEGORY_ORDER,
} from "../data/journey";
import { useJourney } from "../context/JourneyContext";
import { ManagerInfoCard } from "../components/ManagerInfoCard";
import { StatusBanner } from "../components/StatusBanner";
import type { QuotaCategory } from "../types";

export function QuotasView() {
  const { state, toggleQuota, next, back, goTo } = useJourney();
  const isManager = state.conductionPath === "gerente";
  const count = state.selectedQuotaIds.length;

  const selectedCategory: QuotaCategory | null =
    count > 0
      ? (QUOTAS.find((q) => q.id === state.selectedQuotaIds[0])?.category ??
        null)
      : null;

  const categories = useMemo(
    () =>
      QUOTA_CATEGORY_ORDER.filter((category) =>
        QUOTAS.some((q) => q.category === category),
      ),
    [],
  );

  const [activeCategory, setActiveCategory] = useState<QuotaCategory>(
    selectedCategory ?? categories[0],
  );

  useEffect(() => {
    if (selectedCategory) setActiveCategory(selectedCategory);
  }, [selectedCategory]);

  const continueFlow = () => {
    if (isManager) goTo("managerConfirm");
    else next();
  };

  const visibleQuotas = QUOTAS.filter((q) => q.category === activeCategory);
  const categoryLocked =
    selectedCategory !== null && selectedCategory !== activeCategory;

  return (
    <div className="main-panel">
      <StatusBanner
        label={
          isManager ? `Solicitação a ${MANAGER.name}` : "Abertura do processo"
        }
        title={
          isManager
            ? `Selecione as cotas que ${MANAGER.name} vai conduzir`
            : "Qual cota você deseja utilizar?"
        }
        text={
          isManager
            ? `Você pode selecionar mais de uma cota da mesma categoria. ${MANAGER.name} dará continuidade sem que você preencha toda a jornada agora.`
            : "Selecione uma ou mais cotas da mesma categoria (Imobiliário, Veículos leves ou Veículos pesados)."
        }
      />

      {isManager && <ManagerInfoCard compact />}

      <section className="section-card">
        <div className="row row--between">
          <h2>Cotas contempladas</h2>
          <span className="pill pill--info">
            {count} cota{count === 1 ? "" : "s"} selecionada
            {count === 1 ? "" : "s"}
          </span>
        </div>

        {selectedCategory && (
          <div className="callout">
            <p>
              Seleção limitada à categoria{" "}
              <strong>{QUOTA_CATEGORY_LABELS[selectedCategory]}</strong>. Para
              escolher cotas de outra categoria, desmarque as atuais.
            </p>
          </div>
        )}

        <div
          className="quota-tabs"
          role="tablist"
          aria-label="Categorias de cotas"
        >
          {categories.map((category) => {
            const selectedCount = state.selectedQuotaIds.filter(
              (id) => QUOTAS.find((q) => q.id === id)?.category === category,
            ).length;
            const isActive = activeCategory === category;
            const locked =
              selectedCategory !== null && selectedCategory !== category;

            return (
              <button
                key={category}
                type="button"
                role="tab"
                id={`quota-tab-${category}`}
                aria-selected={isActive}
                aria-controls={`quota-panel-${category}`}
                className={`quota-tabs__tab${isActive ? " is-active" : ""}${
                  locked ? " is-locked" : ""
                }`}
                onClick={() => setActiveCategory(category)}
              >
                <span>{QUOTA_CATEGORY_LABELS[category]}</span>
                {selectedCount > 0 && (
                  <span className="quota-tabs__count">{selectedCount}</span>
                )}
              </button>
            );
          })}
        </div>

        <div
          className="quota-tabs__panel"
          role="tabpanel"
          id={`quota-panel-${activeCategory}`}
          aria-labelledby={`quota-tab-${activeCategory}`}
        >
          {categoryLocked && (
            <p className="muted quota-tabs__locked-note">
              Cotas desta categoria ficam indisponíveis enquanto houver seleção
              em {QUOTA_CATEGORY_LABELS[selectedCategory!]}.
            </p>
          )}

          <div className="stack">
            {visibleQuotas.map((quota) => {
              const selected = state.selectedQuotaIds.includes(quota.id);
              const disabled = categoryLocked;

              return (
                <label
                  key={quota.id}
                  className={`choice ${selected ? "is-selected" : ""} ${
                    disabled ? "is-disabled" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    disabled={disabled}
                    onChange={() => toggleQuota(quota.id)}
                  />
                  <div className="stack stack--tight">
                    <strong>
                      Grupo {quota.group} · Cota {quota.quota}
                    </strong>
                    <span className="muted">
                      Crédito disponível: {quota.credit}
                    </span>
                    <div className="row">
                      <span className="pill pill--success">{quota.status}</span>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </section>

      <div className="footer-actions">
        <div className="muted" style={{ marginRight: "auto" }}>
          {count} cota{count === 1 ? "" : "s"} selecionada
          {count === 1 ? "" : "s"}
          {selectedCategory
            ? ` · ${QUOTA_CATEGORY_LABELS[selectedCategory]}`
            : ""}
        </div>
        <button type="button" className="btn btn--ghost" onClick={back}>
          Voltar
        </button>
        <button
          type="button"
          className="btn btn--primary"
          disabled={count === 0}
          onClick={continueFlow}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
