(async()=>{
const targets=await (await fetch('http://127.0.0.1:9222/json')).json();
const target=targets.find(item=>item.type==='page'&&item.url.includes('manus.computer'))||targets.find(item=>item.type==='page');
if(!target)throw new Error('No page target found');
const ws=new WebSocket(target.webSocketDebuggerUrl);let id=0;const pending=new Map();
ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id&&pending.has(m.id)){const resolve=pending.get(m.id);pending.delete(m.id);resolve(m);}});
const send=(method,params={})=>new Promise((resolve,reject)=>{const requestId=++id;pending.set(requestId,m=>m.error?reject(new Error(JSON.stringify(m.error))):resolve(m.result));ws.send(JSON.stringify({id:requestId,method,params}));});
await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const evaluate=async expression=>(await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result?.value;
const baseUrl='https://4183-ih3eq9kgv77c3syrirv4m-dcd118f9.sg1.manus.computer/?v=33.9&mobile-ux=1';
await send('Page.enable');await send('Emulation.setEmulatedMedia',{features:[]});
const rect=node=>node?(()=>{const r=node.getBoundingClientRect(),s=getComputedStyle(node);return {left:Math.round(r.left),right:Math.round(r.right),top:Math.round(r.top),bottom:Math.round(r.bottom),width:Math.round(r.width),height:Math.round(r.height),opacity:s.opacity,visibility:s.visibility,display:s.display}})():null;
const results=[];
for(const width of [390,360]){
 await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true,touch:true});
 await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 await send('Page.navigate',{url:baseUrl});await wait(900);
 const state=await evaluate(`(()=>{const r=e=>e?(()=>{const b=e.getBoundingClientRect(),s=getComputedStyle(e);return {left:Math.round(b.left),right:Math.round(b.right),top:Math.round(b.top),bottom:Math.round(b.bottom),width:Math.round(b.width),height:Math.round(b.height),opacity:s.opacity,visibility:s.visibility,display:s.display}})():null;const root=document.documentElement,sticky=document.querySelector('#mobile-sticky-cta'),ai=document.querySelector('#ai-assistant'),back=document.querySelector('#back-to-top'),progress=document.querySelector('#reading-progress-label'),toggle=document.querySelector('#menu-toggle'),menu=document.querySelector('#site-menu');window.scrollTo(0,1200);return new Promise(resolve=>setTimeout(()=>{toggle?.click();setTimeout(()=>{const menuNodes=[...document.querySelectorAll('#site-menu *')].map(r).filter(Boolean);const menuOverflow=menuNodes.filter(x=>x.left<0||x.right>innerWidth||x.top<0||x.bottom>innerHeight);const open={bodyLock:document.body.classList.contains('menu-open'),aria:toggle?.getAttribute('aria-expanded'),menu:r(menu),menuLinks:r(menu?.querySelector('.site-nav__mobile-tools')),sticky:r(sticky),ai:r(ai),back:r(back),progress:r(progress),menuOverflow};toggle?.click();setTimeout(()=>{const stickyRect=r(sticky),aiRect=r(ai),backRect=r(back),overlap=(a,b)=>a&&b&&!(a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom);const closed={sticky:stickyRect,ai:aiRect,back:backRect,stickyAiOverlap:overlap(stickyRect,aiRect),stickyBackOverlap:overlap(stickyRect,backRect),aiBackOverlap:overlap(aiRect,backRect)};document.querySelector('#ai-launcher')?.click();setTimeout(()=>{const panel=r(document.querySelector('#ai-panel')),launcher=r(document.querySelector('#ai-launcher')),backAfter=r(back);resolve({viewport:innerWidth,scrollY:Math.round(scrollY),scrollWidth:root.scrollWidth,menuOpen:open,closed,aiOpen:{panel,launcher,back:backAfter,backHidden:backAfter?.visibility==='hidden'||backAfter?.opacity==='0',panelWithinViewport:panel?panel.left>=0&&panel.right<=innerWidth&&panel.top>=0&&panel.bottom<=innerHeight:false}})},80)},80)},80)}),100)})()`);
 results.push(state);
}
await send('Emulation.clearDeviceMetricsOverride');await send('Emulation.setTouchEmulationEnabled',{enabled:false,maxTouchPoints:1});console.log(JSON.stringify({baseUrl,results},null,2));ws.close();
})();
