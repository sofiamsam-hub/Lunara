
(function(){
const panda=document.getElementById('pandaArt');
const mood=document.getElementById('guardianMood');
const expression=document.getElementById('pandaExpression');
if(!panda||!mood||!expression)return;
const states=[['✦','✧ O panda está tranquilo'],['♡','♡ O panda recebeu a tua festa'],['✧','✧ O panda parece curioso'],['☾','☾ O panda está a descansar']];
let i=0;
panda.addEventListener('click',()=>{i=(i+1)%states.length;expression.textContent=states[i][0];mood.textContent=states[i][1];panda.classList.remove('panda-react');void panda.offsetWidth;panda.classList.add('panda-react');});
})();

let livingPandaTimer=null;
function animatePanda(action){
 const stage=document.getElementById('livingStage'),label=document.getElementById('livingLabel');
 if(!stage||!label)return;
 if(livingPandaTimer)clearTimeout(livingPandaTimer);
 stage.removeAttribute('data-action');void stage.offsetWidth;
 stage.dataset.action=action;
 const messages={wave:'O panda está a acenar-te! 👋',walk:'Vamos explorar o reino juntos! 🐾',rest:'O panda vai descansar. Tu também podes. 🌙',joy:'O panda está contente por te ver! 💜'};
 label.textContent=messages[action]||'O panda está tranquilo.';
 livingPandaTimer=setTimeout(()=>{stage.removeAttribute('data-action');label.textContent='O panda está tranquilo.'},action==='rest'?6000:action==='walk'?4300:action==='wave'?3800:3100);
}
