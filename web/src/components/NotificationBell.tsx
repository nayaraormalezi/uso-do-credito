import { useEffect, useRef } from "react";
import { useJourney } from "../context/JourneyContext";
import type { AppNotification, NotificationType } from "../types";

const TYPE_META: Record<
  NotificationType,
  { label: string; className: string }
> = {
  action: { label: "Ação necessária", className: "notif-item--action" },
  update: { label: "Atualização", className: "notif-item--update" },
  completed: { label: "Concluído", className: "notif-item--completed" },
};

function sortNotifications(items: AppNotification[]) {
  const weight: Record<NotificationType, number> = {
    action: 0,
    update: 1,
    completed: 2,
  };
  return [...items].sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    if (weight[a.type] !== weight[b.type]) {
      return weight[a.type] - weight[b.type];
    }
    return 0;
  });
}

export function NotificationBell() {
  const {
    state,
    toggleNotifications,
    openNotification,
    markAllNotificationsRead,
  } = useJourney();
  const rootRef = useRef<HTMLDivElement>(null);
  const unread = state.notifications.filter((n) => !n.read).length;
  const sorted = sortNotifications(state.notifications);

  useEffect(() => {
    if (!state.notificationsOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        toggleNotifications(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") toggleNotifications(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [state.notificationsOpen, toggleNotifications]);

  return (
    <div className="notif-bell" ref={rootRef}>
      <button
        type="button"
        className="notif-bell__button"
        aria-label={
          unread > 0
            ? `Notificações, ${unread} não lidas`
            : "Notificações"
        }
        aria-expanded={state.notificationsOpen}
        aria-haspopup="dialog"
        onClick={() => toggleNotifications()}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h18v-1l-2-2Z"
            fill="currentColor"
          />
        </svg>
        {unread > 0 && (
          <span className="notif-bell__badge" aria-hidden="true">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {state.notificationsOpen && (
        <div className="notif-popover" role="dialog" aria-label="Notificações">
          <div className="notif-popover__header">
            <h2>Notificações</h2>
            {unread > 0 && (
              <button
                type="button"
                className="btn btn--ghost btn--compact"
                onClick={markAllNotificationsRead}
              >
                Marcar como lidas
              </button>
            )}
          </div>

          {sorted.length === 0 ? (
            <div className="notif-popover__empty">
              <p>Nenhuma notificação no momento.</p>
              <p className="muted">
                Quando houver algo que precise da sua atenção, avisamos aqui.
              </p>
            </div>
          ) : (
            <ul className="notif-list">
              {sorted.map((item) => {
                const meta = TYPE_META[item.type];
                return (
                  <li
                    key={item.id}
                    className={`notif-item ${meta.className}${
                      item.read ? "" : " is-unread"
                    }`}
                  >
                    <div className="notif-item__top">
                      <span className="notif-item__type">{item.title}</span>
                      <span className="notif-item__time">{item.createdAt}</span>
                    </div>
                    <p className="notif-item__desc">{item.description}</p>
                    {item.ctaLabel && (
                      <button
                        type="button"
                        className={`btn btn--compact ${
                          item.type === "action"
                            ? "btn--primary"
                            : "btn--secondary"
                        }`}
                        onClick={() => openNotification(item.id)}
                      >
                        {item.ctaLabel}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
