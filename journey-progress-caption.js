/* Preserve the existing Journey layout and dynamic progress. Change caption words only. */
(()=>{'use strict';
const re=/(\d+)\s+of\s+(\d+)/i;
let writing=false;
function update(){
 if(writing)return;
 const el=document.getElementById('journey-progress-label');
 if(!el)return;
 const match=(el.textContent||'').match(re);
 if(!match)return;
 const text=match[1]+' of '+match[2]+' Episodes Complete';
 if(el.textContent===text)return;
 writing=true;el.textContent=text;writing=false;
}
function boot(){const el=document.getElementById('journey-progress-label');if(!el)return;new MutationObserver(update).observe(el,{childList:true,characterData:true,subtree:true});update();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

/* Shared, versioned audio loader — identical in TEST and LIVE. */
(()=>{if(document.getElementById('bu-premium-sfx-test'))return;const s=document.createElement('script');s.id='bu-premium-sfx-test';s.src='premium-sfx.js?v=20261104-unified-audio-v1';document.head.appendChild(s)})();

/* TEST-ONLY Daily Discovery question styling; does not affect answer/explanation modal. */
(()=>{if(document.getElementById('bu-daily-question-visual'))return;const l=document.createElement('link');l.id='bu-daily-question-visual';l.rel='stylesheet';l.href='daily-discovery-question-premium.css?v=20261104-weathered-sandstone-v3';document.head.appendChild(l)})();

/* Visual Lab ONLY: home screen TEST label; no layout or input interception. */
(()=>{if(document.getElementById('bu-test-home-loader'))return;const s=document.createElement('script');s.id='bu-test-home-loader';s.src='visual-lab-test-banner.js?v=20261104-test-ribbon-v1';document.head.appendChild(s)})();

/* TEST ONLY: isolate Story Adventure legacy knock during chapter entry and word-wheel swipe. */
(()=>{if(document.getElementById('bu-story-gesture-audio-guard'))return;const s=document.createElement('script');s.id='bu-story-gesture-audio-guard';s.src='story-gesture-audio-guard.js?v=20261104-story-gesture-v1';document.head.appendChild(s)})();
