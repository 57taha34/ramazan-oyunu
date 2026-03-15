'use strict';
const DISP=768,HRADIUS=5,SPEED=2.2;

const canvas=document.getElementById('c');
const ctx=canvas.getContext('2d');
canvas.width=canvas.height=DISP;
const confCanvas=document.getElementById('confetti-canvas');
const confCtx=confCanvas.getContext('2d');
confCanvas.width=confCanvas.height=DISP;

const mapDay=new Image();   mapDay.src=DAY_MAP_B64;
const mapNight=new Image(); mapNight.src=NIGHT_MAP_B64;

const elDayNum  =document.getElementById('day-num');
const elTtime   =document.getElementById('t-time');
const elTfill   =document.getElementById('t-fill');
const elQList   =document.getElementById('quest-list');
const elDlg     =document.getElementById('dlg');
const elDlgSpk  =document.getElementById('dlg-speaker');
const elDlgTxt  =document.getElementById('dlg-text');
const elPbarWrap=document.getElementById('pbar-wrap');
const elPbarFill=document.getElementById('pbar-fill');
const elPbarLbl =document.getElementById('pbar-label');
const elOverlay =document.getElementById('overlay');
const elOvTitle =document.getElementById('ov-title');
const elOvSub   =document.getElementById('ov-sub');
const elOvResult=document.getElementById('ov-result');
const elOvBtns  =document.getElementById('ov-btns');

let day,dayQuestIds,questStates,dayTimer,timerRunning,paused,dayEnded;
let activeWait=null,dlgTimer=0,confParticles=[];
let showDebug=false,gameStarted=false;

const P={x:DISP*0.5117,y:DISP*0.8828,dir:'down',frame:0,ft:0};

const keys={};
window.addEventListener('keydown',e=>{
  const prev=keys[e.code];keys[e.code]=true;
  if(e.code==='F1'){showDebug=!showDebug;}
  if(e.code==='KeyP'&&!prev&&gameStarted)togglePause();
  if(e.code==='Space'&&!prev&&!paused&&!dayEnded&&gameStarted){GameAudio.init();handleSpace();}
  e.preventDefault();
},{passive:false});
window.addEventListener('keyup',e=>keys[e.code]=false);

function togglePause(){
  if(dayEnded)return;paused=!paused;
  if(paused)showOverlay('paused','⏸ DURAKLATILDI','','',null,null,true);
  else elOverlay.style.display='none';
}

function startDay(d){
  gameStarted=true;day=d;dayEnded=false;paused=false;activeWait=null;dlgTimer=0;confParticles=[];
  const picks=pickDayQuests(d);
  dayQuestIds=picks.map(q=>q.id);
  questStates={};dayQuestIds.forEach(qid=>questStates[qid]={stepIdx:0,done:false});
  dayTimer=dayDuration(d)*1000;timerRunning=true;
  P.x=DISP*0.5117;P.y=DISP*0.8828;P.dir='down';P.frame=0;P.ft=0;
  elDayNum.textContent='GÜN '+d;
  elOverlay.style.display='none';
  elPbarWrap.style.display='none';
  confCanvas.style.display='none';
  hideDlg();resetNPCs();
  GameAudio.setMode(isNightDay(d));
  renderQuests();updateTimerUI();
}

function allDone(){return dayQuestIds.every(qid=>questStates[qid].done);}

function currentTargetZoneIds(){
  const ids=new Set();
  dayQuestIds.forEach(qid=>{
    const st=questStates[qid];if(st.done)return;
    QUEST_MAP[qid].steps[st.stepIdx].zone.split('|').forEach(z=>ids.add(z));
  });
  return ids;
}

function nearestZone(){
  let best=null,bestD=9999;
  for(const z of ZONES){
    const dx=P.x/DISP-z.cx,dy=P.y/DISP-z.cy;
    const d=Math.sqrt((dx/(z.rx+0.045))**2+(dy/(z.ry+0.045))**2);
    if(d<1.0&&d<bestD){best=z;bestD=d;}
  }
  for(const nz of Object.values(NPC_ZONES)){
    if(!nz.active)continue;
    const dx=P.x/DISP-nz.cx,dy=P.y/DISP-nz.cy;
    const d=Math.sqrt((dx/(nz.rx+0.045))**2+(dy/(nz.ry+0.045))**2);
    if(d<1.0&&d<bestD){best=nz;bestD=d;}
  }
  return best;
}

function handleSpace(){
  const near=nearestZone();
  if(!near){showSpeaker('','Yeşil noktaya yaklaş!',1400);return;}
  const matches=dayQuestIds.filter(qid=>{
    const st=questStates[qid];if(st.done)return false;
    return QUEST_MAP[qid].steps[st.stepIdx].zone.split('|').includes(near.id);
  });
  if(!matches.length){
    const any=dayQuestIds.some(qid=>QUEST_MAP[qid].steps.some(s=>s.zone.split('|').includes(near.id)));
    showSpeaker('',any?'Bu adım için önce önceki\nadımı tamamla!':'Bu noktada şu an\nyapılacak görev yok.',1800);
    return;
  }
  if(activeWait&&activeWait.zoneId!==near.id){showSpeaker('','Önce mevcut beklemeyi tamamla!',1400);return;}
  const qid=matches[0],q=QUEST_MAP[qid],st=questStates[qid],step=q.steps[st.stepIdx];

  // Special dialogues
  if(near.id==='z4'&&qid==='q1'&&st.stepIdx===1){
    showSpeaker('🍞 Fırıncı Amca','Pide tam da fırından yeni çıkmıştı evlat,\nal bakalım taze taze sıcak pide!',3200);
    setTimeout(()=>completeStep(qid),3400);return;
  }
  if(near.id==='z5'&&qid==='q8'&&st.stepIdx===1){
    showSpeaker('🏠 Komşu Teyze','Teşekkürler evladım, hayırlı iftarlar.',2200);
    setTimeout(()=>{
      const charName=selectedChar==='ayse'?'Ayşe':'Taha';
      showSpeaker('👤 '+charName,'Rica ederim, hayırlı iftarlar.',2200);
      setTimeout(()=>completeStep(qid),2400);
    },2400);return;
  }
  if(near.id==='npc_davulcu'){
    showSpeaker('🥁 Davulcu Amca','Amanın hoşgeldin yiğidim!\nBahşişin için teşekkürler,\niştah açıcı bir pide yer gibi döveyim!',3200);
    freezeNPC('davulcu',true);
    setTimeout(()=>{freezeNPC('davulcu',false);completeStep(qid);},3400);return;
  }
  if(near.id==='npc_dondurma'){
    showSpeaker('🍦 Dondurmacı','Buyur tatlı bir şeyler istedin mi?',2000);
    setTimeout(()=>{
      const charName=selectedChar==='ayse'?'Ayşe':'Taha';
      showSpeaker('👤 '+charName,'Bir dondurma lütfen!',1800);
      setTimeout(()=>{
        showSpeaker('🍦 Dondurmacı','Al bakalım, Ramazan mübarek! 🍦',2000);
        freezeNPC('dondurma',true);
        setTimeout(()=>{freezeNPC('dondurma',false);completeStep(qid);},2200);
      },2000);
    },2200);return;
  }

  if(step.action==='wait'){
    if(activeWait&&activeWait.qid===qid)return;
    activeWait={qid,stepIdx:st.stepIdx,timer:step.wait*1000,total:step.wait*1000,zoneId:near.id};
    elPbarWrap.style.display='block';elPbarFill.style.width='0%';
    elPbarLbl.textContent=step.msg+'...';
  } else {
    showSpeaker('','✓ '+step.msg,1100);setTimeout(()=>completeStep(qid),1200);
  }
}

function completeStep(qid){
  const st=questStates[qid],q=QUEST_MAP[qid];st.stepIdx++;
  if(st.stepIdx>=q.steps.length){
    st.done=true;GameAudio.playSuccess();
    showSpeaker('','✅ '+q.done_msg,2200);renderQuests();
    if(allDone())setTimeout(()=>triggerDayEnd(true),2300);
  } else renderQuests();
}

function renderQuests(){
  elQList.innerHTML='';
  dayQuestIds.forEach(qid=>{
    const st=questStates[qid],q=QUEST_MAP[qid];
    const done=st.done,waiting=activeWait&&activeWait.qid===qid,active=!done&&!waiting&&st.stepIdx>0;
    const row=document.createElement('div');
    row.className='q-row'+(done?' done':waiting?' waiting':active?' active':'');
    const icon=done?'✓':waiting?'⏳':active?'▶':'○';
    const step=!done?q.steps[st.stepIdx]:null;
    row.innerHTML=`<span class="q-icon">${icon}</span><div><div>${q.emoji} ${q.title}</div>`+
      (step?`<div class="q-step">→ ${step.msg}</div>`:'')+'</div>';
    elQList.appendChild(row);
  });
}

function showSpeaker(spk,txt,ms){
  elDlgSpk.textContent=spk;elDlgSpk.style.display=spk?'block':'none';
  elDlgTxt.textContent=txt;elDlg.style.display='block';dlgTimer=ms||2500;
}
function hideDlg(){elDlg.style.display='none';dlgTimer=0;}

function updateTimerUI(){
  const secs=Math.ceil(dayTimer/1000),m=Math.floor(secs/60),s=secs%60;
  elTtime.textContent=m+':'+(s<10?'0':'')+s;
  elTtime.className='t-time'+(secs<=10?' danger':secs<=30?' warn':'');
  elTfill.style.width=Math.max(0,(dayTimer/(dayDuration(day)*1000))*100).toFixed(1)+'%';
}

function showOverlay(type,title,sub,result,btns,_,pauseHint){
  elOverlay.className=type;elOvTitle.textContent=title;
  elOvSub.innerHTML=sub||'';elOvSub.style.display=sub?'block':'none';
  elOvResult.innerHTML=result||'';elOvResult.style.display=result?'block':'none';
  elOvBtns.innerHTML='';
  (btns||[]).forEach(b=>{
    const btn=document.createElement('button');
    btn.className='ov-btn'+(b.red?' red':'');btn.textContent=b.label;btn.onclick=b.fn;
    elOvBtns.appendChild(btn);
  });
  const hint=elOverlay.querySelector('.pause-hint');
  if(hint)hint.style.display=pauseHint?'block':'none';
  elOverlay.style.display='flex';
}

function triggerDayEnd(success){
  if(dayEnded)return;dayEnded=true;timerRunning=false;activeWait=null;
  elPbarWrap.style.display='none';
  GameAudio.playCannon();launchConfetti();
  const isLast=day>=TOTAL_DAYS;
  const doneList=dayQuestIds.filter(qid=>questStates[qid].done)
    .map(qid=>QUEST_MAP[qid].emoji+' '+QUEST_MAP[qid].title).join('<br>');
  const sub=success
    ?'Tüm görevler tamamlandı tebrikler!<br>İftarını açtın afiyet olsun 🍽️'
    :'Görevleri yetiştiremedin<br>Annen sana kızdı... 😠';
  const nextBtns=success
    ?(isLast
      ?[{label:'Yeniden Oyna 🌙',fn:()=>startDay(1)}]
      :[{label:(day+1)+'. Güne Geç →',fn:()=>startDay(day+1)},
        {label:'En Baştan Başla',fn:()=>startDay(1)}])
    :[{label:'Tekrar Dene',fn:()=>startDay(day)},
      {label:'En Baştan Başla',fn:()=>startDay(1),red:true}];
  setTimeout(()=>showOverlay(
    success?'dayend':'gameover',
    'ALLAHU EKBER!\nTop patladı!!! 💥',sub,
    success?doneList:'',nextBtns,null,false
  ),900);
}

function launchConfetti(){
  confCanvas.style.display='block';confParticles=[];
  const C=['#f5d97a','#c8a840','#ff5555','#55ff99','#55aaff','#ff99ff','#fff','#ff8844','#aaffaa'];
  for(let i=0;i<240;i++){
    const a=Math.random()*Math.PI*2,spd=5+Math.random()*11;
    confParticles.push({x:DISP/2,y:DISP/2,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd-6,
      color:C[Math.floor(Math.random()*C.length)],size:3+Math.random()*7,
      rot:Math.random()*Math.PI*2,rotV:(Math.random()-.5)*.35,life:1.0,
      decay:0.006+Math.random()*.009,shape:Math.random()>.5?'rect':'circle'});
  }
}
function updateConfetti(dt){
  if(!confParticles.length){confCanvas.style.display='none';return;}
  confCtx.clearRect(0,0,DISP,DISP);
  confParticles=confParticles.filter(p=>p.life>0);
  confParticles.forEach(p=>{
    p.vy+=0.20*(dt/16);p.x+=p.vx*(dt/16);p.y+=p.vy*(dt/16);
    p.rot+=p.rotV;p.life-=p.decay*(dt/16);
    confCtx.save();confCtx.globalAlpha=Math.max(0,p.life);
    confCtx.translate(p.x,p.y);confCtx.rotate(p.rot);confCtx.fillStyle=p.color;
    if(p.shape==='rect')confCtx.fillRect(-p.size/2,-p.size/4,p.size,p.size/2);
    else{confCtx.beginPath();confCtx.arc(0,0,p.size/2,0,Math.PI*2);confCtx.fill();}
    confCtx.restore();
  });
}

function collides(nx,ny){
  const fy=ny+6;
  for(const w of WALLS){
    if(nx+HRADIUS>w.x*DISP&&nx-HRADIUS<(w.x+w.w)*DISP&&
       fy+HRADIUS>w.y*DISP&&fy-HRADIUS<(w.y+w.h)*DISP)return true;
  }
  return nx<HRADIUS||nx>DISP-HRADIUS||ny<8||ny>DISP-8;
}

function drawZones(){
  const near=nearestZone(),targets=currentTargetZoneIds(),t=Date.now()/700;
  const allZ=[...ZONES,...Object.values(NPC_ZONES).filter(nz=>nz.active)];
  for(const z of allZ){
    const isNear=z===near,isTarget=targets.has(z.id);
    const cx=z.cx*DISP,cy=z.cy*DISP,rx=z.rx*DISP,ry=z.ry*DISP;
    let col,alpha;
    if(isTarget&&isNear){col='80,255,80';alpha=0.65+0.20*Math.sin(t*2.2);}
    else if(isTarget){col='70,210,70';alpha=0.38+0.12*Math.sin(t);}
    else if(isNear){col='200,200,60';alpha=0.32+0.10*Math.sin(t);}
    else{col='45,140,45';alpha=0.13+0.05*Math.sin(t);}
    if(isTarget&&isNear){
      const grd=ctx.createRadialGradient(cx,cy,rx*.1,cx,cy,rx*2.5);
      grd.addColorStop(0,'rgba(80,255,80,.18)');grd.addColorStop(1,'rgba(0,0,0,0)');
      ctx.save();ctx.scale(1,ry/rx);ctx.fillStyle=grd;
      ctx.beginPath();ctx.arc(cx,cy*rx/ry,rx*2.5,0,Math.PI*2);ctx.fill();ctx.restore();
    }
    ctx.save();
    ctx.strokeStyle=`rgba(${col},${alpha})`;
    ctx.lineWidth=isTarget&&isNear?3:isTarget?2:1.2;
    if(!isTarget)ctx.setLineDash([4,4]);
    ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle=`rgba(${col},${alpha*.2})`;
    ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.fill();
    if(z.num!=null){
      ctx.fillStyle='rgba(0,0,0,.72)';ctx.fillRect(cx-7,cy-ry-14,14,12);
      ctx.fillStyle=`rgba(${col},1)`;
      ctx.font=`bold ${isTarget?11:9}px Courier New`;ctx.textAlign='center';
      ctx.fillText(z.num,cx,cy-ry-4);
    }
    if(isNear&&isTarget&&!activeWait){
      const lbl='[SPACE] '+z.name;
      const pulse=0.80+0.20*Math.sin(Date.now()/280);
      ctx.globalAlpha=pulse;ctx.font='bold 11px Courier New';ctx.textAlign='center';
      const tw=ctx.measureText(lbl).width;
      ctx.fillStyle='rgba(0,0,0,.76)';ctx.fillRect(cx-tw/2-7,cy-ry-33,tw+14,14);
      ctx.fillStyle='#a0ffa0';ctx.fillText(lbl,cx,cy-ry-22);ctx.globalAlpha=1;
    }
    ctx.restore();
  }
}

function drawDebug(){
  ctx.save();ctx.globalAlpha=.20;ctx.fillStyle='#ff2200';
  for(const w of WALLS)ctx.fillRect(w.x*DISP,w.y*DISP,w.w*DISP,w.h*DISP);
  ctx.globalAlpha=.8;ctx.strokeStyle='#0ff';ctx.lineWidth=1;
  ctx.strokeRect(P.x-HRADIUS,P.y+6-HRADIUS,HRADIUS*2,HRADIUS*2);ctx.restore();
}

let lastTs=0;
function gameLoop(ts){
  const dt=Math.min(ts-lastTs,50);lastTs=ts;
  const night=isNightDay(day);
  if(!paused&&!dayEnded){
    let dx=0,dy=0;
    if(keys['KeyA']||keys['ArrowLeft']){dx-=1;P.dir='left';}
    if(keys['KeyD']||keys['ArrowRight']){dx+=1;P.dir='right';}
    if(keys['KeyW']||keys['ArrowUp']){dy-=1;P.dir='up';}
    if(keys['KeyS']||keys['ArrowDown']){dy+=1;P.dir='down';}
    if(dx&&dy){dx*=.707;dy*=.707;}
    const spd=SPEED*(dt/16),nx=P.x+dx*spd,ny=P.y+dy*spd;
    if(!collides(nx,P.y))P.x=nx;if(!collides(P.x,ny))P.y=ny;
    if(dx||dy){P.ft+=dt;if(P.ft>170){P.frame^=1;P.ft=0;}}
    if(timerRunning){dayTimer-=dt;if(dayTimer<=0){dayTimer=0;triggerDayEnd(false);}updateTimerUI();}
    if(dlgTimer>0){dlgTimer-=dt;if(dlgTimer<=0)hideDlg();}
    if(activeWait){
      const near=nearestZone();
      if(near&&near.id===activeWait.zoneId){
        activeWait.timer-=dt;
        const pct=Math.max(0,(1-activeWait.timer/activeWait.total)*100);
        elPbarFill.style.width=pct.toFixed(1)+'%';
        const step=QUEST_MAP[activeWait.qid].steps[activeWait.stepIdx];
        elPbarLbl.textContent=step.msg+' ('+Math.ceil(activeWait.timer/1000)+'s)';
        if(activeWait.timer<=0){
          const qid=activeWait.qid;activeWait=null;elPbarWrap.style.display='none';
          showSpeaker('','✅ '+QUEST_MAP[qid].steps[questStates[qid].stepIdx].msg+' tamamlandı!',1500);
          setTimeout(()=>completeStep(qid),1600);
        }
      } else {
        activeWait=null;elPbarWrap.style.display='none';
        showSpeaker('','Bölgeyi terk ettin!\nTekrar yaklaş ve SPACE bas.',2000);
      }
    }
    updateAllNPCs(dt,night,(spk,txt,ms)=>showSpeaker(spk,txt,ms||2200));
    GameAudio.setNearDrum(night&&isNearNPC(DAVULCU,P.x,P.y));
  }
  ctx.clearRect(0,0,DISP,DISP);
  const map=night?mapNight:mapDay;
  if(map.complete&&map.naturalWidth)ctx.drawImage(map,0,0,DISP,DISP);
  if(showDebug)drawDebug();
  drawNPCs(ctx);drawZones();
  drawPlayer(ctx,P.x,P.y,P.dir,P.frame);
  if(confParticles.length)updateConfetti(dt);
  requestAnimationFrame(gameLoop);
}
// gameLoop starts from index.html after char select
