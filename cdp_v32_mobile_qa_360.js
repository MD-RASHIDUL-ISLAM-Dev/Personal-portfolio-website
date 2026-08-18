(async()=>{
const targets=await (await fetch('http://127.0.0.1:9222/json')).json();
const target=targets.find(item=>item.type==='page'&&item.url.includes('manus.computer'))||targets.find(item=>item.type==='page');
if(!target)throw new Error('No page target found');
const ws=new WebSocket(target.webSocketDebuggerUrl);let nextId=1;const pending=new Map();
ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id&&pending.has(m.id)){const resolve=pending.get(m.id);pending.delete(m.id);resolve(m);}});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=nextId++;pending.set(id,m=>m.error?reject(new Error(JSON.stringify(m.error))):resolve(m.result));ws.send(JSON.stringify({id,method,params}));});
await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
const viewWidth=360;await send('Emulation.setDeviceMetricsOverride',{width:viewWidth,height:844,deviceScaleFactor:1,mobile:true});
const expression=`(async()=>{
 const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));const root=document.documentElement;const quick=document.querySelector('#mobile-quick-start');const advanced=document.querySelector('#mobile-advanced-guide');
 const rect=node=>{if(!node)return null;const r=node.getBoundingClientRect();return {left:Math.round(r.left),right:Math.round(r.right),top:Math.round(r.top),bottom:Math.round(r.bottom),width:Math.round(r.width),height:Math.round(r.height)}};
 const initial={viewport:innerWidth,quickDisplay:quick?getComputedStyle(quick).display:'missing',quick:rect(quick),advancedDisplay:advanced?getComputedStyle(advanced).display:'missing',scrollWidth:root.scrollWidth};
 const touchTargets=[...document.querySelectorAll('#mobile-quick-start a,.mobile-form-nav button,#ai-launcher,#ai-form button,#mobile-sticky-cta a')].map(node=>({id:node.id||node.textContent.trim().slice(0,20),rect:rect(node)}));
 const fit=document.querySelector('#fit-quiz-form');const fitSteps=fit?[...fit.querySelectorAll('.mobile-flow-step')]:[];const fitProgress=fit?.querySelector('.mobile-form-progress');const fitNext=fit?.querySelector('.mobile-form-nav__next');const fitBefore={steps:fitSteps.length,current:fit?.querySelector('.mobile-flow-step.is-current')?.textContent.trim().slice(0,50)||'',progress:fitProgress?.textContent||'',submitDisplay:fit?.querySelector('.mobile-flow-submit')?getComputedStyle(fit.querySelector('.mobile-flow-submit')).display:'missing'};fitNext?.click();await wait(30);const fitAfter={current:fit?.querySelector('.mobile-flow-step.is-current')?.textContent.trim().slice(0,50)||'',progress:fitProgress?.textContent||''};
 const brief=document.querySelector('#brief-form');const contact=document.querySelector('#contact-form');const forms={fit:{class:fit?.className||'',steps:fitSteps.length},brief:{class:brief?.className||'',steps:brief?.querySelectorAll('.mobile-flow-step').length||0},contact:{class:contact?.className||'',steps:contact?.querySelectorAll('.mobile-flow-step').length||0}};
 const aiLauncher=document.querySelector('#ai-launcher');aiLauncher?.click();await wait(50);const aiPanel=document.querySelector('#ai-panel');const ai={panel:rect(aiPanel),display:aiPanel?getComputedStyle(aiPanel).display:'missing',maxHeight:aiPanel?getComputedStyle(aiPanel).maxHeight:'missing'};document.querySelector('#ai-close')?.click();
 const sticky=rect(document.querySelector('#mobile-sticky-cta'));const launcher=rect(aiLauncher);const overlap=sticky&&launcher&&!(sticky.right<launcher.left||sticky.left>launcher.right||sticky.bottom<launcher.top||sticky.top>launcher.bottom);
 const offline=Object.defineProperty(navigator,'onLine',{configurable:true,get:()=>false});window.dispatchEvent(new Event('offline'));await wait(15);const fallback={hidden:document.querySelector('#network-fallback-status')?.hidden,text:document.querySelector('#network-fallback-status')?.textContent.trim()||''};
 const overflow=[...document.querySelectorAll('#mobile-quick-start *,#mobile-advanced-guide *,#fit-quiz-form *,#brief-form *,#contact-form *')].filter(node=>{const r=node.getBoundingClientRect();return r.left< -1||r.right>innerWidth+1;}).map(node=>node.id||node.className||node.tagName);
 return {initial,touchTargets,fitBefore,fitAfter,forms,ai,sticky,launcher,overlap,fallback,overflow,finalScrollWidth:root.scrollWidth};
})()`;
const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});console.log(JSON.stringify({target:target.url,result:result.result?.value||result.exceptionDetails},null,2));await send('Emulation.clearDeviceMetricsOverride');ws.close();
})();
