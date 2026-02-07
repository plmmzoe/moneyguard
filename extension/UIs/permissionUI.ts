const CURRENCY_REGEX = /[\$€£¥]\s*\d+([.,]\d{2})?/;
export function showPermissionUI(onAccept:()=>void) {
  const container = document.createElement('div');
  container.id = 'moneyguard-permission-container';
  container.style.position = 'fixed';
  container.style.top = '50%';
  container.style.left = '50%';
  container.style.zIndex = '999999';
  container.style.backgroundColor = 'transparent';
  container.style.borderRadius = '16px';
  container.style.boxShadow = 'none';
  container.style.padding = '0';
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  container.style.width = '440px';
  container.style.height = 'auto';
  container.style.transform = 'translate(-50%, -50%)';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '0';
  container.style.border = 'none';

  // Shadow DOM to isolate styles
  const shadow = container.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = `
  :host {
    all: initial;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .mg-card {
    position: relative;
    width: 100%;
    max-width: 440px;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.18);
    border: 1px solid #d4dde2;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .mg-header {
    padding: 16px 24px 8px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .mg-kicker {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    background: #e2f0f3;
    border: 1px solid #c7e1e6;
  }
  .mg-kicker-icon {
    font-size: 14px;
  }
  .mg-kicker-text {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #79aaaf;
  }
  .mg-close-btn {
    border: none;
    background: transparent;
    padding: 4px;
    border-radius: 6px;
    cursor: pointer;
    color: #94a3b8;
  }
  .mg-close-btn:hover {
    background: #f1f5f9;
    color: #475569;
  }
  .mg-main {
    padding: 0 24px 8px;
  }
  .mg-main-inner {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 8px;
  }
  .mg-icon-main {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: linear-gradient(135deg, #79aaaf, #668192);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-size: 24px;
    box-shadow: 0 16px 30px rgba(85, 136, 141, 0.35);
  }
  .mg-title {
    font-size: 20px;
    font-weight: 800;
    color: #465869;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }
  .mg-body {
    font-size: 14px;
    font-weight: 500;
    color: #668192;
    line-height: 1.5;
  }
  .mg-actions {
    padding: 8px 24px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .mg-btn {
    border: none;
    cursor: pointer;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 600;
    transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease, opacity 0.15s ease;
  }
  .mg-btn-primary {
    height: 44px;
    padding: 0 18px;
    background: #79aaaf;
    color: #ffffff;
    box-shadow: 0 12px 30px rgba(85, 136, 141, 0.4);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .mg-btn-primary:hover {
    background: #668f93;
    transform: translateY(-1px);
  }
  .mg-btn-secondary {
    height: auto;
    padding: 0;
    background: transparent;
    color: #94a3b8;
  }
  .mg-btn-secondary:hover {
    background: transparent;
    color: #64748b;
    text-decoration: underline;
  }
  .mg-footer {
    border-top: 1px solid #edf2f7;
    padding: 8px 24px 16px;
    text-align: center;
  }
  .mg-footer-text {
    font-size: 11px;
    color: #94a3b8;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  `;

  const content = document.createElement('div');
  content.innerHTML = `
  <div class="mg-card">
    <div class="mg-header">
      <div class="mg-kicker">
        <span class="mg-kicker-icon">🛒</span>
        <span class="mg-kicker-text">Detected: Checkout</span>
      </div>
      <button class="mg-close-btn" id="close-btn" aria-label="Close MoneyGuard prompt">×</button>
    </div>
    <div class="mg-main">
      <div class="mg-main-inner">
        <h2 class="mg-title">MoneyGuard detected a purchase</h2>
        <p class="mg-body">
          Do you want AI to analyze this before you buy? We'll check for budget impact and help you pause before an impulse purchase.
        </p>
      </div>
    </div>
    <div class="mg-actions">
      <button class="mg-btn mg-btn-primary" id="analyze-btn">
        <span>Analyze cart</span>
      </button>
      <button class="mg-btn mg-btn-secondary" id="ignore-btn">
        Cancel
      </button>
    </div>
    <div class="mg-footer">
      <p class="mg-footer-text">
        <span>🔒</span>
        <span>Private &amp; secure analysis</span>
      </p>
    </div>
  </div>
`;

  shadow.appendChild(style);
  shadow.appendChild(content);

  const remove = () => container.remove();

  shadow.getElementById('ignore-btn')?.addEventListener('click', remove);
  shadow.getElementById('close-btn')?.addEventListener('click', remove);

  shadow.getElementById('analyze-btn')?.addEventListener('click', () => {
    onAccept();
    container.remove();
  });
  return container;

}

export function openPopup(){
  const item = document.title;
  // Try to find price
  const priceMatch = document.body.innerText.match(CURRENCY_REGEX);
  const price = priceMatch ? priceMatch[0] : '';

  chrome.runtime.sendMessage({
    type: 'OPEN_ANALYSIS',
    data: { item, price, url: window.location.href }
  });
}