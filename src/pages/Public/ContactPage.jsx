import { FiMail, FiHeadphones, FiClock } from "react-icons/fi";
import { Link } from "react-router-dom";

const ContactPage = () => (
  <div className="section-container py-12 lg:py-20">
    <div className="max-w-2xl mx-auto text-center">
      <p className="text-sm font-medium text-brand-600 mb-2">Contact us</p>
      <h1 className="font-display text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
        We are here to help
      </h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
        Have a question about courses, enrollment, payments, or your account? Our support
        team will get back to you as soon as possible.
      </p>
    </div>

    <div className="max-w-lg mx-auto mt-12 glass-card p-8 lg:p-10 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-500/15 flex items-center justify-center mx-auto mb-6">
        <FiHeadphones className="text-brand-600" size={32} />
      </div>
      <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
        INDLearns Support Team
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mt-3 text-sm leading-relaxed">
        For technical issues, billing questions, batch enrollment, and general inquiries.
      </p>

      <a
        href="mailto:support@indlearns.com"
        className="inline-flex items-center justify-center gap-2 mt-8 px-6 py-3 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors"
      >
        <FiMail size={20} />
        support@indlearns.com
      </a>

      <div className="mt-8 pt-6 border-t border-brand-100 dark:border-slate-700 flex items-center justify-center gap-2 text-sm text-slate-500">
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
