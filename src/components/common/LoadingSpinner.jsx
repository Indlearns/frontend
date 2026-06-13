/**
 * Full-page or inline loading indicator
 */
const LoadingSpinner = ({ fullScreen = false }) => {
  const spinner = (
    <div
      className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"
      role="status"
      aria-label="Loading"
    />
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        {spinner}
      </div>
    );
  }

  return <div className="flex justify-center py-12">{spinner}</div>;
};

export default LoadingSpinner;
