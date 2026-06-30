import { api } from './client';

export const paymentApi = {
  /**
   * Creates a Razorpay order on the backend.
   * Returns { free: true } for free competitions, or { orderId, amount, currency, keyId } for paid.
   */
  createOrder: (competitionId, studentName, studentEmail, studentPhone) =>
    api.post('/payments/create-order', { competitionId, studentName, studentEmail, studentPhone }),

  /**
   * Verifies Razorpay payment signature on the backend and registers the student.
   * @param {object} payload - Razorpay callback fields + all student form data
   */
  verifyAndRegister: (payload) =>
    api.post('/payments/verify-and-register', payload),

  /**
   * Directly registers a student for a free competition (no payment flow).
   */
  registerFree: (payload) =>
    api.post('/payments/register-free', payload),
};
