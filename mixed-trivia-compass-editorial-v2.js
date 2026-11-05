/* VISUAL LAB ONLY: Mixed Trivia compass panel, editorial hierarchy V2.
   Native data, theme labels, click targets, imagery, leaves and all game
   state are unchanged. Updates one informational paragraph per rerender. */
(()=>{'use strict';
 if(window.BU_MIX_COMPASS_EDITORIAL_V2)return;
 window.BU_MIX_COMPASS_EDITORIAL_V2=true;
 function make(tag,cls,text){
   const el=document.createElement(tag);el.className=cls;
   if(text!=null)el.textContent=text;return el;
 }
 function upgrade(){
   const root=document.getElementById('bu34-body');
   if(!root)return;
   const section=root.querySelector('.bu386-page.bu-mixed-visual .bu-mix-summary');
   if(!section||section.dataset.buMixEditorialV2==='1')return;
   const paragraph=section.querySelector('p');
   const strong=paragraph?.querySelector('strong');
   const count=strong?.textContent?.trim().match(/^([\d,.]+)\s+questions$/i)?.[1];
   const themes=section.querySelector('.bu-mix-themes');
   const title=section.querySelector('h3');
   if(!count||!themes||!title||!paragraph)return;
   // Preserve dynamic bank-count number; never hardcode 1,122.
   const stat=make('div','bu-mix-discovery-stat');
   stat.setAttribute('aria-label',strong.textContent.trim());
   stat.appendChild(make('span','bu-mix-discovery-stat-value',count));
   stat.appendChild(make('span','bu-mix-discovery-stat-label','BIBLE QUESTIONS TO EXPLORE'));
   const invite=make('p','bu-mix-invitation');
   invite.appendChild(make('span','bu-mix-invitation-lead','Explore people, history, prophecy, faith and more.'));
   invite.appendChild(make('em','bu-mix-invitation-coda','A fresh mix awaits every round.'));
   const caption=make('div','bu-mix-discoveries-caption','DISCOVERIES ALONG THE WAY');
   section.dataset.buMixEditorialV2='1';
   paragraph.replaceWith(stat,invite);
   themes.before(caption);
 }
 function install(){
   const root=document.getElementById('bu34-body');
   if(!root)return;
   upgrade();
   new MutationObserver(upgrade).observe(root,{childList:true,subtree:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
 else install();
})();
