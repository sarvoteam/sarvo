/**
 * Lazily loads the Razorpay checkout script from CDN.
 * Returns a promise that resolves once window.Razorpay is available.
 */
export function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK. Please check your internet connection.'));
    document.head.appendChild(script);
  });
}
