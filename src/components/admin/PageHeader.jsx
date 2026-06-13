const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-950 dark:text-white">
        {title}
      </h1>
      {subtitle && <p className="text-slate-600 dark:text-slate-400 mt-1">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export default PageHeader;
