import { useRef } from "react";
import {
  FiBold,
  FiItalic,
  FiList,
  FiHash,
  FiType,
} from "react-icons/fi";
import FormattedDescription from "../common/FormattedDescription";
import {
  applyTextareaUpdate,
  wrapSelection,
  prefixSelectedLines,
  insertHeading,
} from "../../utils/descriptionFormat";

const ToolbarButton = ({ title, onClick, children, active = false }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`p-2 rounded-lg text-sm transition-colors ${
      active
        ? "bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300"
        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
    }`}
  >
    {children}
  </button>
);

/**
 * Rich description editor for courses, workshops, and hackathons.
 * Stores plain text using the same markup FormattedDescription renders on the public site.
 */
const DescriptionEditor = ({
  label = "Description",
  value,
  onChange,
  required = false,
  minRows = 8,
  placeholder = "Write the description — use the toolbar or type directly.",
  showPreview = true,
}) => {
  const textareaRef = useRef(null);

  const runAction = (fn) => {
    const el = textareaRef.current;
    if (!el) return;
    const { newValue, cursor } = fn(el);
    onChange(newValue);
    requestAnimationFrame(() => applyTextareaUpdate(el, newValue, cursor));
  };

  const toolbar = [
    {
      title: "Bold",
      icon: <FiBold size={16} />,
      action: () => runAction((el) => wrapSelection(el, "**", "**", "bold text")),
    },
    {
      title: "Italic",
      icon: <FiItalic size={16} />,
      action: () => runAction((el) => wrapSelection(el, "*", "*", "italic text")),
    },
    {
      title: "Heading",
      icon: <FiHash size={16} />,
      action: () => runAction((el) => insertHeading(el, 2)),
    },
    {
      title: "Subheading",
      icon: <FiType size={16} />,
      action: () => runAction((el) => insertHeading(el, 3)),
    },
    {
      title: "Bullet list",
      icon: <FiList size={16} />,
      action: () => runAction((el) => prefixSelectedLines(el, "- ")),
    },
    {
      title: "Numbered list",
      icon: <span className="text-xs font-bold leading-none">1.</span>,
      action: () => runAction((el) => prefixSelectedLines(el, "1.")),
    },
    {
      title: "Section title (ends with colon)",
      icon: <span className="text-xs font-semibold">A:</span>,
      action: () => runAction((el) => wrapSelection(el, "", ":", "Section title")),
    },
  ];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>

      <div className="rounded-xl border border-brand-200 dark:border-brand-800 overflow-hidden bg-white dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-brand-100 dark:border-brand-800 bg-slate-50/80 dark:bg-slate-800/50">
          {toolbar.map((item) => (
            <ToolbarButton key={item.title} title={item.title} onClick={item.action}>
              {item.icon}
            </ToolbarButton>
          ))}
        </div>

        <textarea
          ref={textareaRef}
          required={required}
          rows={minRows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 text-sm text-slate-900 dark:text-slate-100 bg-transparent outline-none resize-y min-h-[140px] font-sans leading-relaxed"
        />
      </div>

      <p className="text-xs text-slate-500">
        Formatting uses the same styles as the public website (Inter / Plus Jakarta Sans). Shortcuts:{" "}
        <code className="text-brand-600">**bold**</code>, <code className="text-brand-600">*italic*</code>,{" "}
        <code className="text-brand-600">## Heading</code>, <code className="text-brand-600">- bullet</code>,{" "}
        <code className="text-brand-600">1. numbered</code>, <code className="text-brand-600">Title:</code>
      </p>

      {showPreview && (
        <div className="rounded-xl border border-dashed border-brand-200 dark:border-brand-800 p-4 bg-brand-50/30 dark:bg-brand-950/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 mb-3">
            Website preview
          </p>
          {value?.trim() ? (
            <FormattedDescription text={value} />
          ) : (
            <p className="text-sm text-slate-400 italic">Preview appears here as you type.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DescriptionEditor;
