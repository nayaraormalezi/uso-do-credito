import { useEffect, useRef, useState } from "react";
import { useJourney } from "../context/JourneyContext";

export function UserMenu() {
  const { state, goTo, requestExit, openProfile } = useJourney();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const goToPersonalData = () => {
    setOpen(false);
    openProfile();
  };

  const handleExit = () => {
    setOpen(false);
    if (state.activeDraftId) {
      requestExit();
      return;
    }
    goTo("hub");
  };

  return (
    <div className="user-menu" ref={rootRef}>
      <button
        type="button"
        className="user-menu__trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="user-menu__avatar" aria-hidden="true">
          {state.customerName.slice(0, 1).toUpperCase()}
        </span>
        <span className="user-menu__name">{state.customerName}</span>
        <span className="user-menu__caret" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div className="user-menu__popover" role="menu" aria-label="Conta">
          <button
            type="button"
            className="user-menu__item"
            role="menuitem"
            onClick={goToPersonalData}
          >
            Ver dados cadastrais
          </button>
          <button
            type="button"
            className="user-menu__item"
            role="menuitem"
            onClick={handleExit}
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
