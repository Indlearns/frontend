import { useEffect, useRef } from "react";

export const loadPayPalScript = (clientId, currency = "INR") =>
  new Promise((resolve) => {
    if (!clientId) {
      resolve(false);
      return;
    }

    if (window.paypal) {
      resolve(true);
      return;
    }

    const src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency)}`;
    const existing = document.querySelector(`script[src*="paypal.com/sdk/js"]`);
    if (existing) {
      if (existing.getAttribute("data-loaded") === "true") {
        resolve(Boolean(window.paypal));
        return;
      }
      existing.addEventListener("load", () => resolve(Boolean(window.paypal)));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.setAttribute("data-loaded", "true");
      resolve(Boolean(window.paypal));
    };
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const PayPalCheckout = ({
  clientId,
  currency,
  disabled,
  createOrder,
  onApprove,
  onError,
  onCancel,
}) => {
  const containerRef = useRef(null);
  const buttonsRef = useRef(null);

  useEffect(() => {
    if (!clientId || disabled || !containerRef.current) return undefined;

    let cancelled = false;

    loadPayPalScript(clientId, currency).then((loaded) => {
      if (cancelled || !loaded || !window.paypal || !containerRef.current) return;

      if (buttonsRef.current) {
        try {
          buttonsRef.current.close();
        } catch {
          // ignore
        }
        buttonsRef.current = null;
      }

      containerRef.current.innerHTML = "";

      buttonsRef.current = window.paypal.Buttons({
        style: { layout: "vertical", color: "blue", shape: "rect", label: "paypal" },
        createOrder: async () => {
          const orderId = await createOrder();
          if (!orderId) {
            throw new Error("Could not create PayPal order.");
          }
          return orderId;
        },
        onApprove: async (data) => {
          await onApprove(data.orderID);
        },
        onError: (err) => {
          onError?.(err);
        },
        onCancel: () => {
          onCancel?.();
        },
      });

      buttonsRef.current.render(containerRef.current).catch((err) => {
        onError?.(err);
      });
    });

    return () => {
      cancelled = true;
      if (buttonsRef.current) {
        try {
          buttonsRef.current.close();
        } catch {
          // ignore
        }
        buttonsRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [clientId, currency, disabled, createOrder, onApprove, onError, onCancel]);

  return <div ref={containerRef} className="mt-4 min-h-[45px]" />;
};

export default PayPalCheckout;
