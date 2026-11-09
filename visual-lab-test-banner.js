/* Visual Lab identity marker — TEST repo only.
 * Lives outside layout flow and never receives pointer events.
 * No changes to navigation, game logic, sound, scrolling or live game. */
(()=>{'use strict';
const id='bu-visual-lab-test-banner';
function install(){
  const home=document.getElementById('home');
  if(!home||home.querySelector('#'+id))return;
  if(!document.getElementById(id+'-style')){
    const style=document.createElement('style');
    style.id=id+'-style';
    style.textContent=
      '#home #'+id+'{position:fixed!important;top:0!important;left:50%!important;'+
      'transform:translateX(-50%)!important;z-index:9999!important;'+
      'box-sizing:border-box!important;display:flex!important;align-items:center!important;justify-content:center!important;'+
      'height:25px!important;min-width:100px!important;padding:0 17px!important;'+
      'border:1px solid #ffe69c!important;border-top:0!important;border-radius:0 0 12px 12px!important;'+
      'background:linear-gradient(135deg,#ffe969 0%,#ffb42d 53%,#ff713b 100%)!important;'+
      'color:#1b2134!important;font:900 14px/1 system-ui,-apple-system,sans-serif!important;'+
      'letter-spacing:.19em!important;text-shadow:0 1px 0 #fff5!important;'+
      'box-shadow:0 3px 12px #00131db3, inset 0 -1px 0 #7c2b0066!important;'+
      'pointer-events:none!important;user-select:none!important;-webkit-user-select:none!important;}';
    document.head.appendChild(style);
  }
  const ribbon=document.createElement('div');
  ribbon.id=id;
  ribbon.textContent='TEST';
  ribbon.setAttribute('aria-label','Test game');
  home.appendChild(ribbon);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
else install();
})();
/* Load new Word Trails selector only within the isolated Visual Lab. */
(()=>{const s=document.createElement('script');s.src='word-trails-next-launcher.js?v=word-trails-home-image-nov09-v2';s.defer=true;document.head.appendChild(s)})();
