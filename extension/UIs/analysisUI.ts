import { Item, LlmResponse } from '../shared/types';

export function analysisUI(user:string, resp: LlmResponse,profile:any, onAccept:(user:string,items: Item[])=>void, onDecline:(user:string,items: Item[])=>void){
  if (!user){
    throw new Error('No user found!');
  }
  let cost = 0;
  for (const item of resp.items) {
    cost += item.price;
  }
  const budget = profile.monthly_budget;
  const totalSaving = profile.total_saved;
  const container = document.createElement('div');
  container.id = 'analysis';
  container.style.position = 'fixed';
  container.style.top = '50%';
  container.style.left = '50%';
  container.style.zIndex = '999999';
  container.style.backgroundColor = 'white';
  container.style.transform = 'translate(-50%, -50%)';
  container.style.borderRadius = '3px';
  container.style.padding = '16px';
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  container.style.width = '30%';
  container.style.height = '30%';
  container.style.border = '1px solid #e2e8f0';

  // Shadow DOM to isolate styles
  const shadow = container.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = `
  .title { font-weight: 600; font-size: 16px; color: #0f172a; margin-bottom: 4px; }
  .text { font-size: 20px; margin-bottom: 12px; }
  .desc-text { font-size: 14px; color: #64748b; margin-bottom: 12px; }
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

  <div class="text"> Percentage of monthly budget: ${Math.floor(cost/budget*100)}%</div>
  <div class="desc-text">${resp.analysis}</div>
  <div class="desc-text">Total Amount Saved using MoneyTracker: ${totalSaving} \$</div>
  <div class="buttons">
    <button class="btn-secondary" id="analyze-btn">Ignore budget</button>
    <button class="btn-primary" id="ignore-btn">Save money</button>
  </div>
`;

  shadow.appendChild(style);
  shadow.appendChild(content);

  shadow.getElementById('ignore-btn')?.addEventListener('click', () => {
    container.remove();
    onDecline(user,resp.items);
  });

  shadow.getElementById('analyze-btn')?.addEventListener('click', () => {
    container.remove();
    onAccept(user,resp.items);
  });

  return container;
}