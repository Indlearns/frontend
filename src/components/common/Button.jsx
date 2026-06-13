/**
 * Reusable button - variants: primary, outline, ghost
 */
const Button = ({
  children,
  variant = "primary",
  type = "button",
  className = "",
  disabled = false,
  onClick,
  ...props
}) => {
  const variants = {
    primary: "btn-primary",
    outline: "btn-outline",
    ghost:
      "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
