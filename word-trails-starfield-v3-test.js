/* Visual Lab ONLY — Word Trails completion visual V3.
   Faithfully adapts Story Adventure bu3814's 18-point gold-angle spark bursts
   and breathing revealTwinkle, with a transparent gold vector centerpiece.
   Decorative DOM only: no puzzle logic, scoring, audio, handlers or reward edits. */
(()=>{
 'use strict';
 const ROOT='xword-content';
 const STAGE='.xword-finish.trail-finish > .trail-victory-star';
 const starSvg=`<svg class="wt-star-v3-core" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144" role="presentation" aria-hidden="true" focusable="false">
  <defs>
   <radialGradient id="wt-star-v3-bloom"><stop stop-color="#fff9d6" stop-opacity=".62"/><stop offset=".30" stop-color="#ffe1a1" stop-opacity=".32"/><stop offset="1" stop-color="#e9b45c" stop-opacity="0"/></radialGradient>
   <linearGradient id="wt-star-v3-gold" x1=".23" y1=".08" x2=".82" y2=".94" gradientUnits="objectBoundingBox"><stop stop-color="#fff9db"/><stop offset=".29" stop-color="#ffedb3"/><stop offset=".57" stop-color="#dfb16b"/><stop offset=".80" stop-color="#b97d3c"/><stop offset="1" stop-color="#ffe5a3"/></linearGradient>
   <linearGradient id="wt-star-v3-ray" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#faeac6" stop-opacity="0"/><stop offset=".50" stop-color="#ffe4a6" stop-opacity=".72"/><stop offset="1" stop-color="#faeac6" stop-opacity="0"/></linearGradient>
  </defs>
  <circle cx="72" cy="72" r="70" fill="url(#wt-star-v3-bloom)"/>
  <g class="wt-star-v3-rays" fill="none" stroke="#ffe9ad" stroke-linecap="round">
   <path d="M72 9V37 M72 107V135 M9 72H37 M107 72H135" stroke-width="1.1" opacity=".62"/>
   <path d="M27 27L48 48 M96 96L117 117 M117 27L96 48 M48 96L27 117" stroke-width=".9" opacity=".35"/>
  </g>
  <path d="M72 15C80 55 88 64 129 72C87 80 80 90 72 129C64 89 56 80 15 72C56 64 64 55 72 15Z" fill="#7e502a" opacity=".42" transform="translate(0 2)"/>
  <path d="M72 15C80 55 88 64 129 72C87 80 80 90 72 129C64 89 56 80 15 72C56 64 64 55 72 15Z" fill="url(#wt-star-v3-gold)"/>
  <path d="M72 15C64 55 56 64 15 72C56 69 68 70 72 72Z" fill="#fffce4" opacity=".80"/>
  <path d="M72 72C79 70 95 72 129 72C92 79 80 89 72 129Z" fill="#b98244" opacity=".28"/>
  <circle cx="72" cy="72" r="5" fill="#fffbe6" opacity=".65"/>
 </svg>`;
 function upgrade(){
  const root=document.getElementById(ROOT);
  const stage=root?.querySelector(STAGE);
  if(!stage || stage.classList.contains('wt-star-v3'))return;
  stage.classList.add('wt-star-v3');
  stage.setAttribute('aria-hidden','true');
  stage.insertAdjacentHTML('beforeend',starSvg);
  const field=document.createElement('span');
  field.className='wt-star-v3-field';
  field.setAttribute('aria-hidden','true');
  // Original Story Adventure's true particle distribution: golden angle,
  // eighteen small motes, alternating radii, slight stagger in their burst.
  for(let i=0;i<18;i++){
   const theta=i*137.5*Math.PI/180;
   const radius=(65+(i%4)*17)*.65;
   const mote=document.createElement('i');
   mote.style.setProperty('--wt-dx',(Math.cos(theta)*radius).toFixed(2)+'px');
   mote.style.setProperty('--wt-dy',(Math.sin(theta)*radius).toFixed(2)+'px');
   mote.style.setProperty('--wt-delay',(-((i%9)*.53)).toFixed(2)+'s');
   field.appendChild(mote);
  }
  stage.appendChild(field);
 }
 function start(){
  const root=document.getElementById(ROOT);
  if(!root)return;
  upgrade();
  // Native crossRender recreates completion markup after wins and replays.
  // One scoped observer attaches the decoration to the newly created star.
  new MutationObserver(upgrade).observe(root,{childList:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
})();
