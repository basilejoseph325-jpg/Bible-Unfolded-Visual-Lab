// Research-backed Episode 14 authoring package checks; NOT a runtime or phone gameplay test.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const target = path.join(__dirname, '../story-adventure-content/genesis-episode14-joseph-v1.json');
const p = JSON.parse(fs.readFileSync(target, 'utf8'));
const official=new Set(['https://www.jw.org/en/library/bible/nwt/books/genesis/37/']);
assert.equal(p.chapterId, 'genesis_ep14');
assert.equal(p.chapterNumber, 14);
assert.match(p.contentStatus, /native_isolated_review_candidate/);
assert.equal(p.discoveries.length, 12);
const ids = new Set(), answers = new Set();
for (const [i, d] of p.discoveries.entries()) {
  assert.equal(d.id, 'g14-d' + String(i + 1).padStart(2, '0'));
  assert.equal(d.sequence, i + 1);
  assert(!ids.has(d.id), 'duplicate id: ' + d.id);
  ids.add(d.id);
  assert.equal(d.interaction.type, 'word_connect');
  const a = d.interaction.answer;
  assert.match(a, /^[A-Z]{4,12}$/, 'invalid wheel answer ' + d.id);
  assert(!answers.has(a), 'duplicate wheel answer ' + a);
  answers.add(a);
  for (const k of ['title', 'narration', 'explanation']) {
    assert.equal(typeof d[k], 'string');
    assert(d[k].length >= (k === 'title' ? 5 : 20), 'missing ' + k + ': ' + d.id);
  }
  assert.equal(d.progressiveHints.length, 3);
  for (const [n, h] of d.progressiveHints.entries()) {
    assert.equal(h.level, n + 1);
    assert(h.text.length >= 15, 'empty hint ' + d.id);
    assert(!(h.text.toUpperCase().match(/[A-Z]+/g)||[]).includes(a), 'answer leaked by hint ' + d.id);
  }
  assert(d.scripture.length);
  for (const source of d.scripture) {
    assert(official.has(source.url), 'unapproved source ' + d.id);
    assert(source.reference.startsWith('Genesis 37'));
  }
  const review=p.sourceReview.items[d.id];assert(review&&review.reviewNote.length>80,'Missing item source/readability review '+d.id);
  const w = p.words[d.id], art = p.artPlan[d.id];
  assert(w && art, 'missing wheel/art specification for ' + d.id);
  assert.equal(w.answer, a);
  assert.equal(w.clue, d.interaction.prompt);
  assert.equal(w.explanation, d.explanation);
  assert.equal(w.hint1, d.progressiveHints[0].text);
  assert.equal(w.hint2, d.progressiveHints[1].text);
  assert.equal(w.hint3, d.progressiveHints[2].text);
  assert.equal(art.status,'owner_approved_image_installed');
  assert(art.brief.length>150,'Specific illustration brief missing '+d.id);
  assert.equal(art.width, 640);
  assert.equal(art.height, 360);
  assert.equal(art.filename, d.id + '.webp');
  assert(!d.narration.includes('must have wondered'), 'unsupported mind reading');
}
assert.deepEqual(Object.keys(p.words).sort(), [...ids].sort());
assert.deepEqual(Object.keys(p.artPlan).sort(), [...ids].sort());
console.log('PASS: 12 sequential Genesis 37 scenes, distinct answers, 3 hints each, synchronized wheel and art plans, approved JW.org link structure.');
console.log('NOTE: Source/editorial review recorded separately; runtime is tested by the native preview suite. Owner illustration approval is recorded; no physical-device or independent editorial acceptance claimed.');

const manifest=JSON.parse(fs.readFileSync('story-adventure-art/genesis14/manifest.json'));
assert.equal(manifest.chapterId,p.chapterId);assert.equal(manifest.ending.heroDiscovery,'g14-d12');assert.equal(manifest.ending.backgroundDiscovery,'g14-d12');
assert.equal(Object.keys(manifest.scenes).length,12);
for(const d of p.discoveries){assert.equal(manifest.scenes[d.id].approved,true);assert.equal(manifest.scenes[d.id].path,'story-adventure-art/genesis14/'+d.id+'.webp');assert(fs.existsSync(manifest.scenes[d.id].path));assert.equal(p.words[d.id].reference,d.scripture[0].reference);}
console.log('PASS: 12 owner-approved image paths; exact approved assets installed.');

const crypto=require('node:crypto');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const approvedBytes=fs.readFileSync('docs/GENESIS14_APPROVED_ART_CHECKSUMS.json');
assert.equal(sha(approvedBytes),'192f21e4f0168889c86c84c22aabced57d6664f26e12bc84b94398e607c88d4b','Supplied checksum record changed');
assert.equal(sha(fs.readFileSync('story-adventure-art/genesis14/manifest.json')),'71998db3fb0befc267caf5e41841a3b1efdddc7732d65ed91c637efceb2d66b7','Supplied approved manifest changed');
const approved=JSON.parse(approvedBytes);
assert.deepEqual(p.discoveries.map(d=>d.interaction.answer),['ROBE','SHEAVES','STARS','DOTHAN','SCHEME','REUBEN','WATERPIT','CARAVAN','JUDAH','SILVER','EMPTY','GRIEF']);
assert.equal(Object.keys(approved).length,12);
for(const d of p.discoveries){const file=manifest.scenes[d.id].path,spec=approved[file],bytes=fs.readFileSync(file);assert(spec);assert.equal(bytes.length,spec.bytes);assert.equal(sha(bytes),spec.sha256);assert.equal(p.artPlan[d.id].sha256,spec.sha256);assert.equal(spec.suggested_puzzle_answer,d.interaction.answer);assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');}
assert.equal(manifest.ending.caption,'Jacob grieves for Joseph');assert.equal(p.endingArtPlan.caption,manifest.ending.caption);
assert.match(p.completionMessage,/Genesis 37:36/);assert.equal(p.discoveries[11].interaction.answer,'GRIEF');
console.log('PASS_APPROVED_G14_SEQUENCE_AND_ALL_12_SUPPLIED_SHA256_CHECKSUMS');
