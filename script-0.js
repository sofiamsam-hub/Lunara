
const defaults=[['Lavar a loiça','medium'],['Arrumar a cozinha','medium'],['Limpar um quarto','large'],['Tratar da roupa','medium'],['Arrumar uma superfície','small'],['Recolher objetos espalhados','small']];const key='lunara_v1';let state;try{state=JSON.parse(localStorage.getItem(key))}catch{};if(!state||!Array.isArray(state.tasks))state={xp:0,coins:0,tasks:defaults.map((a,i)=>({id:i+1,name:a[0],size:a[1],done:false,date:''})),entries:[],moods:[],rest:0,pet:0};state.entries??=[];state.moods??=[];state.rest??=0;state.pet??=0;state.decor??=[];state.pats??=0;let selectedMood='',breathInterval=null;const today=()=>new Date().toLocaleDateString('sv-SE');const dateLabel=()=>new Date().toLocaleDateString('pt-PT',{day:'numeric',month:'short'});const rewards={small:[20,10],medium:[45,20],large:[75,35]};function save(){try{localStorage.setItem(key,JSON.stringify(state))}catch{alert('Não foi possível guardar os dados neste navegador.')}render()}function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function render(){document.getElementById('day').textContent=dateLabel();const level=Math.floor(state.xp/150)+1;document.getElementById('levelTitle').textContent=`Nível ${level} · ${level<3?'Panda aprendiz':level<7?'Guardião lunar':'Mestre do luar'}`;document.getElementById('xpbar').style.width=(state.xp%150)/150*100+'%';document.getElementById('xptext').textContent=`${state.xp%150} / 150 XP para o próximo nível`;document.getElementById('coins').textContent=state.coins;document.getElementById('xp').textContent=state.xp;document.getElementById('completed').textContent=state.tasks.filter(t=>t.done&&t.date===today()).length;renderTasks();renderSanctuary();document.getElementById('entries').innerHTML=state.entries.slice().reverse().slice(0,30).map(e=>`<div class="card"><div class="sub">${esc(e.date)}</div><p>${esc(e.text)}</p></div>`).join('')||'<p>Ainda não há registos.</p>'}function renderTasks(){const low=document.getElementById('energy').value==='low';document.getElementById('tasks').innerHTML=state.tasks.filter(t=>!low||t.size==='small').map(t=>{const [xp,coins]=rewards[t.size];return `<div class="card task ${t.done?'done':''}"><div><strong>${esc(t.name)}</strong><small>${xp} XP · ${coins} 🪙 · ${t.size==='small'?'pequena':t.size==='medium'?'média':'grande'}</small></div><button ${t.done?'disabled':''} onclick="complete(${t.id})">${t.done?'Feita ✓':'Concluir'}</button></div>`}).join('')||'<p>Não há tarefas deste tamanho. Podes criar uma missão pequena.</p>'}function complete(id){let t=state.tasks.find(t=>t.id===id);if(!t||t.done)return;t.done=true;t.date=today();state.xp+=rewards[t.size][0];state.coins+=rewards[t.size][1];save()}function addTask(){const input=document.getElementById('newTask');const name=input.value.trim();if(!name)return;state.tasks.push({id:Date.now(),name,size:document.getElementById('newSize').value,done:false,date:''});input.value='';save()}function resetTasks(){if(!confirm('Voltar a disponibilizar todas as missões? Os pontos ganhos mantêm-se.'))return;state.tasks.forEach(t=>{t.done=false;t.date='' });save()}function pet(kind){let cost=kind==='feed'?15:10;if(state.coins<cost){document.getElementById('petMsg').textContent='Ainda não tens moedas suficientes. Faz uma missão quando tiveres energia.';return}state.coins-=cost;state.pet++;document.getElementById('petMsg').textContent=kind==='feed'?'O panda adorou o bambu! 🥬':'O panda brincou contigo! 🎋';save()}function tab(name){['home','missions','refuge','diary','agenda','companion'].forEach(x=>document.getElementById(x).classList.toggle('hidden',x!==name));document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));window.scrollTo(0,0)}const advice={Calma:'Aproveita este momento. Podes escolher uma missão ou simplesmente desfrutar da tranquilidade.',Raiva:'Afasta-te por um instante do que te está a irritar, se for possível. Repara nos pés no chão e relaxa os ombros antes de decidires o próximo passo.',Cansaço:'Reduz a exigência. Experimenta uma missão pequena ou faz uma pausa. Não precisas de completar tudo hoje.',Ansiedade:'Olha à tua volta e nomeia objetos concretos. Regressa ao presente e escolhe apenas o próximo passo.'};function chooseMood(m,el){selectedMood=m;document.getElementById('moodAdvice').textContent=advice[m];document.querySelectorAll('#moods button').forEach(b=>b.classList.remove('active'));el.classList.add('active')}function saveMood(){if(!selectedMood){alert('Escolhe primeiro como te sentes.');return}state.moods.push({date:new Date().toLocaleString('pt-PT'),mood:selectedMood,intensity:Number(document.getElementById('intensity').value)});state.entries.push({date:new Date().toLocaleString('pt-PT'),text:'Estado emocional: '+selectedMood+' ('+document.getElementById('intensity').value+'/10)'});save();alert('Estado emocional guardado.')}function addEntry(){const input=document.getElementById('entry'),value=input.value.trim();if(!value)return;state.entries.push({date:new Date().toLocaleString('pt-PT'),text:value});input.value='';save()}function rest(){state.rest++;document.getElementById('restMsg').textContent='Pausa registada. Descansar é válido.';save()}function stopBreath(){if(breathInterval)clearInterval(breathInterval);breathInterval=null;document.getElementById('breath').textContent='Pronta?';document.getElementById('breathOrb')?.classList.remove('inhale','exhale');document.getElementById('breathInfo').textContent='Sessão de 1 minuto'}function startBreath(){stopBreath();let elapsed=0;const update=()=>{const phase=elapsed%10;document.getElementById('breath').textContent=phase<4?'Inspira':'Expira';const orb=document.getElementById('breathOrb');if(orb){orb.classList.toggle('inhale',phase<4);orb.classList.toggle('exhale',phase>=4)}document.getElementById('breathInfo').textContent=`${60-elapsed}s restantes`;if(elapsed>=60){stopBreath();document.getElementById('breath').textContent='Concluído 🌙';return}elapsed++};update();breathInterval=setInterval(update,1000)}function exportData(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='lunara-dados.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}function patPanda(){state.pats++;document.getElementById('pandaAction').textContent=['O panda está feliz com a tua companhia 💜','Uma festinha para ti também ✨','O panda ronrona baixinho 🌙'][state.pats%3];save()}const decorItems={lantern:{cost:40,emoji:'🏮'},bamboo:{cost:60,emoji:'🎋'},stars:{cost:80,emoji:'⭐'}};function renderSanctuary(){document.getElementById('sanctuary').textContent='🌙 🏡 '+state.decor.map(x=>decorItems[x]?.emoji||'').join(' ');document.querySelectorAll('[onclick^="buy("]').forEach(b=>{const k=b.getAttribute('onclick').match(/'([^']+)'/)?.[1];b.disabled=state.decor.includes(k)})}function buy(item){const d=decorItems[item];if(!d||state.decor.includes(item))return;if(state.coins<d.cost){document.getElementById('shopMsg').textContent='Precisas de mais moedas. Não há pressa.';return}state.coins-=d.cost;state.decor.push(item);document.getElementById('shopMsg').textContent='Decoração desbloqueada!';save()}let focusInterval=null,focusRemaining=600;function focusDisplay(){document.getElementById('focusClock').textContent=String(Math.floor(focusRemaining/60)).padStart(2,'0')+':'+String(focusRemaining%60).padStart(2,'0')}function focusStop(){if(focusInterval)clearInterval(focusInterval);focusInterval=null}function focusReset(){focusStop();focusRemaining=600;focusDisplay()}function focusStart(){if(focusInterval)return;focusInterval=setInterval(()=>{focusRemaining=Math.max(0,focusRemaining-1);focusDisplay();if(focusRemaining===0){focusStop();alert('Dez minutos concluídos. Podes descansar ou escolher outra missão.')}},1000)}async function importData(el){const f=el.files?.[0];if(!f)return;try{const data=JSON.parse(await f.text());if(!data||!Array.isArray(data.tasks)||!Array.isArray(data.entries)||!Number.isFinite(data.xp)||!Number.isFinite(data.coins))throw Error('Ficheiro inválido');if(!confirm('Substituir o progresso atual pelo da cópia?'))return;state={...data,decor:Array.isArray(data.decor)?data.decor:[],pats:data.pats||0};save();alert('Cópia restaurada.')}catch(e){alert('Não foi possível restaurar este ficheiro.')}finally{el.value=''}}
const modes={normal:'Escolhe uma prioridade realista. Não tens de fazer tudo.',post:'Depois de um turno, prioriza hidratação, alimentação e sono. Evita transformar o descanso numa obrigação.',family:'Escolhe uma tarefa tua e, se fizer sentido, uma tarefa curta para fazer com os miúdos, adequada à idade.',study:'Experimenta um bloco curto de trabalho académico e uma pausa. A qualidade conta mais do que a duração.',free:'Podes dedicar tempo a uma tarefa maior, mas reserva espaço para lazer e recuperação.'};
const presets={normal:[['Lavar a loiça por 10 minutos','small'],['Recolher roupa espalhada','small'],['Preparar a mochila para amanhã','small']],post:[['Beber água e preparar algo para comer','small'],['Preparar um ambiente favorável ao sono','small'],['Arrumar apenas uma superfície, se tiver energia','small']],family:[['Preparar mochilas e roupa dos miúdos','small'],['Arrumar brinquedos em conjunto, 5 minutos','small'],['Organizar a rotina de amanhã','small']],study:[['Ler um artigo do mestrado durante 15 minutos','medium'],['Escrever um parágrafo do relatório','small'],['Organizar referências bibliográficas','small']],free:[['Tratar de uma máquina de roupa','medium'],['Limpar uma divisão por etapas','large'],['Organizar um armário durante 15 minutos','medium']]};
state.lifeMode??='normal';state.suggestedDone??={};
function setLifeMode(m){if(!modes[m])return;state.lifeMode=m;save()}
function renderMode(){const m=modes[state.lifeMode]?state.lifeMode:'normal';document.getElementById('lifeMode').value=m;document.getElementById('modeAdvice').textContent=modes[m];document.getElementById('dailyMessage').textContent=modes[m];const keyDay=today();document.getElementById('suggestedTasks').innerHTML=presets[m].map(([name,size],i)=>{const k=keyDay+'_'+m+'_'+i,done=!!state.suggestedDone[k];return `<div class="task" style="padding:12px 0;border-bottom:1px solid #49355c"><div><strong>${esc(name)}</strong><small>${rewards[size][0]} XP · ${rewards[size][1]} 🪙</small></div><button ${done?'disabled':''} onclick="completeSuggested('${m}',${i})">${done?'Feita ✓':'Concluir'}</button></div>`}).join('')}
function completeSuggested(m,i){if(!presets[m]?.[i])return;const k=today()+'_'+m+'_'+i;if(state.suggestedDone[k])return;state.suggestedDone[k]=true;const size=presets[m][i][1];state.xp+=rewards[size][0];state.coins+=rewards[size][1];save()}
function saveReflection(){const trigger=document.getElementById('trigger').value,need=document.getElementById('need').value;state.entries.push({date:new Date().toLocaleString('pt-PT'),text:'Reflexão — fator: '+(trigger||'não indicado')+'; necessidade: '+need+'.'});save()}
const originalRender=render;render=function(){originalRender();renderMode();renderEvents()};

// v4: guided self-reflection, deliberately rule-based (not a simulated therapist).
const guideSteps=[
 {q:'O que está mais presente neste momento?',options:['Cansaço','Frustração','Tristeza','Sobrecarga','Raiva','Ansiedade','Não sei bem']},
 {q:'O que parece ter contribuído mais?',options:['Turnos ou sono','Casa e tarefas','Responsabilidades familiares','Mestrado ou formação','Relações ou conflito','Várias coisas ao mesmo tempo','Não sei']},
 {q:'Como notas isso em ti?',options:['Corpo cansado ou tenso','Pensamentos acelerados','Vontade de chorar','Irritabilidade','Dificuldade em concentrar-me','Outra coisa']},
 {q:'O que sentes que mais precisas agora?',options:['Descanso ou sono','Ajuda prática','Espaço e tranquilidade','Ser ouvida','Organizar prioridades','Movimento ou ar livre','Ainda não sei']},
 {q:'Qual seria um primeiro passo possível, sem te exigires demasiado?',options:['Pausar cinco minutos','Beber água ou comer','Pedir ajuda a alguém','Fazer só uma tarefa pequena','Escrever o que sinto','Descansar sem tarefas','Não quero decidir já']}
];
let guideIndex=0,guideAnswers=[],guideChoice='';
function guideRender(){const st=guideSteps[guideIndex];document.getElementById('guideQuestion').textContent=st.q;document.getElementById('guideProgress').textContent='Pergunta '+(guideIndex+1)+' de '+guideSteps.length;document.getElementById('guideFree').value='';guideChoice='';document.getElementById('guideChoices').innerHTML=st.options.map((o,i)=>'<button class="secondary choice" onclick="guidePick('+i+')">'+esc(o)+'</button>').join('');document.getElementById('guideResult').classList.add('hidden');document.getElementById('guideNextBtn').textContent=guideIndex===guideSteps.length-1?'Ver reflexão':'Continuar'}
function guidePick(i){guideChoice=guideSteps[guideIndex].options[i];document.querySelectorAll('#guideChoices button').forEach((b,n)=>b.classList.toggle('selected',n===i))}
function guideNext(){const free=document.getElementById('guideFree').value.trim();if(!guideChoice&&!free){alert('Escolhe uma resposta ou escreve pelas tuas palavras.');return}guideAnswers[guideIndex]={answer:guideChoice||'Resposta livre',note:free};if(guideIndex<guideSteps.length-1){guideIndex++;guideRender()}else guideFinish()}
function guideFinish(){document.getElementById('guideQuestion').textContent='Obrigado por partilhares. O que descreveste merece atenção.';document.getElementById('guideChoices').innerHTML='';document.getElementById('guideProgress').textContent='Reflexão concluída';document.getElementById('guideNextBtn').disabled=true;document.getElementById('guideFree').style.display='none';const labels=['Emoção','Contexto','Sinais','Necessidade','Primeiro passo'];document.getElementById('guideSummary').innerHTML=guideAnswers.map((a,i)=>'<p><strong>'+labels[i]+':</strong> '+esc(a.answer)+(a.note?' — '+esc(a.note):'')+'</p>').join('')+'<p>Estas respostas são hipóteses para explorares, não conclusões sobre ti.</p>';document.getElementById('guideResult').classList.remove('hidden')}
function guideRestart(){guideIndex=0;guideAnswers=[];document.getElementById('guideNextBtn').disabled=false;document.getElementById('guideFree').style.display='block';guideRender()}
function guideSave(){if(guideAnswers.length!==guideSteps.length)return;const labels=['Emoção','Contexto','Sinais','Necessidade','Primeiro passo'];state.entries.push({date:new Date().toLocaleString('pt-PT'),text:'Reflexão guiada — '+guideAnswers.map((a,i)=>labels[i]+': '+a.answer+(a.note?' ('+a.note+')':'')).join('; ')});save();alert('Reflexão guardada no diário deste dispositivo.')}
// Calendar events are local-only. End before start means overnight shift.
if(!Array.isArray(state.events))state.events=[];
function parseLocal(date,time){return new Date(date+'T'+time+':00')}
function eventBounds(e){const a=parseLocal(e.date,e.start),b=parseLocal(e.date,e.end);if(b<=a)b.setDate(b.getDate()+1);return [a,b]}
function addEvent(){const date=document.getElementById('eventDate').value,start=document.getElementById('eventStart').value,end=document.getElementById('eventEnd').value,type=document.getElementById('eventType').value,name=document.getElementById('eventName').value.trim()||type;if(!date||!start||!end||start===end){alert('Indica data e horas válidas.');return}state.events.push({id:Date.now()+Math.random(),date,start,end,type,name});document.getElementById('eventName').value='';save()}
function removeEvent(id){if(!confirm('Apagar este compromisso?'))return;state.events=state.events.filter(e=>String(e.id)!==String(id));save()}
function renderEvents(){if(!Array.isArray(state.events))state.events=[];const list=state.events.slice().sort((a,b)=>eventBounds(a)[0]-eventBounds(b)[0]);const now=new Date(),upcoming=list.filter(e=>eventBounds(e)[1]>=now).slice(0,30);document.getElementById('eventsList').innerHTML=upcoming.map(e=>'<div class="schedule-item"><div><strong>'+esc(e.name)+'</strong><div class="mini">'+esc(e.date)+' · '+esc(e.start)+'–'+esc(e.end)+' · '+esc(e.type)+'</div></div><button class="secondary" onclick="removeEvent('+JSON.stringify(String(e.id))+')">×</button></div>').join('')||'<p class="mini">Ainda não há compromissos futuros.</p>';let conflicts=[];for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){const [a,b]=eventBounds(list[i]),[c,d]=eventBounds(list[j]);if(a<d&&c<b)conflicts.push(list[i].date+': '+list[i].name+' / '+list[j].name)}document.getElementById('agendaAdvice').textContent=conflicts.length?'⚠️ Sobreposições a confirmar: '+conflicts.slice(0,3).join(' · '):'Sem sobreposições identificadas nos compromissos registados.';const todayEvents=list.filter(e=>e.date===today());if(todayEvents.length){const mode=todayEvents.some(e=>e.type==='enfermagem'&&e.start>='20:00')?'post':todayEvents.some(e=>e.type==='formacao'||e.type==='mestrado')?'study':'normal';document.getElementById('dailyMessage').textContent='Hoje tens '+todayEvents.length+' compromisso(s). '+modes[mode]}}
function icsStamp(d){return d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')+'T'+String(d.getHours()).padStart(2,'0')+String(d.getMinutes()).padStart(2,'0')+'00'}
function icsEscape(s){return String(s).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;')}
function exportICS(){if(!state.events.length){alert('Ainda não há eventos.');return}let lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Lunara//Agenda Pessoal//PT','CALSCALE:GREGORIAN'];state.events.forEach((e,i)=>{const [a,b]=eventBounds(e);lines.push('BEGIN:VEVENT','UID:lunara-'+i+'-'+e.date+'@local','DTSTART:'+icsStamp(a),'DTEND:'+icsStamp(b),'SUMMARY:'+icsEscape(e.name),'DESCRIPTION:'+icsEscape(e.type),'END:VEVENT')});lines.push('END:VCALENDAR');const blob=new Blob([lines.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='lunara-agenda.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)}
function parseICSDate(s){const m=s.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);return m?{date:m[1]+'-'+m[2]+'-'+m[3],time:m[4]+':'+m[5]}:null}
async function importICS(el){const f=el.files?.[0];if(!f)return;try{const txt=(await f.text()).replace(/\r\n[ \t]/g,'');let blocks=txt.split('BEGIN:VEVENT').slice(1),items=[];for(const block of blocks){const lines=block.split(/\r?\n/);const get=k=>{const line=lines.find(x=>x.split(':')[0].split(';')[0]===k);return line?line.substring(line.indexOf(':')+1):''};const a=parseICSDate(get('DTSTART')),b=parseICSDate(get('DTEND'));if(!a||!b)continue;const name=get('SUMMARY').replace(/\\([,;n\\])/g,(_,c)=>c==='n'?'\n':c);items.push({id:Date.now()+Math.random(),date:a.date,start:a.time,end:b.time,type:'outro',name:name.slice(0,100)||'Compromisso'})}if(!items.length)throw Error('Não foram encontrados eventos compatíveis. Eventos com fuso horário ou dia inteiro podem necessitar de revisão.');if(!confirm('Importar '+items.length+' eventos? Confirma as datas e horas após a importação.'))return;state.events.push(...items);save();document.getElementById('icsMessage').textContent=items.length+' eventos importados. Confirma os horários, sobretudo os turnos noturnos e os eventos com fuso horário.'}catch(e){document.getElementById('icsMessage').textContent='Não foi possível importar: '+e.message}finally{el.value=''}}
// Keep imported legacy data compatible with v4.
const oldImportData=importData;importData=async function(el){await oldImportData(el);if(!Array.isArray(state.events))state.events=[];renderEvents()};
document.getElementById('eventDate').value=today();guideRender();

render();if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});

function sceneMarkup(){const d=state.decor||[];const stars=Array.from({length:21},(_,i)=>{const x=(i*79+29)%520,y=(i*47+18)%122,r=i%5===0?2.1:1.1;return `<circle class="spark" cx="${x}" cy="${y}" r="${r}" fill="#f8e8ff" opacity=".65"/>`}).join('');return `<svg viewBox="0 0 520 230" role="img" aria-label="Santuário noturno com lua, colinas e jardim encantado"><defs><linearGradient id="sky5" x2="0" y2="1"><stop stop-color="#27163d"/><stop offset="1" stop-color="#755185"/></linearGradient><linearGradient id="hill5" x2="0" y2="1"><stop stop-color="#3e315a"/><stop offset="1" stop-color="#1d2437"/></linearGradient><radialGradient id="moonGlow5"><stop stop-color="#ead5ff" stop-opacity=".6"/><stop offset="1" stop-color="#ead5ff" stop-opacity="0"/></radialGradient></defs><rect width="520" height="230" fill="url(#sky5)"/><circle cx="400" cy="55" r="71" fill="url(#moonGlow5)"/><circle cx="400" cy="55" r="26" fill="#f7e9ff"/>${stars}<path d="M0 156 Q100 70 214 150 Q343 82 520 154 V230 H0Z" fill="#45365c"/><path d="M0 184 Q133 124 260 185 Q380 119 520 174 V230 H0Z" fill="url(#hill5)"/><path d="M0 216 Q160 165 310 210 Q450 167 520 208 V230 H0Z" fill="#152a2d"/><path d="M201 175 L260 127 L319 175 Z" fill="#1e162e" stroke="#ae85d6" stroke-width="3"/><rect x="215" y="174" width="91" height="51" rx="3" fill="#2b1c36" stroke="#9c78bb" stroke-width="2"/><rect x="251" y="190" width="18" height="35" rx="8" fill="#1a1423"/><rect x="226" y="185" width="17" height="16" rx="3" fill="#f7d69b"/><rect x="277" y="185" width="17" height="16" rx="3" fill="#f7d69b"/>${d.includes('lantern')?'<path d="M112 155V205" stroke="#bb91c9" stroke-width="3"/><rect x="101" y="161" width="22" height="29" rx="6" fill="#f9ce81" stroke="#c18ae9" stroke-width="3"/><circle cx="112" cy="176" r="28" fill="#f6b76b" opacity=".13"/>':''}${d.includes('bamboo')?'<path d="M386 220V141 M400 220V150 M414 220V132" stroke="#6cae8b" stroke-width="7"/><path d="M386 165q-35-25-38-3 M400 178q35-31 41-13 M414 155q-31-22-35-7" stroke="#79c8a0" stroke-width="9" fill="none"/>':''}${d.includes('stars')?'<path d="M80 46l5 12 12 5-12 5-5 12-5-12-12-5 12-5z M150 70l4 9 9 4-9 4-4 9-4-9-9-4 9-4z" fill="#f9e1a6"/>':''}</svg>`}
function renderVisuals(){
 const sc=document.getElementById('sanctuary');if(sc)sc.innerHTML=sceneMarkup();
 const wc=document.getElementById('weeklyChart');
 if(wc){
  const days=Array.from({length:7},(_,i)=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-6+i);return {date:d.toLocaleDateString('sv-SE'),label:d.toLocaleDateString('pt-PT',{weekday:'short'}).replace('.','').slice(0,3)}});
  const vals=days.map(d=>(state.tasks||[]).filter(t=>t.done&&t.date===d.date).length+Object.keys(state.suggestedDone||{}).filter(k=>k.startsWith(d.date+'_')&&state.suggestedDone[k]).length);
  const total=vals.reduce((a,b)=>a+b,0),max=Math.max(3,...vals),step=Math.max(1,Math.ceil(max/4));
  const cap=Math.ceil(max/step)*step;
  const w=500,h=226,left=38,right=14,top=24,bottom=40,base=h-bottom,plotH=base-top,cell=(w-left-right)/7;
  const grid=Array.from({length:5},(_,i)=>{const value=cap*i/4,y=base-plotH*i/4;return `<line x1="${left}" y1="${y}" x2="${w-right}" y2="${y}" stroke="#ffffff17" stroke-dasharray="${i===0?'0':'3 7'}"/><text x="${left-12}" y="${y+4}" fill="#b7a8c7" font-size="11" text-anchor="end">${Number.isInteger(value)?value:value.toFixed(1)}</text>`}).join('');
  const bars=vals.map((v,i)=>{const x=left+cell*i+cell*.2,bw=cell*.6,bh=plotH*v/cap,y=base-bh;return `<rect x="${x}" y="${top}" width="${bw}" height="${plotH}" rx="9" fill="#ffffff08"/><rect x="${x}" y="${y}" width="${bw}" height="${Math.max(0,bh)}" rx="${Math.min(9,bh/2)}" fill="url(#bar${i===6?'Today':'Other'})"><title>${days[i].label}: ${v} missões</title></rect>${v?`<text x="${x+bw/2}" y="${Math.max(15,y-8)}" fill="#f8edff" font-size="13" font-weight="700" text-anchor="middle">${v}</text>`:''}<text x="${x+bw/2}" y="${base+23}" fill="${i===6?'#f0d5ff':'#b8a8c9'}" font-size="12" text-anchor="middle" font-weight="${i===6?'700':'400'}">${days[i].label}</text>`}).join('');
  wc.innerHTML=`<div class="chart-summary"><div><strong>${total}</strong><span>missões em 7 dias</span></div><div><strong>${vals.filter(Boolean).length}/7</strong><span>dias com atividade</span></div></div><svg class="chart-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="Gráfico de barras: ${total} missões concluídas nos últimos sete dias"><defs><linearGradient id="barToday" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#9161e8"/><stop offset="1" stop-color="#e9c4ff"/></linearGradient><linearGradient id="barOther" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#58458b"/><stop offset="1" stop-color="#ae8ce7"/></linearGradient></defs>${grid}${bars}</svg><p class="mini">Cada barra corresponde às missões registadas nesse dia. Os dias sem atividade aparecem a zero.</p>`;
 }
 const mc=document.getElementById('moodChart');
 if(mc){
  const items=(state.moods||[]).slice(-14).filter(m=>Number.isFinite(Number(m.intensity)));
  if(!items.length){mc.innerHTML='<div class="chart-empty">Ainda não existem registos emocionais. Quando registares uma emoção, a evolução aparece aqui.</div>'}
  else{
   const left=43,right=20,top=24,base=180,w=500,h=225,plotW=w-left-right,plotH=base-top;
   const pts=items.map((m,i)=>({x:left+(items.length===1?plotW/2:i*plotW/(items.length-1)),y:base-Math.max(0,Math.min(10,Number(m.intensity)))*plotH/10,m}));
   const path=pts.map((p,i)=>(i?'L':'M')+p.x.toFixed(2)+' '+p.y.toFixed(2)).join(' ');
   const area=pts.length>1?`<path d="${path} L${pts.at(-1).x} ${base} L${pts[0].x} ${base}Z" fill="url(#moodArea)"/>`:'';
   const ticks=[0,2,4,6,8,10].map(v=>{const y=base-v*plotH/10;return `<line x1="${left}" y1="${y}" x2="${w-right}" y2="${y}" stroke="#ffffff17" stroke-dasharray="3 6"/><text x="${left-13}" y="${y+4}" fill="#b9abc9" font-size="11" text-anchor="end">${v}</text>`}).join('');
   const circles=pts.map((p,i)=>`<circle cx="${p.x}" cy="${p.y}" r="6" fill="#edcbff" stroke="#7255a7" stroke-width="3"><title>Registo ${i+1}: ${esc(String(p.m.mood||'Emoção'))}, intensidade ${Number(p.m.intensity)}/10</title></circle>`).join('');
   const last=items.at(-1),average=items.reduce((a,m)=>a+Number(m.intensity),0)/items.length;
   mc.innerHTML=`<div class="chart-summary"><div><strong>${Number(last.intensity)}/10</strong><span>último registo</span></div><div><strong>${average.toFixed(1).replace('.',',')}/10</strong><span>média dos registos</span></div></div><svg class="chart-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="Evolução da intensidade emocional dos últimos ${items.length} registos"><defs><linearGradient id="moodArea" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#c69bf9" stop-opacity=".28"/><stop offset="1" stop-color="#c69bf9" stop-opacity="0"/></linearGradient></defs>${ticks}${area}<path d="${path}" fill="none" stroke="#d5a8ff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>${circles}<text x="${w/2}" y="216" fill="#ac9cbd" text-anchor="middle" font-size="11">Registos por ordem cronológica</text></svg><p class="mini">Intensidade não significa gravidade clínica. O gráfico mostra os teus registos, sem fazer diagnósticos.</p>`;
  }
 }
}
const lunaraRenderOriginal=render;render=function(){lunaraRenderOriginal();renderVisuals()};const lunaraSanctuaryOriginal=renderSanctuary;renderSanctuary=function(){lunaraSanctuaryOriginal();const el=document.getElementById('sanctuary');if(el)el.innerHTML=sceneMarkup()};renderVisuals();


// Lunara 6: private, client-side PDF extraction with mandatory human review.
// pdf.js is loaded from a third-party CDN. Files are processed locally, not uploaded.
let pdfCandidates=[];
async function importSchedulePDF(el){
 const f=el.files?.[0]; if(!f)return;
 const status=document.getElementById('pdfMessage'),review=document.getElementById('pdfReview');
 review.innerHTML='';pdfCandidates=[];status.textContent='A analisar o documento no dispositivo…';
 try{
  if(!window.pdfjsLib){
   await new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload=resolve;script.onerror=()=>reject(Error('Não foi possível carregar o leitor de PDF. É necessária ligação à internet.'));
    document.head.appendChild(script);
   });
  }
  window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const pdf=await window.pdfjsLib.getDocument({data:new Uint8Array(await f.arrayBuffer())}).promise;
  let lines=[];
  for(let n=1;n<=Math.min(pdf.numPages,24);n++){
   const content=await (await pdf.getPage(n)).getTextContent();
   const rows=new Map();
   for(const item of content.items){
    const y=Math.round(item.transform[5]/4)*4;
    if(!rows.has(y))rows.set(y,[]);
    rows.get(y).push({x:item.transform[4],t:item.str});
   }
   for(const [y,parts] of rows)lines.push(parts.sort((a,b)=>a.x-b.x).map(x=>x.t).join(' ').trim());
  }
  // Only unambiguous date+time rows are proposed. Grid-based rosters require manual entry.
  const dateRx=/\b(\d{1,2})[\/-](\d{1,2})[\/-](20\d{2})\b/;
  const timeRx=/\b([01]?\d|2[0-3])[:h]([0-5]\d)\s*(?:[-–—]|a|até)\s*([01]?\d|2[0-3])[:h]([0-5]\d)\b/i;
  for(const line of lines){
   const dm=line.match(dateRx),tm=line.match(timeRx);
   if(!dm||!tm)continue;
   const date=dm[3]+'-'+dm[2].padStart(2,'0')+'-'+dm[1].padStart(2,'0');
   if(Number(dm[1])>31||Number(dm[2])>12)continue;
   pdfCandidates.push({date,start:tm[1].padStart(2,'0')+':'+tm[2],end:tm[3].padStart(2,'0')+':'+tm[4],name:line.slice(0,100),type:'outro'});
  }
  pdfCandidates=pdfCandidates.slice(0,80);
  status.textContent=pdfCandidates.length?
   'Foram encontradas '+pdfCandidates.length+' possíveis entradas. Revê cada uma antes de guardar.':
   'O PDF foi lido, mas não foram encontradas linhas com data completa e intervalo horário inequívocos. As escalas em grelha necessitam de confirmação manual; nenhum turno foi inventado.';
  if(pdfCandidates.length){
   review.innerHTML=pdfCandidates.map((c,i)=>'<div class="card"><label><input type="checkbox" id="pdfCheck'+i+'"> Incluir sugestão '+(i+1)+'</label><label>Data<input type="date" id="pdfDate'+i+'" value="'+c.date+'"></label><div class="flex"><div><label>Início<input type="time" id="pdfStart'+i+'" value="'+c.start+'"></label></div><div><label>Fim<input type="time" id="pdfEnd'+i+'" value="'+c.end+'"></label></div></div><label>Descrição<input id="pdfName'+i+'" value="'+esc(c.name)+'" maxlength="100"></label><label>Tipo<select id="pdfType'+i+'"><option value="enfermagem">Enfermagem</option><option value="formacao">Formação</option><option value="mestrado">Mestrado</option><option value="outro" selected>Outro</option></select></label></div>').join('')+
    '<button onclick="confirmPDFEvents()">Guardar apenas os eventos selecionados</button>';
  }
 }catch(e){status.textContent='Erro ao ler PDF: '+e.message+' Podes continuar a introduzir eventos manualmente.'}
 finally{el.value=''}
}
function confirmPDFEvents(){
 const selected=[];
 for(let i=0;i<pdfCandidates.length;i++){
  if(!document.getElementById('pdfCheck'+i)?.checked)continue;
  const date=document.getElementById('pdfDate'+i).value,start=document.getElementById('pdfStart'+i).value,end=document.getElementById('pdfEnd'+i).value;
  if(!date||!start||!end||start===end){alert('Revê a data e as horas da sugestão '+(i+1));return}
  selected.push({id:Date.now()+Math.random()+i,date,start,end,name:document.getElementById('pdfName'+i).value.slice(0,100),type:document.getElementById('pdfType'+i).value});
 }
 if(!selected.length){alert('Seleciona pelo menos um evento.');return}
 if(!confirm('Guardar '+selected.length+' eventos revistos na agenda?'))return;
 state.events??=[];state.events.push(...selected);save();
 document.getElementById('pdfReview').innerHTML='';
 document.getElementById('pdfMessage').textContent=selected.length+' eventos guardados. Confirma possíveis sobreposições na agenda.';
}

// A more responsive guided conversation: one question at a time,
// using the person's own words and offering a choice of needs.
// It remains rule-based, not a clinical assessment or generative AI.
const lunaraGuideOriginal=guideRender;
guideRender=function(){
 lunaraGuideOriginal();
 if(guideIndex===0)return;
 const previous=guideAnswers[guideIndex-1];
 if(!previous)return;
 const prior=(previous.note||previous.answer||'').trim();
 const lead=document.createElement('p');lead.className='mini';
 lead.textContent=guideIndex===1?'Percebo que escolheste partilhar: “'+prior.slice(0,130)+'”. Vamos olhar para o contexto.':
 guideIndex===2?'Obrigado por explicares. Não vou assumir o que isso significa para ti.':
 guideIndex===3?'O que descreves pode apontar para várias necessidades. És tu quem melhor pode reconhecer a tua.':
 'Podemos pensar num passo pequeno, adequado à energia que tens hoje.';
 const q=document.getElementById('guideQuestion');q.parentNode.insertBefore(lead,q);
 const old=q.parentNode.querySelectorAll('.lunara-lead');old.forEach(x=>x.remove());lead.classList.add('lunara-lead');
};
guideRender();


const relaxTechniques=[
{id:'ground',emoji:'🌿',name:'Ancoragem 5–4–3–2–1',duration:'3–5 min',tags:['stress','anger'],intro:'Para regressares ao momento presente quando os pensamentos aceleram.',steps:[
'Encontra uma posição confortável. Mantém os olhos abertos e observa o espaço à tua volta. Não precisas de alterar a respiração.',
'Nomeia cinco coisas que consegues ver. Repara em formas, cores e pequenos detalhes.',
'Identifica quatro sensações de contacto: pés no chão, roupa na pele, apoio da cadeira ou temperatura nas mãos.',
'Escuta três sons, próximos ou distantes. Não precisas de os avaliar.',
'Identifica dois cheiros. Se não encontrares nenhum, recorda dois aromas agradáveis.',
'Repara num sabor presente ou imagina um sabor familiar. Volta a observar o espaço e pergunta: «O que preciso agora?»'
]},
{id:'breath',emoji:'🌙',name:'Respiração tranquila',duration:'2–4 min',tags:['stress','sleep'],intro:'Respiração sem retenções, com expiração ligeiramente mais longa.',steps:[
'Senta-te ou deita-te confortavelmente. Se estiveres com falta de ar, tonturas ou desconforto, não forces o ritmo.',
'Inspira suavemente pelo nariz, se for confortável, contando até quatro. Não precisas de encher totalmente os pulmões.',
'Expira de forma tranquila contando até seis, sem empurrar o ar. Se for difícil, usa um ritmo natural.',
'Repete algumas vezes, observando se os ombros e a mandíbula relaxam. Podes interromper a qualquer momento.',
'Volta à respiração habitual. Nota como te sentes agora, sem exigir que a ansiedade desapareça.'
]},
{id:'muscles',emoji:'🪷',name:'Relaxamento muscular',duration:'6–10 min',tags:['stress','sleep'],intro:'Reconhece a diferença entre tensão e relaxamento, sem provocar dor.',steps:[
'Encontra uma posição apoiada. Não contraias zonas dolorosas, lesionadas ou com limitações físicas.',
'Fecha as mãos suavemente durante cerca de cinco segundos. Solta e observa a diferença durante dez segundos.',
'Eleva ligeiramente os ombros, sem forçar, durante cinco segundos. Solta e deixa-os repousar.',
'Contrai delicadamente as pernas, apenas se for confortável. Solta e sente o apoio do corpo.',
'Relaxar não significa ficar completamente sem tensão. Percorre mentalmente o corpo e deixa cada região encontrar uma posição confortável.',
'Termina mexendo os dedos, abrindo os olhos e regressando devagar à atividade.'
]},
{id:'anger',emoji:'🔥',name:'Pausa para a raiva',duration:'3–7 min',tags:['anger'],intro:'Cria espaço entre a emoção intensa e a resposta.',steps:[
'Se for seguro, afasta-te temporariamente do conflito. Podes dizer: «Preciso de alguns minutos e depois retomamos».',
'Identifica a intensidade da raiva entre zero e dez, sem te censurares.',
'Observa os sinais no corpo: calor, mãos tensas, coração acelerado, vontade de falar alto.',
'Coloca os pés no chão e procura um objeto concreto no espaço. Não precisas de resolver o conflito já.',
'Pergunta: «Que limite, valor ou necessidade sinto que foi ultrapassado?» Evita decidir enquanto a intensidade estiver elevada.',
'Escolhe uma resposta segura: adiar a conversa, estabelecer um limite, pedir ajuda ou escrever o que queres dizer.'
]},
{id:'compassion',emoji:'💜',name:'Autocompaixão',duration:'4–6 min',tags:['tired','stress'],intro:'Um exercício para reconhecer sofrimento sem te tratares com dureza.',steps:[
'Reconhece com palavras simples: «Isto está a ser difícil para mim». Não precisas de minimizar o que sentes.',
'Pergunta se estás a exigir de ti mais do que exigias a alguém de quem gostas.',
'Experimenta uma frase realista: «Posso estar cansada e continuar a merecer cuidado». Se não fizer sentido, escolhe outra.',
'Identifica uma necessidade concreta: alimento, água, silêncio, apoio, descanso ou limites.',
'Escolhe um gesto pequeno que respeite essa necessidade. O objetivo não é ficar imediatamente bem.'
]},
{id:'sleep',emoji:'✨',name:'Desacelerar para dormir',duration:'8–12 min',tags:['sleep','tired'],intro:'Uma transição suave para repousar, útil também após turnos.',steps:[
'Reduz estímulos quando possível: luminosidade, notificações e conversas exigentes. Se trabalhas por turnos, adapta o ambiente à hora em que vais dormir.',
'Escolhe uma posição confortável. Evita olhar repetidamente para as horas.',
'Percorre mentalmente o corpo dos pés à cabeça e repara onde existe apoio.',
'Se surgirem preocupações, reconhece-as e imagina colocá-las numa lista para mais tarde, sem tentares resolvê-las agora.',
'Permite que a respiração siga o seu ritmo natural. Não precisas de adormecer durante o exercício.',
'Se continuares desperta, podes simplesmente descansar. Se a dificuldade de sono for persistente, procura avaliação profissional.'
]},
{id:'safe',emoji:'🏡',name:'Lugar seguro imaginado',duration:'4–7 min',tags:['stress','sleep'],intro:'Visualização opcional de um cenário tranquilo, mantendo ligação ao presente.',steps:[
'Observa primeiro a sala onde estás. Se preferires, mantém os olhos abertos durante todo o exercício.',
'Imagina um lugar em que te sintas confortável: um jardim, praia, floresta ou uma divisão familiar.',
'Acrescenta detalhes sensoriais: luz, temperatura, sons e superfícies.',
'Imagina que podes aproximar-te ou afastar-te desse lugar sempre que quiseres. Tu controlas a experiência.',
'Se as imagens te causarem desconforto, interrompe e nomeia três objetos reais à tua volta.',
'Regressa ao ambiente atual e identifica algo concreto que te ajude a sentir estabilidade.'
]},
{id:'thoughts',emoji:'📖',name:'Desenredar pensamentos',duration:'5–8 min',tags:['stress','anger','tired'],intro:'Distingue factos, interpretações e necessidades, sem negar emoções.',steps:[
'Escreve ou pensa numa situação específica que te está a preocupar.',
'Identifica o pensamento que apareceu: «O que disse a mim própria sobre isto?»',
'Separa o que observaste diretamente da interpretação que fizeste.',
'Pergunta: «Há outra explicação plausível?» Não precisas de acreditar nela imediatamente.',
'Identifica a emoção e a necessidade por trás do pensamento.',
'Escolhe uma ação pequena e possível hoje; ou decide conscientemente não agir já.'
]},
{id:'senses',emoji:'🍃',name:'Micro-pausa sensorial',duration:'1–2 min',tags:['tired','anger','stress'],intro:'Para quando tens pouca energia ou poucos minutos.',steps:[
'Pára apenas se for seguro. Apoia os pés e observa a tua postura.',
'Escolhe uma sensação neutra ou agradável: água nas mãos, uma textura, uma luz ou um som.',
'Durante alguns instantes, dirige a atenção para essa sensação. Se a mente divagar, regressa sem te criticares.',
'Pergunta: «Qual é a próxima coisa realmente necessária?» Podes escolher descansar.'
]}
];
let relaxActive=null,relaxStep=0;
function filterRelax(tag,button){
 document.querySelectorAll('#relaxFilters button').forEach(b=>b.classList.toggle('selected',b===button));
 const items=tag==='all'?relaxTechniques:relaxTechniques.filter(t=>t.tags.includes(tag));
 document.getElementById('relaxLibrary').innerHTML=items.map(t=>`<button class="relax-tile" onclick="openRelax('${t.id}')"><span class="relax-emoji">${t.emoji}</span><strong>${esc(t.name)}</strong><small>${esc(t.duration)} · ${esc(t.intro)}</small></button>`).join('');
}
function openRelax(id){
 relaxActive=relaxTechniques.find(t=>t.id===id);relaxStep=0;
 document.getElementById('relaxPlayer').classList.remove('hidden');showRelaxStep();
 document.getElementById('relaxPlayer').scrollIntoView({behavior:'smooth',block:'nearest'});
}
function showRelaxStep(){
 const el=document.getElementById('relaxPlayer');if(!relaxActive)return;
 const finished=relaxStep>=relaxActive.steps.length;
 el.innerHTML=`<div class="relax-scene relax-scene-${relaxActive.id}" role="img" aria-label="Cenário de fantasia para ${esc(relaxActive.name)}"><div class="relax-mist"></div><div class="relax-spark" aria-hidden="true">✧ ✦ · ✧</div><div class="relax-panda" aria-hidden="true"><img src="panda-guardian.webp" alt=""></div><span class="relax-scene-label">✧ Um momento só teu</span></div><div class="relax-companion"><span class="relax-companion-icon" aria-hidden="true">🐼</span><span>O teu guardião acompanha-te. Podes parar quando quiseres.</span></div><div class="relax-eyebrow">${relaxActive.emoji} ${esc(relaxActive.duration)} · AO TEU RITMO</div><h3>${esc(relaxActive.name)}</h3><p class="step-count">${finished?'Exercício terminado':'Passo '+(relaxStep+1)+' de '+relaxActive.steps.length}</p><div class="relax-track"><div style="width:${100*Math.min(relaxStep+(finished?0:1),relaxActive.steps.length)/relaxActive.steps.length}%"></div></div><p class="step-body">${finished?'Terminaste a sequência. Não precisas de sentir uma mudança imediata. Observa apenas o que precisas agora.':esc(relaxActive.steps[relaxStep])}</p><div class="relax-actions"><button class="secondary" onclick="closeRelax()">Fechar</button>${!finished&&relaxStep>0?'<button class="secondary" onclick="relaxStep--;showRelaxStep()">Anterior</button>':''}${!finished?'<button onclick="relaxStep++;showRelaxStep()">'+(relaxStep===relaxActive.steps.length-1?'Terminar':'Próximo passo')+'</button>':'<button onclick="relaxStep=0;showRelaxStep()">Repetir</button>'}</div><p class="relax-note">Sem pontos, pressão ou obrigação de terminar.</p>`;
}
function closeRelax(){relaxActive=null;document.getElementById('relaxPlayer').classList.add('hidden')}
filterRelax('all',document.querySelector('#relaxFilters button'));

// Emotional support suggestions: transparent rules, no diagnosis or remote AI.
const supportMap={
 anxiety:{title:'Quando há inquietação',intro:'A ansiedade pode ter diferentes causas. Não precisamos de determinar uma causa agora.',tech:['ground','breath','senses']},
 anger:{title:'Quando a frustração aumenta',intro:'A raiva pode sinalizar limites, necessidades ou acontecimentos difíceis, mas não define o que deves fazer.',tech:['anger','ground','thoughts']},
 sad:{title:'Quando estás triste',intro:'Não precisas de transformar a tristeza em produtividade. Podemos começar por reconhecer o que está a custar.',tech:['compassion','safe','senses']},
 tired:{title:'Quando tudo parece demasiado',intro:'A exaustão pode pedir menos exigências, não mais uma tarefa para cumprir.',tech:['senses','compassion','sleep']},
 sleep:{title:'Quando precisas de desacelerar',intro:'O descanso não tem de ser merecido. O objetivo é criar condições mais favoráveis, sem exigir que adormeças.',tech:['sleep','muscles','breath']},
 confused:{title:'Quando os pensamentos se acumulam',intro:'Podemos separar o que aconteceu, o que interpretaste e aquilo de que precisas, sem tirar conclusões precipitadas.',tech:['thoughts','ground','senses']}
};
const needText={
 unsure:'É legítimo ainda não saberes do que precisas. Podes começar por uma pausa e observar.',
 rest:'Talvez possas reduzir uma exigência e reservar um pequeno período de recuperação.',
 safety:'Procura um local ou uma pessoa com quem te sintas segura. Se estiveres em perigo imediato, liga 112.',
 connection:'Podes contactar alguém de confiança e dizer concretamente que precisas de ser ouvida.',
 boundary:'Considera que limite precisas de estabelecer e qual é uma forma segura de o comunicar.',
 clarity:'Tenta identificar apenas uma prioridade e aquilo que pode esperar.',
 action:'Escolhe um passo pequeno, reversível e compatível com a energia disponível.'
};
function suggestSupport(){
 const feeling=document.getElementById('supportFeeling').value;
 const need=document.getElementById('supportNeed').value;
 const selected=supportMap[feeling];
 const box=document.getElementById('supportResult');
 box.classList.remove('hidden');
 const techniques=(selected?.tech||['senses','ground','compassion']).map(id=>relaxTechniques.find(t=>t.id===id)).filter(Boolean);
 box.innerHTML='<h3>'+esc(selected?.title||'Começar sem pressa')+'</h3><p>'+esc(selected?.intro||'Não é necessário dar um nome ao que sentes para começares a cuidar de ti.')+'</p><p><strong>Uma necessidade possível:</strong> '+esc(needText[need])+'</p><p><strong>Práticas que podes experimentar:</strong></p>'+techniques.map(t=>'<button class="secondary" style="display:block;width:100%;margin:7px 0;text-align:left" onclick="openRelax(\''+t.id+'\')">'+t.emoji+' '+esc(t.name)+' · '+esc(t.duration)+'</button>').join('')+'<p class="mini">Estas são sugestões gerais, não uma avaliação psicológica. Podes não escolher nenhuma.</p>';
}
function savePractice(){
 const before=Number(document.getElementById('beforeDistress').value),after=Number(document.getElementById('afterDistress').value);
 const technique=document.getElementById('practiceName').value;
 const note=document.getElementById('practiceNote').value.trim();
 state.practiceRecords??=[];
 state.practiceRecords.push({date:new Date().toISOString(),before,after,technique,note});
 save();
 document.getElementById('practiceFeedback').textContent='Registo guardado apenas neste dispositivo. A mudança de intensidade não é uma medida de eficácia clínica.';
 document.getElementById('practiceNote').value='';
 renderPracticeStats();
}
function renderPracticeStats(){
 const records=(state.practiceRecords||[]).slice(-30),target=document.getElementById('practiceStats');
 if(!target)return;
 if(!records.length){target.innerHTML='<p class="mini">Ainda não existem avaliações de práticas.</p>';return}
 const helped=records.filter(r=>r.after<r.before).length,unchanged=records.filter(r=>r.after===r.before).length;
 target.innerHTML='<div class="practice-stat"><strong>'+records.length+'</strong><p>avaliações recentes guardadas</p><p>'+helped+' com menor desconforto após a prática · '+unchanged+' sem alteração · '+(records.length-helped-unchanged)+' com maior desconforto</p><p>Estas observações são pessoais e não permitem concluir eficácia terapêutica.</p></div>';
}
document.getElementById('practiceName').innerHTML='<option value="">Seleciona uma técnica (opcional)</option>'+relaxTechniques.map(t=>'<option value="'+esc(t.name)+'">'+t.emoji+' '+esc(t.name)+'</option>').join('');
renderPracticeStats();
