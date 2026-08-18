const targets = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
const target = targets.find(item => item.type === 'page' && item.url.includes('manus.computer')) || targets.find(item => item.type === 'page');
if (!target) throw new Error('No page target found');
const ws = new WebSocket(target.webSocketDebuggerUrl);
let nextId=1; const pending=new Map();
ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);}});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=nextId++;pending.set(id,m=>m.error?reject(new Error(JSON.stringify(m.error))):resolve(m.result));ws.send(JSON.stringify({id,method,params}));});
await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
const expression=`(async()=>{
 const root=document.documentElement;root.dataset.theme='dark';root.dataset.language='bn';
 const rect=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {left:Math.round(r.left),right:Math.round(r.right),top:Math.round(r.top),bottom:Math.round(r.bottom),width:Math.round(r.width),height:Math.round(r.height),font:s.fontSize,line:s.lineHeight,text:(e.textContent||'').trim().slice(0,160)}};
 const ai=document.querySelector('#ai-launcher');ai?.click();await new Promise(r=>setTimeout(r,40));
 const input=document.querySelector('#ai-input'),form=document.querySelector('#ai-form'); if(input&&form){input.value='What skills do you use?';form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));await new Promise(r=>setTimeout(r,100));}
 const msgs=[...document.querySelectorAll('#ai-messages .ai-message')].map(rect); const messagePanel=rect(document.querySelector('#ai-messages')); const composer={input:rect(input),form:rect(form),button:rect(document.querySelector('#ai-form button'))};document.querySelector('#ai-close')?.click();
 const toc=document.querySelector('#section-toc-toggle');toc?.click();await new Promise(r=>setTimeout(r,40));const links=document.querySelector('#section-toc .section-toc__links');const first=links?.querySelector('a');if(links)links.scrollTop=links.scrollHeight;await new Promise(r=>setTimeout(r,30));const last=links?.querySelector('a:last-child');const drawer={panel:rect(links),first:first?rect(first):null,last:last?rect(last):null,scrollTop:links?.scrollTop,scrollHeight:links?.scrollHeight,clientHeight:links?.clientHeight};toc?.click();return {scrollWidth:root.scrollWidth,progress:rect(document.querySelector('#reading-progress-label')),msgs,messagePanel,composer,drawer};
})()`;
const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});console.log(JSON.stringify({target:target.url,result:result.result?.value||result.exceptionDetails},null,2));await send('Emulation.clearDeviceMetricsOverride');ws.close();
