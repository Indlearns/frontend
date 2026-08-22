import { Link } from "react-router-dom";
import { FiCopy, FiCheck } from "react-icons/fi";
import { useState } from "react";

const CopyButton = ({ text, label = "Copy" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700"
    >
      {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
      {copied ? "Copied" : label}
    </button>
  );
};

export const formatInr = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export { CopyButton, Link };
