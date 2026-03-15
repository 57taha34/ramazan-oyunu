'use strict';
const GameAudio = (() => {
  let ac=null,master,birdTmr,drumTmr,nightSrc,nightLfo,_init=false,_night=false,_nearDrum=false;
  function init(){
    if(_init)return;
    try{ac=new(window.AudioContext||window.webkitAudioContext)();
      master=ac.createGain();master.gain.value=0.55;master.connect(ac.destination);_init=true;
    }catch(e){console.warn('Audio N/A');}
  }
  function stopAll(){
    clearTimeout(birdTmr);clearTimeout(drumTmr);
    try{nightSrc&&nightSrc.stop();}catch(e){}
    try{nightLfo&&nightLfo.stop();}catch(e){}
    nightSrc=nightLfo=null;
  }
  function setMode(night){
    if(!_init)return;_night=night;stopAll();
    if(night){_startCrickets();_scheduleDrum();}else{_scheduleBirds();}
  }
  function _scheduleBirds(){_chirp();birdTmr=setTimeout(_scheduleBirds,2800+Math.random()*3500);}
  function _chirp(){
    if(!ac)return;const t=ac.currentTime;
    const osc=ac.createOscillator(),g=ac.createGain();
    osc.type='sine';osc.connect(g);g.connect(master);
    const f=900+Math.random()*500;
    osc.frequency.setValueAtTime(f,t);osc.frequency.linearRampToValueAtTime(f+300,t+0.09);
    osc.frequency.linearRampToValueAtTime(f+100,t+0.20);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.15,t+0.04);g.gain.linearRampToValueAtTime(0,t+0.24);
    osc.start(t);osc.stop(t+0.28);
  }
  function _startCrickets(){
    if(!ac)return;const sr=ac.sampleRate,buf=ac.createBuffer(1,sr*2,sr),d=buf.getChannelData(0);
    for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    nightSrc=ac.createBufferSource();nightSrc.buffer=buf;nightSrc.loop=true;
    const flt=ac.createBiquadFilter();flt.type='bandpass';flt.frequency.value=5800;flt.Q.value=28;
    nightLfo=ac.createOscillator();nightLfo.frequency.value=22;
    const lfog=ac.createGain();lfog.gain.value=0.035;nightLfo.connect(lfog);
    const ambg=ac.createGain();ambg.gain.value=0.06;lfog.connect(ambg.gain);
    nightSrc.connect(flt);flt.connect(ambg);ambg.connect(master);
    nightSrc.start();nightLfo.start();
  }
  // Drum - plays regularly at night, much louder when near
  function _scheduleDrum(){
    _drum(_nearDrum?1.1:0.55);
    drumTmr=setTimeout(_scheduleDrum,2200+Math.random()*1400);
  }
  function _drum(vol=0.7){
    if(!ac)return;const t=ac.currentTime;
    // Main hit
    [{f0:95,f1:45,dur:0.42,v:vol},{f0:58,f1:30,dur:0.32,v:vol*.5,dt:0.07},{f0:130,f1:80,dur:0.18,v:vol*.3,dt:0.02}]
    .forEach(({f0,f1,dur,v,dt=0})=>{
      const o=ac.createOscillator(),g=ac.createGain();
      o.connect(g);g.connect(master);o.type='sine';
      o.frequency.setValueAtTime(f0,t+dt);o.frequency.exponentialRampToValueAtTime(f1,t+dt+dur);
      g.gain.setValueAtTime(Math.min(v,1.3),t+dt);g.gain.exponentialRampToValueAtTime(0.001,t+dt+dur+0.05);
      o.start(t+dt);o.stop(t+dt+dur+0.08);
    });
    // Noise snap
    const nb=ac.createBuffer(1,ac.sampleRate*0.04,ac.sampleRate),nd=nb.getChannelData(0);
    for(let i=0;i<nd.length;i++)nd[i]=(Math.random()*2-1)*Math.exp(-i/(ac.sampleRate*0.005));
    const ns=ac.createBufferSource();ns.buffer=nb;
    const ng=ac.createGain();ng.gain.value=vol*0.35;
    const nf=ac.createBiquadFilter();nf.type='bandpass';nf.frequency.value=200;nf.Q.value=2;
    ns.connect(nf);nf.connect(ng);ng.connect(master);ns.start(t);
  }
  function setNearDrum(v){_nearDrum=v;}
  function playIceCream(){
    if(!ac)return;const t=ac.currentTime;
    [523,659,784,1047].forEach((hz,i)=>{
      const o=ac.createOscillator(),g=ac.createGain();
      o.type='triangle';o.connect(g);g.connect(master);o.frequency.value=hz;
      const st=t+i*0.15;
      g.gain.setValueAtTime(0,st);g.gain.linearRampToValueAtTime(0.20,st+0.03);g.gain.linearRampToValueAtTime(0,st+0.14);
      o.start(st);o.stop(st+0.18);
    });
  }
  function playSuccess(){
    if(!ac)return;const t=ac.currentTime;
    [523,659,784,1047].forEach((hz,i)=>{
      const o=ac.createOscillator(),g=ac.createGain();
      o.type='sine';o.connect(g);g.connect(master);o.frequency.value=hz;
      const st=t+i*0.12;
      g.gain.setValueAtTime(0,st);g.gain.linearRampToValueAtTime(0.25,st+0.03);g.gain.linearRampToValueAtTime(0,st+0.22);
      o.start(st);o.stop(st+0.25);
    });
  }
  function playCannon(){
    if(!ac)return;const t=ac.currentTime;
    // LOUD boom - multiple layers
    const sr=ac.sampleRate,dur=1.8;
    const buf=ac.createBuffer(1,sr*dur,sr),d=buf.getChannelData(0);
    for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/sr*2.5);
    const src=ac.createBufferSource();src.buffer=buf;
    const flt=ac.createBiquadFilter();flt.type='lowpass';flt.frequency.value=400;
    const g=ac.createGain();g.gain.setValueAtTime(1.8,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    src.connect(flt);flt.connect(g);g.connect(master);
    // Sub boom
    const o=ac.createOscillator(),og=ac.createGain();
    o.type='sine';o.frequency.setValueAtTime(65,t);o.frequency.exponentialRampToValueAtTime(22,t+0.8);
    og.gain.setValueAtTime(1.5,t);og.gain.exponentialRampToValueAtTime(0.001,t+0.9);
    o.connect(og);og.connect(master);
    // Click transient
    const cb=ac.createBuffer(1,sr*0.02,sr),cd=cb.getChannelData(0);
    for(let i=0;i<cd.length;i++)cd[i]=(Math.random()*2-1)*Math.exp(-i/(sr*0.001));
    const cs=ac.createBufferSource();cs.buffer=cb;
    const cg=ac.createGain();cg.gain.value=2.0;
    cs.connect(cg);cg.connect(master);
    src.start(t);src.stop(t+dur);o.start(t);o.stop(t+0.95);cs.start(t);
  }
  return{init,setMode,setNearDrum,playIceCream,playSuccess,playCannon};
})();
