import { useState } from "react";

const COMPANIES = [
  { name: "Tata Communications", domain: "tatacommunications.com", color: "#E31837" },
  { name: "Chargebee", domain: "chargebee.com", color: "#FF6B35" },
  { name: "Clayfin", domain: "clayfin.com", color: "#2563EB" },
  { name: "DBS", domain: "dbs.com", color: "#C41230" },
  { name: "Flipkart", domain: "flipkart.com", color: "#2874F0" },
  { name: "Freshworks", domain: "freshworks.com", color: "#1DAA61" },
  { name: "JUSPAY", domain: "juspay.in", color: "#6366F1" },
  { name: "PayPal", domain: "paypal.com", color: "#003087" },
  { name: "Scapic", domain: "flipkart.com", color: "#7C3AED" },
  { name: "Zoho", domain: "zoho.com", color: "#E42527" },
  { name: "Infosys", domain: "infosys.com", color: "#007CC3" },
  { name: "Wipro", domain: "wipro.com", color: "#341758" },
];

const ROW_A = COMPANIES.slice(0, 6);
const ROW_B = COMPANIES.slice(6);

const initialsFor = (name) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const CompanyPill = ({ company }) => {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <div className="learners-marquee-pill">
      {logoFailed ? (
        <span
          className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold text-white"
          style={{ backgroundColor: company.color }}
        >
          {initialsFor(company.name)}
        </span>
      ) : (
        <img
          src={`https://www.google.com/s2/favicons?domain=${company.domain}&sz=64`}
          alt=""
          className="w-8 h-8 rounded-full object-contain shrink-0 bg-white p-0.5"
          loading="lazy"
          onError={() => setLogoFailed(true)}
        />
      )}
      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">
        {company.name}
      </span>
    </div>
  );
};

const MarqueeRow = ({ items, reverse = false, duration = "45s" }) => {
  const track = [...items, ...items];

  return (
    <div className="learners-marquee-row">
      <div
        className={`learners-marquee-track ${reverse ? "learners-marquee-reverse" : ""}`}
        style={{ "--marquee-duration": duration }}
      >
        {track.map((company, i) => (
          <CompanyPill key={`${company.name}-${i}`} company={company} />
        ))}
      </div>
    </div>
  );
};

const LearnersWorkAtMarquee = ({
  title = "Our Learners Work At",
  subtitle = "Graduates from IndLearn programs are building careers at leading companies worldwide.",
}) => (
  <section className="py-16 lg:py-20 overflow-hidden bg-white dark:bg-[#0A1628]">
    <div className="section-container mb-10 lg:mb-12">
      <h2 className="section-title text-center text-slate-900 dark:text-white">{title}</h2>
      {subtitle && (
        <p className="text-center text-slate-600 dark:text-slate-400 mt-3 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>

    <div className="space-y-4 lg:space-y-5">
      <MarqueeRow items={ROW_A} duration="50s" />
      <MarqueeRow items={ROW_B.length ? ROW_B : ROW_A} reverse duration="55s" />
    </div>
  </section>
);

export default LearnersWorkAtMarquee;
