
// Heuristic keywords for detecting purchase intent
const PURCHASE_KEYWORDS = ['checkout', 'buy', 'purchase', 'payment', 'order', 'pay', 'cart', 'bag', 'basket'];

let hasPrompted = false;
export function detectPurchaseIntent(trigger: () => void) {
    if (hasPrompted) return;

    // Simple heuristic: Check explicit keywords in URL path. do not pick up the domain name
    const path_segments = window.location.pathname.toLowerCase();    
    
    const isCheckoutUrl = PURCHASE_KEYWORDS.some(keyword => path_segments.includes(keyword));


    if (isCheckoutUrl) {
        trigger();
        hasPrompted = true;
    }
}