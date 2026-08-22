import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { affiliateService } from "../../services/affiliateService";
import { CopyButton, formatInr } from "../../components/affiliate/affiliateUi";

const AffiliateLinksPage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    affiliateService
      .getProducts()
      .then((r) => {
        if (r.success) setData(r.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Could not load links");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-500">Loading links...</p>;

  if (error) {
    return (
      <div className="max-w-lg">
        <h1 className="font-display text-2xl font-bold mb-4">Affiliate links</h1>
        <div className="p-4 rounded-xl bg-amber-50 text-amber-800 text-sm">
          {error}{" "}
          <Link to="/affiliate/profile" className="text-brand-600 font-medium hover:underline">
            Complete profile →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Affiliate links</h1>
        <p className="text-sm text-slate-500 mt-1">
          Share these links. When someone purchases through your link, you earn commission.
        </p>
      </div>

      <div className="glass-card p-5">
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Your affiliate code</p>
        <p className="font-mono text-lg font-bold text-brand-700">{data.affiliateCode}</p>
      </div>

      <div className="glass-card p-5 space-y-3">
        <h2 className="font-semibold">General links</h2>
        {Object.entries(data.generalLinks).map(([key, link]) => (
          <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
            <span className="capitalize w-28 shrink-0 text-slate-500">{key}</span>
            <code className="flex-1 truncate text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{link}</code>
            <CopyButton text={link} />
          </div>
        ))}
      </div>

      <div className="glass-card p-5">
        <h2 className="font-semibold mb-4">Paid products ({data.products.length})</h2>
        <ul className="space-y-4 max-h-[520px] overflow-y-auto">
          {data.products.map((product) => (
            <li key={`${product.type}-${product._id}`} className="border-b border-brand-50 dark:border-brand-900/50 pb-4">
              <div className="flex justify-between gap-2 mb-1">
                <p className="font-medium text-sm">{product.title}</p>
                <span className="text-xs text-slate-500 shrink-0 capitalize">
                  {product.type} · {formatInr(product.price)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  {product.link}
                </code>
                <CopyButton text={product.link} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AffiliateLinksPage;
