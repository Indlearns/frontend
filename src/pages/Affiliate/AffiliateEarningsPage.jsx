import { useEffect, useState } from "react";
import { affiliateService } from "../../services/affiliateService";
import { formatInr } from "../../components/affiliate/affiliateUi";

const AffiliateEarningsPage = () => {
  const [sales, setSales] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([affiliateService.getSales(), affiliateService.getWithdrawals()]).then(
      ([salesRes, withdrawalsRes]) => {
        if (salesRes.success) setSales(salesRes.data);
        if (withdrawalsRes.success) setWithdrawals(withdrawalsRes.data);
      }
    ).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-500">Loading earnings...</p>;

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="font-display text-2xl font-bold">Earnings history</h1>

      <div className="glass-card p-6">
        <h2 className="font-semibold mb-4">Sales & commissions</h2>
        {sales.length === 0 ? (
          <p className="text-sm text-slate-500">No sales recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-brand-100 dark:border-brand-800">
                  <th className="py-2 pr-4">Product</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Price</th>
                  <th className="py-2 pr-4">Commission</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale._id} className="border-b border-brand-50 dark:border-brand-900/50">
                    <td className="py-3 pr-4 font-medium">{sale.productTitle}</td>
                    <td className="py-3 pr-4 capitalize text-slate-500">{sale.purchaseType}</td>
                    <td className="py-3 pr-4">{formatInr(sale.productPrice)}</td>
                    <td className="py-3 pr-4 text-brand-600 font-semibold">
                      {formatInr(sale.commissionAmount)}
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(sale.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="glass-card p-6">
        <h2 className="font-semibold mb-4">Withdrawal requests</h2>
        {withdrawals.length === 0 ? (
          <p className="text-sm text-slate-500">No withdrawal requests yet.</p>
        ) : (
          <ul className="space-y-3">
            {withdrawals.map((w) => (
              <li
                key={w._id}
                className="flex flex-wrap justify-between gap-2 text-sm border-b border-brand-50 dark:border-brand-900/50 pb-3"
              >
                <div>
                  <p className="font-medium">{formatInr(w.amount)}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(w.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full h-fit ${
                    w.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {w.status === "completed" ? "Payment completed" : "Pending (3–4 working days)"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AffiliateEarningsPage;
