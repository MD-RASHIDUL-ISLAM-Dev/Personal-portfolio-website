(async()=>{
const targets=await (await fetch('http://127.0.0.1:9222/json')).json();
const target=targets.find(item=>item.type==='page'&&item.url.includes('v=34.2'))||targets.find(item=>item.type==='page'&&item.url.includes('manus.computer'))||targets.find(item=>item.type==='page');
if(!target)throw new Error('No page target found');
const ws=new WebSocket(target.webSocketDebuggerUrl);let nextId=1;const pending=new Map();
ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id&&pending.has(m.id)){const resolve=pending.get(m.id);pending.delete(m.id);resolve(m);}});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=nextId++;pending.set(id,m=>m.error?reject(new Error(JSON.stringify(m.error))):resolve(m.result));ws.send(JSON.stringify({id,method,params}));});
await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
const evaluate=async expression=>(await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result?.value;
const run=async(width,reduced)=>{
  await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<700,touch:width<700});
  if(reduced)await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  else await send('Emulation.setEmulatedMedia',{features:[]});
  return evaluate(`(async()=>{const wait=ms=>new Promise(r=>setTimeout(r,ms));const root=document.documentElement;const html=root.style;const prior=html.scrollBehavior;html.scrollBehavior='auto';const projects=document.querySelector('#projects');const top=projects?projects.getBoundingClientRect().top+window.scrollY:0;window.scrollTo(0,Math.max(0,top-80));await wait(160);const cards=[...document.querySelectorAll('#projects .motion-card')];const all=[...document.querySelectorAll('.motion-card,.motion-rise')];const overflow=all.map(e=>{const r=e.getBoundingClientRect();return {tag:e.tagName,cls:String(e.className||'').slice(0,50),left:Math.round(r.left),right:Math.round(r.right)}}).filter(x=>x.left< -1||x.right>innerWidth+1);const first=cards[0];const fs=first?getComputedStyle(first):null;html.scrollBehavior=prior;return {width:${width},reduced:${reduced},theme:root.dataset.theme,language:root.dataset.language,motionReady:root.classList.contains('motion-ready'),motionEntered:root.classList.contains('motion-entered'),motionReduced:root.classList.contains('motion-reduced'),scrollWidth:root.scrollWidth,projectVisible:cards.filter(e=>e.classList.contains('is-motion-visible')).length,projectTotal:cards.length,firstOpacity:fs?.opacity||null,firstClip:fs?.clipPath||null,sectionWord:projects?.dataset.motionWord||'',overflow}})()`);
};
const results=[];for(const reduced of [false,true])for(const width of [360,390,1280])results.push(await run(width,reduced));await send('Emulation.clearDeviceMetricsOverride');await send('Emulation.setEmulatedMedia',{features:[]});console.log(JSON.stringify({target:target.url,results},null,2));ws.close();
})();
