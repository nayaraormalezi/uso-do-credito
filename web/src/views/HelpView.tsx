import { useMemo, useState } from "react";
import {
  FAQ_TOPICS,
  HELP_GUIDES,
  findFaqTopic,
  type FaqTopicId,
  type HelpSection,
} from "../data/help";
import { useJourney } from "../context/JourneyContext";
import { StatusBanner } from "../components/StatusBanner";

export function HelpView() {
  const { state, closeHelp, openHelp } = useJourney();
  const [search, setSearch] = useState("");
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const section = state.helpSection;
  const topic = findFaqTopic(state.helpFaqTopic);

  const filteredTopics = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return FAQ_TOPICS;
    return FAQ_TOPICS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.questions.some((question) =>
          question.question.toLowerCase().includes(q),
        ),
    );
  }, [search]);

  const filteredGuides = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return HELP_GUIDES;
    return HELP_GUIDES.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q),
    );
  }, [search]);

  const goSection = (next: HelpSection, faqTopic: FaqTopicId | null = null) => {
    openHelp({ section: next, faqTopic });
    setExpandedQuestion(null);
  };

  return (
    <div className="main-panel">
      <StatusBanner
        label="Ajuda"
        title="Central de ajuda"
        text="Encontre respostas e orientações para o uso do seu crédito. Você pode voltar à jornada a qualquer momento — seu progresso permanece salvo."
      />

      <section className="section-card">
        <div className="row row--between">
          <div>
            <h2>Como podemos ajudar?</h2>
            <p className="muted">
              Busque por um tema ou navegue pelas perguntas e cartilhas.
            </p>
          </div>
          <button type="button" className="btn btn--ghost" onClick={closeHelp}>
            Voltar à jornada
          </button>
        </div>

        <div className="help-page__search">
          <label className="help-center__search-label" htmlFor="help-search">
            O que você precisa saber?
          </label>
          <input
            id="help-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Digite o que você procura"
          />
        </div>
      </section>

      {section === "home" && (
        <section className="section-card">
          <div className="help-page__home">
            <button
              type="button"
              className="help-card"
              onClick={() => goSection("faq")}
            >
              <h3>Perguntas frequentes</h3>
              <p className="muted">
                Respostas rápidas para as principais dúvidas.
              </p>
              <span className="btn-link">Consultar FAQ →</span>
            </button>
            <button
              type="button"
              className="help-card"
              onClick={() => goSection("guides")}
            >
              <h3>Cartilhas orientativas</h3>
              <p className="muted">
                Materiais completos para consultar quando precisar.
              </p>
              <span className="btn-link">Ver cartilhas →</span>
            </button>
          </div>
        </section>
      )}

      {section === "faq" && !topic && (
        <section className="section-card">
          <div className="row row--between">
            <div>
              <h3>Perguntas frequentes</h3>
              <p className="muted">
                Encontre respostas para as principais dúvidas sobre o uso do
                crédito.
              </p>
            </div>
            <button
              type="button"
              className="btn btn--ghost btn--compact"
              onClick={() => goSection("home")}
            >
              Voltar
            </button>
          </div>
          <div className="help-topic-list">
            {filteredTopics.map((item) => (
              <button
                key={item.id}
                type="button"
                className="help-topic"
                onClick={() => goSection("faq", item.id)}
              >
                <strong>{item.title}</strong>
                <span className="muted">{item.description}</span>
              </button>
            ))}
            {filteredTopics.length === 0 && (
              <p className="muted">Nenhum tema encontrado para essa busca.</p>
            )}
          </div>
        </section>
      )}

      {section === "faq" && topic && (
        <section className="section-card">
          <div className="row row--between">
            <div>
              <p className="status-banner__label">FAQ</p>
              <h3>{topic.title}</h3>
              <p className="muted">{topic.description}</p>
            </div>
            <button
              type="button"
              className="btn btn--ghost btn--compact"
              onClick={() => goSection("faq")}
            >
              Todos os temas
            </button>
          </div>
          <div className="help-faq-list">
            {topic.questions.map((item) => {
              const open = expandedQuestion === item.id;
              return (
                <article key={item.id} className="help-faq-item">
                  <button
                    type="button"
                    className="help-faq-item__q"
                    aria-expanded={open}
                    onClick={() => setExpandedQuestion(open ? null : item.id)}
                  >
                    {item.question}
                    <span aria-hidden="true">{open ? "−" : "+"}</span>
                  </button>
                  {open && (
                    <p className="help-faq-item__a muted">
                      {item.answerPlaceholder}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {section === "guides" && (
        <section className="section-card">
          <div className="row row--between">
            <div>
              <h3>Cartilhas orientativas</h3>
              <p className="muted">
                Consulte materiais com orientações detalhadas para cada etapa do
                processo.
              </p>
            </div>
            <button
              type="button"
              className="btn btn--ghost btn--compact"
              onClick={() => goSection("home")}
            >
              Voltar
            </button>
          </div>
          <div className="help-guide-list">
            {filteredGuides.map((guide) => (
              <article key={guide.id} className="help-guide">
                <div>
                  <span className="pill">{guide.category}</span>
                  <h4>{guide.title}</h4>
                  <p className="muted">{guide.description}</p>
                  <p className="help-guide__meta muted">
                    {guide.format} · Atualização: {guide.updatedAt}
                  </p>
                </div>
                <button type="button" className="btn btn--secondary" disabled>
                  Consultar
                </button>
              </article>
            ))}
            {filteredGuides.length === 0 && (
              <p className="muted">
                Nenhuma cartilha encontrada para essa busca.
              </p>
            )}
          </div>
        </section>
      )}

      <div className="footer-actions">
        <button type="button" className="btn btn--primary" onClick={closeHelp}>
          Voltar à jornada
        </button>
      </div>
    </div>
  );
}
