#!/usr/bin/env node
'use strict';
// Authored review ledger asserts integration, not human acceptance or phone testing.
const fs=require('node:fs'),assert=require('node:assert/strict'),p=require('puppeteer-core');
const ledger=JSON.parse(fs.readFileSync('docs/STORY_ADVENTURE_DISCOVERY_REVIEW_2026-11-15.json'));
assert.equal(ledger.records.length,108);assert.equal(new Set(ledger.records.map(r=>r.id)).size,108);
assert.equal(ledger.sceneIntroductions.length,84);assert.equal(Object.keys(ledger.finales).length,8);
for(const r of [...ledger.records,...ledger.sceneIntroductions]){assert(r.sourceKeys.length,r.id);for(const k of r.sourceKeys){const s=ledger.sources[k];assert(s&&s.url.startsWith('https://www.jw.org/'),k);assert.match(s.snapshotSha256,/^[a-f0-9]{64}$/);}}
for(const r of ledger.records)assert(r.reviewNote.length>60,r.id);
(async()=>{const browser=await p.launch({executablePath:process.env.CHROME_BIN||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});try{
const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(process.env.STORY_URL||'http://127.0.0.1:8893/index.html',{waitUntil:'load',timeout:120000});await page.waitForFunction(()=>typeof bu3857Open==='function');
const data=await page.evaluate(()=>({early:{genesis:GENESIS_BEATS,eden:EDEN_BEATS,cain:CAIN_BEATS,noah:NOAH_BEATS,babel:BABEL_BEATS,abraham:ABRAHAM_BEATS,moses:MOSES_BEATS,moses_midian:MOSES_MIDIAN_BEATS,moses_bush:MOSES_BUSH_BEATS},modern:BU3857_DATA,words:BU_HQ_WORDS}));
for(const r of ledger.records){
 if(r.id.includes(':')){const [book,i]=r.id.split(':'),v=data.early[book][+i];assert.equal(v.word,r.answer);for(const [k,text] of Object.entries(r.after))assert.deepEqual(v[k],text,r.id+' '+k);}
 else{const v=data.modern[r.chapter].discoveries.find(d=>d.id===r.id);assert.equal(data.words[r.id].answer,r.answer);for(const [k,text] of Object.entries(r.after))assert.deepEqual(k==='word'?data.words[r.id]:v[k],text,r.id+' '+k);}
}
for(const r of ledger.sceneIntroductions){const [book,i]=r.id.split(':');assert.equal(data.early[book][+i].narration,r.narration);}
for(const [id,text] of Object.entries(ledger.finales))assert.equal(data.modern[id].completionMessage,text);
for(const [book,i] of [['genesis',1],['cain',5],['moses',4],['moses_bush',9]]){
 const text=await page.evaluate(({book,i})=>{focusHome();startChapter(book,false,true);stage=i;render();bu3894SceneContext();const layer=document.getElementById('bu3864-modal-layer'),text=layer.textContent;layer.buClose();return text},{book,i});assert(text.includes(data.early[book][i].narration));
}
const links=await page.evaluate(()=>{
 focusHome();startChapter('moses',false,true);stage=4;render();document.getElementById('scene-scripture').focus();document.getElementById('scene-scripture').click();
 const read=()=>[...document.querySelectorAll('#bu3898-scripture-layer a')].map(a=>({text:a.textContent,href:a.href}));const miriam=read();document.getElementById('bu3898-scripture-layer').buClose();const restored=document.activeElement.id;
 const modern=(id,i)=>{bu3857Open(id,true);bu3857State.step=i;bu3857Render();document.getElementById('bu3863-scripture').click();const out=read();document.getElementById('bu3898-scripture-layer').buClose();return out;};
 return {miriam,restored,purchase:modern('genesis_ep09',0),worship:modern('genesis_ep09',4)};
});
assert.deepEqual(links.miriam.map(x=>x.href),['https://www.jw.org/en/library/bible/nwt/books/exodus/2/','https://www.jw.org/en/library/bible/nwt/books/numbers/26/','https://www.jw.org/en/library/bible/nwt/books/exodus/15/']);assert.equal(links.restored,'scene-scripture');
assert.deepEqual(links.purchase.map(x=>x.href),['https://www.jw.org/en/library/bible/nwt/books/genesis/23/','https://www.jw.org/en/library/bible/nwt/books/genesis/24/']);assert(links.worship[1].text.includes('Genesis 24:47–48'));assert(links.worship.every(x=>x.href.endsWith('/genesis/24/')));assert.equal(new URL(page.url()).hostname,'127.0.0.1');
assert.deepEqual(errors,[]);console.log('PASS_STORY_REVIEW_INTEGRATION',JSON.stringify({remainingDiscoveries:108,sceneIntroductions:84,chapterEndingMessages:8,sourceReceipts:Object.keys(ledger.sources).length,compoundBibleLinks:true,focusRestored:true,independentHumanReview:false,physicalPhones:false}));
}finally{await browser.close()}})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
