import { FiMail, FiHeadphones, FiClock, FiPhone, FiLinkedin, FiInstagram } from "react-icons/fi";
import { Link } from "react-router-dom";
import { CONTACT } from "../../utils/constants";

const ContactPage = () => (
  <div className="section-container py-12 lg:py-20">
    <div className="max-w-2xl mx-auto text-center">
      <p className="text-sm font-medium text-brand-600 mb-2">Contact us</p>
      <h1 className="font-display text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
        We are here to help
      </h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
        Have a question about courses, enrollment, payments, or your account? Reach our support
        team by email or phone.
      </p>
    </div>

    <div className="max-w-lg mx-auto mt-12 glass-card p-8 lg:p-10 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-500/15 flex items-center justify-center mx-auto mb-6">
        <FiHeadphones className="text-brand-600" size={32} />
      </div>
      <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
        INDLearns Support
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mt-3 text-sm leading-relaxed">
        For technical issues, billing questions, batch enrollment, and general inquiries.
      </p>

      <div className="mt-8 space-y-3">
        <a
          href={`mailto:${CONTACT.email}`}
          className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors"
        >
          <FiMail size={20} />
          {CONTACT.email}
        </a>
        <a
          href={`tel:${CONTACT.phoneTel}`}
          className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl border border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-300 font-semibold hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors"
        >
          <FiPhone size={20} />
          {CONTACT.phoneDisplay}
        </a>
      </div>

      <div className="mt-8 pt-6 border-t border-brand-100 dark:border-slate-700">
        <p className="text-sm text-slate-500 mb-4">Follow us</p>
        <div className="flex items-center justify-center gap-4">
          <a
            href={CONTACT.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-brand-600 hover:underline"
          >
            <FiLinkedin size={18} />
            LinkedIn
          </a>
          <a
            href={CONTACT.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-brand-600 hover:underline"
          >
            <FiInstagram size={18} />
            Instagram
          </a>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
        <FiClock size={16} />
        <span>Typical response within 1–2 business days</span>
      </div>
    </div>

    <p className="text-center text-sm text-slate-500 mt-10 max-w-md mx-auto">
      Before writing in, you may find answers in our{" "}
      <Link to="/privacy" className="text-brand-600 hover:underline">
        Privacy Policy
      </Link>
      ,{" "}
      <Link to="/terms" className="text-brand-600 hover:underline">
        Terms
      </Link>
      , or{" "}
      <Link to="/refund" className="text-brand-600 hover:underline">
        Refund Policy
      </Link>
      .
    </p>
  </div>
);

export default ContactPage;
