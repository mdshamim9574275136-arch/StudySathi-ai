const log=document.getElementById("log"),q=document.getElementById("q"),t=document.getElementById("t");
const p=new URLSearchParams(location.search).get("t");if(p&&t)t.value=p;
q.addEventListener("keydown",e=>e.key==="Enter"&&send());
function add(c,x){const d=document.createElement("div");d.className="msg "+c;d.textContent=x;log.append(d);log.scrollTop=log.scrollHeight}
async function send(){const m=q.value.trim();if(!m)return;add("me",m);q.value="";
 try{const r=await fetch("/.netlify/functions/chat",{method:"POST",body:JSON.stringify({teacher:t.value,message:m})});add("bot",(await r.json()).reply)}
 catch(e){add("bot","Backend abhi connected nahi hai. Netlify function /.netlify/functions/chat banao.")}}
