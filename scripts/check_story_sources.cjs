#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const parts=Array.from({length:5},(_,i)=>{const source=fs.readFileSync('bible_unfolded_core_part'+(i+1)+'.js','utf8');new vm.Script(source);return JSON.parse(source.match(/__BU_STAGE41_CORE_PARTS__\[\d+\] = (".*")\s*;/s)[1])});
const core=parts.join('');new vm.Script(core);
const html=fs.readFileSync('index.html','utf8');let count=0;
for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
 if(/\bsrc\s*=|application\/(?:json|ld\+json)/i.test(match[1]))continue;
 new vm.Script(match[2],{filename:'inline-'+(++count)});
}
for(const path of ['story-chapter-complete-v2-test.js','scripts/qa_story_adventure_release.cjs'])new vm.Script(fs.readFileSync(path,'utf8'),{filename:path});
const data=JSON.parse(fs.readFileSync('story-adventure-content/genesis-episode11-haran-v1.json','utf8'));
assert.equal(data.discoveries.length,10);
for(const d of data.discoveries){assert.equal(data.words[d.id].answer,d.interaction.answer);assert.equal(d.progressiveHints.length,3);assert(fs.existsSync('story-adventure-art/genesis11/'+d.id+'.webp'));}
const edits=JSON.parse(fs.readFileSync('docs/STORY_ADVENTURE_EDITORIAL_REVIEW.json','utf8'));
for(const e of edits){assert(e.before!==e.after);assert(e.answerChanged===false);assert(e.source.every(s=>s.url.startsWith('https://www.jw.org/')));assert(core.includes(e.after)||core.includes(JSON.stringify(e.after).slice(1,-1)),'Missing integrated edit '+e.id);}
assert(!core.includes("e.target.closest('#hint,#scene-hint,#trail-hint,#cross-hint')"));
assert(core.includes('entries[beat.word]'),'Hint matching must use answer identity');
for(const helper of ['function bu3857ReadSave(', 'function bu3857SolutionText(', "restart.id='bu-story-restart'"])assert(core.includes(helper),'Missing runtime integration '+helper);
console.log(JSON.stringify({nativeSyntax:true,inlineScripts:count,editorialFieldChanges:edits.length,genesis11Integrity:true}));
