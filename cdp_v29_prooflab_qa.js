(async()=>{
const targets=await (await fetch('http://127.0.0.1:9222/json')).json();
const target=targets.find(item=>item.type==='page'&&item.url.includes('manus.computer'))||targets.find(item=>item.type==='page');
if(!target)throw new Error('No page target found');
const ws=new WebSocket(target.webSocketDebuggerUrl);let nextId=1;const pending=new Map();
ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id&&pending.has(m.id)){const resolve=pending.get(m.id);pending.delete(m.id);resolve(m);}});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=nextId++;pending.set(id,m=>m.error?reject(new Error(JSON.stringify(m.error))):resolve(m.result));ws.send(JSON.stringify({id,method,params}));});
await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
const expression=`(async()=>{
 const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));const root=document.documentElement;const section=document.querySelector('#proof-lab-next');const cards=[...document.querySelectorAll('#proof-lab-next .proof-lab-card')];
 const initial={present:!!section,cards:cards.length,scrollWidth:root.scrollWidth,sectionHeight:section?Math.round(section.getBoundingClientRect().height):0};
 const click=async(selector)=>{document.querySelector(selector)?.click();await wait(25)};
 await click('.trace-node[data-trace="intelligence"]');const trace=document.querySelector('#architecture-trace-output')?.textContent.trim()||'';
 const query=document.querySelector('#sandbox-query');query.value='backup';document.querySelector('#live-demo-sandbox-form')?.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));await wait(25);const sandbox=document.querySelector('#live-demo-sandbox-output')?.textContent.trim()||'';
 await click('#run-v29-performance');const performance=document.querySelector('#performance-budget-output')?.textContent.trim()||'';
 document.querySelector('#proposal-type').value='ai';document.querySelector('#proposal-platform').value='telegram';document.querySelector('#proposal-generator-form')?.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));await wait(25);const proposal=document.querySelector('#proposal-generator-output')?.textContent.trim()||'';
 document.querySelector('#release-diff-from').value='v28';document.querySelector('#release-diff-to').value='v29';document.querySelector('#release-diff-to').dispatchEvent(new Event('change',{bubbles:true}));await wait(25);const diff=document.querySelector('#release-diff-output')?.textContent.trim()||'';
 await click('.proof-rail-button[data-rail="proof"]');const rail=document.querySelector('#proof-rail-output')?.textContent.trim()||'';
 document.querySelector('#stack-rationale-select').value='vanilla';document.querySelector('#stack-rationale-select').dispatchEvent(new Event('change',{bubbles:true}));await wait(25);const stack=document.querySelector('#stack-rationale-output')?.textContent.trim()||'';
 const overflow=cards.flatMap(card=>[...card.querySelectorAll('*')].filter(child=>{const r=child.getBoundingClientRect();return r.left< -1||r.right>root.clientWidth+1;}).map(child=>child.id||child.className||child.tagName));
 const language=document.querySelector('#language-toggle');language?.click();await wait(90);const bn={value:root.dataset.language||'',title:document.querySelector('#proof-lab-next-title')?.textContent.trim()||'',trace:document.querySelector('#architecture-trace-output')?.textContent.trim()||''};
 const theme=document.querySelector('#theme-toggle');if(root.dataset.theme!=='light')theme?.click();await wait(50);const light={theme:root.dataset.theme||'',heading:document.querySelector('#proof-lab-next-title')?.getBoundingClientRect().width||0,color:document.querySelector('#proof-lab-next-title')?getComputedStyle(document.querySelector('#proof-lab-next-title')).color:''};
 return {initial,trace,sandbox,performance,proposal,diff,rail,stack,overflow,bn,light,finalScrollWidth:root.scrollWidth};
})()`;
const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});console.log(JSON.stringify({target:target.url,result:result.result?.value||result.exceptionDetails},null,2));await send('Emulation.clearDeviceMetricsOverride');ws.close();
})();
