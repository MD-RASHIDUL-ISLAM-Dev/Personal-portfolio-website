(async()=>{
const targets=await (await fetch('http://127.0.0.1:9222/json')).json();
const target=targets.find(item=>item.type==='page'&&item.url.includes('manus.computer'))||targets.find(item=>item.type==='page');
if(!target) throw new Error('No page target found');
const ws=new WebSocket(target.webSocketDebuggerUrl); let nextId=1; const pending=new Map();
ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id&&pending.has(m.id)){const resolve=pending.get(m.id);pending.delete(m.id);resolve(m.result);}});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=nextId++;pending.set(id,m=>m.error?reject(new Error(JSON.stringify(m.error))):resolve(m.result));ws.send(JSON.stringify({id,method,params}));});
await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
const evaluate=async expression=>(await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result?.value;
const run=async(width,theme)=>{
  await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<700,touch:width<700});
  await evaluate(`(()=>{const html=document.documentElement;if(html.dataset.theme!==${JSON.stringify(theme)})document.querySelector('#theme-toggle')?.click();})()`);
  await new Promise(r=>setTimeout(r,80));
  return evaluate(`(()=>{const root=document.documentElement;const pick=sel=>{const e=document.querySelector(sel);if(!e)return null;const s=getComputedStyle(e);return {color:s.color,background:s.backgroundColor,border:s.borderColor}};const section=document.querySelector('#client-ready-layer');const nodes=[...document.querySelectorAll('#client-ready-layer *')];const overflow=nodes.map(e=>{const r=e.getBoundingClientRect();return {tag:e.tagName,id:e.id||'',cls:e.className||'',left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width)}}).filter(x=>x.left< -1||x.right>innerWidth+1||x.width>innerWidth+1);return {width:${width},theme:root.dataset.theme,scrollWidth:root.scrollWidth,overflow,section:pick('#client-ready-layer'),card:pick('#client-ready-layer .client-card'),heading:pick('#client-ready-layer .client-card h3'),body:pick('#client-ready-layer .client-card p'),output:pick('#client-ready-layer .client-output'),button:pick('#client-ready-layer .tradeoff-button'),input:pick('#client-ready-layer input'),cards:section?.querySelectorAll('.client-card').length||0}})()`);
};
const results=[];for(const theme of ['dark','light'])for(const width of [360,390,1280])results.push(await run(width,theme));await send('Emulation.clearDeviceMetricsOverride');console.log(JSON.stringify({target:target.url,results},null,2));ws.close();
})();
