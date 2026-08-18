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
 const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));const root=document.documentElement;const section=document.querySelector('#evaluation-ops');const cards=[...document.querySelectorAll('#evaluation-ops .ops-card')];const click=async selector=>{document.querySelector(selector)?.click();await wait(35)};
 const initial={present:!!section,cards:cards.length,forms:section?section.querySelectorAll('form').length:0,scrollWidth:root.scrollWidth,sectionHeight:section?Math.round(section.getBoundingClientRect().height):0};
 document.querySelector('input[data-compare="deepseek"]').checked=true;await click('#compare-projects-run');const comparison=document.querySelector('#project-comparison-output')?.textContent.trim()||'';
 await click('#self-health-scan-run');const health=document.querySelector('#self-health-scan-output')?.textContent.trim()||'';
 await click('#performance-observer-run');const observer=document.querySelector('#performance-observer-output')?.textContent.trim()||'';
 document.querySelector('#seo-preview-locale').value='bn';document.querySelector('#seo-preview-locale').dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('#seo-preview-title').value='রিফাত | Full-Stack AI Engineer';document.querySelector('#seo-preview-title').dispatchEvent(new Event('input',{bubbles:true}));const seo=document.querySelector('#seo-social-preview-output')?.textContent.trim()||'';
 document.querySelector('#rubric-topic').value='security';document.querySelector('#rubric-topic').dispatchEvent(new Event('change',{bubbles:true}));const rubric=document.querySelector('#interview-rubric-output')?.textContent.trim()||'';
 document.querySelector('#discovery-type').value='ai';document.querySelector('#discovery-constraint').value='privacy';document.querySelector('#discovery-meeting-form')?.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));await wait(35);const meeting=document.querySelector('#discovery-meeting-output')?.textContent.trim()||'';
 await click('.roadmap-filter[data-roadmap-filter="next"]');const roadmap=[...document.querySelectorAll('#roadmap-items > div:not(.is-hidden)')].map(node=>node.textContent.trim()).join(' | ');
 document.querySelector('#inquiry-draft-input').value='Need a Telegram AI workflow with a protected provider boundary.';await click('#inquiry-draft-save');const draft=document.querySelector('#inquiry-draft-output')?.textContent.trim()||'';
 await click('.branch-button[data-branch="maintenance"]');const branch=document.querySelector('#case-study-branch-output')?.textContent.trim()||'';
 await click('.scenario-button[data-a11y-scenario="lowmotion"]');const scenario=document.querySelector('#accessibility-scenario-output')?.textContent.trim()||'';
 const overflow=cards.flatMap(card=>[...card.querySelectorAll('*')].filter(child=>{const r=child.getBoundingClientRect();return r.left< -1||r.right>root.clientWidth+1;}).map(child=>child.id||child.className||child.tagName));
 const language=document.querySelector('#language-toggle');language?.click();await wait(100);const localized={value:root.dataset.language||'',title:document.querySelector('#evaluation-ops-title')?.textContent.trim()||'',roadmap:[...document.querySelectorAll('#roadmap-items > div:not(.is-hidden)')].map(node=>node.textContent.trim()).join(' | ')};
 const theme=document.querySelector('#theme-toggle');if(root.dataset.theme!=='light')theme?.click();await wait(50);const light={theme:root.dataset.theme||'',titleColor:document.querySelector('#evaluation-ops-title')?getComputedStyle(document.querySelector('#evaluation-ops-title')).color:'',cardColor:document.querySelector('.ops-card h3')?getComputedStyle(document.querySelector('.ops-card h3')).color:''};
 return {initial,comparison,health,observer,seo,rubric,meeting,roadmap,draft,branch,scenario,overflow,localized,light,finalScrollWidth:root.scrollWidth};
})()`;
const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});console.log(JSON.stringify({target:target.url,result:result.result?.value||result.exceptionDetails},null,2));await send('Emulation.clearDeviceMetricsOverride');ws.close();
})();
