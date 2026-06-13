import { useState } from "react";
import { Link } from "react-router-dom";
import { APP_NAME } from "../../utils/constants";

/** Brand image: frontend/public/logo.png */
const LOGO_SRC = "/logo.png";

const variants = {
  /** Top navbar — larger; scale compensates for extra padding in PNG */
  nav: {
    wrap: "inline-flex items-center shrink-0 h-16 sm:h-[4.75rem] lg:h-[5.25rem] max-w-[300px] sm:max-w-[360px] lg:max-w-[420px] overflow-visible",
    img: "block h-14 sm:h-16 lg:h-[4.25rem] w-auto max-w-full object-contain object-left origin-left scale-[2] sm:scale-[2.35] lg:scale-[2.65]",
  },
  auth: {
    wrap: "flex justify-center w-full max-w-[380px] mx-auto py-2 overflow-visible",
    img: "block h-16 sm:h-20 w-auto max-w-full object-contain scale-[2.2] sm:scale-[2.5] origin-center",
  },
  footer: {
    wrap: "inline-flex items-center h-16 max-w-[280px] overflow-visible",
    img: "block h-14 w-auto max-w-full object-contain object-left scale-[2] origin-left",
  },
  sidebar: {
    wrap: "inline-flex items-center w-full max-w-[220px] h-12 shrink-0 overflow-visible",
    img: "block h-10 w-auto max-w-full object-contain object-left scale-[1.85] origin-left",
  },
};

const Logo = ({ className = "", variant = "nav", to = "/" }) => {
  const [imgError, setImgError] = useState(false);
  const v = variants[variant] || variants.nav;

  return (
    <Link
      to={to}
      className={`group ${v.wrap} ${className}`}
      aria-label={`${APP_NAME} home`}
    >
      {!imgError ? (
        <img
          src={LOGO_SRC}
          alt={APP_NAME}
          className={`${v.img} transition-opacity duration-200 group-hover:opacity-90`}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="h-12 min-w-[140px] px-4 rounded-xl bg-brand-gradient flex items-center justify-center">
          <span className="text-white font-display font-bold text-xl tracking-tight">
            INDLearns
          </span>
        </div>
      )}
    </Link>
  );
};

export default Logo;
