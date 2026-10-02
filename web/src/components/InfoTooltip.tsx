import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

export function InfoTooltip({
  label,
  actionLabel,
  onAction,
}: {
  label: string;
  actionLabel: string;
  onAction: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const closeTimer = useRef<number | null>(null);
  const tipId = useId();

  const clearCloseTimer = () => {
    if (closeTimer.current != null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const show = () => {
    clearCloseTimer();
    setOpen(true);
  };

  const scheduleHide = () => {
    if (pinned) return;
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => {
      setOpen(false);
      closeTimer.current = null;
    }, 220);
  };

  const close = () => {
    clearCloseTimer();
    setPinned(false);
    setOpen(false);
  };

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        close();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open, pinned]);

  return (
    <span
      className="info-tip"
      ref={rootRef}
      onMouseEnter={show}
      onMouseLeave={scheduleHide}
    >
      <button
        type="button"
        className="info-tip__button"
        aria-label={label}
        aria-controls={tipId}
        aria-expanded={open}
        onFocus={show}
        onBlur={(event) => {
          if (!rootRef.current?.contains(event.relatedTarget as Node)) {
            scheduleHide();
          }
        }}
        onClick={() => {
          if (open && pinned) {
            close();
            return;
          }
          clearCloseTimer();
          setPinned(true);
          setOpen(true);
        }}
      >
        ⓘ
      </button>
      {open && (
        <span
          className="info-tip__popover"
          id={tipId}
          role="dialog"
          aria-label={label}
          onMouseEnter={show}
          onMouseLeave={scheduleHide}
        >
          <span className="info-tip__text">{label}</span>
          <button
            type="button"
            className="info-tip__action"
            onClick={() => {
              close();
              onAction();
            }}
          >
            {actionLabel}
          </button>
        </span>
      )}
    </span>
  );
}

export function FieldLabelWithInfo({
  children,
  ...tipProps
}: {
  children: ReactNode;
} & Parameters<typeof InfoTooltip>[0]) {
  return (
    <span className="field-label-with-info">
      {children}
      <InfoTooltip {...tipProps} />
    </span>
  );
}
