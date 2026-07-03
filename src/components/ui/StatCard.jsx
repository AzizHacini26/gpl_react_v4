function StatCard({
  label,
  value,
  meta,
  icon,
  variant = 'default',
  className = '',
}) {
  return (
    <article className={`ui-card stat-card stat-card--${variant} ${className}`.trim()}>
      <div className="ui-card__body">
        <div className="stat-card__header">
          <p className="stat-card__label">{label}</p>
          {icon ? (
            <span className="stat-card__icon" aria-hidden="true">
              <i className={icon} />
            </span>
          ) : null}
        </div>
        <p className="stat-card__value">{value}</p>
        {meta ? <p className="stat-card__meta">{meta}</p> : null}
      </div>
    </article>
  );
}

export default StatCard;
