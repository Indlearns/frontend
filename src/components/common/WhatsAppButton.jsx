import { FaWhatsapp } from "react-icons/fa";
import { getWhatsAppUrl } from "../../utils/constants";

/**
 * Link that opens WhatsApp Business chat (wa.me).
 * @param {"button"|"link"|"icon"} variant
 */
const WhatsAppButton = ({
  message,
  variant = "button",
  className = "",
  children,
}) => {
  const href = getWhatsAppUrl(message);
  const label = children || "Message us on WhatsApp";

  if (variant === "icon") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center p-2 rounded-lg bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors ${className}`}
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp size={18} />
      </a>
    );
  }

  if (variant === "link") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 text-[#128C7E] hover:underline font-medium ${className}`}
      >
        <FaWhatsapp size={18} className="shrink-0" />
        {label}
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-[#25D366] text-white font-semibold hover:bg-[#20bd5a] transition-colors ${className}`}
    >
      <FaWhatsapp size={20} />
      {label}
    </a>
  );
};

export default WhatsAppButton;
