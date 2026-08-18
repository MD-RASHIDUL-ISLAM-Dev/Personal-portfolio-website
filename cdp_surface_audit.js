const targets = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
const target = targets.find(item => item.type === 'page' && item.url.includes('manus.computer')) || targets.find(item => item.type === 'page');
if (!target) throw new Error('No page target found');
const ws = new WebSocket(target.webSocketDebuggerUrl);
let nextId = 1; const pending = new Map();
ws.addEventListener('message', event => { const m=JSON.parse(event.data); if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);}});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=nextId++;pending.set(id,m=>m.error?reject(new Error(JSON.stringify(m.error))):resolve(m.result));ws.send(JSON.stringify({id,method,params}));});
await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
const results=[];
for(const width of [390,360]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});
  const expression=`(async()=>{
    const root=document.documentElement; root.dataset.theme='dark'; root.dataset.language='bn';
    const rect=sel=>{const e=document.querySelector(sel);if(!e)return null;const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {sel,left:Math.round(r.left),right:Math.round(r.right),top:Math.round(r.top),bottom:Math.round(r.bottom),width:Math.round(r.width),height:Math.round(r.height),display:s.display,position:s.position,z:s.zIndex,overflow:s.overflow,transform:s.transform,font:s.fontSize,line:s.lineHeight,text:(e.textContent||'').trim().slice(0,160)}};
    const openButton=id=>{const e=document.querySelector(id);e?.click();return true};
    const progress=rect('#reading-progress-label');
    const tocBefore=rect('#section-toc'); openButton('#section-toc-toggle'); await new Promise(r=>setTimeout(r,40)); const tocOpen={toggle:rect('#section-toc-toggle'),panel:rect('#section-toc'),links:rect('#section-toc .section-toc__links'),items:[...document.querySelectorAll('#section-toc a')].slice(0,30).map(e=>{const r=e.getBoundingClientRect();return {text:e.textContent.trim(),left:Math.round(r.left),right:Math.round(r.right),top:Math.round(r.top),bottom:Math.round(r.bottom),width:Math.round(r.width),height:Math.round(r.height)}}),bodyOverflow:getComputedStyle(document.body).overflow}; openButton('#section-toc-toggle');
    const launcher=rect('#ai-launcher'); openButton('#ai-launcher'); await new Promise(r=>setTimeout(r,40)); const ai={launcher:rect('#ai-launcher'),panel:rect('#ai-panel'),messages:rect('#ai-messages'),input:rect('#ai-input'),form:rect('#ai-form'),suggestions:[...document.querySelectorAll('.ai-assistant__suggestions button')].map(e=>{const r=e.getBoundingClientRect();return {left:Math.round(r.left),right:Math.round(r.right),top:Math.round(r.top),bottom:Math.round(r.bottom),width:Math.round(r.width),height:Math.round(r.height),text:e.textContent.trim()}})}; document.querySelector('#ai-close')?.click();
    const overflow=[...document.querySelectorAll('#section-toc *,#ai-panel *')].map(e=>{const r=e.getBoundingClientRect();return {id:e.id||'',cls:String(e.className||'').slice(0,60),left:Math.round(r.left),right:Math.round(r.right),top:Math.round(r.top),bottom:Math.round(r.bottom),width:Math.round(r.width),height:Math.round(r.height),text:(e.textContent||'').trim().slice(0,80)}}).filter(x=>x.left<0||x.right>innerWidth||x.width>innerWidth);
    return {width:${width},scrollWidth:root.scrollWidth,progress,tocBefore,tocOpen,ai,overflow,header:rect('#site-nav')};
  })()`;
  const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true}); results.push(result.result?.value ?? {exception:result.exceptionDetails?.text||result.result?.description||'no-return'});
}
console.log(JSON.stringify({target:target.url,results},null,2)); await send('Emulation.clearDeviceMetricsOverride'); ws.close();
