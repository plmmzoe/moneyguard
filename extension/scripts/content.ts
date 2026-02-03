
// Heuristic keywords for detecting purchase intent
const PURCHASE_KEYWORDS = ['checkout', 'place order', 'buy now', 'complete purchase', 'payment'];
const CURRENCY_REGEX = /[\$€£¥]\s*\d+([.,]\d{2})?/;

let hasPrompted = false;

function detectPurchaseIntent() {
    if (hasPrompted) return;

    const textContent = document.body.innerText.toLowerCase();
    const hasKeyword = PURCHASE_KEYWORDS.some(keyword => textContent.includes(keyword));
    const hasPrice = CURRENCY_REGEX.test(document.body.innerText);

    // Simple heuristic: Keyword + Price or just explicit checkout URL
    const isCheckoutUrl = window.location.href.includes('checkout') || window.location.href.includes('cart');

    if ((hasKeyword && hasPrice) || isCheckoutUrl) {
        showPermissionUI();
        hasPrompted = true;
    }
}

function showPermissionUI() {
    const container = document.createElement('div');
    container.id = 'moneyguard-permission-container';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '999999';
    container.style.backgroundColor = 'white';
    container.style.borderRadius = '8px';
    container.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    container.style.padding = '16px';
    container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    container.style.width = '300px';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '12px';
    container.style.border = '1px solid #e2e8f0';

    // Shadow DOM to isolate styles
    const shadow = container.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
    .title { font-weight: 600; font-size: 16px; color: #0f172a; margin-bottom: 4px; }
    .text { font-size: 14px; color: #64748b; margin-bottom: 12px; }
    .buttons { display: flex; gap: 8px; }
    button {
      flex: 1;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: opacity 0.2s;
    }
    .btn-primary { background: #2563eb; color: white; }
    .btn-secondary { background: #f1f5f9; color: #475569; }
    button:hover { opacity: 0.9; }
  `;

    const content = document.createElement('div');
    content.innerHTML = `
    <div class="title">MoneyGuard Detected a Purchase</div>
    <div class="text">Do you want AI to analyze this purchase before you buy?</div>
    <div class="buttons">
      <button class="btn-secondary" id="ignore-btn">Ignore</button>
      <button class="btn-primary" id="analyze-btn">Analyze</button>
    </div>
  `;

    shadow.appendChild(style);
    shadow.appendChild(content);

    shadow.getElementById('ignore-btn')?.addEventListener('click', () => {
        container.remove();
    });

    shadow.getElementById('analyze-btn')?.addEventListener('click', () => {
        const item = document.title;
        // Try to find price
        const priceMatch = document.body.innerText.match(CURRENCY_REGEX);
        const price = priceMatch ? priceMatch[0] : '';

        chrome.runtime.sendMessage({
            type: 'OPEN_ANALYSIS',
            data: { item, price, url: window.location.href }
        });
        container.remove();
    });

    document.body.appendChild(container);
}

// Run detection on load and mutations
detectPurchaseIntent();

const observer = new MutationObserver(() => {
    detectPurchaseIntent();
});

observer.observe(document.body, { childList: true, subtree: true });
