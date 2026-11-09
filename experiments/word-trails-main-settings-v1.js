/* Word Trails settings modal uses the same fields, order, voice clips,
   saved voice preferences, and presentation language as Bible Unfolded.
   Standalone mode needs a dialog host; content comes from the shared settings
   experience. Audio/gameplay remain independent; no layout changes. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const SHARED_AUDIO='bu-platform-audio-preferences-v1';
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch(_){return null}};
const pct=x=>Math.max(0,Math.min(100,Number(x)||0));
function current(){return window.BUWTPolish?.state?.()||{}}
function saveShared(){
 const s=current();
 try{localStorage.setItem(SHARED_AUDIO,JSON.stringify({
  music:!!s.music,sfx:!!s.sfx,musicVolume:pct(s.musicVolume),
  sfxVolume:pct(s.sfxVolume),updated:Date.now(),source:'trails'
 }))}catch(_){}
}
function draw(){
 if(!$('wt-main-settings'))return;
 const state=current();
 for(const name of ['music','sfx','musicVolume','sfxVolume','haptics','motion']){
  const el=$('wt-native-'+name);if(!el)continue;
  const value=name==='motion'?!state.motion:state[name];
  if(el.type==='checkbox')el.checked=!!value;else el.value=String(pct(value));
 }
 $('wt-native-musicVolume-display').textContent=pct(state.musicVolume)+'%';
 $('wt-native-sfxVolume-display').textContent=pct(state.sfxVolume)+'%';
 if(window.BUWTAnnouncer){
  $('wt-voice-mode').value=window.BUWTAnnouncer.getMode();
  $('wt-voice-volume').value=window.BUWTAnnouncer.getVolume();
  $('wt-voice-volume-display').textContent=window.BUWTAnnouncer.getVolume()+'%';
  $('wt-voice-status').textContent=window.BUWTAnnouncer.available()?
   'Original Bible Unfolded voices · noncommercial testing only.':
   'Original voice recordings are being loaded.';
 }
}
function applySharedInitial(){
 const a=read(SHARED_AUDIO);
 if(!a||!window.BUWTPolish?.setPreference)return;
 for(const name of ['music','sfx','musicVolume','sfxVolume']){
  if(Object.prototype.hasOwnProperty.call(a,name))
   window.BUWTPolish.setPreference(name,a[name],{silent:true});
 }
}
function open(){
 const d=$('wt-main-settings');if(!d)return;
 draw();if(!d.open)d.showModal();
}
function close(){const d=$('wt-main-settings');if(d?.open)d.close()}
function make(){
 if($('wt-main-settings'))return;
 const d=document.createElement('dialog');d.id='wt-main-settings';
 d.setAttribute('aria-labelledby','wt-settings-title');
 d.innerHTML=[
  '<div class="wt-shared-settings-panel">',
  '<button type="button" class="dialog-x" id="wt-settings-x" aria-label="Close settings">×</button>',
  '<div class="overline">PERSONALIZE THE JOURNEY</div>',
  '<h2 id="wt-settings-title">Settings</h2>',
  '<small class="music-note">Bible Unfolded · Word Trails · Noncommercial Beta</small>',
  '<label class="setting-row"><span><b>Music</b><small>Background soundtrack</small></span><input id="wt-native-music" data-wt-setting="music" type="checkbox"></label>',
  '<label class="setting-row"><span><b>Sound Effects</b><small>Letters and discoveries</small></span><input id="wt-native-sfx" data-wt-setting="sfx" type="checkbox"></label>',
  '<label class="setting-volume"><b>Music volume</b><input id="wt-native-musicVolume" data-wt-setting="musicVolume" type="range" min="0" max="100"><span id="wt-native-musicVolume-display">75%</span></label>',
  '<label class="setting-volume"><b>Sound effects volume</b><input id="wt-native-sfxVolume" data-wt-setting="sfxVolume" type="range" min="0" max="100"><span id="wt-native-sfxVolume-display">75%</span></label>',
  '<div class="bu383-sfx-preview"><button type="button" id="wt-preview-chime">▶ Hear word-complete sound</button></div>',
  '<div class="bu381-voice-controls">',
    '<div class="bu381-voice-label">VOICE ANNOUNCEMENTS <span class="bu381-private">NONCOMMERCIAL TEST</span></div>',
    '<label class="setting-row"><span><b>Announcer</b><small>Off, rotating voices, or one favorite speaker</small></span>',
    '<select id="wt-voice-mode" aria-label="Voice announcer">',
    '<option value="rotate">Rotate voices (default)</option><option value="off">Off</option>',
    '<option value="charlie">Charlie</option><option value="paul">Paul</option>',
    '<option value="toby">Toby</option><option value="julian">Julian</option></select></label>',
    '<label class="setting-volume"><b>Voice volume</b><input id="wt-voice-volume" type="range" min="0" max="100"><span id="wt-voice-volume-display">65%</span></label>',
    '<div class="bu381-preview"><button type="button" id="wt-voice-preview">▶ Hear a voice sample</button>',
    '<small id="wt-voice-status" aria-live="polite" role="status"></small></div>',
    '<small class="music-note">Free-plan demonstration voices generated with <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer">elevenlabs.io</a>. Noncommercial testing only; final commercial recordings must be regenerated under an eligible paid plan.</small>',
  '</div>',
  '<div class="setting-volume"><b>Original Bible Unfolded Soundtracks</b><small class="music-note">Original instrumental themes for Navigation, Story Adventure, Word Trails, Daily Discovery, Word Builder, and Family Worship. Music is on by default. On mobile, playback may begin after your first tap.</small></div>',
  '<label class="setting-row"><span><b>Reduced motion</b><small>Limit decorative animation</small></span><input id="wt-native-motion" data-wt-setting="motion" data-invert="true" type="checkbox"></label>',
  '<label class="setting-row"><span><b>Vibration feedback</b><small>When supported by your phone</small></span><input id="wt-native-haptics" data-wt-setting="haptics" type="checkbox"></label>',
  '<div class="bu383-sfx-preview"><button type="button" id="wt-more-sounds">♫ More sound and effects previews</button></div>',
  '<div class="save-transfer"><b>Move your progress to another device</b><p>Use the main Bible Unfolded Settings screen to export or import a complete backup, including chapters and shared rewards.</p><button type="button" id="wt-open-main-settings">Open shared backup controls</button></div>',
  '<button type="button" id="wt-settings-done" class="gold-button">Done</button>',
  '</div>'
 ].join('');
 document.body.append(d);
 $('wt-settings-x').onclick=close;$('wt-settings-done').onclick=close;
 d.addEventListener('click',e=>{if(e.target===d)close()});
 d.addEventListener('input',e=>{
  const el=e.target.closest?.('[data-wt-setting]');
  if(el&&el.type==='range'){
   window.BUWTPolish?.setPreference?.(el.dataset.wtSetting,Number(el.value));
   $('wt-native-'+el.dataset.wtSetting+'-display').textContent=el.value+'%';
   saveShared();
  }
 });
 d.addEventListener('change',e=>{
  const el=e.target.closest?.('[data-wt-setting]');
  if(el){
   const val=el.type==='checkbox'?el.checked:Number(el.value);
   window.BUWTPolish?.setPreference?.(el.dataset.wtSetting,el.dataset.invert? !val:val);
   saveShared();draw();
  }
 });
 $('wt-preview-chime').onclick=()=>window.BUWTPolish?.cue?.('correct');
 $('wt-voice-mode').onchange=()=>{
  window.BUWTAnnouncer?.change?.($('wt-voice-mode').value,undefined);
  draw();if($('wt-voice-mode').value!=='off')window.BUWTAnnouncer?.play?.('excellent_thinking',{preview:true});
 };
 $('wt-voice-volume').oninput=()=>{
  window.BUWTAnnouncer?.change?.($('wt-voice-mode').value,Number($('wt-voice-volume').value));
  $('wt-voice-volume-display').textContent=$('wt-voice-volume').value+'%';
 };
 $('wt-voice-preview').onclick=()=>window.BUWTAnnouncer?.play?.('excellent_thinking',{preview:true});
 $('wt-more-sounds').onclick=()=>{close();window.BUWTPolish?.openSettings?.()};
 $('wt-open-main-settings').onclick=()=>{close();location.assign('../index.html?wt_nav=settings')};
 window.addEventListener('bu-wt-voice-change',draw);
 applySharedInitial();draw();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',make,{once:true});else make();
window.BUWTMainSettings=Object.freeze({open,close,draw,sharedAudioKey:SHARED_AUDIO});
})();