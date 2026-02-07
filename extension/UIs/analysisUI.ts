import { Item, LlmResponse } from '../shared/types';

function escapeHtml(s: string): string {
  if (!s) return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getVerdictDisplay(verdict: string | undefined): { label: string; iconClass: string; iconSymbol: string } {
  switch (verdict) {
    case 'high':
      return { label: 'Pause suggested', iconClass: 'danger', iconSymbol: '!' };
    case 'medium':
      return { label: 'Proceed with care', iconClass: 'warning', iconSymbol: '⚠' };
    case 'low':
      return { label: 'Looks reasonable', iconClass: '', iconSymbol: '✓' };
    default:
      return { label: 'Analysis complete', iconClass: '', iconSymbol: '✓' };
  }
}

export type DecisionState = 'draft' | 'waiting' | 'discarded' | 'bought';

export function analysisUI(
  user: string,
  resp: LlmResponse,
  profile: any,
  _transactionId: number,
  onAccept: (user: string, items: Item[]) => void,
  onDecline: (user: string, items: Item[]) => void,
  onDecision: (state: DecisionState) => void
) {
  if (!user) {
    throw new Error('No user found!');
  }
  let cost = 0;
  for (const item of resp.items) {
    cost += (item.price ?? 0) * (item.quantity ?? 1);
  }
  const budget = profile?.monthly_budget ?? 1;
  const budgetImpact = budget > 0 ? Math.floor((cost / budget) * 100) : 0;
  const impulseScore = resp.impulseScore ?? 0;
  const verdictDisplay = getVerdictDisplay(resp.verdict);
  const analysisText = resp.summary ?? resp.analysis ?? '';

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
  container.style.maxHeight = '90vh';
  container.style.overflowY = 'auto';
  container.style.border = 'none';

  const shadow = container.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = `
  :host { all: initial; font-family: system-ui, -apple-system, sans-serif; }
  .mg-card {
    width: 100%; max-width: 520px; background: #fff; border-radius: 16px;
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.25); border: 1px solid #d4dde2;
    overflow: hidden; display: flex; flex-direction: column;
  }
  .mg-section { padding: 20px 24px; border-bottom: 1px solid #f1f5f9; }
  .mg-section:last-child { border-bottom: none; }
  .mg-section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; color: #64748b; margin-bottom: 8px; }
  .mg-verdict-score-row { display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: center; }
  .mg-verdict-row { display: flex; align-items: center; gap: 12px; }
  .mg-header-icon {
    width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700;
  }
  .mg-header-icon.success { background: #f0fdf4; color: #16a34a; }
  .mg-header-icon.warning { background: #fefce8; color: #ca8a04; }
  .mg-header-icon.danger { background: #fef2f2; color: #dc2626; }
  .mg-verdict-label { font-size: 18px; font-weight: 700; color: #0f172a; }
  .mg-score-row { display: flex; align-items: baseline; gap: 8px; }
  .mg-score-value { font-size: 28px; font-weight: 700; color: #0f172a; }
  .mg-score-label { font-size: 13px; color: #64748b; }
  .mg-metric-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .mg-metric-card {
    background: #f8fafc; border-radius: 12px; padding: 14px; border: 1px solid #e2e8f0;
  }
  .mg-metric-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; color: #64748b; margin-bottom: 4px; }
  .mg-metric-value { font-size: 18px; font-weight: 700; color: #0f172a; }
  .mg-metric-sub { font-size: 12px; color: #94a3b8; margin-top: 2px; }
  .mg-analysis-text { font-size: 14px; line-height: 1.6; color: #334155; }
  .mg-decision-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .mg-decision-btn {
    padding: 12px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; border: 2px solid transparent;
    display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;
  }
  .mg-decision-btn:disabled { opacity: 0.7; cursor: default; }
  .mg-decision-btn.btn-red { background: #fef2f2; color: #991b1b; }
  .mg-decision-btn.btn-red:hover:not(:disabled) { background: #fee2e2; }
  .mg-decision-btn.btn-red.selected { border-color: #dc2626; }
  .mg-decision-btn.btn-green { background: #f0fdf4; color: #166534; }
  .mg-decision-btn.btn-green:hover:not(:disabled) { background: #dcfce7; }
  .mg-decision-btn.btn-green.selected { border-color: #16a34a; }
  .mg-decision-btn.btn-amber { background: #fffbeb; color: #92400e; }
  .mg-decision-btn.btn-amber:hover:not(:disabled) { background: #fef3c7; }
  .mg-decision-btn.btn-amber.selected { border-color: #d97706; }
  .mg-decision-btn.btn-gray { background: #f1f5f9; color: #334155; }
  .mg-decision-btn.btn-gray:hover:not(:disabled) { background: #e2e8f0; }
  .mg-decision-btn.btn-gray.selected { border-color: #64748b; }
  `;

  const iconClass = verdictDisplay.iconClass ? `mg-header-icon ${verdictDisplay.iconClass}` : 'mg-header-icon success';

  const content = document.createElement('div');
  content.innerHTML = `
  <div class="mg-card">
    <!-- 1. AI verdict + Impulse score (same row) -->
    <div class="mg-section">
      <div class="mg-section-title">AI Verdict & Impulse score</div>
      <div class="mg-verdict-score-row">
        <div class="mg-verdict-row">
          <div class="${iconClass}"><span>${verdictDisplay.iconSymbol}</span></div>
          <div class="mg-verdict-label">${escapeHtml(verdictDisplay.label)}</div>
        </div>
        <div class="mg-score-row">
          <span class="mg-score-value">${Math.min(100, Math.max(0, impulseScore))}</span>
          <span class="mg-score-label">/ 100</span>
        </div>
      </div>
    </div>

    <!-- 2. Financial impact -->
    <div class="mg-section">
      <div class="mg-section-title">Financial impact</div>
      <div class="mg-metric-row">
        <div class="mg-metric-card">
          <div class="mg-metric-label">Budget impact</div>
          <div class="mg-metric-value">${budgetImpact}%</div>
          <div class="mg-metric-sub">of monthly budget</div>
        </div>
        <div class="mg-metric-card">
          <div class="mg-metric-label">Total cost</div>
          <div class="mg-metric-value">$${cost.toFixed(2)}</div>
          <div class="mg-metric-sub">${resp.items.length} item(s)</div>
        </div>
      </div>
    </div>

    <!-- 3. Analysis text -->
    <div class="mg-section">
      <div class="mg-section-title">Summary</div>
      <div class="mg-analysis-text">${escapeHtml(analysisText)}</div>
    </div>

    <!-- 4. Log your decision (simplified) -->
    <div class="mg-section">
      <div class="mg-section-title">Log your decision</div>
      <p style="font-size: 12px; color: #64748b; margin-bottom: 10px;">Choose one option. Your choice will be saved.</p>
      <div class="mg-decision-grid">
        <button type="button" class="mg-decision-btn btn-red" id="btn-discarded" data-state="discarded">I won't buy</button>
        <button type="button" class="mg-decision-btn btn-green" id="btn-bought" data-state="bought">I will buy</button>
        <button type="button" class="mg-decision-btn btn-amber" id="btn-waiting" data-state="waiting">Send to cool-off</button>
        <button type="button" class="mg-decision-btn btn-gray" id="btn-draft" data-state="draft">Just browsing</button>
      </div>
    </div>
  </div>
  `;

  shadow.appendChild(style);
  shadow.appendChild(content);

  let selectedState: string | null = null;

  const setSelected = (state: string) => {
    selectedState = state;
    ['btn-discarded', 'btn-bought', 'btn-waiting', 'btn-draft'].forEach((id) => {
      const btn = shadow.getElementById(id);
      if (btn) {
        btn.classList.toggle('selected', btn.getAttribute('data-state') === state);
        (btn as HTMLButtonElement).disabled = true;
      }
    });
  };

  const handleDecision = (state: DecisionState) => {
    if (selectedState) return;
    setSelected(state);
    onDecision(state);
    if (state === 'bought') onAccept(user, resp.items);
    else if (state === 'discarded') onDecline(user, resp.items);
    container.remove();
  };

  shadow.getElementById('btn-bought')?.addEventListener('click', () => handleDecision('bought'));
  shadow.getElementById('btn-discarded')?.addEventListener('click', () => handleDecision('discarded'));
  shadow.getElementById('btn-waiting')?.addEventListener('click', () => handleDecision('waiting'));
  shadow.getElementById('btn-draft')?.addEventListener('click', () => handleDecision('draft'));

  return container;
}
