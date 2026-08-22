import { Link } from "react-router-dom";
import { COMMISSION_TIERS } from "../../utils/affiliateCommission";
import Button from "../../components/common/Button";
import { AFFILIATE_LOGIN_PATH, AFFILIATE_REGISTER_PATH } from "../../utils/constants";

const AffiliateProgramPage = () => (
  <div className="section-container py-12 lg:py-16">
    <div className="max-w-3xl mx-auto text-center mb-12">
      <h1 className="font-display text-3xl lg:text-4xl font-bold">IndLearn Affiliate Program</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400 text-lg">
        Share paid courses, workshops, and hackathons. Earn fixed commission on every successful sale
        through your unique affiliate link.
      </p>
      <div className="flex flex-wrap justify-center gap-3 mt-8">
        <Link to={AFFILIATE_REGISTER_PATH}>
          <Button>Become an affiliate</Button>
        </Link>
        <Link to={AFFILIATE_LOGIN_PATH}>
          <Button variant="outline">Affiliate login</Button>
        </Link>
      </div>
    </div>

    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 mb-12">
      <div className="glass-card p-6">
        <h2 className="font-bold text-lg mb-3">How it works</h2>
        <ol className="space-y-3 text-sm text-slate-600 dark:text-slate-400 list-decimal list-inside">
          <li>Register and complete your profile (KYC + bank details)</li>
          <li>Get unique affiliate links for each paid product</li>
          <li>Share links on social media, WhatsApp, or with your network</li>
          <li>Earn commission when someone purchases through your link</li>
          <li>Request withdrawal once a month (minimum ₹1,000)</li>
        </ol>
      </div>
      <div className="glass-card p-6">
        <h2 className="font-bold text-lg mb-3">Withdrawal policy</h2>
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li>Minimum withdrawal: ₹1,000</li>
          <li>One withdrawal request per calendar month</li>
          <li>Processed manually within 3–4 working days</li>
          <li>Payment sent to your registered bank account</li>
        </ul>
      </div>
    </div>

    <div className="max-w-3xl mx-auto glass-card p-6 lg:p-8">
      <h2 className="font-bold text-xl mb-4 text-center">Commission structure</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-100 dark:border-brand-800">
              <th className="text-left py-3 pr-4 font-semibold">Product price</th>
              <th className="text-right py-3 font-semibold">Your commission</th>
            </tr>
          </thead>
          <tbody>
            {COMMISSION_TIERS.map((tier) => (
              <tr key={tier.label} className="border-b border-brand-50 dark:border-brand-900/50">
                <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">{tier.label}</td>
                <td className="py-3 text-right font-semibold text-brand-700 dark:text-brand-300">
                  ₹{tier.commission}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default AffiliateProgramPage;
