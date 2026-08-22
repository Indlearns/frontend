import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import PageHeader from "../../components/admin/PageHeader";
import Button from "../../components/common/Button";

const formatInr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const AffiliatesPage = () => {
  const [affiliates, setAffiliates] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [tab, setTab] = useState("affiliates");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [affRes, wRes] = await Promise.all([
        adminService.getAffiliates(),
        adminService.getAffiliateWithdrawals("pending"),
      ]);
      if (affRes.success) {
        setAffiliates(affRes.data);
        setPendingCount(affRes.pendingWithdrawals || 0);
      }
      if (wRes.success) setWithdrawals(wRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openDetail = async (id) => {
    setSelected(id);
    const r = await adminService.getAffiliate(id);
    if (r.success) setDetail(r.data);
  };

  const completeWithdrawal = async (id) => {
    if (!confirm("Mark this withdrawal as payment completed? The affiliate will be notified.")) return;
    setActionLoading(id);
    try {
      await adminService.completeAffiliateWithdrawal(id);
      setDetail(null);
      setSelected(null);
      load();
    } finally {
      setActionLoading("");
    }
  };

  const toggleActive = async (id) => {
    await adminService.toggleAffiliateActive(id);
    load();
    if (selected === id) openDetail(id);
  };

  return (
    <div>
      <PageHeader
        title="Affiliate marketing"
        subtitle="Manage affiliate registrations, track sales & commissions, and process withdrawal requests."
      />

      {pendingCount > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-sm">
          <strong>{pendingCount}</strong> pending withdrawal request{pendingCount === 1 ? "" : "s"} need
          processing.
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setTab("affiliates")}
          className={`px-4 py-2 rounded-xl text-sm font-medium ${
            tab === "affiliates" ? "bg-brand-600 text-white" : "bg-white dark:bg-slate-800 border"
          }`}
        >
          Affiliates ({affiliates.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("withdrawals")}
          className={`px-4 py-2 rounded-xl text-sm font-medium ${
            tab === "withdrawals" ? "bg-brand-600 text-white" : "bg-white dark:bg-slate-800 border"
          }`}
        >
          Withdrawals {pendingCount > 0 && `(${pendingCount} pending)`}
        </button>
      </div>

      {loading && <p className="text-slate-500">Loading...</p>}

      {!loading && tab === "affiliates" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-2 pr-2">Name</th>
                  <th className="py-2 pr-2">Sales</th>
                  <th className="py-2 pr-2">Earned</th>
                  <th className="py-2">Balance</th>
                </tr>
              </thead>
              <tbody>
                {affiliates.map((a) => (
                  <tr
                    key={a._id}
                    className={`border-b cursor-pointer hover:bg-brand-50/50 ${
                      selected === a._id ? "bg-brand-50/80" : ""
                    }`}
                    onClick={() => openDetail(a._id)}
                  >
                    <td className="py-3 pr-2">
                      <p className="font-medium">{a.name}</p>
                      <p className="text-xs text-slate-500">{a.affiliateCode}</p>
                    </td>
                    <td className="py-3 pr-2">{a.salesCount}</td>
                    <td className="py-3 pr-2">{formatInr(a.totalEarned)}</td>
                    <td className="py-3">{formatInr(a.availableBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!affiliates.length && (
              <p className="text-sm text-slate-500 py-4">No affiliates registered yet.</p>
            )}
          </div>

          <div className="glass-card p-6">
            {!detail ? (
              <p className="text-sm text-slate-500">Select an affiliate to view full details.</p>
            ) : (
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h2 className="font-bold text-lg">{detail.affiliate.name}</h2>
                    <p className="text-slate-500">{detail.affiliate.email}</p>
                    <p className="text-slate-500">{detail.affiliate.phone}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleActive(detail.affiliate._id)}
                    className="text-xs text-brand-600"
                  >
                    {detail.affiliate.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <p className="text-xs text-slate-500">Total earned</p>
                    <p className="font-bold">{formatInr(detail.affiliate.totalEarned)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <p className="text-xs text-slate-500">Available</p>
                    <p className="font-bold">{formatInr(detail.affiliate.availableBalance)}</p>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-1">KYC ({detail.affiliate.kycType || "—"})</p>
                  <p className="text-slate-600">
                    {detail.affiliate.kycType === "aadhar"
                      ? detail.affiliate.aadharNumber
                      : detail.affiliate.panNumber || "—"}
                  </p>
                </div>

                <div>
                  <p className="font-medium mb-1">Bank account</p>
                  <p className="text-slate-600">
                    {detail.affiliate.bankAccountHolderName}
                    <br />
                    A/C: {detail.affiliate.bankAccountNumber}
                    <br />
                    {detail.affiliate.bankIfsc} · {detail.affiliate.bankName}
                  </p>
                </div>

                <div>
                  <p className="font-medium mb-2">Sales ({detail.sales.length})</p>
                  <ul className="max-h-48 overflow-y-auto space-y-2">
                    {detail.sales.map((s) => (
                      <li key={s._id} className="flex justify-between text-xs border-b pb-2">
                        <span>
                          {s.productTitle} ({s.purchaseType})
                        </span>
                        <span className="text-brand-600 font-medium">+{formatInr(s.commissionAmount)}</span>
                      </li>
                    ))}
                    {!detail.sales.length && <li className="text-slate-500">No sales yet</li>}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!loading && tab === "withdrawals" && (
        <div className="glass-card p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="py-2 pr-4">Affiliate</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Bank</th>
                <th className="py-2 pr-4">Requested</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w._id} className="border-b align-top">
                  <td className="py-3 pr-4">
                    <p className="font-medium">{w.affiliateName || w.affiliate?.name}</p>
                    <p className="text-xs text-slate-500">{w.affiliateEmail || w.affiliate?.email}</p>
                    <p className="text-xs text-slate-500">{w.affiliatePhone}</p>
                  </td>
                  <td className="py-3 pr-4 font-semibold">{formatInr(w.amount)}</td>
                  <td className="py-3 pr-4 text-xs">
                    {w.bankAccountHolderName}
                    <br />
                    {w.bankAccountNumber}
                    <br />
                    {w.bankIfsc} · {w.bankName}
                  </td>
                  <td className="py-3 pr-4 text-slate-500">
                    {new Date(w.createdAt).toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 pr-4 capitalize">{w.status}</td>
                  <td className="py-3">
                    {w.status === "pending" && (
                      <Button
                        className="text-sm px-3 py-1.5"
                        disabled={actionLoading === w._id}
                        onClick={() => completeWithdrawal(w._id)}
                      >
                        {actionLoading === w._id ? "..." : "Payment completed"}
                      </Button>
                    )}
                    {w.status === "completed" && (
                      <span className="text-xs text-green-600">
                        Done {w.completedAt && new Date(w.completedAt).toLocaleDateString("en-IN")}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!withdrawals.length && (
            <p className="text-sm text-slate-500 py-4">No pending withdrawal requests.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AffiliatesPage;
