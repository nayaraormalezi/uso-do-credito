function IconDocument() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 3.75h7.5L19 8.25V20.25a.75.75 0 0 1-.75.75H7.75A.75.75 0 0 1 7 20.25V3.75Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 3.75V8.25H19"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 12h5M9.5 15.5h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconPerson() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5.5 19.25c1.1-3 3.2-4.5 6.5-4.5s5.4 1.5 6.5 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.5 19 6.5v5.2c0 4.3-2.9 7.4-7 8.8-4.1-1.4-7-4.5-7-8.8V6.5L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="m9.2 12 1.9 1.9 3.7-3.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const BENEFITS = [
  {
    title: "Orientação",
    subtitle: "em cada etapa",
    icon: <IconDocument />,
  },
  {
    title: "Acompanhamento",
    subtitle: "com seu gerente",
    icon: <IconPerson />,
  },
  {
    title: "Transparência",
    subtitle: "e segurança",
    icon: <IconShield />,
  },
] as const;

export function HomeVisualPanel() {
  return (
    <aside className="home-visual" aria-label="Uso do crédito">
      <img
        className="home-visual__media"
        src="/home-credit-visual.jpg"
        alt="Uso do crédito com a CAIXA Consórcio"
      />
      <div className="home-visual__content">
        <h2 className="home-visual__title">
          Seu crédito,
          <br />
          do seu jeito.
        </h2>
        <p className="home-visual__text">
          Com o apoio da CAIXA Consórcio, você tem uma experiência mais simples,
          segura e acompanhada.
        </p>
        <ul className="home-visual__benefits">
          {BENEFITS.map((item) => (
            <li key={item.title}>
              <span className="home-visual__icon">{item.icon}</span>
              <span className="home-visual__benefit-text">
                <strong>{item.title}</strong>
                <span>{item.subtitle}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
