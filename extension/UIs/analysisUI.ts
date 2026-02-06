import { Item, LlmResponse } from '../shared/types';

export function analysisUI(user: string, resp: LlmResponse, profile: any, onAccept: (user: string, items: Item[]) => void, onDecline: (user: string, items: Item[]) => void) {
  if (!user) {
    throw new Error('No user found!');
  }
  let cost = 0;
  for (const item of resp.items) {
    cost += item.price;
  }
  const budget = profile.monthly_budget;
  const budgetImpact = Math.floor((cost / budget) * 100);

  const container = document.createElement('div');
  container.id = 'analysis';
  container.style.position = 'fixed';
  container.style.top = '50%';
  container.style.left = '50%';
  container.style.zIndex = '999999';
  container.style.backgroundColor = 'transparent';
  container.style.transform = 'translate(-50%, -50%)';
  container.style.borderRadius = '16px';
  container.style.padding = '0';
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  container.style.width = '520px';
  container.style.height = 'auto';
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
    max-width: 520px;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.25);
    border: 1px solid #d4dde2;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .mg-header {
    padding: 24px 24px 16px;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .mg-header-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: #f0fdf4;
    color: #16a34a;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  }
  .mg-header-icon.warning {
    background: #fefce8;
    color: #ca8a04;
  }
  .mg-header-icon.danger {
    background: #fef2f2;
    color: #dc2626;
  }
  .mg-header-content {
    flex: 1;
  }
  .mg-header-title {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.2;
  }
  .mg-header-subtitle {
    font-size: 13px;
    color: #64748b;
    margin-top: 2px;
  }
  .mg-body {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .mg-metric-row {
    display: flex;
    gap: 16px;
  }
  .mg-metric-card {
    flex: 1;
    background: #f8fafc;
    border-radius: 12px;
    padding: 16px;
    border: 1px solid #e2e8f0;
  }
  .mg-metric-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 6px;
  }
  .mg-metric-value {
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
  }
  .mg-metric-sub {
    font-size: 12px;
    color: #94a3b8;
    margin-top: 2px;
  }
  .mg-analysis-text {
    font-size: 14px;
    line-height: 1.6;
    color: #334155;
    background: #fff;
    padding: 16px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    border-left: 4px solid #79aaaf;
  }
  .mg-actions {
    padding: 16px 24px 24px;
    display: flex;
    gap: 12px;
    border-top: 1px solid #f1f5f9;
    background: #fcfcfc;
  }
  .mg-btn {
    flex: 1;
    height: 44px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }
  .mg-btn-primary {
    background: #79aaaf;
    color: white;
    box-shadow: 0 4px 12px rgba(121, 170, 175, 0.25);
  }
  .mg-btn-primary:hover {
    background: #668f93;
    transform: translateY(-1px);
  }
  .mg-btn-secondary {
    background: white;
    border: 1px solid #cbd5e1;
    color: #475569;
  }
  .mg-btn-secondary:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
  `;

  // Determine visual state based on budget impact
  let iconClass = '';
  let iconSymbol = '✓';
  let titleText = 'Looks good!';
  
  if (budgetImpact > 50) {
    iconClass = 'danger';
    iconSymbol = '!';
    titleText = 'High Budget Impact';
  } else if (budgetImpact > 20) {
    iconClass = 'warning';
    iconSymbol = '⚠';
    titleText = 'Moderate Impact';
  }

  const content = document.createElement('div');
  content.innerHTML = `
  <div class="mg-card">
    <div class="mg-header">
      <div class="mg-header-icon ${iconClass}">
        <span>${iconSymbol}</span>
      </div>
      <div class="mg-header-content">
        <div class="mg-header-title">${titleText}</div>
        <div class="mg-header-subtitle">Analysis complete</div>
      </div>
    </div>
    
    <div class="mg-body">
      <div class="mg-metric-row">
        <div class="mg-metric-card">
          <div class="mg-metric-label">Budget Impact</div>
          <div class="mg-metric-value">${budgetImpact}%</div>
          <div class="mg-metric-sub">of monthly budget</div>
        </div>
        <div class="mg-metric-card">
          <div class="mg-metric-label">Total Cost</div>
          <div class="mg-metric-value">$${cost.toFixed(2)}</div>
          <div class="mg-metric-sub">${resp.items.length} item(s)</div>
        </div>
      </div>
      
      <div class="mg-analysis-text">
        ${resp.analysis}
      </div>
    </div>

    <div class="mg-actions">
      <button class="mg-btn mg-btn-secondary" id="analyze-btn">
        Ignore & Buy
      </button>
      <button class="mg-btn mg-btn-primary" id="ignore-btn">
        Save Money
      </button>
    </div>
  </div>
`;

  shadow.appendChild(style);
  shadow.appendChild(content);

  shadow.getElementById('ignore-btn')?.addEventListener('click', () => {
    container.remove();
    onDecline(user, resp.items);
  });

  shadow.getElementById('analyze-btn')?.addEventListener('click', () => {
    container.remove();
    onAccept(user, resp.items);
  });

  return container;
}
