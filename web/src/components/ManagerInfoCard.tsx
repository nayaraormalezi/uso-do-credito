import { MANAGER } from "../data/journey";

export function ManagerInfoCard({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <aside
      className={`manager-card${compact ? " manager-card--compact" : ""}`}
      aria-label={`Gerente responsável: ${MANAGER.name}`}
    >
      <div className="manager-card__avatar" aria-hidden="true">
        {MANAGER.name
          .split(" ")
          .slice(0, 2)
          .map((part) => part[0])
          .join("")}
      </div>
      <div className="manager-card__body">
        <p className="manager-card__eyebrow">Seu gerente</p>
        <strong className="manager-card__name">{MANAGER.name}</strong>
        <p className="muted manager-card__role">
          {MANAGER.role}
          {MANAGER.agency ? ` · ${MANAGER.agency}` : ""}
        </p>
        {!compact && <p className="muted manager-card__note">{MANAGER.note}</p>}
      </div>
    </aside>
  );
}
