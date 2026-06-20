import { Link } from "react-router-dom";
import Button from "../common/Button";
import { getPurchaseType } from "../../utils/purchaseFlow";

/**
 * Unified CTA for courses, workshops, and hackathons.
 * Free → enroll/register immediately. Paid → go to checkout → Zoho Payments.
 */
const PurchaseButton = ({
  purchaseType,
  itemId,
  enrollment,
  className = "",
  variant = "primary",
}) => {
  const cfg = getPurchaseType(purchaseType);
  if (!cfg || !enrollment) return null;

  const label =
    enrollment.authLoading || enrollment.configLoading || enrollment.loading
      ? "Please wait..."
      : enrollment.hasAccess
        ? enrollment.isFree
          ? "Enrolled"
          : "Purchased"
        : cfg.actionLabel;

  const handleClick = () => {
    if (enrollment.hasAccess || enrollment.disabled) return;

    if (!enrollment.isAuthenticated) {
      const target = enrollment.isFree
        ? cfg.detailPath(itemId)
        : cfg.checkoutPath(itemId);
      enrollment.navigate("/login", { state: { from: target } });
      return;
    }

    if (enrollment.isFree) {
      enrollment.handlePurchase();
      return;
    }

    enrollment.navigate(cfg.checkoutPath(itemId));
  };

  if (enrollment.hasAccess) {
    return (
      <Link to={cfg.detailPath(itemId)} className={className}>
        <Button type="button" variant={variant} className="w-full">
          View {cfg.listTitle.slice(0, -1) || "item"}
        </Button>
      </Link>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      disabled={enrollment.disabled}
      onClick={handleClick}
    >
      {label}
    </Button>
  );
};

export default PurchaseButton;
