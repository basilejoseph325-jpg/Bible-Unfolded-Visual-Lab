// Research-backed Episode 13 authoring package checks; NOT a runtime or phone gameplay test.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const target = path.join(__dirname, '../story-adventure-content/genesis-episode13-bethel-v1.json');
const p = JSON.parse(fs.readFileSync(target, 'utf8'));
const official = new Set([
  'https://www.jw.org/en/library/bible/nwt/books/genesis/34/',
  'https://www.jw.org/en/library/bible/nwt/books/genesis/35/',
  'https://www.jw.org/en/library/bible/nwt/books/genesis/49/'
]);
assert.equal(p.chapterId, 'genesis_ep13');
assert.equal(p.chapterNumber, 13);
assert.match(p.contentStatus, /not_native_integrated/);
assert.equal(p.discoveries.length, 12);
const ids = new Set(), answers = new Set();
for (const [i, d] of p.discoveries.entries()) {
  assert.equal(d.id, 'g13-d' + String(i + 1).padStart(2, '0'));
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
    assert(!new RegExp('\\b' + a + '\\b', 'i').test(h.text), 'answer leaked by hint ' + d.id);
  }
  assert(d.scripture.length);
  for (const source of d.scripture) {
    assert(official.has(source.url), 'unapproved source ' + d.id);
    assert(source.reference.startsWith('Genesis 34') || source.reference.startsWith('Genesis 35') || source.reference.startsWith('Genesis 49'));
  }
  const w = p.words[d.id], art = p.artPlan[d.id];
  assert(w && art, 'missing wheel/art specification for ' + d.id);
  assert.equal(w.answer, a);
  assert.equal(w.clue, d.interaction.prompt);
  assert.equal(w.explanation, d.explanation);
  assert.equal(w.hint1, d.progressiveHints[0].text);
  assert.equal(w.hint2, d.progressiveHints[1].text);
  assert.equal(w.hint3, d.progressiveHints[2].text);
  assert.equal(art.width, 640);
  assert.equal(art.height, 360);
  assert.equal(art.filename, d.id + '.webp');
  assert(!d.narration.includes('must have wondered'), 'unsupported mind reading');
}
assert.deepEqual(Object.keys(p.words).sort(), [...ids].sort());
assert.deepEqual(Object.keys(p.artPlan).sort(), [...ids].sort());
console.log('PASS: 12 sequential Genesis 34–35 scenes, distinct answers, 3 hints each, synchronized wheel and art plans, approved JW.org link structure.');
console.log('NOTE: Does NOT establish native integration, asset existence, independent biblical editorial signoff, or playable-device testing.');
