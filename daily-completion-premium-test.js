/* Visual Lab only: Daily Discovery completion art and SCORE-GRADED celebration.
   Native Daily logic remains sole owner of scoring, rewards, saves and navigation.
   Sound uses existing approved chime/coin/victory functions and SFX preferences. */
(()=>{'use strict';
 const TIERS=Object.freeze([
  {confetti:4,duration:3700,label:'A new discovery awaits.'},
  {confetti:12,duration:3900,label:null},
  {confetti:20,duration:4050,label:'You’re making discoveries!'},
  {confetti:32,duration:4250,label:null},
  {confetti:48,duration:4450,label:'Excellent discovery!'},
  {confetti:74,duration:4900,label:null}
 ]);
 const COLORS=['#f5d184','#fff1bb','#a8d7ba','#d99856','#dcb8e5'];
 const reduced=()=>document.documentElement.classList.contains('reduce-motion')||
   !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 function preference(){
  try{
   const val=JSON.parse(localStorage.getItem('bible-unfolded-immersive-v34')||'{}').celebrate;
   return ['off','gentle','full'].includes(val)?val:'full';
  }catch(_){return 'full'}
 }
 function partyAudio(score,pref){
  if(score===0||pref==='off'||document.hidden)return;
  // Existing saved sound controls; no change to global settings or audio assets.
  try{
   if(typeof sfxOn==='undefined'||!sfxOn||typeof sfxVolume==='undefined'||sfxVolume<=0)return;
   if(typeof playChime==='function')playChime();
   if(pref==='gentle')return;
   if(score===3&&typeof playCoinFx==='function')playCoinFx('spend');
   if(score>=4&&typeof playCoinFx==='function')playCoinFx('earn');
   if(score===5&&typeof playVictoryCheer==='function')playVictoryCheer();
  }catch(_){/* audio must never block the result controls */}
 }
 function sprinkle(body,score,pref){
  if(pref==='off'||reduced())return;
  const tier=TIERS[score];
  const count=pref==='gentle'?Math.min(9,tier.confetti):tier.confetti;
  if(!count)return;
  const layer=document.createElement('div');
  layer.className='bu-daily-finale-confetti';
  layer.setAttribute('aria-hidden','true');
  // No controls, overlays, body scroll handlers or hitbox interception.
  for(let i=0;i<count;i++){
   const piece=document.createElement('i');
   const x=5+((i*67+17)%90);
   const wait=(i%11)*.092+(i%3)*.045;
   const drift=((i*41)%80)-40;
   piece.style.setProperty('--x',x+'%');
   piece.style.setProperty('--delay',wait+'s');
   piece.style.setProperty('--drift',drift+'px');
   piece.style.setProperty('--duration',(2.6+((i*17)%17)/10)+'s');
   piece.style.setProperty('--shade',COLORS[i%COLORS.length]);
   piece.style.setProperty('--twist',((i%2)?1:-1)*(260+(i%3)*100)+'deg');
   if(i%4===0)piece.className='bu-daily-finale-sparkle';
   layer.appendChild(piece);
  }
  body.appendChild(layer);
  // Cleaning is not required for gameplay correctness, but avoids hidden clutter.
  window.setTimeout(()=>{layer.remove()},Math.max(tier.duration,5400));
 }
 function start(){
  const root=document.getElementById('bu375-daily');
  const body=document.getElementById('bu375-body');
  if(!root||!body)return;
  let inChange=false;
  function enhance(){
   if(inChange)return;
   const result=body.querySelector(':scope > .bu375-result');
   const home=body.querySelector(':scope > #bu375-home');
   const replay=body.querySelector(':scope > #bu375-again');
   if(!result||!home||!replay){
    body.classList.remove('bu-daily-finale-v1');
    return;
   }
   if(body.classList.contains('bu-daily-finale-v1'))return;
   inChange=true;
   try{
    const scoreNode=result.querySelector('.bu375-result-score');
    const raw=Number.parseInt(scoreNode?.textContent||'',10);
    const score=Number.isFinite(raw)?Math.max(0,Math.min(5,raw)):0;
    const tier=TIERS[score];
    // We only adjust the motivational headline, not the score/reward wording.
    const heading=result.querySelector('.bu375-hero');
    if(heading&&tier.label)heading.textContent=tier.label;

    const emblem=document.createElement('div');
    emblem.className='bu-daily-finale-emblem';
    emblem.setAttribute('aria-hidden','true');
    const img=document.createElement('img');
    img.src='assets/ui/daily-complete-laurel-v1.svg';
    img.alt='';img.draggable=false;
    emblem.appendChild(img);
    for(let i=0;i<6;i++){
     const particle=document.createElement('i');
     particle.style.setProperty('--i',String(i));
     emblem.appendChild(particle);
    }
    result.prepend(emblem);
    const homeName=(home.textContent||'Back to Bible Unfolded').replace(/\s*→\s*$/u,'').trim();
    home.textContent=homeName;
    home.setAttribute('aria-label',homeName);
    const icon=document.createElement('img');
    icon.src='assets/ui/story-gold-restart-v1.svg';
    icon.className='bu-daily-finale-replay-icon';
    icon.alt='';icon.draggable=false;icon.setAttribute('aria-hidden','true');
    replay.prepend(icon);
    body.classList.add('bu-daily-finale-v1');
    body.dataset.buDailyScore=String(score);
    const pref=preference();
    sprinkle(body,score,pref);
    partyAudio(score,pref);
   }finally{inChange=false}
  }
  new MutationObserver(enhance).observe(body,{childList:true,subtree:false});
  enhance();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
})();
