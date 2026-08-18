(async()=>{
const fs=require('fs');
const baseUrl='https://4183-ih3eq9kgv77c3syrirv4m-dcd118f9.sg1.manus.computer/?v=34.3&motion=2&mobile-perf=1&fresh=perf-audit';
const targets=await (await fetch('http://127.0.0.1:9222/json')).json();
const target=targets.find(item=>item.type==='page'&&item.url.includes('v=34.3'))||targets.find(item=>item.type==='page'&&item.url.includes('manus.computer'))||targets.find(item=>item.type==='page');
if(!target)throw new Error('No page target found');
const ws=new WebSocket(target.webSocketDebuggerUrl);let nextId=1;const pending=new Map();
ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id&&pending.has(m.id)){const resolve=pending.get(m.id);pending.delete(m.id);resolve(m);}});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=nextId++;pending.set(id,m=>m.error?reject(new Error(JSON.stringify(m.error))):resolve(m.result));ws.send(JSON.stringify({id,method,params}));});
await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const evaluate=async expression=>(await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result?.value;
const metricMap=raw=>Object.fromEntries((raw.metrics||[]).map(item=>[item.name,item.value]));
await send('Page.enable');await send('Performance.enable');await send('Emulation.setEmulatedMedia',{features:[]});
await send('Page.navigate',{url:baseUrl});await wait(1000);
const results=[];
for(const width of [360,390]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true,touch:true});
  await send('Page.reload',{ignoreCache:true});await wait(2200);
  await evaluate(`(async()=>{history.scrollRestoration='manual';const html=document.documentElement;const previous=html.style.scrollBehavior;html.style.scrollBehavior='auto';scrollTo(0,0);await new Promise(r=>setTimeout(r,320));scrollTo(0,0);html.style.scrollBehavior=previous;return {scrollY,ready:document.readyState}})()`);
  const before=metricMap(await send('Performance.getMetrics'));
  const initial=await evaluate(`(()=>{const root=document.documentElement;return {innerWidth,innerHeight,scrollWidth:root.scrollWidth,bodyScrollWidth:document.body.scrollWidth,theme:root.dataset.theme,language:root.dataset.language,motionReady:root.classList.contains('motion-ready'),motionEntered:root.classList.contains('motion-entered'),motionReduced:root.classList.contains('motion-reduced'),heroVisible:getComputedStyle(document.querySelector('.hero__visual')).opacity,watermarks:document.querySelectorAll('.motion-section[data-motion-word]').length,motionCards:document.querySelectorAll('.motion-card').length,visibleCards:document.querySelectorAll('.motion-card.is-motion-visible').length}})()`);
  const capture=await send('Page.captureScreenshot',{format:'png',fromSurface:true});fs.writeFileSync(`/home/ubuntu/workspace/portfolio-upgrade/mobile-motion-${width}-hero.png`,Buffer.from(capture.data,'base64'));
  const sectionOffsets=await evaluate(`(()=>[...document.querySelectorAll('.motion-section[data-motion-word]')].slice(0,7).map(e=>Math.max(0,e.getBoundingClientRect().top+scrollY-72)))()`);
  const scrollStart=Date.now();
  const scrollResult=await evaluate(`(async()=>{const offsets=${JSON.stringify(sectionOffsets||[])};const wait=ms=>new Promise(r=>setTimeout(r,ms));const html=document.documentElement;const previous=html.style.scrollBehavior;html.style.scrollBehavior='auto';const samples=[];for(const top of offsets){scrollTo(0,top);await wait(160);samples.push({top:Math.round(top),scrollY:Math.round(scrollY),visibleCards:document.querySelectorAll('.motion-card.is-motion-visible').length,wordSections:[...document.querySelectorAll('.motion-section[data-motion-word]')].filter(e=>e.getBoundingClientRect().top<innerHeight&&e.getBoundingClientRect().bottom>0).length});}html.style.scrollBehavior=previous;return {samples,finalScrollY:Math.round(scrollY),finalScrollWidth:document.documentElement.scrollWidth}})()`);
  const scrollMs=Date.now()-scrollStart;
  const after=metricMap(await send('Performance.getMetrics'));
  const captureProjects=await send('Page.captureScreenshot',{format:'png',fromSurface:true});fs.writeFileSync(`/home/ubuntu/workspace/portfolio-upgrade/mobile-motion-${width}-projects.png`,Buffer.from(captureProjects.data,'base64'));
  results.push({width,initial,scrollResult,scrollMeasurementMs:scrollMs,metrics:{before:{TaskDuration:before.TaskDuration,ScriptDuration:before.ScriptDuration,LayoutDuration:before.LayoutDuration,RecalcStyleDuration:before.RecalcStyleDuration,JSHeapUsedSize:before.JSHeapUsedSize,Nodes:before.Nodes,LayoutCount:before.LayoutCount},after:{TaskDuration:after.TaskDuration,ScriptDuration:after.ScriptDuration,LayoutDuration:after.LayoutDuration,RecalcStyleDuration:after.RecalcStyleDuration,JSHeapUsedSize:after.JSHeapUsedSize,Nodes:after.Nodes,LayoutCount:after.LayoutCount,RecalcStyleCount:after.RecalcStyleCount}}});
}
await send('Emulation.clearDeviceMetricsOverride');await send('Emulation.setEmulatedMedia',{features:[]});console.log(JSON.stringify({target:target.url,baseUrl,results},null,2));ws.close();
})();
