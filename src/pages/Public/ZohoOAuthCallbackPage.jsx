import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { paymentService } from "../../services/paymentService";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";

/**
 * Server-based Zoho OAuth callback.
 * Register this exact URL in Zoho API Console as Authorized Redirect URI.
 */
const ZohoOAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [refreshToken, setRefreshToken] = useState("");

  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");

  useEffect(() => {
    if (oauthError) {
      setStatus("error");
      setMessage(`Zoho authorization failed: ${oauthError}`);
      return;
    }

    if (!code) {
      setStatus("error");
      setMessage("No authorization code in the URL. Start from the Zoho OAuth setup link.");
      return;
    }

    setStatus("loading");
    setMessage("Exchanging authorization code for refresh token...");

    paymentService
      .exchangeZohoCode(code)
      .then((r) => {
        if (r.success && r.data?.refreshToken) {
          setRefreshToken(r.data.refreshToken);
          setStatus("success");
          setMessage(r.message || "Refresh token generated. Add it to your backend env and redeploy.");
          return;
        }
        setStatus("error");
        setMessage(r.message || "Could not exchange authorization code.");
      })
      .catch((err) => {
        setStatus("error");
        const apiMsg = err.response?.data?.message;
        if (err.response?.status === 401 || err.response?.status === 403) {
          setMessage(
            apiMsg ||
              "Sign in as super admin first, then open the Zoho authorization link again."
          );
        } else {
          setMessage(apiMsg || "Could not exchange authorization code.");
        }
      });
  }, [code, oauthError]);

  return (
    <div className="section-container py-16 max-w-xl mx-auto">
      <h1 className="font-display text-2xl font-bold">Zoho Payments setup</h1>
      <p className="text-sm text-slate-500 mt-2">
        Server-based OAuth callback for IndLearn payment gateway.
      </p>

      {status === "loading" && (
        <div className="mt-8">
          <LoadingSpinner />
          <p className="text-slate-600 mt-4">{message}</p>
        </div>
      )}

      {status === "success" && (
        <div className="mt-8 p-6 rounded-xl bg-green-50 border border-green-200">
          <p className="text-green-800 font-medium">{message}</p>
          <p className="text-sm text-slate-600 mt-3">
            Add this to Render (and local backend/.env), then redeploy:
          </p>
          <pre className="mt-3 p-4 rounded-lg bg-slate-900 text-green-300 text-xs overflow-x-auto whitespace-pre-wrap break-all">
            ZOHO_PAYMENTS_REFRESH_TOKEN={refreshToken}
          </pre>
          <p className="text-xs text-amber-700 mt-3">
            Save this token now — it is shown only once here.
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="mt-8 p-6 rounded-xl bg-red-50 border border-red-200">
          <p className="text-red-800">{message}</p>
          <p className="text-sm text-slate-600 mt-4">
            Steps: sign in as super admin → visit the Zoho authorization URL → approve → you land
            here again with a fresh code.
          </p>
          <Link to="/superadmin/login" className="inline-block mt-4">
            <Button type="button">Super admin login</Button>
          </Link>
        </div>
      )}

      <Link to="/admin" className="inline-block mt-8 text-sm text-brand-600 hover:underline">
        ← Back to admin
      </Link>
    </div>
  );
};

export default ZohoOAuthCallbackPage;
