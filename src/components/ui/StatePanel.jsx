import { Button } from 'primereact/button';

function StatePanel({
  variant = 'loading',
  title,
  message,
  icon = 'pi pi-spin pi-spinner',
  onRetry,
  retryLabel = 'Retry',
}) {
  return (
    <div className={`state-panel state-panel--${variant}`}>
      <span className="state-panel__icon" aria-hidden="true">
        <i className={icon} />
      </span>
      {title ? <h3 className="state-panel__title">{title}</h3> : null}
      {message ? <p className="state-panel__message">{message}</p> : null}
      {onRetry ? (
        <Button
          type="button"
          label={retryLabel}
          icon="pi pi-refresh"
          onClick={onRetry}
          outlined
        />
      ) : null}
    </div>
  );
}

export default StatePanel;
