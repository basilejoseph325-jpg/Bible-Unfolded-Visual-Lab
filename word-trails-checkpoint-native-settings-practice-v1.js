/* Bible Unfolded Visual Lab — TEST-ONLY native Settings checkpoint rehearsal link.
 * Root original Settings owns save/export/import; this adds ONE informational
 * hyperlink beside its existing Save controls without intercepting any action.
 * The destination runs synthetic Map-backed progress and cannot access actual
 * game storage. No localStorage reads/writes, token/wheel/voice changes, or
 * automatic progress transfers here. Not intended for original LIVE.
 */
(()=>{'use strict';
if(window.BUWTCheckpointSettingsPracticeV1)return;
const ID='bu-wt-checkpoint-practice-native-link';
const URL_PATH='experiments/word-trails-checkpoint-rehearsal-v2.html';
function install(){
 if(document.getElementById(ID))return true;
 const saveBtn=document.getElementById('save-export');
 const native=saveBtn?.closest('.save-transfer');
 const settings=document.getElementById('settings-dialog');
 if(!native||!settings||!settings.contains(native))return false;
 const link=document.createElement('a');
 link.id=ID;
 link.href=new URL(URL_PATH,document.baseURI).href;
 link.target='_blank';
 link.rel='noopener noreferrer';
 link.setAttribute('aria-label','Open safe Word Trails backup and recovery practice in a new tab, TEST only');
 link.textContent='Practice Word Trails backup and recovery (TEST only)';
 link.style.cssText='display:inline-block;margin-top:8px;max-width:100%;font:600 12px/1.45 system-ui,-apple-system,sans-serif;color:#f1d294;text-decoration:underline;text-underline-offset:3px;overflow-wrap:anywhere;';
 link.title='Opens a separate demonstration using fictional crossword progress. Your saved game and native backup will not change.';
 const note=document.createElement('small');
 note.id=ID+'-note';
 note.textContent='Safe example only — it doesn\'t use your real saves.';
 note.style.cssText='display:block;margin-top:4px;color:inherit;opacity:.78;font:400 11px/1.35 system-ui,-apple-system,sans-serif;';
 native.append(link,note);
 return true;
}
let attempts=0;
function bind(){
 if(install())return;
 if(attempts++<70)setTimeout(bind,250);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});
else bind();
window.BUWTCheckpointSettingsPracticeV1=Object.freeze({
 version:'1.0.0-test-only',linkId:ID,practicePath:URL_PATH,install
});
})();