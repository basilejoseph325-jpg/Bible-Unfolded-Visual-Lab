#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),p=require('puppeteer-core'),fs=require('node:fs');
(async()=>{const b=await p.launch({executablePath:process.env.CHROME_BIN||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});try{
const page=await b.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(process.env.STORY_URL||'http://127.0.0.1:8893/index.html',{waitUntil:'load',timeout:120000});
const ledger=JSON.parse(fs.readFileSync('docs/STORY_ADVENTURE_EDITORIAL_REVIEW.json','utf8'));
for(const id of ['exodus-10','exodus-11','exodus-12'])for(let step=0;step<10;step++){
 const result=await page.evaluate(({id,step})=>{
  bu3857Open(id,true);bu3857State.step=step;bu3857Render();economy.coins=100;saveEconomy();
  const d=bu3857Current(),start=economy.points;
  document.getElementById('bu3857-hint').click();
  if(economy.coins!==100)throw Error('Free hint charged '+d.id);
  const buy=()=>{const e=document.querySelector('#bu3864-modal-layer .bu3864-modal-body .gold-button');if(!e||e.hidden)throw Error('Missing paid stage '+d.id);e.click()};
  buy();if(economy.coins!==85)throw Error('Wrong second-stage price '+d.id);
  buy();if(economy.coins!==55)throw Error('Wrong third-stage price '+d.id);
  if(!document.getElementById('bu3864-modal-layer').textContent.includes(d.progressiveHints[2].text))throw Error('Third clue was not delivered '+d.id);
  document.getElementById('bu3864-modal-layer').buClose();document.getElementById('bu3857-hint').click();
  if(economy.coins!==55||economy.points!==start)throw Error('Reopen charged or hints changed Points '+d.id);
  document.getElementById('bu3864-modal-layer').buClose();
  return {id:d.id,third:d.progressiveHints[2].text};
 },{id,step});
 const entry=ledger.find(e=>e.id===result.id&&e.field==='progressiveHints[2].text');assert(entry);assert.equal(result.third,entry.after);
}
const sources=await page.evaluate(()=>{focusHome();startChapter('noah',false,true);stage=7;render();document.getElementById('scene-scripture').click();return {range:BEATS[stage].reference,preview:document.getElementById('bu3898-scripture-layer').textContent,flashback:BU3857_DATA.genesis_ep10.discoveries[1].narration,firstHint:BU28_STORY_HINTS.genesis.BEGINNING}});
assert.equal(sources.range,'Genesis 8:6–12');assert(sources.preview.includes('Genesis 8:6–12'));assert(sources.flashback.includes('look back'));assert(!sources.firstHint.includes('planet'));
assert.deepEqual(errors,[]);console.log('PASS_STORY_EDITORIAL_HINTS',JSON.stringify({exodusDiscoveries:30,paidStages:60,freeHints:30,noRepeatCharges:30,prices:[0,15,30],pointsUnaffected:true,noahReferenceCorrect:true,genesisFlashbackClear:true,independentHumanReview:false}));
}finally{await b.close()}})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
