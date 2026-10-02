import { creditUseCardMeta } from "../data/creditUseDisplay";
import type { CreditUse } from "../types";

export function RequestCardMeta({ use }: { use: CreditUse }) {
  const meta = creditUseCardMeta(use);

  return (
    <dl className="request-meta">
      <div className="request-meta__item">
        <dt>Protocolo</dt>
        <dd>{meta.protocolLabel}</dd>
      </div>
      <div className="request-meta__item">
        <dt>Data da solicitação</dt>
        <dd>{meta.createdAt}</dd>
      </div>
      <div className="request-meta__item">
        <dt>Cotas</dt>
        <dd>{meta.quotaSummary}</dd>
      </div>
      <div className="request-meta__item">
        <dt>Valor do uso</dt>
        <dd>{meta.creditValueLabel}</dd>
      </div>
      <div className="request-meta__item request-meta__item--wide">
        <dt>Acompanhamento</dt>
        <dd>
          <span className="request-meta__badge">{meta.conductionLabel}</span>
        </dd>
      </div>
    </dl>
  );
}
