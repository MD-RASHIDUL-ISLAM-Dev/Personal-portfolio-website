(async()=>{
const targets=await (await fetch('http://127.0.0.1:9222/json')).json();
const target=targets.find(item=>item.type==='page'&&item.url.includes('manus.computer'))||targets.find(item=>item.type==='page');
if(!target)throw new Error('No target');
const ws=new WebSocket(target.webSocketDebuggerUrl);let id=0;const messages=[];const pending=new Map();
ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.method)messages.push({method:m.method,params:m.params});if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id)}});
const send=(method,params={})=>new Promise(resolve=>{const request={id:++id,method,params};pending.set(request.id,resolve);ws.send(JSON.stringify(request))});
await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
await send('Runtime.enable');
await send('Log.enable');
await send('Page.enable');
await send('Page.reload',{ignoreCache:true});
await new Promise(resolve=>setTimeout(resolve,3500));
const errors=messages.filter(m=>['Runtime.exceptionThrown','Runtime.consoleAPICalled','Log.entryAdded'].includes(m.method)).map(m=>m.params);
console.log(JSON.stringify({url:target.url,errors},null,2));
ws.close();
})();
