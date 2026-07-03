function PageHeader({ title, subtitle, actions }) {
  return (
    <header className="page-header">
      <div className="page-header__content">
        <h1 className="page-header__title">{title}</h1>
        {subtitle ? <p className="page-header__subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </header>
  );
}

export default PageHeader;
