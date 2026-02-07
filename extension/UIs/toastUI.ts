export function toastUI(msg:string){
  const container = document.createElement('div');
  container.id = 'loading';
  container.style.position = 'fixed';
  container.style.top = '10%';
  container.style.right = '10%';
  container.style.zIndex = '999999';
  container.style.backgroundColor = '#ffffff';
  container.style.borderRadius = '3px';
  container.style.padding = '16px';
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  container.style.border = '1px solid #d4dde2';

  // Shadow DOM to isolate styles
  const shadow = container.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = `
  .toast-inner { display: flex; align-items: flex-start; gap: 12px; }
  .text { font-size: 14px; color: #668192; flex: 1; }
  .mg-close-btn { border: none; background: transparent; padding: 2px; border-radius: 4px; cursor: pointer; color: #94a3b8; font-size: 18px; line-height: 1; flex-shrink: 0; }
  .mg-close-btn:hover { background: #f1f5f9; color: #475569; }
`;

  const content = document.createElement('div');
  content.innerHTML = `
  <div class="toast-inner">
    <div class="text">${msg}</div>
    <button type="button" class="mg-close-btn" id="toast-close" aria-label="Close">×</button>
  </div>
`;
  shadow.appendChild(style);
  shadow.appendChild(content);

  shadow.getElementById('toast-close')?.addEventListener('click', () => {
    container.remove();
  });

  setTimeout(() => {
    console.log('Timeout executed after 3 seconds');
    container.remove()
  }, 3000);

  return container;
}