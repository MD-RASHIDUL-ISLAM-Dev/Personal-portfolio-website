(async()=>{
const fs=require('fs');
const baseUrl='https://4183-ih3eq9kgv77c3syrirv4m-dcd118f9.sg1.manus.computer/?v=33.8&cursor=1';
const targets=await (await fetch('http://127.0.0.1:9222/json')).json();
const target=targets.find(item=>item.type==='page'&&item.url.includes('manus.computer'))||targets.find(item=>item.type==='page');
if(!target)throw new Error('No page target found');
const ws=new WebSocket(target.webSocketDebuggerUrl);let nextId=1;const pending=new Map();
ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id&&pending.has(m.id)){const resolve=pending.get(m.id);pending.delete(m.id);resolve(m);}});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=nextId++;pending.set(id,m=>m.error?reject(new Error(JSON.stringify(m.error))):resolve(m.result));ws.send(JSON.stringify({id,method,params}));});
await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const evaluate=async expression=>(await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result?.value;
await send('Page.enable');await send('Emulation.setEmulatedMedia',{features:[]});await send('Page.navigate',{url:baseUrl});await wait(1000);
const configs=[{name:'desktop',width:1280,mobile:false,touch:false,reduced:false},{name:'mobile',width:390,mobile:true,touch:true,reduced:false},{name:'reduced',width:1280,mobile:false,touch:false,reduced:true}];
const results=[];
for(const cfg of configs){
 await send('Emulation.setDeviceMetricsOverride',{width:cfg.width,height:844,deviceScaleFactor:1,mobile:cfg.mobile,touch:cfg.touch});
 await send('Emulation.setTouchEmulationEnabled',{enabled:cfg.touch,maxTouchPoints:cfg.touch?5:1});
 await send('Emulation.setEmulatedMedia',{features:cfg.reduced?[{name:'prefers-reduced-motion',value:'reduce'}]:[]});
 await send('Page.reload',{ignoreCache:true});await wait(1200);
 const state=await evaluate(`(()=>{const root=document.documentElement,layer=document.querySelector('.cursor-experience-layer'),card=document.querySelector('.project-card'),label=document.querySelector('.cursor-context-label');const cardRect=card?.getBoundingClientRect();return {innerWidth,rootClass:root.className,pointerFine:matchMedia('(pointer:fine)').matches,pointerCoarse:matchMedia('(pointer:coarse)').matches,hover:matchMedia('(hover:hover)').matches,reduced:matchMedia('(prefers-reduced-motion:reduce)').matches,layer:!!layer,layerDisplay:layer?getComputedStyle(layer).display:null,trails:document.querySelectorAll('.cursor-trail').length,label:!!label,cardEnhanced:!!card?.classList.contains('cursor-enhanced-card'),cardRect:cardRect?{left:Math.round(cardRect.left),right:Math.round(cardRect.right)}:null,scrollWidth:root.scrollWidth}})()`);
 const shot=await send('Page.captureScreenshot',{format:'png',fromSurface:true});fs.writeFileSync(`/home/ubuntu/workspace/portfolio-upgrade/cursor-${cfg.name}-hero.png`,Buffer.from(shot.data,'base64'));
 results.push({config:cfg,state});
}
await send('Emulation.clearDeviceMetricsOverride');await send('Emulation.setTouchEmulationEnabled',{enabled:false,maxTouchPoints:1});await send('Emulation.setEmulatedMedia',{features:[]});console.log(JSON.stringify({target:target.url,baseUrl,results},null,2));ws.close();
})();
