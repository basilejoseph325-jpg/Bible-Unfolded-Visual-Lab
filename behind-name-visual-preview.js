/* Bible Unfolded Visual Lab — Behind the Name premium gameplay skin.
   Retains the actual question, answer, score, audio, buttons, and modal behavior.
   Visual rules align with Daily Discovery stone tablets & metallic icon assets. */
(()=>{'use strict';
const css=`
#btn3926-play{background:radial-gradient(ellipse at 50% 18%,#184a53,#0b3340 65%,#061e2b)!important}
#btn3926-play .play-head{background:linear-gradient(180deg,#0b333e,#092a36);border-bottom:1px solid #d8b87699}
#btn3926-play .head-title small{letter-spacing:2px;color:#dcbf85}
#btn3926-play .head-title b{font:700 clamp(22px,5.9vw,29px) Georgia,serif;color:#f7dfaa}
#btn3926-play .btn3926-body{gap:clamp(5px,.85dvh,9px);padding:5px clamp(10px,3vw,16px) max(8px,env(safe-area-inset-bottom))}
#btn3926-play .btn3928-wallet{min-height:32px;margin:5px 12px 1px;border-radius:11px;font-weight:600}
#btn3926-play .btn3926-status{color:#efcf96;font-size:clamp(11px,3vw,14px)}
#btn3926-play .btn3926-rail{height:5px;background:#54727b88}
#btn3926-play .btn3926-rail i{background:linear-gradient(90deg,#d3ad65,#ffdfa0)}
/* Unique identity: an illuminated archival nameplate, not Daily's ordinary question box. */
#btn3926-play .btn3926-question{position:relative;isolation:isolate;flex:1 1 124px;min-height:clamp(98px,17.5dvh,155px);margin:5px 2px 3px;padding:clamp(12px,2dvh,18px) 12px;gap:5px;overflow:hidden;border:2px solid #e2c18c;border-radius:20px;background:radial-gradient(ellipse at 50% 20%,#b58c4c38,transparent 80%),linear-gradient(145deg,#123841f7,#082833f8);box-shadow:inset 0 0 0 4px #102e39,inset 0 0 0 5px #c5a56b66,0 7px 0 #041d28,0 10px 16px #0006}
#btn3926-play .btn3926-question:before,#btn3926-play .btn3926-question:after{content:'';position:absolute;left:30%;width:40%;height:1px;background:linear-gradient(90deg,transparent,#f0d095,transparent);pointer-events:none}
#btn3926-play .btn3926-question:before{top:8px}#btn3926-play .btn3926-question:after{bottom:8px}
#btn3926-play .btn3926-question .btn3926-overline{color:#e8c88f;font-size:clamp(10px,2.7vw,12px);letter-spacing:2.1px}
#btn3926-play .btn3926-question h2{color:#fff0ca;font:700 clamp(19px,5.2vw,27px)/1.17 Georgia,serif;text-shadow:0 2px 8px #000a}
#btn3926-play .btn3926-question .btn-name-hero{display:block;margin:4px auto 0;color:#f2d18b;font:700 clamp(28px,7.6vw,39px)/1.08 Georgia,serif;text-shadow:0 2px 3px #0008,0 0 12px #b9873433}
#btn3926-play .btn3926-icons{gap:clamp(5px,1.3vw,9px);grid-template-columns:repeat(4,minmax(0,1fr));margin:1px 2px}
#btn3926-play .btn3926-icons button{height:clamp(42px,6.5dvh,57px);background:linear-gradient(145deg,#144654,#092e3d);border:1px solid #dcbb81;border-radius:14px;box-shadow:inset 0 1px #ffffff32,0 3px 8px #00121d88}
#btn3926-play .btn3926-icons button img{display:block;object-fit:contain;width:clamp(29px,7.2vw,39px);height:clamp(29px,7.2vw,39px);margin:auto;filter:drop-shadow(0 0 3px #e8b85b65);pointer-events:none}
#btn3926-play #btn3926-progress{font:700 clamp(16px,4.6vw,21px) Georgia,serif}
#btn3926-play .btn3926-answers{flex:1.75 1 270px;min-height:clamp(205px,37dvh,390px);gap:clamp(7px,1.05dvh,12px);margin-top:2px}
/* Same light sandstone and sculpted bevel treatment as Daily Discovery. */
#btn3926-play .btn3926-answer{position:relative;min-height:0;padding:clamp(9px,1.35dvh,15px) clamp(11px,3vw,17px);gap:clamp(10px,3vw,17px);border:3px solid #cbb080;border-radius:17px;background:radial-gradient(ellipse at 15% 3%,#fff0ccaa,transparent 70%),linear-gradient(112deg,#e9d6af,#d8bd8c 54%,#c8a16d);box-shadow:inset 0 0 0 3px #fff1d0d6,inset 0 -5px 8px #89633e37,0 5px 0 #896844,0 8px 14px #0006;color:#263b3f;font:750 clamp(14px,3.75vw,18px)/1.23 system-ui,sans-serif;text-shadow:none;transition:transform .14s}
#btn3926-play .btn3926-answer:nth-child(even){background:radial-gradient(ellipse at 73% 1%,#fff0cf9a,transparent 70%),linear-gradient(110deg,#e9d2a6,#d8bd91 53%,#c9a476)}
#btn3926-play .btn3926-answer span{display:grid;place-items:center;width:clamp(34px,9.3vw,43px);height:clamp(34px,9.3vw,43px);flex:0 0 clamp(34px,9.3vw,43px);border:2px solid #cda96a;border-radius:50%;background:linear-gradient(145deg,#184654,#0b2b38);color:#f5daa0;font:700 clamp(19px,5vw,23px) Georgia,serif;box-shadow:0 2px 5px #0004}
#btn3926-play .btn3926-answer:not(:disabled):active{transform:translateY(2px)}
#btn3926-play .btn3926-answer.is-correct{background:linear-gradient(125deg,#d8ebc3,#89bd9b)!important;color:#153c2f;border-color:#62ab81;box-shadow:inset 0 0 0 3px #eaf5d6,0 4px 0 #407056}
#btn3926-play .btn3926-answer.is-wrong{background:linear-gradient(125deg,#eed3c3,#c98b8c)!important;color:#552e37!important;border-color:#bf6d70!important;opacity:.8}
#btn3926-play .btn3926-feedback{color:#f5e0b9;font-size:clamp(11px,3vw,14px)}
#btn3926-play .btn3926-bottom{min-height:clamp(19px,3.2dvh,30px)}
@media(max-height:710px){#btn3926-play .btn3926-question{min-height:78px;flex-basis:87px;padding:9px 12px}#btn3926-play .btn3926-question h2{font-size:18px}#btn3926-play .btn3926-question .btn-name-hero{font-size:26px}#btn3926-play .btn3926-answers{min-height:185px;flex-basis:205px}#btn3926-play .btn3926-icons button{height:40px}#btn3926-play .btn3926-body{gap:4px}}
@media(max-height:590px){#btn3926-play .btn3926-question{min-height:66px;flex-basis:72px}#btn3926-play .btn3926-answers{min-height:153px;flex-basis:170px}#btn3926-play .btn3926-answer{padding:5px 9px}#btn3926-play .btn3926-answer span{width:29px;height:29px;flex-basis:29px}}
@media(prefers-reduced-motion:reduce){#btn3926-play .btn3926-answer{transition:none}}
`;
function boot(){
 const root=document.getElementById('btn3926-play');if(!root)return;
 if(!document.getElementById('btn-name-premium-style')){const st=document.createElement('style');st.id='btn-name-premium-style';st.textContent=css;document.head.appendChild(st)}
 const icons=[['btn3926-bible','assets/ui/daily-gold-bible-v3.svg'],['btn3926-hint','assets/ui/daily-gold-hint-v3.svg'],['btn3926-info','assets/ui/daily-gold-eye-v3.svg']];
 for(const [id,src]of icons){const button=document.getElementById(id);if(!button)continue;const img=document.createElement('img');img.src=src;img.alt='';img.decoding='async';img.setAttribute('aria-hidden','true');button.replaceChildren(img)}
 const prompt=document.getElementById('btn3926-prompt');if(!prompt)return;
 function decorate(){
  if(prompt.querySelector('.btn-name-hero'))return;
  const t=prompt.textContent.trim();const m=t.match(/^Which meaning belongs to\s+(.+?)\?$/i);
  if(!m)return;
  prompt.replaceChildren(document.createTextNode('Which meaning belongs to'));
  const name=document.createElement('span');name.className='btn-name-hero';name.textContent=m[1]+'?';prompt.appendChild(name);
 }
 new MutationObserver(decorate).observe(prompt,{childList:true});decorate();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
