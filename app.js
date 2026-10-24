
const navItems=[['index.html','Home'],['ai-chat.html','AI Chat'],['teachers.html','AI Teachers'],['homework.html','Homework'],['language.html','Language'],['exam-coach.html','Exam Coach']];
const current=location.pathname.split('/').pop()||'index.html';
const links=navItems.map(([href,label])=>`<a href="${href}" class="${current===href?'active':''}">${label}</a>`).join('');
document.querySelectorAll('[data-navlinks]').forEach(el=>el.innerHTML=links);
document.querySelectorAll('[data-mobile-links]').forEach(el=>el.innerHTML=links);
document.querySelectorAll('[data-menu-toggle]').forEach(btn=>btn.addEventListener('click',()=>document.querySelector('[data-mobile-links]').classList.toggle('open')));
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
function toast(msg){const t=document.querySelector('.toast');if(!t)return;t.textContent=msg;t.style.display='block';setTimeout(()=>t.style.display='none',2600)}
const langSelect=document.querySelector('#language-select');if(langSelect){const saved=localStorage.getItem('studysaathi-language');if(saved&&[...langSelect.options].some(o=>o.value===saved))langSelect.value=saved;else if(saved&&langSelect.querySelector('option[value="auto"]'))langSelect.value='auto';langSelect.addEventListener('change',()=>{localStorage.setItem('studysaathi-language',langSelect.value);toast('Language preference saved for this device.')})}
const photoInput=document.querySelector('#photo-input'),photoPreview=document.querySelector('#photo-preview'),uploadZone=document.querySelector('#upload-zone');
if(photoInput){uploadZone?.addEventListener('click',()=>photoInput.click());photoInput.addEventListener('change',()=>{const f=photoInput.files?.[0];if(!f)return;if(!f.type.startsWith('image/')){toast('Please choose an image file.');return}photoPreview.src=URL.createObjectURL(f);photoPreview.style.display='block';const label=document.querySelector('#upload-label');if(label)label.textContent=f.name;const ask=document.querySelector('#photo-note');if(ask)ask.style.display='block'})}
const teacherProfiles={maths:{name:'Arjun',subject:'Mathematics',greeting:'Namaste! Main Arjun, tumhara Mathematics teacher hoon. Apna maths question bhejo—hum step by step solve karenge.'},science:{name:'Meera',subject:'Science',greeting:'Hi! Main Meera, tumhari Science teacher hoon. Physics, Chemistry ya Biology ka question poochho.'},english:{name:'Anaya',subject:'English',greeting:'Hello! Main Anaya, tumhari English teacher hoon. Grammar, writing ya literature mein help chahiye?'},social:{name:'Kabir',subject:'Social Science',greeting:'Namaste! Main Kabir, tumhara Social Science teacher hoon. History, Geography ya Civics se shuru karein.'},coding:{name:'Dev',subject:'Coding & Computer Science',greeting:'Hey! Main Dev, tumhara coding teacher hoon. Computer basics ya programming ka question bhejo.'},einstein:{name:'Albert Einstein',subject:'Science & Exam Coaching',greeting:'Hello, young learner! Main Einstein Coach hoon. Science concepts aur exam strategy par saath kaam karte hain.'},hindi:{name:'Kavya',subject:'Hindi',greeting:'Namaste! Main Kavya, tumhari Hindi teacher hoon. Vyakaran, sahitya ya lekhan mein kya seekhna hai?'},commerce:{name:'Riya',subject:'Commerce',greeting:'Namaste! Main Riya, tumhari Commerce guide hoon. Accountancy, Business Studies ya Economics poochho.'}};
const chatParams=new URLSearchParams(location.search);const profile=teacherProfiles[(chatParams.get('teacher')||chatParams.get('subject')||'').toLowerCase()]||null;
if(profile){const head=document.querySelector('.chat-head');if(head){const title=head.querySelector('strong'),subtitle=head.querySelector('small');if(title)title.textContent=`${profile.name} · ${profile.subject}`;if(subtitle)subtitle.textContent=`Your ${profile.subject} AI teacher · Step-by-step help`;}
const area=document.querySelector('#demo-chat-area');if(area){area.innerHTML='';const greet=document.createElement('div');greet.className='bubble';greet.textContent=profile.greeting;area.appendChild(greet);}const subjectSelect=document.querySelector('#subject-select');if(subjectSelect){const target=[...subjectSelect.options].find(o=>o.text.toLowerCase().includes(profile.subject.toLowerCase())||profile.subject.toLowerCase().includes(o.text.toLowerCase()));if(target)subjectSelect.value=target.value;}}
// Browser text-to-speech for assistant replies. Works in browsers that support Web Speech API.
function speechLanguage(){
  const lang=(localStorage.getItem('studysaathi-language')||document.querySelector('#language-select')?.value||'English').toLowerCase();
  const map={hindi:'hi-IN',gujarati:'gu-IN',bengali:'bn-IN',marathi:'mr-IN',tamil:'ta-IN',telugu:'te-IN',urdu:'ur-IN',punjabi:'pa-IN',kannada:'kn-IN',malayalam:'ml-IN',odia:'or-IN',english:'en-IN',auto:'en-IN'};
  return map[lang]||'en-IN';
}
function speakStudySaathi(text){
  if(!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)){toast('Voice playback is not supported in this browser.');return;}
  window.speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(String(text||''));
  utterance.lang=speechLanguage(); utterance.rate=0.92; utterance.pitch=1;
  const voices=window.speechSynthesis.getVoices();
  const base=utterance.lang.toLowerCase().split('-')[0];
  const matching=voices.find(v=>v.lang.toLowerCase()===utterance.lang.toLowerCase())||voices.find(v=>v.lang.toLowerCase().startsWith(base+'-'));
  if(matching)utterance.voice=matching;
  window.speechSynthesis.speak(utterance);
}
function addSpeakButton(bubble,spokenText){
  const btn=document.createElement('button');btn.type='button';btn.className='btn btn-secondary';btn.textContent='🔊 Listen';btn.style.cssText='margin-top:8px;padding:7px 12px;font-size:12px;';
  btn.addEventListener('click',()=>speakStudySaathi(spokenText ?? bubble.textContent ?? ''));bubble.appendChild(document.createElement('br'));bubble.appendChild(btn);
}
document.querySelectorAll('[data-demo-chat]').forEach(form=>form.addEventListener('submit',async e=>{
  e.preventDefault();
  const input=form.querySelector('input'),area=document.querySelector('#demo-chat-area'),send=form.querySelector('button[type=submit]');
  const question=input?.value.trim(); if(!question||!area)return;
  const userBubble=document.createElement('div');userBubble.className='bubble user';userBubble.textContent=question;area.appendChild(userBubble);input.value='';
  const reply=document.createElement('div');reply.className='bubble';reply.style.marginTop='14px';reply.textContent='Thinking…';area.appendChild(reply);area.scrollTop=area.scrollHeight;
  if(send){send.disabled=true;send.textContent='Thinking…';}
  const classValue=document.querySelector('#class-select')?.value||'Not specified';
  const streamValue=document.querySelector('#stream-select')?.value||'Not specified';
  const subjectValue=document.querySelector('#subject-select')?.value||profile?.subject||'General study help';
  const selectedLanguage=document.querySelector('#language-select')?.value;
  const languageValue=(selectedLanguage&&selectedLanguage!=='auto')?selectedLanguage:(localStorage.getItem('studysaathi-language')||'Auto detect');
  try{
    const response=await fetch('/.netlify/functions/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,teacher:profile?profile.name:'StudySaathi AI',subject:profile?profile.subject:subjectValue,studentClass:classValue,stream:streamValue,language:languageValue})});
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||'AI request failed.');
    reply.textContent=(profile?profile.name+' · '+profile.subject+'\n':'')+data.answer;
    addSpeakButton(reply,data.answer);speakStudySaathi(data.answer);
  }catch(err){reply.textContent=err.message||'AI service could not connect. Please try again.';const hint=document.createElement('div');hint.style.cssText='font-size:12px;margin-top:8px;opacity:.85';hint.textContent='If this is your first setup, add GEMINI_API_KEY in Netlify environment variables and redeploy.';reply.appendChild(hint);}
  finally{if(send){send.disabled=false;send.textContent='Send ↑';}area.scrollTop=area.scrollHeight;}
}));
// Add listen controls to any existing assistant greeting bubbles too.
document.querySelectorAll('#demo-chat-area .bubble:not(.user)').forEach(b=>{if(!b.querySelector('button'))addSpeakButton(b,b.textContent||'')});
document.querySelectorAll('[data-language]').forEach(btn=>{if(btn.dataset.language===localStorage.getItem('studysaathi-language'))btn.classList.add('selected');btn.addEventListener('click',()=>{document.querySelectorAll('[data-language]').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');localStorage.setItem('studysaathi-language',btn.dataset.language);toast(`${btn.dataset.language} selected.`)})});


// Teacher availability is evaluated in India Standard Time, not the device timezone.
function getIndiaMinutes(){
  const parts = new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
  const h = Number(parts.find(p=>p.type==='hour')?.value || 0);
  const m = Number(parts.find(p=>p.type==='minute')?.value || 0);
  return h*60+m;
}

if(profile){
  const key=(chatParams.get('teacher')||chatParams.get('subject')||'').toLowerCase();
  const hours=key==='einstein'?[7,22]:[12,20];
  const mins=getIndiaMinutes();
  const available=mins>=hours[0]*60&&mins<hours[1]*60;
  if(!available){
    const form=document.querySelector('[data-demo-chat]'),input=form?.querySelector('input'),send=form?.querySelector('button[type=submit]');
    if(form){form.hidden=true;}
    const area=document.querySelector('#demo-chat-area');
    if(area){area.innerHTML='';const msg=document.createElement('div');msg.className='bubble';msg.textContent=`${profile.name} is offline right now. Please return during ${hours[0]===7?'7 AM–10 PM':'12 PM–8 PM'} India time.`;area.appendChild(msg);}
    const head=document.querySelector('.chat-head small');if(head)head.textContent='Teacher currently offline';
  }
}

function updateTeacherAvailability(){
  const mins=getIndiaMinutes();
  document.querySelectorAll('.teacher').forEach(card=>{
    const status=card.querySelector('.availability');
    const link=card.querySelector('a.btn');
    const hours=(card.dataset.hours||'12-20').split('-').map(Number);
    const start=hours[0]*60, end=hours[1]*60;
    const active=mins>=start && mins<end;
    const startLabel=hours[0]>=12?(hours[0]===12?'12 PM':(hours[0]-12)+' PM'):(hours[0]===0?'12 AM':hours[0]+' AM');
    const endLabel=hours[1]>=12?(hours[1]===12?'12 PM':(hours[1]-12)+' PM'):(hours[1]===0?'12 AM':hours[1]+' AM');
    if(status){status.classList.toggle('off',!active);status.textContent=active?`Active now · until ${endLabel} IST`:`Offline · active ${startLabel}–${endLabel} IST`;}
    if(link){if(!link.dataset.originalLabel)link.dataset.originalLabel=link.textContent;link.style.opacity=active?'1':'.55';link.style.pointerEvents=active?'auto':'none';link.setAttribute('aria-disabled',String(!active));link.title=active?'Teacher is available now':`Teacher is offline. Available ${startLabel}–${endLabel} IST`;link.textContent=active?link.dataset.originalLabel:'Offline right now';}
  });
}
updateTeacherAvailability();
setInterval(updateTeacherAvailability,30000);

// Class 11–12 stream selection
(()=>{const cls=document.querySelector('#class-select'),row=document.querySelector('#stream-row'),stream=document.querySelector('#stream-select'),subject=document.querySelector('#subject-select');if(!cls||!row||!stream)return;const update=()=>{const senior=['Class 11','Class 12'].includes(cls.value);row.hidden=!senior;if(!senior)stream.value='';if(subject&&senior&&stream.value==='Commerce'){subject.innerHTML='<option>Accountancy</option><option>Business Studies</option><option>Economics</option><option>English</option><option>Mathematics</option><option>Informatics Practices</option>';}else if(subject&&senior&&stream.value==='Science'){subject.innerHTML='<option>Physics</option><option>Chemistry</option><option>Biology</option><option>Mathematics</option><option>Computer Science</option><option>English</option>';}else if(subject&&(!senior||!stream.value)){subject.innerHTML='<option>Mathematics</option><option>Science</option><option>English</option><option>Social Science</option><option>Computer Science</option><option>General Knowledge</option>';}};cls.addEventListener('change',update);stream.addEventListener('change',update);const params=new URLSearchParams(location.search);if(params.has('class')){cls.value='Class '+params.get('class');update();if(params.has('stream')){stream.value=params.get('stream');update();}}})();
