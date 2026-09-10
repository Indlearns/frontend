import { FaWhatsapp } from "react-icons/fa";
import { getWhatsAppUrl } from "../../utils/constants";

/** Fixed WhatsApp Business chat button for public pages */
const WhatsAppFloat = () => (
  <a
    href={getWhatsAppUrl()}
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 hover:bg-[#20bd5a] hover:scale-105 active:scale-95 transition-all"
    aria-label="Chat with INDLearns on WhatsApp"
    title="Chat on WhatsApp"
  >
    <FaWhatsapp size={28} />
  </a>
);

export default WhatsAppFloat;
