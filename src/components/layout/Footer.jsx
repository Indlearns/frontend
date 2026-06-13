import { Link } from "react-router-dom";
import { FiGithub, FiLinkedin, FiTwitter, FiMail } from "react-icons/fi";
import Logo from "../common/Logo";
import { APP_NAME } from "../../utils/constants";

/**
 * Site footer - links, social icons, copyright
 */
const Footer = () => {
  const footerLinks = {
    Platform: [
      { label: "Courses", path: "/courses" },
      { label: "Workshops", path: "/workshops" },
      { label: "Events", path: "/events" },
      { label: "Mentorship", path: "/mentorship" },
    ],
    Company: [
      { label: "About Us", path: "/about" },
      { label: "Contact Us", path: "/contact" },
    ],
    Legal: [
      { label: "Privacy Policy", path: "/privacy" },
      { label: "Terms and Conditions", path: "/terms" },
      { label: "Refund Policy", path: "/refund" },
    ],
  };

  return (
    <footer className="bg-brand-950 text-brand-100 mt-auto">
      <div className="section-container py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Logo variant="footer" />
            <p className="mt-4 text-brand-200/80 max-w-sm leading-relaxed">
              Empowering learners with world-class education, mentorship, and
              career-ready skills. Build your future with {APP_NAME}.
            </p>
            <div className="flex gap-4 mt-6">
              {[FiTwitter, FiLinkedin, FiGithub].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-2 rounded-lg bg-brand-900 hover:bg-brand-500 text-brand-200 hover:text-white transition-colors"
                  aria-label="Social link"
                >
                  <Icon size={18} />
                </a>
              ))}
              <a
                href="mailto:support@indlearns.com"
                className="p-2 rounded-lg bg-brand-900 hover:bg-brand-500 text-brand-200 hover:text-white transition-colors"
                aria-label="Email support"
              >
                <FiMail size={18} />
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-slate-400 hover:text-brand-400 transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-brand-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-brand-300/60">
          <p>© {new Date().getFullYear()} INDLearns. All rights reserved.</p>
          <div className="flex flex-wrap gap-4 justify-center sm:justify-end">
            <Link to="/privacy" className="hover:text-brand-400 transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-brand-400 transition-colors">
              Terms
            </Link>
            <Link to="/refund" className="hover:text-brand-400 transition-colors">
              Refunds
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
