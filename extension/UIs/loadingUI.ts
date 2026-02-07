export function loadingUI() {
  const container = document.createElement('div');
  container.id = 'loading';
  container.style.position = 'fixed';
  container.style.top = '50%';
  container.style.left = '50%';
  container.style.transform = 'translate(-50%, -50%)';
  container.style.zIndex = '999999';
  container.style.backgroundColor = 'transparent';
  container.style.borderRadius = '16px';
  container.style.padding = '0';
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  container.style.width = '520px';
  container.style.height = 'auto';

  // Shadow DOM to isolate styles
  const shadow = container.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = `
  :host {
    all: initial;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .mg-loading-card {
    position: relative;
    width: 100%;
    max-width: 520px;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.35);
    padding: 40px 32px 32px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .mg-breath-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 96px;
    height: 96px;
    margin-bottom: 32px;
  }
  .mg-breath-outer {
    position: absolute;
    inset: 0;
    border-radius: 999px;
    background: rgba(121, 170, 175, 0.16);
    animation: mg-pulse-slow 2.5s ease-in-out infinite;
  }
  .mg-breath-inner {
    position: absolute;
    inset: 8px;
    border-radius: 999px;
    background: rgba(121, 170, 175, 0.28);
    animation: mg-breathe 3s ease-in-out infinite;
    animation-delay: 0.5s;
  }
  .mg-breath-core {
    width: 14px;
    height: 14px;
    border-radius: 999px;
    background: #79aaaf;
    box-shadow: 0 0 18px rgba(121, 170, 175, 0.8);
  }
  .mg-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
  }
  .mg-status {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #79aaaf;
    opacity: 0.85;
    animation: mg-pulse-text 1.6s ease-in-out infinite;
  }
  .mg-title {
    font-size: 22px;
    font-weight: 800;
    color: #0e121b;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }
  .mg-body {
    font-size: 14px;
    line-height: 1.6;
    color: #4b5563;
    max-width: 340px;
  }
  .mg-actions {
    margin-top: 32px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    align-items: center;
  }
  .mg-secondary-btn {
    border: none;
    background: transparent;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
  }
  .mg-secondary-btn:hover {
    background: #f9fafb;
    color: #475569;
  }
  .mg-secondary-icon {
    font-size: 16px;
    transition: transform 0.2s ease;
  }
  .mg-secondary-btn:hover .mg-secondary-icon {
    transform: translateX(-2px);
  }
  .mg-blob {
    position: absolute;
    width: 220px;
    height: 220px;
    border-radius: 999px;
    pointer-events: none;
    filter: blur(32px);
    opacity: 0.8;
  }
  .mg-blob-top-right {
    top: -120px;
    right: -120px;
    background: rgba(121, 170, 175, 0.16);
  }
  .mg-blob-bottom-left {
    bottom: -140px;
    left: -120px;
    background: rgba(96, 165, 250, 0.16);
  }
  @keyframes mg-pulse-slow {
    0%, 100% { transform: scale(1); opacity: 0.7; }
    50% { transform: scale(1.08); opacity: 1; }
  }
  @keyframes mg-breathe {
    0%, 100% { transform: scale(0.9); opacity: 0.8; }
    50% { transform: scale(1.05); opacity: 1; }
  }
  @keyframes mg-pulse-text {
    0%, 100% { opacity: 0.65; }
    50% { opacity: 1; }
  }
  `;

  const content = document.createElement('div');
  content.innerHTML = `
  <div class="mg-loading-card">
    <div class="mg-breath-wrapper">
      <div class="mg-breath-outer"></div>
      <div class="mg-breath-inner"></div>
      <div class="mg-breath-core"></div>
    </div>
    <div class="mg-content">
      <p class="mg-status">Analyzing necessity</p>
      <h2 class="mg-title">
        Take a deep breath<br />and a moment to reconsider.
      </h2>
      <p class="mg-body">
        MoneyGuard is reviewing this product's impact on your goals. Is this purchase aligned with your values today?
      </p>
    </div>
    <div class="mg-actions">
      <button class="mg-secondary-btn" id="mg-loading-cancel">
        <span class="mg-secondary-icon">←</span>
        <span>I don't need this right now</span>
      </button>
    </div>
    <div class="mg-blob mg-blob-top-right"></div>
    <div class="mg-blob mg-blob-bottom-left"></div>
  </div>
`;

  shadow.appendChild(style);
  shadow.appendChild(content);

  // Allow the user to dismiss the loading state if they decide to stop
  shadow.getElementById('mg-loading-cancel')?.addEventListener('click', () => {
    container.remove();
  });

  return container;
}