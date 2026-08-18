const targets = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
const target = targets.find(item => item.type === 'page' && item.url.includes('manus.computer')) || targets.find(item => item.type === 'page');
if (!target) throw new Error('No page target found');
const ws = new WebSocket(target.webSocketDebuggerUrl);
let nextId = 1;
const pending = new Map();
ws.addEventListener('message', event => { const message = JSON.parse(event.data); if (message.id && pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); } });
const send = (method, params = {}) => new Promise((resolve, reject) => { const id = nextId++; pending.set(id, message => message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result)); ws.send(JSON.stringify({id, method, params})); });
await new Promise(resolve => ws.addEventListener('open', resolve, {once:true}));
const results = [];
for (const width of [390,360]) {
  await send('Emulation.setDeviceMetricsOverride', {width,height:844,deviceScaleFactor:1,mobile:true});
  const expression = `(() => {
    const vw=innerWidth, root=document.documentElement;
    const rect=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {tag:e.tagName,id:e.id||'',cls:String(e.className||'').slice(0,80),left:Math.round(r.left),right:Math.round(r.right),top:Math.round(r.top),bottom:Math.round(r.bottom),width:Math.round(r.width),height:Math.round(r.height),display:s.display,grid:s.gridTemplateColumns,gridColumn:s.gridColumn,flex:s.flex,minHeight:s.minHeight,maxHeight:s.maxHeight,overflow:s.overflow,overflowWrap:s.overflowWrap,wordBreak:s.wordBreak,text:(e.textContent||'').trim().slice(0,90)}};
    const cards=[...document.querySelectorAll('#ai-studio .v25-ai-card')].map(card=>({card:rect(card),children:[...card.querySelectorAll('form,textarea,input,select,button,.v25-consent,.v25-consent span,.v25-ai-output')].map(rect).filter(x=>x.left<-1||x.right>vw+1||x.width>vw+1||x.top<cardTop(card)-1||x.bottom>cardBottom(card)+1),all:[...card.querySelectorAll('form,textarea,input,select,button,.v25-consent,.v25-consent span,.v25-ai-output')].map(rect)}));
    function cardTop(card){return card.getBoundingClientRect().top} function cardBottom(card){return card.getBoundingClientRect().bottom}
    const header=document.querySelector('#site-nav'), hr=header?.getBoundingClientRect();
    const headerChildren=[...document.querySelectorAll('.site-nav__inner>*')].map(rect);
    return {width:vw,scrollWidth:root.scrollWidth,header:header?{left:Math.round(hr.left),right:Math.round(hr.right),top:Math.round(hr.top),bottom:Math.round(hr.bottom),height:Math.round(hr.height)}:null,headerChildren,headerOut:headerChildren.filter(x=>x.display!=='none'&&(x.left<0||x.right>vw)),cards,section:rect(document.querySelector('#ai-studio'))};
  })()`;
  const result = await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
  results.push(result.result?.value);
}
console.log(JSON.stringify({target:target.url,results},null,2));
await send('Emulation.clearDeviceMetricsOverride'); ws.close();
