function StatusBadge({ label, variant = 'neutral' }) {
  return (
    <span className={`status-badge status-badge--${variant}`}>
      {label}
    </span>
  );
}

export default StatusBadge;
