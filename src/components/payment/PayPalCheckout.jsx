import { useEffect, useRef } from "react";

const scriptCache = new Map();

const buildPayPalSdkUrl = ({ clientId, currency, enableCard, buyerCountry, sandbox }) => {
  const params = new URLSearchParams({
    "client-id": clientId,
    currency: currency || "USD",
    intent: "capture",
    components: "buttons",
  });

  if (enableCard) {
    params.set("enable-funding", "card");
  } else {
    params.set("disable-funding", "card,credit,paylater");
  }

  // buyer-country is sandbox-only; including it on live SDK loads returns HTTP 400.
  if (sandbox && buyerCountry) {
    params.set("buyer-country", buyerCountry);
  }

  return `https://www.paypal.com/sdk/js?${params.toString()}`;
};

export const loadPayPalScript = ({
  clientId,
  currency = "USD",
  enableCard = true,
  buyerCountry = "IN",
  sandbox = false,
}) => {
  if (!clientId) return Promise.resolve(false);

  const cacheKey = `${clientId}:${currency || "USD"}:${enableCard}:${sandbox ? buyerCountry : "live"}`;

  if (window.paypal && window.__paypalSdkKey === cacheKey) {
    return Promise.resolve(true);
  }

  if (scriptCache.has(cacheKey)) {
    return scriptCache.get(cacheKey);
  }

  const promise = new Promise((resolve) => {
    document.querySelectorAll('script[src*="paypal.com/sdk/js"]').forEach((node) => node.remove());
    delete window.paypal;
    window.__paypalSdkKey = undefined;

    const script = document.createElement("script");
    script.src = buildPayPalSdkUrl({ clientId, currency, enableCard, buyerCountry, sandbox });
    script.async = true;
    script.setAttribute("data-paypal-sdk", cacheKey);
    script.onload = () => {
      window.__paypalSdkKey = cacheKey;
      resolve(Boolean(window.paypal));
    };
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  scriptCache.set(cacheKey, promise);
  return promise;
};

const PayPalCheckout = ({
  clientId,
  currency,
  enableCard = true,
  buyerCountry = "IN",
  sandbox = false,
  ready,
  createOrder,
  onApprove,
  onError,
  onCancel,
}) => {
  const containerRef = useRef(null);
  const buttonsRef = useRef(null);
  const createOrderRef = useRef(createOrder);
  const onApproveRef = useRef(onApprove);
  const onErrorRef = useRef(onError);
  const onCancelRef = useRef(onCancel);

  createOrderRef.current = createOrder;
  onApproveRef.current = onApprove;
  onErrorRef.current = onError;
  onCancelRef.current = onCancel;

  useEffect(() => {
    if (!clientId || !ready || !containerRef.current) return undefined;

    let cancelled = false;

    loadPayPalScript({ clientId, currency, enableCard, buyerCountry, sandbox }).then((loaded) => {
      if (cancelled || !loaded || !window.paypal || !containerRef.current) {
        if (!cancelled) {
          onErrorRef.current?.(new Error("Could not load PayPal checkout."));
        }
        return;
      }

      if (buttonsRef.current) {
        try {
          buttonsRef.current.close();
        } catch {
          // ignore
        }
        buttonsRef.current = null;
      }

      containerRef.current.innerHTML = "";

      const buttons = window.paypal.Buttons({
        style: {
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "paypal",
          tagline: false,
        },
        createOrder: async () => {
          const orderId = await createOrderRef.current();
          if (!orderId) {
            throw new Error("Could not create PayPal order.");
          }
          return orderId;
        },
        onApprove: async (data) => {
          await onApproveRef.current(data.orderID);
        },
        onError: (err) => {
          onErrorRef.current?.(err);
        },
        onCancel: () => {
          onCancelRef.current?.();
        },
      });

      if (!buttons.isEligible()) {
        onErrorRef.current?.(
          new Error("PayPal checkout is not available for this browser or account.")
        );
        return;
      }

      buttonsRef.current = buttons;
      buttons.render(containerRef.current).catch((err) => {
        onErrorRef.current?.(err);
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
    };
  }, [clientId, currency, enableCard, buyerCountry, sandbox, ready]);

  return (
    <div
      ref={containerRef}
      className="paypal-checkout-host mt-4 w-full min-h-[220px]"
      aria-live="polite"
    />
  );
};

export default PayPalCheckout;
