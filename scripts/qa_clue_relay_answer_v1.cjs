#!/usr/bin/env node
'use strict';
// Zero-cost free-answer regression. No backend, speech API, storage, or audio.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const puppeteer=require('puppeteer-core'),cp=require('node:child_process');
const rules=require('../experiments/family-clue-relay-rules-v1.js');
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync('experiments/family-clue-relay-questions-v1.js','utf8'),sandbox);
const bank=JSON.parse(JSON.stringify(sandbox.window.BUClueRelayQuestions));
function game(id){const g=rules.create(bank,['First','Second'],2,()=>0.5);g.questions[0]=bank.find(q=>q.id===id);rules.begin(g);return g;}
const furnace=game('cr-furnace');assert.equal(rules.guess(furnace,'furnace').points,3);
const miss=game('cr-bezalel');assert.equal(rules.guess(miss,'Moses').nextClue,2);
assert.equal(rules.familyApprove(miss).points,2);
assert.equal(miss.players[0].score,2);
assert(rules.familyApprove(miss).ignored);assert.equal(miss.players[0].score,2);
const typo=game('cr-bezalel');assert.equal(rules.familyApprove(typo).points,3);
assert.equal(typo.result.familyApproved,true);
assert.equal(typo.players[0].score,3);
const blank=game('cr-noah');assert(rules.guess(blank,' ').error);assert.equal(blank.clue,0);
const ua=process.env.CHROME_BIN||cp.execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim();
const base=process.env.BU_RELAY_URL||'http://127.0.0.1:8896/experiments/family-clue-relay-v1.html';
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:ua,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  for(const [width,height] of [[320,568],[430,932]]){
   const page=await browser.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.setViewport({width,height,isMobile:true,hasTouch:true});
   await page.goto(base,{waitUntil:'load'});
   await page.click('#start-relay');await page.waitForSelector('#begin-round');
   await page.click('#begin-round');await page.waitForSelector('#family-approve');
   const first=await page.$eval('#family-approve',e=>e.textContent);assert(first.includes('Family'));
   await page.click('#family-approve');
   const pending=await page.$eval('#family-approve',e=>e.textContent);assert(pending.includes('Confirm'));
   assert(await page.$('#guess'),'First tap should NOT score or reveal the answer');
   await page.click('#family-approve');
   await page.waitForSelector('#round-result');
   assert.equal(await page.$eval('.score.current b',e=>e.textContent),'3');
   assert.equal(await page.$('#family-approve'),null);
   await page.click('#next-round');await page.waitForSelector('#begin-round');await page.click('#begin-round');
   await page.type('#guess','certainly wrong');await page.click('#submit-guess');
   await page.waitForFunction(()=>document.querySelectorAll('#clue-list .clue').length===2);
   await page.click('#family-approve');await page.click('#family-approve');await page.waitForSelector('#round-result');
   assert.equal(await page.$eval('.score.current b',e=>e.textContent),'2');
   assert.deepEqual(errors,[]);
   console.log('PASS_CLUE_RELAY_FAMILY_APPROVAL',JSON.stringify({width,afterWrongGuess:true,twoStep:true,pointsFirst:3,pointsSecond:2,noPageErrors:true}));
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
