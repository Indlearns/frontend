import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { paymentService } from "../../services/paymentService";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getPurchaseType } from "../../utils/purchaseFlow";

const PaymentReturnPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    const payload = Object.fromEntries(searchParams.entries());
    const purchaseType = payload.udf1 === "workshop" ? "workshop" : "course";
    const itemId = payload.udf2;
    const flow = getPurchaseType(purchaseType === "workshop" ? "workshop" : "course");

    if (!itemId || !flow) {
      setStatus("error");
      setMessage("Invalid payment return data.");
      return;
    }

    const verify =
      purchaseType === "course"
        ? paymentService.verifyCoursePayment(payload)
        : paymentService.verifyWorkshopPayment(payload);

    verify
      .then((r) => {
        if (r.success) {
          setStatus("success");
          setMessage(r.message || "Payment successful.");
          window.dispatchEvent(new CustomEvent("student-enrollment-changed"));
          setTimeout(() => {
            navigate(purchaseType === "course" ? "/student" : flow.detailPath(itemId), {
              replace: true,
            });
          }, 2000);
        } else {
          setStatus("error");
          setMessage(r.message || "Payment verification failed.");
        }
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.message || "Payment verification failed.");
      });
  }, [searchParams, navigate]);

  return (
    <div className="section-container py-16 max-w-lg mx-auto text-center">
      {status === "loading" && <LoadingSpinner />}
      <h1 className="font-display text-2xl font-bold mt-6">
        {status === "loading" && "Processing payment"}
        {status === "success" && "Payment successful"}
        {status === "error" && "Payment issue"}
      </h1>
      <p className="mt-4 text-slate-600 dark:text-slate-400">{message}</p>
      {status === "error" && (
        <Link to="/courses" className="inline-block mt-8">
          <Button variant="outline">Back to courses</Button>
        </Link>
      )}
    </div>
  );
};

export default PaymentReturnPage;
