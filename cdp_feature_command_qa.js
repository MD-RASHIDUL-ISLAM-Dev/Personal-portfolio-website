(async()=>{
const targets = await (await fetch('http://127.0.0.1:9222/json')).json();
const target = targets.find(item => item.type === 'page' && item.url.includes('manus.computer')) || targets.find(item => item.type === 'page');
if (!target) throw new Error('No page target found');
const ws = new WebSocket(target.webSocketDebuggerUrl);
let nextId = 1;
const pending = new Map();
ws.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const resolve = pending.get(message.id);
    pending.delete(message.id);
    resolve(message);
  }
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = nextId++;
  pending.set(id, message => message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result));
  ws.send(JSON.stringify({ id, method, params }));
});
await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
const expression = `(async()=>{
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const root = document.documentElement;
  const rect = element => { const r = element.getBoundingClientRect(); const s = getComputedStyle(element); return { left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), bottom: Math.round(r.bottom), width: Math.round(r.width), height: Math.round(r.height), font: s.fontSize, color: s.color, background: s.backgroundColor, text: (element.textContent || '').trim().slice(0, 180) }; };
  const section = document.querySelector('#feature-command-center');
  const cards = [...document.querySelectorAll('#feature-command-center .feature-command-card')];
  const initial = { present: Boolean(section), cards: cards.length, scrollWidth: root.scrollWidth, section: section ? rect(section) : null, freshness: document.querySelector('#content-freshness-v27')?.textContent.trim() || '' };
  const radio = document.querySelector('#visitor-intent-form input[value="client"]');
  if (radio) { radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true })); }
  document.querySelector('#visitor-intent-form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  await wait(30);
  const intent = { dataIntent: root.dataset.intent || '', output: document.querySelector('#visitor-intent-output')?.textContent.trim() || '' };
  const evidence = document.querySelector('#evidence-project');
  if (evidence) { evidence.value = 'deepseek'; evidence.dispatchEvent(new Event('change', { bubbles: true })); }
  await wait(30);
  document.querySelector('#evidence-export')?.click();
  await wait(30);
  const evidenceResult = { value: evidence?.value || '', heading: document.querySelector('#evidence-room-heading')?.textContent.trim() || '', architecture: document.querySelector('#evidence-room-architecture')?.textContent.trim() || '', next: document.querySelector('#evidence-room-next')?.textContent.trim() || '' };
  document.querySelector('#deployment-health-refresh')?.click();
  await wait(80);
  const health = { mri: document.querySelector('#health-mri')?.textContent.trim() || '', deepseek: document.querySelector('#health-deepseek')?.textContent.trim() || '', portfolio: document.querySelector('#health-portfolio')?.textContent.trim() || '', output: document.querySelector('#deployment-health-output')?.textContent.trim() || '' };
  document.querySelector('#evidence-pack-copy')?.click();
  await wait(1000);
  const exportState = document.querySelector('#evidence-pack-status')?.textContent.trim() || '';
  const cardOverflow = cards.flatMap(card => [...card.querySelectorAll('*')].filter(child => { const r = child.getBoundingClientRect(); return r.left < -1 || r.right > root.clientWidth + 1; }).map(child => child.id || child.className || child.tagName));
  const languageToggle = document.querySelector('#language-toggle');
  languageToggle?.click();
  await wait(80);
  const language = { value: root.dataset.language || '', title: document.querySelector('#feature-command-center-title')?.textContent.trim() || '', evidenceHeading: document.querySelector('#evidence-room-heading')?.textContent.trim() || '', healthOutput: document.querySelector('#deployment-health-output')?.textContent.trim() || '' };
  const themeToggle = document.querySelector('#theme-toggle');
  if (root.dataset.theme !== 'light') themeToggle?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  await wait(50);
  const light = { theme: root.dataset.theme || '', heading: document.querySelector('#feature-command-center-title') ? rect(document.querySelector('#feature-command-center-title')) : null, card: document.querySelector('.feature-command-card h3') ? rect(document.querySelector('.feature-command-card h3')) : null };
  return { initial, intent, evidence: evidenceResult, health, exportState, cardOverflow, language, light, finalScrollWidth: root.scrollWidth };
})()`;
const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
console.log(JSON.stringify({ target: target.url, result: result.result?.value || result.exceptionDetails }, null, 2));
await send('Emulation.clearDeviceMetricsOverride');
ws.close();
})();
