/** Unified purchase flow for courses, workshops, and hackathons */

export const PURCHASE_TYPES = {
  course: {
    apiType: "course",
    listPath: "/courses",
    detailPath: (id) => `/courses/${id}`,
    checkoutPath: (id) => `/checkout/course/${id}`,
    actionLabel: "Enroll now",
    payLabel: "Pay with Razorpay",
    freeLabel: "Confirm enrollment",
    listTitle: "courses",
  },
  workshop: {
    apiType: "workshop",
    listPath: "/workshops",
    detailPath: (id) => `/workshops/${id}`,
    checkoutPath: (id) => `/checkout/workshop/${id}`,
    actionLabel: "Register now",
    payLabel: "Pay with Razorpay",
    freeLabel: "Confirm registration",
    listTitle: "workshops",
  },
  hackathon: {
    apiType: "workshop",
    listPath: "/events",
    detailPath: (id) => `/events/${id}`,
    checkoutPath: (id) => `/checkout/hackathon/${id}`,
    actionLabel: "Register now",
    payLabel: "Pay with Razorpay",
    freeLabel: "Confirm registration",
    listTitle: "events",
  },
};

export const getPurchaseType = (type) => PURCHASE_TYPES[type] || null;

export const resolveWorkshopPurchaseType = (workshop) =>
  workshop?.eventType === "hackathon" ? "hackathon" : "workshop";
