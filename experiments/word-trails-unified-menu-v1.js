/* Bible Unfolded / Word Trails NEXT — Shared Menu Bridge.
   VISUAL LAB ONLY.  No layout changes. Reuses native wheel entitlements.
   Actual Word Trails test coins remain in their original separate save. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const nativeShell=()=>{try{return parent!==window&&parent.BUWTNativeShell?.active?.()?parent.BUWTNativeShell:null}catch(_){return null}};
const STYLES=[
 {id:'classic',name:'Classic Puzzle Wheel',desc:'Original finish, always free',cost:0,mark:'◯'},
 {id:'goldwheel',name:'Golden Puzzle Wheel',desc:'A softly glowing golden wheel',cost:180,mark:'✦'},
 {id:'moonwheel',name:'Moonlit Puzzle Wheel',desc:'Cool silver-blue moonlight',cost:135,mark:'☾'},
 {id:'seawheel',name:'Ocean Glow Wheel',desc:'Luminous turquoise and teal',cost:235,mark:'≈'}
];
const IDS=new Set(STYLES.map(x=>x.id));
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch(_){return null}};
// All wallet, permanent purchase and equipped-wheel logic now comes from
// the exact same shared service loaded by the TEST homepage.
const platform=()=>window.BUPlatformRewards;
function wallet(){return platform()?.wallet()||null}
function owned(){return new Set(platform()?.owned()||['classic'])}
function currentTheme(){return platform()?.currentTheme()||'classic'}
function apply(theme){
 const id=IDS.has(theme)?theme:'classic';
 document.documentElement.classList.toggle('gold-wheel',id==='goldwheel');
 document.documentElement.classList.toggle('moon-wheel',id==='moonwheel');
 document.documentElement.classList.toggle('sea-wheel',id==='seawheel');
}
function status(msg){if($('wt-menu-status'))$('wt-menu-status').textContent=msg}
function equip(id){
 const api=platform();
 if(!api){status('Shared Rewards service unavailable. No change was made.');return false}
 const result=api.equipWheel(id);
 if(!result.ok){
  status(result.reason==='not-owned'?'That wheel has not been unlocked yet.':
    result.reason==='wallet-unavailable'?'Please open the main Bible Unfolded Rewards screen to initialize your wallet.':
    'Wheel choice was not saved. Your previous rewards and balance are unchanged.');
  refresh();return false;
 }
 apply(api.currentTheme());refresh();
 status('✓ '+STYLES.find(s=>s.id===id).name+' equipped across Bible Unfolded.');
 return true;
}
function refresh(){
 apply(currentTheme());
 const w=wallet(),balance=$('wt-shared-wallet');
 if(balance)balance.textContent=w?'◉ '+Math.floor(w.coins).toLocaleString()+' Insight Tokens   ·   ✦ '+Math.floor(w.points).toLocaleString()+' Points':
  'Your shared rewards are on the Bible Unfolded home screen';
 const test=$('wt-test-wallet'),save=read('bu-visual-lab-wordtrails-next-v1');
 if(test)test.textContent='Word Trails test coins: '+(save?.coins??'—')+' (separate)';
 const view=$('wt-wheel-rewards');if(!view)return;
 view.replaceChildren();
 const available=owned(),equipped=currentTheme();
 for(const style of STYLES){
  const card=document.createElement('article');card.className='wt-wheel-item'+(equipped===style.id?' active':'');
  const symbol=document.createElement('span');symbol.className='wt-wheel-symbol';symbol.dataset.style=style.id;symbol.textContent=style.mark;
  const content=document.createElement('span');content.className='wt-wheel-copy';
  const name=document.createElement('strong');name.textContent=style.name;
  const desc=document.createElement('small');desc.textContent=style.desc;
  content.append(name,desc);
  const btn=document.createElement('button');btn.type='button';btn.className='wt-wheel-action';
  if(equipped===style.id){btn.textContent='✓ Equipped';btn.disabled=true}
  else if(available.has(style.id)){btn.textContent='Equip';btn.addEventListener('click',()=>equip(style.id))}
  else{btn.textContent='◉ '+style.cost;btn.title='Unlock in the shared Rewards Shop';
   btn.addEventListener('click',()=>status(style.name+' must be unlocked in the full Rewards Shop. Use the button below.'))}
  card.append(symbol,content,btn);view.appendChild(card);
 }
}
function show(view='menu',{local=false}={}){
 const native=nativeShell();
 if(native&&!local){close();if(view==='menu')return native.openMenu();if(view==='help')return show('help',{local:true});}
 const dlg=$('wt-unified-menu');if(!dlg)return;
 if(!dlg.open)dlg.showModal();
 for(const panel of dlg.querySelectorAll('[data-menu-view]'))panel.hidden=panel.dataset.menuView!==view;
 $('wt-menu-back').hidden=view==='menu';
 $('wt-menu-title').textContent=view==='menu'?'Bible Unfolded':view==='rewards'?'Rewards':'How to Play';
 status('');refresh();
}
function close(){if($('wt-unified-menu')?.open)$('wt-unified-menu').close()}
function go(target){
 close();window.location.assign('../index.html'+(target?'?wt_nav='+encodeURIComponent(target):''));
}
function perform(action){
 switch(action){
  case 'continue':close();break;
  case 'back':show('menu');break;
  case 'levels':close();$('level-map')?.click();break;
  case 'rewards':show('rewards');break;
  case 'settings':close();if(window.BUWTMainSettings)window.BUWTMainSettings.open();else window.BUWTPolish?.openSettings();break;
  case 'help':show('help');break;
  case 'home':go('');break;
  case 'journey':go('journey');break;
  case 'gallery':go('gallery');break;
  case 'about':go('about');break;
  case 'shop':go('rewards');break;
 }
}
function build(){
 if($('wt-unified-menu'))return;
 const dlg=document.createElement('dialog');dlg.id='wt-unified-menu';
 dlg.setAttribute('aria-label','Bible Unfolded shared game menu');
 dlg.innerHTML=[
 "<div class='wt-menu-shell'>",
 "<header class='wt-menu-header'><button type='button' id='wt-menu-back' data-wt-menu='back' aria-label='Back to menu' hidden>‹</button><div class='wt-menu-titleblock'><span>BIBLE UNFOLDED · TEST</span><h2 id='wt-menu-title'>Bible Unfolded</h2></div><button id='wt-menu-close' type='button' data-wt-menu='continue' aria-label='Close menu'>×</button></header>",
 "<section data-menu-view='menu' class='wt-menu-main'><div class='wt-menu-wallet' id='wt-shared-wallet'></div><div class='wt-menu-testwallet' id='wt-test-wallet'></div><nav class='wt-menu-links' aria-label='Bible Unfolded navigation'>",
 "<button data-wt-menu='continue'><span>▶</span><strong>Continue Playing</strong><small>Resume your current crossword</small></button>",
 "<button data-wt-menu='journey'><span>✧</span><strong>Journey Path</strong><small>See your Bible journey</small></button>",
 "<button data-wt-menu='levels'><span>▦</span><strong>Levels</strong><small>Browse Word Trails puzzles</small></button>",
 "<button data-wt-menu='gallery'><span>✧</span><strong>Discovery Gallery</strong><small>Revisit unlocked scenes</small></button>",
 "<button data-wt-menu='rewards'><span>★</span><strong>Rewards</strong><small>Wheel styles, Insight Tokens and prizes</small></button>",
 "<button data-wt-menu='settings'><span>♫</span><strong>Settings</strong><small>Music, sounds, effects and vibration</small></button>",
 "<button data-wt-menu='help'><span>?</span><strong>How to Play</strong><small>Bible words, bonus words and hints</small></button>",
 "<button data-wt-menu='about'><span>ⓘ</span><strong>About Me</strong><small>Our purpose and feedback</small></button>",
 "<button data-wt-menu='home'><span>⌂</span><strong>Cover Screen</strong><small>Return to the beginning</small></button>",
 "</nav><p class='wt-menu-foot'>This menu uses the same wheel rewards as the other Bible Unfolded modes.</p></section>",
 "<section data-menu-view='rewards' class='wt-menu-rewards' hidden><p class='wt-menu-intro'>Choose an unlocked style to change your Word Trails wheel right now. These are your existing Bible Unfolded rewards.</p><div id='wt-wheel-rewards'></div><button type='button' class='wt-menu-gold' data-wt-menu='shop'>★ Open Full Rewards Shop</button><p class='wt-menu-foot'>Wheel purchases use shared Insight Tokens, not Word Trails test coins. You will not be charged again for a wheel you own.</p></section>",
 "<section data-menu-view='help' class='wt-menu-help' hidden><h3>Word Trails</h3><p>Swipe letters on the wheel to fill the intersecting crossword. You can also tap letters and press Enter.</p><p><strong>★ Bible Word Hunt:</strong> Find hidden Bible names, places, and other Scripture words. Open the star for clues and discoveries.</p><p><strong>✦ Bonus words:</strong> Find extra words to earn test coins. Three bonus words fill the satchel.</p><p><strong>Hints:</strong> Your first hint is free; later hints cost test coins.</p><button type='button' data-wt-menu='continue' class='wt-menu-gold'>Back to Puzzle</button></section>",
 "<p id='wt-menu-status' class='wt-menu-status' role='status' aria-live='polite'></p></div>"
 ].join('');
 document.body.appendChild(dlg);
 dlg.addEventListener('click',event=>{
  const btn=event.target.closest('[data-wt-menu]');
  if(btn){event.preventDefault();perform(btn.dataset.wtMenu)}
  else if(event.target===dlg)close();
 });
}
function init(){
 build();refresh();
 const back=document.querySelector('#app .back');
 if(back)back.addEventListener('click',event=>{
  const native=nativeShell();if(!native)return;
  event.preventDefault();event.stopImmediatePropagation();
  native.close(); // Exit the real native shell; never load another homepage inside the frame.
 },true);
 const trigger=$('audio');if(trigger){
  trigger.textContent='☰';trigger.title='Bible Unfolded menu';
  trigger.setAttribute('aria-label','Open Bible Unfolded menu');
  trigger.setAttribute('aria-pressed','false');
 }
 window.addEventListener('storage',event=>{
  if(Object.values(platform()?.keys||{}).includes(event.key))refresh();
 });
 window.addEventListener('bu-platform-rewards-change',refresh);
 window.addEventListener('pageshow',refresh);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.BUWTUnifiedMenu=Object.freeze({open:()=>show('menu'),show,showLocal:(view)=>show(view,{local:true}),equip,refresh,
 owned:()=>[...owned()],currentTheme,wallet,themeIds:STYLES.map(s=>s.id)});
})();