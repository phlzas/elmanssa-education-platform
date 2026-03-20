import { apiRequest } from "./client";

// ─── Raw API calls ───────────────────────────────────────────

export function placeOrder(data: {
    subjectId: string;
    paymentMethod?: string;
    couponCode?: string;
    billingFullName?: string;
    billingEmail?: string;
    billingPhone?: string;
}) {
    return apiRequest("/orders", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function getOrders() {
    return apiRequest("/orders");
}

export function getOrder(id: string) {
    return apiRequest(`/orders/${id}`);
}

export function checkCoupon(data: { code: string; subjectId?: string }) {
    return apiRequest("/orders/validate-coupon", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

// ─── Compatibility wrappers (match old services/api.ts signatures) ───

/**
 * createOrder(data, token?) — token param is ignored because
 * apiRequest already attaches the token from localStorage.
 */
export const createOrder = async (
    data: {
        subjectId: string;
        paymentMethod: string;
        couponCode?: string;
        billingFullName: string;
        billingEmail: string;
        billingPhone?: string;
    },
    _token?: string
) => {
    try {
        const json = await placeOrder(data);
        return json.data;
    } catch (error) {
        console.error('Error creating order', error);
        throw error;
    }
};

/**
 * validateCoupon(code, subjectId?) — matches old positional args.
 */
export const validateCoupon = async (code: string, subjectId?: string) => {
    try {
        const json = await checkCoupon({ code, subjectId });
        return json.data;
    } catch (error) {
        console.error('Error validating coupon', error);
        throw error;
    }
};
