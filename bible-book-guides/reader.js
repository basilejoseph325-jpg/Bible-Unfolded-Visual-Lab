/* Bible Unfolded — standalone Bible Book Guide reader (Visual Lab branch only).
 * NO changes to original game, puzzle state, points, sounds, or Story Adventure data.
 * Integration later: <script defer src="bible-book-guides/reader.js"></script>
 */
(() => {
  'use strict';
  const names = ['Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'];
  const base = new URL('.', document.currentScript ? document.currentScript.src : document.baseURI);
  const css = document.createElement('link');
  css.rel = 'stylesheet'; css.href = new URL('reader.css', base).href;
  document.head.appendChild(css);
  let root, bookIndex = 0, sectionIndex = 0, currentData = null;
  let legacyCard = null, passThrough = false;
  const cache = {};
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }
  function createRoot() {
    if (root) return root;
    root = el('section', 'bu-guide-reader');
    root.id = 'bu-guide-reader'; root.hidden = true;
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'Bible Book Guide');
    root.innerHTML = '<header class="bu-guide-header"><button type="button" class="bu-guide-close" aria-label="Return to Bible Books">‹ Back</button><div><small>BIBLE UNFOLDED</small><strong>Understand the Book</strong></div><span class="bu-guide-header-mark" aria-label="Test version">TEST</span></header><main class="bu-guide-main"><div class="bu-guide-intro"><small class="bu-guide-number"></small><h1 class="bu-guide-title"></h1><p class="bu-guide-subtitle"></p></div><div class="bu-guide-reading"><div class="bu-guide-progress"><span class="bu-guide-count"></span><span class="bu-guide-ref"></span></div><div class="bu-guide-track"><span></span></div><label class="bu-guide-picker-label" for="bu-guide-picker">Jump to a section</label><select id="bu-guide-picker" class="bu-guide-picker"></select><article class="bu-guide-article"><h2></h2><div class="bu-guide-paragraphs"></div><aside class="bu-guide-thought"><small>SOMETHING TO THINK ABOUT</small><p></p></aside></article><a class="bu-guide-source" href="#" target="_blank" rel="noopener noreferrer">Read these chapters in the NWT ↗</a><button type="button" class="bu-guide-story">Play Genesis Story Adventure ›</button><p class="bu-guide-note">A simplified retelling. For the complete account, read the Bible passage above.</p></div></main><footer class="bu-guide-footer"><button type="button" class="bu-guide-prev">‹ Previous</button><button type="button" class="bu-guide-next">Next ›</button></footer>';
    (document.body || document.documentElement).appendChild(root);
    root.querySelector('.bu-guide-close').addEventListener('click', close);
    root.querySelector('.bu-guide-story').addEventListener('click', () => { const card=legacyCard; close(); if(card){passThrough=true;try{card.click()}finally{passThrough=false}} });
    root.querySelector('.bu-guide-prev').addEventListener('click', () => setSection(sectionIndex - 1));
    root.querySelector('.bu-guide-next').addEventListener('click', () => setSection(sectionIndex + 1));
    root.querySelector('.bu-guide-picker').addEventListener('change', e => setSection(Number(e.target.value)));
    root.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    return root;
  }
  function close() { if (root) root.hidden = true; }
  function persist() {
    try { localStorage.setItem('buGuideLast:'+bookIndex, String(sectionIndex)); } catch (_) {}
  }
  function savedPosition() {
    try { return Number(localStorage.getItem('buGuideLast:'+bookIndex)) || 0; } catch (_) { return 0; }
  }
  async function load(book) {
    if (book !== 0) return null; // Only Genesis has editorial draft content so far.
    if (cache.genesis) return cache.genesis;
    const response = await fetch(new URL('genesis-draft.json', base).href, {cache:'no-cache'});
    if (!response.ok) throw new Error('Bible Book Guide content unavailable');
    const data = await response.json();
    if (!Array.isArray(data.sections) || data.sections.length === 0) throw new Error('Empty guide content');
    cache.genesis = data;
    return data;
  }
  function setSection(i) {
    if (!currentData || !currentData.sections) return;
    const sections = currentData.sections;
    sectionIndex = Math.min(Math.max(i,0),sections.length-1);
    const item = sections[sectionIndex];
    root.querySelector('.bu-guide-count').textContent = 'PART '+(sectionIndex+1)+' OF '+sections.length;
    root.querySelector('.bu-guide-ref').textContent = item.chapters;
    root.querySelector('.bu-guide-track span').style.width = ((sectionIndex+1)/sections.length*100)+'%';
    root.querySelector('.bu-guide-picker').value = String(sectionIndex);
    root.querySelector('.bu-guide-article h2').textContent = item.title;
    root.querySelector('.bu-guide-paragraphs').replaceChildren(...(item.paragraphs || [item.text]).map(t=>el('p','',t)));
    root.querySelector('.bu-guide-thought p').textContent = item.takeaway || '';
    const source = root.querySelector('.bu-guide-source');
    source.hidden = !item.readUrl;
    if (item.readUrl) source.href = item.readUrl;
    root.querySelector('.bu-guide-prev').disabled = sectionIndex === 0;
    const next = root.querySelector('.bu-guide-next');
    next.disabled = sectionIndex === sections.length-1;
    next.textContent = next.disabled ? 'End of Genesis ✓' : 'Next ›';
    root.querySelector('.bu-guide-main').scrollTop = 0;
    persist();
  }
  async function openBook(n) {
    bookIndex = Number.isInteger(n) && n >= 0 && n < names.length ? n : 0;
    createRoot().hidden = false;
    root.querySelector('.bu-guide-number').textContent = 'BOOK '+(bookIndex+1)+' OF 66';
    root.querySelector('.bu-guide-title').textContent = names[bookIndex];
    root.querySelector('.bu-guide-subtitle').textContent = 'The Bible, explained simply—without losing the important parts.';
    root.querySelector('.bu-guide-article h2').textContent = 'Opening your guide…';
    root.querySelector('.bu-guide-paragraphs').textContent = '';
    root.querySelector('.bu-guide-picker').replaceChildren();
    root.querySelector('.bu-guide-source').hidden = true;
    root.querySelector('.bu-guide-footer').hidden = true;
    root.querySelector('.bu-guide-progress').hidden = true;
    root.querySelector('.bu-guide-picker-label').hidden = true;
    root.querySelector('.bu-guide-picker').hidden = true;
    root.querySelector('.bu-guide-track').hidden = true;
    root.querySelector('.bu-guide-note').hidden = true;
    currentData = null;
    try { currentData = await load(bookIndex); }
    catch (e) {
      root.querySelector('.bu-guide-article h2').textContent = 'Guide unavailable';
      root.querySelector('.bu-guide-paragraphs').textContent = 'We couldn’t load this book right now. Please try again later.';
      return;
    }
    if (!currentData) {
      root.querySelector('.bu-guide-article h2').textContent = 'This book’s guide is being written';
      root.querySelector('.bu-guide-paragraphs').textContent = 'Each of the 66 books will receive its own easy-to-follow explanation. This one isn’t ready yet. Story Adventure stays separate.';
      return;
    }
    root.querySelector('.bu-guide-subtitle').textContent = currentData.subtitle || '';
    const picker = root.querySelector('.bu-guide-picker');
    currentData.sections.forEach((item,i) => {
      const opt = el('option', '', (i+1)+'. '+item.title+' ('+item.chapters+')');
      opt.value = String(i); picker.appendChild(opt);
    });
    for (const selector of ['.bu-guide-footer','.bu-guide-progress','.bu-guide-picker-label','.bu-guide-picker','.bu-guide-track','.bu-guide-note']) root.querySelector(selector).hidden = false;
    setSection(savedPosition());
  }
  // Capture the clicks BEFORE legacy book-tile onclick handlers. We do not modify
  // the old Story Adventure code, and we do not change any shared save data.
  document.addEventListener('click', e => {
    if(passThrough)return;
    const tile=e.target.closest && e.target.closest('#levels #hebrew-books .book-tile');
    if(!tile || tile!==document.querySelector('#levels #hebrew-books .book-tile'))return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    legacyCard=tile;openBook(0);
  }, true);
  window.BibleBookGuides = Object.freeze({openBook, close});
  if (window.BU_BIBLE_BOOK_GUIDE_PREVIEW) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => openBook(0), {once:true});
    else openBook(0);
  }
})();
