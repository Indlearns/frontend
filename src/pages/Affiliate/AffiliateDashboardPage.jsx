import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { affiliateService } from "../../services/affiliateService";
import { formatInr } from "../../components/affiliate/affiliateUi";
import Button from "../../components/common/Button";

const AffiliateDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    affiliateService.getDashboard().then((r) => {
      if (r.success) setData(r.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleWithdraw = async () => {
    if (!confirm("Request withdrawal of your full available balance?")) return;
    setWithdrawLoading(true);
    setError("");
    setMessage("");
    try {
      const r = await affiliateService.requestWithdrawal();
      if (r.success) {
        setMessage(r.message);
        load();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit withdrawal");
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (loading) return <p className="text-slate-500">Loading dashboard...</p>;
  if (!data) return <p className="text-red-600">Could not load dashboard.</p>;

  const { affiliate, recentSales, pendingWithdrawal, minWithdrawal } = data;
  const canWithdraw =
    affiliate.profileComplete &&
    affiliate.availableBalance >= minWithdrawal &&
    !pendingWithdrawal;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Welcome, {affiliate.name}</h1>
        <p className="text-slate-500 text-sm mt-1">Affiliate code: {affiliate.affiliateCode}</p>
      </div>

      {!affiliate.profileComplete && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-sm">
          Complete your profile (KYC + bank details) to unlock affiliate links.{" "}
          <Link to="/affiliate/profile" className="text-brand-600 font-medium hover:underline">
            Complete profile →
          </Link>
        </div>
      )}

      {message && <div className="p-4 rounded-xl bg-green-50 text-green-700 text-sm">{message}</div>}
      {error && <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Available balance</p>
          <p className="text-2xl font-bold text-brand-700 mt-1">{formatInr(affiliate.availableBalance)}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Total earned</p>
          <p className="text-2xl font-bold mt-1">{formatInr(affiliate.totalEarned)}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Total withdrawn</p>
          <p className="text-2xl font-bold mt-1">{formatInr(affiliate.totalWithdrawn)}</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="font-bold text-lg mb-2">Withdraw earnings</h2>
        <p className="text-sm text-slate-500 mb-4">
          Minimum withdrawal ₹{minWithdrawal.toLocaleString("en-IN")}. One request per month. Payment is
          processed manually within <strong>3–4 working days</strong> to your registered bank account.
        </p>
        {pendingWithdrawal ? (
          <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-950/30 text-sm">
            Pending withdrawal of {formatInr(pendingWithdrawal.amount)} submitted on{" "}
            {new Date(pendingWithdrawal.createdAt).toLocaleDateString("en-IN")}. Processing in 3–4 working
            days.
          </div>
        ) : (
          <Button onClick={handleWithdraw} disabled={!canWithdraw || withdrawLoading}>
            {withdrawLoading ? "Submitting..." : "Request withdrawal"}
          </Button>
        )}
        {!canWithdraw && !pendingWithdrawal && affiliate.profileComplete && (
          <p className="text-xs text-slate-500 mt-2">
            {affiliate.availableBalance < minWithdrawal
              ? `Need at least ${formatInr(minWithdrawal)} available to withdraw.`
              : "You may have already requested withdrawal this month."}
          </p>
        )}
      </div>

      <div className="glass-card p-6">
        <h2 className="font-bold text-lg mb-4">Recent sales</h2>
        {recentSales.length === 0 ? (
          <p className="text-sm text-slate-500">No sales yet. Share your affiliate links to start earning.</p>
        ) : (
          <ul className="space-y-3">
            {recentSales.map((sale) => (
              <li
                key={sale._id}
                className="flex justify-between gap-4 text-sm border-b border-brand-50 dark:border-brand-900/50 pb-3"
              >
                <div>
                  <p className="font-medium">{sale.productTitle}</p>
                  <p className="text-xs text-slate-500 capitalize">
                    {sale.purchaseType} · {new Date(sale.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <p className="font-semibold text-brand-600 shrink-0">+{formatInr(sale.commissionAmount)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AffiliateDashboardPage;
