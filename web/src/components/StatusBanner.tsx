export function StatusBanner({
  label,
  title,
  text,
  variant = "default",
}: {
  label: string;
  title: string;
  text: string;
  variant?: "default" | "pending" | "waiting" | "success";
}) {
  const className =
    variant === "default"
      ? "status-banner"
      : `status-banner status-banner--${variant}`;

  return (
    <div className={className}>
      <p className="status-banner__label">{label}</p>
      <p className="status-banner__title">{title}</p>
      <p className="status-banner__text">{text}</p>
    </div>
  );
}
