/* Bible Unfolded — Visual Lab ONLY — Family Worship gallery dropdown interiors V3.
 * Based on the earlier Trivia Together cinematic custom selectors.
 * Not a replacement of setup/page handlers: this only decorates the existing
 * #bu-fw-picker-layer after Family Worship's native-backed picker opens.
 * Photographs are isolated COPIES under family-worship-menu-art/v1/.
 * Original Word Challenges/Scholar Research/Bible Book art is never edited.
 * Approved V2 exterior remains frozen. */
(()=>{'use strict';
 if(window.BU_FW_GALLERY_V3)return;
 window.BU_FW_GALLERY_V3=true;
 const TOPIC_ART=Object.freeze({
  "All Bible · Fresh Mix": "family-worship-menu-art/v1/topic-01-all-bible-fresh-mix.webp",
  "Bible People & Events": "family-worship-menu-art/v1/topic-02-bible-people-events.jpg",
  "Jesus & His Teachings": "family-worship-menu-art/v1/topic-03-jesus-his-teachings.jpg",
  "Wisdom, Kingdom & Prophecy": "family-worship-menu-art/v1/topic-04-wisdom-kingdom-prophecy.jpg",
  "Early Congregation": "family-worship-menu-art/v1/topic-05-early-congregation.jpg",
  "Creation": "family-worship-menu-art/v1/topic-06-creation.jpg",
  "Eden": "family-worship-menu-art/v1/topic-07-eden.webp",
  "Cain and Abel": "family-worship-menu-art/v1/topic-08-cain-and-abel.webp",
  "Noah and the Ark": "family-worship-menu-art/v1/topic-09-noah-and-the-ark.jpg",
  "The Tower of Babel": "family-worship-menu-art/v1/topic-10-the-tower-of-babel.webp",
  "Abram’s Journey": "family-worship-menu-art/v1/topic-11-abram-s-journey.jpg",
  "Baby Moses": "family-worship-menu-art/v1/topic-12-baby-moses.webp",
  "Joshua & Jericho": "family-worship-menu-art/v1/topic-13-joshua-jericho.webp",
  "Gideon": "family-worship-menu-art/v1/topic-14-gideon.webp",
  "Ruth & Naomi": "family-worship-menu-art/v1/topic-15-ruth-naomi.webp",
  "David": "family-worship-menu-art/v1/topic-16-david.webp",
  "Solomon": "family-worship-menu-art/v1/topic-17-solomon.webp",
  "Elijah": "family-worship-menu-art/v1/topic-18-elijah.webp",
  "Elisha": "family-worship-menu-art/v1/topic-19-elisha.webp",
  "Esther": "family-worship-menu-art/v1/topic-20-esther.webp",
  "Daniel": "family-worship-menu-art/v1/topic-21-daniel.webp",
  "Jesus’ Early Life": "family-worship-menu-art/v1/topic-22-jesus-early-life.webp",
  "Jesus’ Illustrations": "family-worship-menu-art/v1/topic-23-jesus-illustrations.webp",
  "Jesus’ Miracles": "family-worship-menu-art/v1/topic-24-jesus-miracles.webp",
  "Peter & Early Disciples": "family-worship-menu-art/v1/topic-25-peter-early-disciples.webp",
  "Paul & Timothy": "family-worship-menu-art/v1/topic-26-paul-timothy.webp",
  "Samuel": "family-worship-menu-art/v1/topic-27-samuel.webp",
  "Jonah": "family-worship-menu-art/v1/topic-28-jonah.webp",
  "Nehemiah": "family-worship-menu-art/v1/topic-29-nehemiah.webp",
  "Psalms": "family-worship-menu-art/v1/topic-30-psalms.webp",
  "Proverbs": "family-worship-menu-art/v1/topic-31-proverbs.webp",
  "Sermon on the Mount": "family-worship-menu-art/v1/topic-32-sermon-on-the-mount.jpg",
  "Model Prayer": "family-worship-menu-art/v1/topic-33-model-prayer.webp",
  "Pentecost": "family-worship-menu-art/v1/topic-34-pentecost.webp",
  "Jesus’ Resurrection": "family-worship-menu-art/v1/topic-35-jesus-resurrection.webp",
  "Future Promises": "family-worship-menu-art/v1/topic-36-future-promises.webp",
  "Jehovah’s Qualities": "family-worship-menu-art/v1/topic-37-jehovah-s-qualities.webp",
  "Jesus’ Ministry": "family-worship-menu-art/v1/topic-38-jesus-ministry.webp",
  "Kingdom & Armageddon": "family-worship-menu-art/v1/topic-39-kingdom-armageddon.webp",
  "Bible Prophecy": "family-worship-menu-art/v1/topic-40-bible-prophecy.webp",
  "Job & Integrity": "family-worship-menu-art/v1/topic-41-job-integrity.webp",
  "Christian Living": "family-worship-menu-art/v1/topic-42-christian-living.webp"
});
 const LEVEL_ART=Object.freeze({
  "Beginner": "family-worship-menu-art/v1/level-beginner.webp",
  "Intermediate": "family-worship-menu-art/v1/level-intermediate.webp",
  "Advanced": "family-worship-menu-art/v1/level-advanced.webp",
  "Expert": "family-worship-menu-art/v1/level-expert.webp"
});
 let current=null,choiceObserver=null,lazyObserver=null;
 function cleanOldChallengeStyling(overlay){
   // The old Word Challenges enhancement recognizes "Noah and the Ark"
   // anywhere on the page. Only neutralize its decoration INSIDE our picker.
   for(const b of overlay.querySelectorAll('.bu-fw-picker-option.bu-word-challenge-card')){
     b.classList.remove('bu-word-challenge-card','bu-copy-pseudos');
     b.style.removeProperty('background-image');
     b.style.removeProperty('background-position');
     b.style.removeProperty('background-size');
   }
 }
 function decorate(overlay){
   if(!overlay.isConnected)return;
   const level=overlay.dataset.buFwGallery==='level';
   const assets=level?LEVEL_ART:TOPIC_ART;
   const choices=overlay.querySelectorAll('.bu-fw-picker-option');
   for(const b of choices){
     if(b.dataset.buFwCardV3==='yes')continue;
     const label=b.querySelector(':scope > span:first-child');
     const text=label?.textContent?.trim()||'';
     const asset=assets[text];
     if(!asset){b.dataset.buFwCardV3='unmapped';continue;}
     b.dataset.buFwCardV3='yes';
     b.dataset.buFwArt=asset;
     b.classList.add('bu-fw-gallery-card');
     if(label)label.classList.add('bu-fw-gallery-label');
     const photo=document.createElement('span');
     photo.className='bu-fw-gallery-photo';
     photo.setAttribute('aria-hidden','true');
     b.insertBefore(photo,b.firstChild);
     if(lazyObserver)lazyObserver.observe(b);
     else photo.style.backgroundImage='url("'+asset+'")';
   }
   requestAnimationFrame(()=>cleanOldChallengeStyling(overlay));
 }
 function attach(overlay){
   if(!overlay||overlay===current)return;
   choiceObserver?.disconnect();lazyObserver?.disconnect();
   current=overlay;
   const list=overlay.querySelector('.bu-fw-picker-options');
   if(!list)return;
   const title=overlay.querySelector('#bu-fw-picker-title')?.textContent||'';
   const level=/level/i.test(title);
   overlay.dataset.buFwGallery=level?'level':'topic';
   overlay.classList.add('bu-fw-gallery-mode');
   if(typeof IntersectionObserver==='function'){
     lazyObserver=new IntersectionObserver((entries,io)=>{
       for(const entry of entries){
         if(!entry.isIntersecting)continue;
         const b=entry.target,photo=b.querySelector('.bu-fw-gallery-photo');
         const asset=b.dataset.buFwArt;
         if(photo&&asset)photo.style.backgroundImage='url("'+asset+'")';
         io.unobserve(b);
       }
     },{root:list,rootMargin:'240px 0px',threshold:0});
   }else lazyObserver=null;
   choiceObserver=new MutationObserver(()=>decorate(overlay));
   choiceObserver.observe(list,{childList:true});
   decorate(overlay);
 }
 function check(){
   const el=document.getElementById('bu-fw-picker-layer');
   if(el)attach(el);
   else if(current){
     choiceObserver?.disconnect();lazyObserver?.disconnect();
     choiceObserver=null;lazyObserver=null;current=null;
   }
 }
 function init(){
   if(!document.body)return;
   new MutationObserver(check).observe(document.body,{childList:true});
   check();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();
