import { Link } from "react-router-dom";
import { LEGAL_LAST_UPDATED } from "../../content/policies";

const LegalDocumentPage = ({ document }) => {
  const { title, sections } = document;

  return (
    <div className="section-container py-12 lg:py-16 max-w-3xl">
      <Link to="/" className="text-sm text-brand-600 hover:underline">
        ← Back to home
      </Link>
      <h1 className="font-display text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mt-4">
        {title}
      </h1>
      <p className="text-sm text-slate-500 mt-2 mb-10">
        Last Updated: {LEGAL_LAST_UPDATED}
      </p>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
        {sections.map((section, idx) => (
          <section key={idx}>
            {section.heading && (
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                {section.heading}
              </h2>
            )}
            {section.paragraphs?.map((p, i) => (
              <p
                key={i}
                className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3"
              >
                {p.includes("support@indlearns.com") ? (
                  <>
                    {p.split("support@indlearns.com")[0]}
                    <a
                      href="mailto:support@indlearns.com"
                      className="text-brand-600 hover:underline"
                    >
                      support@indlearns.com
                    </a>
                    {p.split("support@indlearns.com")[1]}
                  </>
                ) : (
                  p
                )}
              </p>
            ))}
            {section.list?.length > 0 && (
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-brand-100 dark:border-slate-800 flex flex-wrap gap-4 text-sm">
        <Link to="/privacy" className="text-brand-600 hover:underline">
          Privacy Policy
        </Link>
        <Link to="/terms" className="text-brand-600 hover:underline">
          Terms and Conditions
        </Link>
        <Link to="/refund" className="text-brand-600 hover:underline">
          Refund Policy
        </Link>
      </div>
    </div>
  );
};

export default LegalDocumentPage;
