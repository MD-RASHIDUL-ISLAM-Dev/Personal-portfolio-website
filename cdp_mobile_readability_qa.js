const targets = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
const target = targets.find(item => item.type === 'page' && item.url.includes('manus.computer')) || targets.find(item => item.type === 'page');
if (!target) throw new Error('No page target found');
const ws = new WebSocket(target.webSocketDebuggerUrl);
let nextId = 1;
const pending = new Map();
ws.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message);
    pending.delete(message.id);
  }
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = nextId++;
  pending.set(id, message => message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result));
  ws.send(JSON.stringify({id, method, params}));
});
await new Promise(resolve => ws.addEventListener('open', resolve, {once: true}));
await send('Emulation.setDeviceMetricsOverride', {width: 390, height: 844, deviceScaleFactor: 1, mobile: true});
const expression = `(() => {
  const root = document.documentElement;
  root.dataset.theme = 'light';
  root.dataset.language = 'bn';
  const menu = document.querySelector('#site-menu');
  const toggle = document.querySelector('#menu-toggle');
  const before = {width: innerWidth, menuOpen: menu?.classList.contains('is-open'), bodyLock: document.body.classList.contains('menu-open'), aria: toggle?.getAttribute('aria-expanded')};
  toggle?.click();
  const after = {width: innerWidth, menuOpen: menu?.classList.contains('is-open'), bodyLock: document.body.classList.contains('menu-open'), aria: toggle?.getAttribute('aria-expanded'), mobileTools: document.querySelectorAll('#site-nav-mobile-tools .utility-toggle').length};
  const selectors = ['.site-nav__links a','.brand__copy strong','.hero__sub','.body-copy','.form-field label','.security-layer','.preference-switch small'];
  const text = selectors.map(sel => { const el = document.querySelector(sel); if (!el) return {sel,missing:true}; const s = getComputedStyle(el); return {sel,font:s.fontSize,line:s.lineHeight,color:s.color}; });
  toggle?.click();
  return {before, after, closed:{menuOpen:menu?.classList.contains('is-open'), bodyLock:document.body.classList.contains('menu-open'), aria:toggle?.getAttribute('aria-expanded')}, text};
})()`;
const evaluated = await send('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true});
console.log(JSON.stringify({target: target.url, result: evaluated.result?.value}, null, 2));
await send('Emulation.clearDeviceMetricsOverride');
ws.close();
