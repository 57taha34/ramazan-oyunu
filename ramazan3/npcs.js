'use strict';
// ── CHARACTER DEFINITIONS ─────────────────────────────────────────────────
// selectedChar: 'ayse' | 'taha'  (set from char-select screen)
let selectedChar = 'ayse';

// Palette
const C = {
  // Shared skin / hair
  skin:     '#f0c080', skin2:'#d4a060', skinD:'#c08040',
  hair:     '#5a2e0a', hair2:'#7a3e10', hairH:'#8a4e18',
  // Ayşe: dark navy outfit
  ayseBody: '#2a2a6a', ayseBody2:'#1e1e52', ayseAcc:'#a0a0ff',
  // Taha: forest green outfit
  tahaBody: '#2a5a28', tahaBody2:'#1e421c', tahaAcc:'#60c840',
  // NPC Davulcu: deep purple robe
  davBody:  '#3a1055', davBody2:'#280a3c', davAcc:'#cc2200',
  davFez:   '#cc2200',
  // NPC Dondurmacı: white apron + teal shirt
  donShirt: '#1a7a6a', donApron: '#f0ece0', donApron2:'#d8d4c8',
  // Children
  childA:   '#c83030', childB:'#3050b8', childC:'#a02080',
  // Boots
  boot:     '#1a1010', boot2:'#2a1818',
};

function _hair(ctx, bx, by, w=10, extraTop=false) {
  // Curly/wavy brown hair like in reference image
  ctx.fillStyle = C.hair2;
  ctx.fillRect(bx, by, w, 4); // base
  if(extraTop){ ctx.fillStyle=C.hair; ctx.fillRect(bx-1,by-2,w+2,3); }
  // Curly bumps
  ctx.fillStyle = C.hairH;
  ctx.fillRect(bx,   by-1, 3, 2);
  ctx.fillRect(bx+3, by-2, 3, 3);
  ctx.fillRect(bx+6, by-1, 3, 2);
  ctx.fillStyle = C.hair;
  ctx.fillRect(bx,   by,   3, 4);
  ctx.fillRect(bx+3, by,   3, 4);
  ctx.fillRect(bx+6, by,   3, 4);
  // Side wisps
  ctx.fillRect(bx-1, by+1, 2, 3);
  ctx.fillRect(bx+w-1, by+1, 2, 3);
}

function _face(ctx, bx, by, dir) {
  ctx.fillStyle = C.skin; ctx.fillRect(bx, by, 10, 8);
  ctx.fillStyle = C.skin2;
  ctx.fillRect(bx, by+5, 10, 3); // lower face
  ctx.fillRect(bx+9, by+1, 1, 6); // right shadow
  if(dir !== 'up'){
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(bx+2, by+3, 2, 2); // left eye
    ctx.fillRect(bx+6, by+3, 2, 2); // right eye
    ctx.fillStyle = '#fff';
    ctx.fillRect(bx+3, by+3, 1, 1); ctx.fillRect(bx+7, by+3, 1, 1);
  }
  if(dir === 'down'){ctx.fillStyle='#c07050';ctx.fillRect(bx+3,by+6,4,1);}
}

function _shadow(ctx, x, by, hh, r=7) {
  ctx.fillStyle='rgba(0,0,0,0.18)';
  ctx.beginPath();ctx.ellipse(x,by+hh+1,r,2.5,0,0,Math.PI*2);ctx.fill();
}

// ── PLAYER SPRITES ────────────────────────────────────────────────────────
function drawPlayer(ctx, x, y, dir, frame) {
  if(selectedChar === 'ayse') _drawAyse(ctx, x, y, dir, frame);
  else                         _drawTaha(ctx, x, y, dir, frame);
}

function _drawAyse(ctx, x, y, dir, frame) {
  const bx=Math.round(x-7), by=Math.round(y-20);
  _shadow(ctx, x, by, 22);
  const lo = frame===0 ? 2 : -2;
  // Legs + boots
  ctx.fillStyle=C.ayseBody2;ctx.fillRect(bx+2,by+15,4,5+lo);ctx.fillRect(bx+8,by+15,4,5-lo);
  ctx.fillStyle=C.boot;ctx.fillRect(bx+1,by+19,5,2);ctx.fillRect(bx+7,by+19,5,2);
  // Dress/robe body
  ctx.fillStyle=C.ayseBody;ctx.fillRect(bx+1,by+7,12,10);
  ctx.fillStyle=C.ayseBody2;ctx.fillRect(bx+1,by+7,2,10);
  // Belt detail
  ctx.fillStyle=C.ayseAcc;ctx.fillRect(bx+1,by+12,12,1);
  // Arms
  ctx.fillStyle=C.ayseBody;ctx.fillRect(bx-1,by+8,3,7);ctx.fillRect(bx+12,by+8,3,7);
  ctx.fillStyle=C.skin;ctx.fillRect(bx-1,by+13,3,2);ctx.fillRect(bx+12,by+13,3,2);
  // Neck
  ctx.fillStyle=C.skin;ctx.fillRect(bx+4,by+6,6,2);
  // Head
  _face(ctx, bx+2, by, dir);
  // Hair (long, curly - Ayşe has longer hair)
  _hair(ctx, bx+1, by-3, 12, true);
  ctx.fillStyle=C.hair;ctx.fillRect(bx+1,by+3,2,4);ctx.fillRect(bx+11,by+3,2,4); // side hair
  // Hijab-like headband
  ctx.fillStyle=C.ayseAcc;ctx.fillRect(bx+1,by-1,12,2);
}

function _drawTaha(ctx, x, y, dir, frame) {
  const bx=Math.round(x-7), by=Math.round(y-20);
  _shadow(ctx, x, by, 22);
  const lo = frame===0 ? 2 : -2;
  // Legs + boots
  ctx.fillStyle='#2a3a50';ctx.fillRect(bx+2,by+15,4,5+lo);ctx.fillRect(bx+8,by+15,4,5-lo);
  ctx.fillStyle=C.boot;ctx.fillRect(bx+1,by+19,5,2);ctx.fillRect(bx+7,by+19,5,2);
  // Shirt body
  ctx.fillStyle=C.tahaBody;ctx.fillRect(bx+1,by+7,12,10);
  ctx.fillStyle=C.tahaBody2;ctx.fillRect(bx+1,by+7,2,10);
  // Shirt detail
  ctx.fillStyle=C.tahaAcc;ctx.fillRect(bx+5,by+7,4,1);
  // Arms
  ctx.fillStyle=C.tahaBody;ctx.fillRect(bx-1,by+8,3,7);ctx.fillRect(bx+12,by+8,3,7);
  ctx.fillStyle=C.skin;ctx.fillRect(bx-1,by+13,3,2);ctx.fillRect(bx+12,by+13,3,2);
  // Neck
  ctx.fillStyle=C.skin;ctx.fillRect(bx+4,by+6,6,2);
  // Head
  _face(ctx, bx+2, by, dir);
  // Hair (shorter, curly - Taha)
  _hair(ctx, bx+1, by-2, 12, true);
  ctx.fillStyle=C.hair;ctx.fillRect(bx+1,by+3,2,3);ctx.fillRect(bx+11,by+3,2,3);
}

// ── PREVIEW SPRITES (for character select) ────────────────────────────────
function drawCharPreview(canvas, charId) {
  const W=64,H=80; canvas.width=W; canvas.height=H;
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,W,H);
  if(charId==='ayse') _drawAyse(ctx, W/2, H-16, 'down', 0);
  else                _drawTaha(ctx, W/2, H-16, 'down', 0);
}

// ── NPC SPRITES ───────────────────────────────────────────────────────────
function _drawDavulcu(ctx, x, y, dir, frame) {
  const bx=Math.round(x-7), by=Math.round(y-20);
  _shadow(ctx, x, by, 22);
  const lo = frame===0 ? 2 : -2;
  // Robe legs
  ctx.fillStyle=C.davBody2;ctx.fillRect(bx+2,by+15,4,5+lo);ctx.fillRect(bx+8,by+15,4,5-lo);
  ctx.fillStyle='#111';ctx.fillRect(bx+1,by+19,5,2);ctx.fillRect(bx+7,by+19,5,2);
  // Robe body
  ctx.fillStyle=C.davBody;ctx.fillRect(bx+1,by+7,12,10);
  ctx.fillStyle=C.davBody2;ctx.fillRect(bx+1,by+7,2,10);
  // Drum strap
  ctx.fillStyle='#c8a040';ctx.fillRect(bx+4,by+7,1,10);
  // Drum (held in front)
  ctx.fillStyle='#7a3a10';ctx.fillRect(bx-3,by+9,18,7);
  ctx.fillStyle='#b05020';ctx.fillRect(bx-3,by+9,18,2);
  ctx.fillStyle='#3a1a06';ctx.fillRect(bx-3,by+14,18,2);
  for(let i=0;i<5;i++){ctx.fillStyle='#d4a030';ctx.fillRect(bx-2+i*3,by+11,1,3);}
  // Drumsticks
  ctx.fillStyle='#d4b060';
  ctx.fillRect(bx-5,by+8+lo,2,9);ctx.fillRect(bx+17,by+8-lo,2,9);
  // Arms
  ctx.fillStyle=C.davBody;ctx.fillRect(bx-1,by+8,3,8);ctx.fillRect(bx+12,by+8,3,8);
  ctx.fillStyle=C.skin;ctx.fillRect(bx-2,by+15,4,2);ctx.fillRect(bx+12,by+15,4,2);
  // Neck
  ctx.fillStyle=C.skin;ctx.fillRect(bx+4,by+6,6,2);
  // Head
  _face(ctx, bx+2, by, dir);
  // Hair (curly brown like reference)
  _hair(ctx, bx+1, by-2, 12, true);
  // Fez (red cap on top)
  ctx.fillStyle=C.davFez;ctx.fillRect(bx+3,by-6,8,5);
  ctx.fillStyle='#aa1800';ctx.fillRect(bx+3,by-6,8,1);
  ctx.fillStyle='#888';ctx.fillRect(bx+6,by-8,2,3);
  // Mustache
  ctx.fillStyle='#2a1a0a';ctx.fillRect(bx+2,by+6,8,1);
}

function _drawDondurma(ctx, x, y, dir, frame) {
  const bx=Math.round(x-7), by=Math.round(y-20);
  _shadow(ctx, x, by, 22, 8);
  const lo = frame===0 ? 2 : -2;
  // Legs
  ctx.fillStyle='#1a4a5a';ctx.fillRect(bx+2,by+15,4,5+lo);ctx.fillRect(bx+8,by+15,4,5-lo);
  ctx.fillStyle=C.boot;ctx.fillRect(bx+1,by+19,5,2);ctx.fillRect(bx+7,by+19,5,2);
  // Apron over shirt
  ctx.fillStyle=C.donShirt;ctx.fillRect(bx+1,by+7,12,10);
  ctx.fillStyle=C.donApron;ctx.fillRect(bx+3,by+8,8,9);
  ctx.fillStyle=C.donApron2;ctx.fillRect(bx+3,by+8,1,9);
  // Apron strings
  ctx.fillStyle=C.donApron2;ctx.fillRect(bx+3,by+7,1,2);ctx.fillRect(bx+10,by+7,1,2);
  // Arms holding ice cream
  ctx.fillStyle=C.donShirt;ctx.fillRect(bx-1,by+8,3,8);ctx.fillRect(bx+12,by+8,3,8);
  ctx.fillStyle=C.skin;ctx.fillRect(bx-1,by+14,3,2);ctx.fillRect(bx+12,by+14,3,2);
  // Ice cream cone in hand
  ctx.fillStyle='#e8d090';ctx.fillRect(bx+13,by+6,4,6); // cone
  ctx.fillStyle='#ff9ecd';ctx.fillRect(bx+12,by+3,6,4); // scoop
  ctx.fillStyle='#ffeeee';ctx.fillRect(bx+13,by+2,4,2); // highlight
  // Neck
  ctx.fillStyle=C.skin;ctx.fillRect(bx+4,by+6,6,2);
  // Head
  _face(ctx, bx+2, by, dir);
  // Hair (curly brown)
  _hair(ctx, bx+1, by-2, 12, true);
  // Chef hat
  ctx.fillStyle='#f8f8f8';ctx.fillRect(bx+2,by-1,10,4);ctx.fillRect(bx+4,by-5,6,5);
  ctx.fillStyle='#e0e0e0';ctx.fillRect(bx+2,by-1,10,1);
}

const CHILD_COLS = [C.childA, C.childB, C.childC];
function _drawChild(ctx, x, y, dir, frame, colorIdx) {
  const bx=Math.round(x-5), by=Math.round(y-16);
  _shadow(ctx, x, by, 18, 5);
  const lo = frame===0 ? 1 : -1;
  // Legs (shorter = child)
  ctx.fillStyle='#2a3a50';ctx.fillRect(bx+1,by+11,3,5+lo);ctx.fillRect(bx+6,by+11,3,5-lo);
  ctx.fillStyle=C.boot;ctx.fillRect(bx,by+15,4,2);ctx.fillRect(bx+5,by+15,4,2);
  // Shirt
  const sc=CHILD_COLS[colorIdx%3];
  ctx.fillStyle=sc;ctx.fillRect(bx+1,by+5,8,8);
  // Arms
  ctx.fillStyle=sc;ctx.fillRect(bx-1,by+6,3,5);ctx.fillRect(bx+8,by+6,3,5);
  ctx.fillStyle=C.skin;ctx.fillRect(bx-1,by+10,3,2);ctx.fillRect(bx+8,by+10,3,2);
  // Neck
  ctx.fillStyle=C.skin;ctx.fillRect(bx+3,by+4,4,2);
  // Head (slightly smaller)
  ctx.fillStyle=C.skin;ctx.fillRect(bx+1,by,8,6);
  ctx.fillStyle=C.skin2;ctx.fillRect(bx+1,by+4,8,2);
  if(dir!=='up'){
    ctx.fillStyle='#2a1a0a';ctx.fillRect(bx+2,by+2,2,2);ctx.fillRect(bx+6,by+2,2,2);
    ctx.fillStyle='#fff';ctx.fillRect(bx+3,by+2,1,1);ctx.fillRect(bx+7,by+2,1,1);
  }
  if(dir==='down'){ctx.fillStyle='#c07050';ctx.fillRect(bx+3,by+5,3,1);}
  // Hair (curly, shorter)
  ctx.fillStyle=C.hair2;ctx.fillRect(bx+1,by-1,8,3);
  ctx.fillStyle=C.hairH;ctx.fillRect(bx+1,by-2,3,2);ctx.fillRect(bx+4,by-3,3,3);ctx.fillRect(bx+7,by-2,2,2);
  ctx.fillStyle=C.hair;ctx.fillRect(bx,by,2,3);ctx.fillRect(bx+9,by,1,3);
}

// ── NPC STATE + MOVEMENT ──────────────────────────────────────────────────
const NPC_SPEED=0.40, NPC_INTERACT=40;
const NPC_ZONES={
  npc_davulcu: {id:'npc_davulcu',name:'Davulcu',rx:0.055,ry:0.045,cx:0,cy:0,active:false},
  npc_dondurma:{id:'npc_dondurma',name:'Dondurmacı',rx:0.055,ry:0.045,cx:0,cy:0,active:false},
};

function _makeNPC(id,path){
  return{id,path,pathIdx:0,x:path[0].x*768,y:path[0].y*768,dir:'down',frame:0,ft:0,frozen:false,active:true};
}
const DAVULCU=_makeNPC('davulcu',[
  {x:0.19,y:0.39},{x:0.46,y:0.39},{x:0.46,y:0.57},
  {x:0.46,y:0.78},{x:0.46,y:0.57},{x:0.46,y:0.39},{x:0.19,y:0.39}
]);
const DONDURMA=_makeNPC('dondurma',[
  {x:0.46,y:0.44},{x:0.46,y:0.70},{x:0.46,y:0.44}
]);
const CHILD_PATHS=[
  [{x:0.28,y:0.40},{x:0.53,y:0.40},{x:0.28,y:0.40}],
  [{x:0.46,y:0.47},{x:0.46,y:0.68},{x:0.46,y:0.47}],
  [{x:0.18,y:0.40},{x:0.38,y:0.40},{x:0.18,y:0.40}],
];
const CHILDREN=CHILD_PATHS.map((p,i)=>{const n=_makeNPC('child'+i,p);n.colorIdx=i;return n;});
const CHILD_TALKS=[
  {child:'Dayı bir dondurma lütfen!',vendor:'Al bakalım yavrucuğum! 🍦'},
  {child:'Çikolatamı var mı?',vendor:'Var var, taze çikolata!'},
  {child:'Ben fıstıklı istiyorum!',vendor:'Hemen veriyorum güzelim!'},
  {child:'Ne kadar dayı?',vendor:'Ramazan hediyesi, bedava! 😄'},
];
let childTalkCooldown=0,childTalkIdx=0;

function _updateNPC(npc,dt){
  if(!npc.active||npc.frozen)return;
  const D=768,tgt=npc.path[npc.pathIdx],tx=tgt.x*D,ty=tgt.y*D;
  const dx=tx-npc.x,dy=ty-npc.y,dist=Math.sqrt(dx*dx+dy*dy);
  if(dist<3){npc.pathIdx=(npc.pathIdx+1)%npc.path.length;return;}
  const spd=NPC_SPEED*(dt/16);
  npc.x+=(dx/dist)*spd;npc.y+=(dy/dist)*spd;
  npc.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
  npc.ft+=dt;if(npc.ft>260){npc.frame^=1;npc.ft=0;}
}

function updateAllNPCs(dt,nightMode,showDlgFn){
  if(nightMode){
    DAVULCU.active=true;DONDURMA.active=false;CHILDREN.forEach(c=>c.active=false);
    _updateNPC(DAVULCU,dt);
    NPC_ZONES.npc_davulcu.cx=DAVULCU.x/768;NPC_ZONES.npc_davulcu.cy=DAVULCU.y/768;
    NPC_ZONES.npc_davulcu.active=true;NPC_ZONES.npc_dondurma.active=false;
  } else {
    DAVULCU.active=false;DONDURMA.active=true;CHILDREN.forEach(c=>c.active=true);
    _updateNPC(DONDURMA,dt);CHILDREN.forEach(c=>_updateNPC(c,dt));
    NPC_ZONES.npc_dondurma.cx=DONDURMA.x/768;NPC_ZONES.npc_dondurma.cy=DONDURMA.y/768;
    NPC_ZONES.npc_dondurma.active=true;NPC_ZONES.npc_davulcu.active=false;
    if(childTalkCooldown>0)childTalkCooldown-=dt;
    else{
      CHILDREN.forEach(child=>{
        if(childTalkCooldown>0)return;
        const dx=(child.x-DONDURMA.x)/768,dy=(child.y-DONDURMA.y)/768;
        if(Math.sqrt(dx*dx+dy*dy)<0.06){
          const talk=CHILD_TALKS[childTalkIdx%CHILD_TALKS.length];childTalkIdx++;
          showDlgFn('👦 Çocuk','"'+talk.child+'"',2200);
          setTimeout(()=>showDlgFn('🍦 Dondurmacı','"'+talk.vendor+'"',2200),2400);
          childTalkCooldown=18000+Math.random()*8000;
          GameAudio.playIceCream();
        }
      });
    }
  }
}

function drawNPCs(ctx){
  if(DAVULCU.active) _drawDavulcu(ctx,DAVULCU.x,DAVULCU.y,DAVULCU.dir,DAVULCU.frame);
  if(DONDURMA.active) _drawDondurma(ctx,DONDURMA.x,DONDURMA.y,DONDURMA.dir,DONDURMA.frame);
  CHILDREN.forEach(c=>{if(c.active)_drawChild(ctx,c.x,c.y,c.dir,c.frame,c.colorIdx);});
}
function isNearNPC(npc,px,py){const dx=px-npc.x,dy=py-npc.y;return Math.sqrt(dx*dx+dy*dy)<NPC_INTERACT;}
function freezeNPC(id,v){if(id==='davulcu')DAVULCU.frozen=v;if(id==='dondurma')DONDURMA.frozen=v;}
function resetNPCs(){
  [DAVULCU,DONDURMA,...CHILDREN].forEach(n=>{n.pathIdx=0;n.x=n.path[0].x*768;n.y=n.path[0].y*768;n.frozen=false;});
  childTalkCooldown=0;
}
