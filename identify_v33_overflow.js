(async()=>{
const targets=await (await fetch('http://127.0.0.1:9222/json')).json();
const target=targets.find(item=>item.type==='page'&&item.url.includes('manus.computer'))||targets.find(item=>item.type==='page');
const ws=new WebSocket(target.webSocketDebuggerUrl);let nextId=1;const pending=new Map();
ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id&&pending.has(m.id)){const resolve=pending.get(m.id);pending.delete(m.id);resolve(m.result);}});
const send=(method,params={})=>new Promise(resolve=>{const id=nextId++;pending.set(id,resolve);ws.send(JSON.stringify({id,method,params}));});
await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
await send('Emulation.setDeviceMetricsOverride',{width:360,height:844,deviceScaleFactor:1,mobile:true,touch:true});
await send('Runtime.evaluate',{expression:`document.querySelector('.tradeoff-button[data-tradeoff="privacy"]')?.click()`});
const expr=`(()=>{const e=document.querySelector('#client-ready-layer .tradeoff-button[data-tradeoff="maintenance"]');const r=e?.getBoundingClientRect();const p=e?.parentElement;const pr=p?.getBoundingClientRect();const cs=e?getComputedStyle(e):null;const ps=p?getComputedStyle(p):null;return {url:location.href,button:e&&{text:e.textContent,rect:{left:r.left,right:r.right,width:r.width},whiteSpace:cs.whiteSpace,flex:cs.flex,maxWidth:cs.maxWidth,display:cs.display},parent:p&&{cls:p.className,rect:{left:pr.left,right:pr.right,width:pr.width},overflow:ps.overflow,flexWrap:ps.flexWrap,width:ps.width}}})()`;
const result=await send('Runtime.evaluate',{expression:expr,returnByValue:true});console.log(JSON.stringify(result.result?.value||[],null,2));await send('Emulation.clearDeviceMetricsOverride');ws.close();
})();
