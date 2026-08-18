const targets = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
const target = targets.find(item => item.type === 'page' && item.url.includes('manus.computer')) || targets.find(item => item.type === 'page');
if (!target) throw new Error('No page target found');
const ws = new WebSocket(target.webSocketDebuggerUrl);
let nextId = 1;
const pending = new Map();
ws.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); }
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = nextId++;
  pending.set(id, message => message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result));
  ws.send(JSON.stringify({ id, method, params }));
});
await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
const expression = `(() => {
  const root = document.documentElement;
  root.dataset.theme = 'light';
  root.dataset.language = 'bn';
  const vw = innerWidth;
  const nav = document.querySelector('.site-nav');
  const navInner = document.querySelector('.site-nav__inner');
  const menu = document.querySelector('#site-menu');
  const toggle = document.querySelector('#menu-toggle');
  const contact = document.querySelector('#contact');
  const contactWrap = contact?.querySelector('.wrap');
  const contactNodes = [...document.querySelectorAll('#contact *')].map(el => { const r = el.getBoundingClientRect(); return { tag: el.tagName, id: el.id || '', cls: String(el.className || '').slice(0,90), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), top: Math.round(r.top), bottom: Math.round(r.bottom), text: (el.textContent || '').trim().slice(0,90) }; }).filter(x => x.left < -1 || x.right > vw + 1 || x.width > vw + 1);
  const headerNodes = [nav, navInner, ...document.querySelectorAll('.site-nav *')].map(el => { const r = el.getBoundingClientRect(); return { tag: el.tagName, id: el.id || '', cls: String(el.className || '').slice(0,90), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), height: Math.round(r.height), text: (el.textContent || '').trim().slice(0,70) }; }).filter(x => x.left < -1 || x.right > vw + 1 || x.width > vw + 1);
  const before = { width: vw, scrollWidth: document.documentElement.scrollWidth, navHeight: nav?.getBoundingClientRect().height, navOverflow: getComputedStyle(nav || document.body).overflow, contactDisplay: getComputedStyle(contact || document.body).display, contactWrapWidth: contactWrap?.getBoundingClientRect().width };
  toggle?.click();
  const menuState = { open: menu?.classList.contains('is-open'), bodyLock: document.body.classList.contains('menu-open'), aria: toggle?.getAttribute('aria-expanded'), mobileTools: document.querySelectorAll('#site-nav-mobile-tools .utility-toggle').length };
  toggle?.click();
  return { before, menuState, contactNodes, headerNodes, closed: { open: menu?.classList.contains('is-open'), bodyLock: document.body.classList.contains('menu-open'), aria: toggle?.getAttribute('aria-expanded') } };
})()`;
const evaluated = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
console.log(JSON.stringify({ target: target.url, result: evaluated.result?.value }, null, 2));
await send('Emulation.clearDeviceMetricsOverride');
ws.close();
