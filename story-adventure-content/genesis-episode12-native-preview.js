/* Genesis 12 native wheel integration — isolated Visual Lab developer preview.
 * This script runs only with ?bu_story_dev=genesis12, does not publish or unlock
 * chapters in the ordinary book/Journey progression, and never overwrites saves. */
(() => {
  'use strict';
  const CHAPTER_ID = 'genesis_ep12';
  const query = new URLSearchParams(location.search);
  if (query.get('bu_story_dev') !== 'genesis12') return;
  if (location.hostname.endsWith('github.io') &&
      !location.pathname.includes('/Bible-Unfolded-Visual-Lab/')) return;

  const preview = { status: 'loading', chapterId: CHAPTER_ID, discoveries: 0 };
  window.BUGenesis12DevPreview = preview;

  const text = value => String(value == null ? '' : value);
  const firstLine = value => text(value).replace(/\s+/g, ' ').trim();

  function validate(chapter) {
    if (!chapter || chapter.chapterId !== CHAPTER_ID ||
        chapter.chapterNumber !== 12 ||
        !Array.isArray(chapter.discoveries) || chapter.discoveries.length !== 13 ||
        !chapter.words || !chapter.artPlan) {
      throw Error('Genesis 12 content package is incomplete.');
    }
    const ids = new Set();
    for (const [i, d] of chapter.discoveries.entries()) {
      const expected = 'g12-d' + String(i + 1).padStart(2, '0');
      if (d.id !== expected || ids.has(d.id) || d.sequence !== i + 1 ||
          d.interaction?.type !== 'word_connect' ||
          !/^[A-Z]{4,12}$/.test(d.interaction.answer) ||
          chapter.words[d.id]?.answer !== d.interaction.answer ||
          chapter.words[d.id]?.clue !== d.interaction.prompt ||
          d.progressiveHints?.length !== 3) {
        throw Error('Invalid Episode 12 wheel configuration: ' + expected);
      }
      ids.add(d.id);
    }
  }

  function appendPreviewCard() {
    if (typeof bu3854EpisodeBook === 'undefined' || bu3854EpisodeBook !== 'genesis') return;
    const list = document.getElementById('episode-list');
    if (!list || list.querySelector('[data-bu-genesis12-dev]')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'episode-card available';
    button.setAttribute('data-bu-genesis12-dev', '');
    button.setAttribute('aria-label', 'Developer preview: Genesis Episode 12, Jacob and Esau — The Road Home');
    button.innerHTML =
      '<div class="episode-thumb"><img src="bible-book-art/01_genesis.webp" alt="" loading="lazy"></div>' +
      '<div class="episode-copy">' +
      '<span class="episode-status">🧪 DEVELOPMENT PREVIEW · NOT UNLOCKED FOR PLAYERS</span>' +
      '<strong>Episode 12 · Jacob and Esau — The Road Home</strong>' +
      '<small>Genesis 32–33 · 13 new word-wheel discoveries</small>' +
      '</div>';
    button.addEventListener('click', () => {
      if (typeof bu3857Open === 'function') bu3857Open(CHAPTER_ID);
    });
    list.appendChild(button);
  }

  function installHintLadder() {
    if (typeof bu3857Hint !== 'function') throw Error('Native Story help handler is unavailable.');
    const oldHint = bu3857Hint;
    bu3857Hint = function genesis12Hint(...args) {
      const st=typeof bu3857State==='undefined'?null:bu3857State;
      if(!st||st.book!==CHAPTER_ID)return oldHint.apply(this,args);
      if(st.complete)return;
      const d=bu3857Current();
      if(!d||st.solved[d.id])return;
      const entry=BU_HQ_WORDS[d.id],receipt='story-assist-v1:'+CHAPTER_ID+':'+d.id;
      if(!entry||typeof saveEconomy!=='function'||typeof bu3824RefreshWallet!=='function')
        throw Error('Native saved-wallet hint service unavailable');
      const norm=n=>Math.max(0,Math.trunc(Number(n)||0));
      const level=()=>Math.min(3,Math.max(norm(st.hints[d.id]),norm(economy.hints[receipt])));
      const price=()=>level()===1?15:level()===2?25:0;
      // Use PR#21's durable wallet receipt model: the purchase level and token debit
      // are saved in one wallet write. A failed chapter save cannot charge twice.
      function saveHelp(next,cost){
        bu3824RefreshWallet();
        const before=JSON.parse(JSON.stringify(economy));
        if(norm(economy.hints[receipt])>=next)return true;
        if(norm(economy.coins)<cost)return false;
        economy.hints[receipt]=next;
        economy.coins-=cost;
        if(saveEconomy()!==true){economy=before;updateWallet();return false;}
        updateWallet();
        if(cost)try{playCoinFx('spend')}catch(_){}
        return true;
      }
      st.hints[d.id]=level();
      if(level()===0){
        if(!saveHelp(1,0)){bu3864Modal('Hints unavailable','Your hint could not be saved. No tokens were deducted.');return;}
        st.hints[d.id]=1;st.feedback='';bu3857Save();bu3857Render();
      }
      bu3864Modal('Discovery hint','');
      const layer=document.getElementById('bu3864-modal-layer');
      const body=layer?.querySelector('.bu3864-modal-body');
      if(!body)throw Error('Existing Story hint dialog is unavailable');
      const buy=document.createElement('button');
      buy.type='button';buy.className='gold-button';
      buy.style.cssText='width:100%;min-height:44px;padding:10px 13px;border-radius:12px;font-weight:800;margin-top:8px';
      const warning=document.createElement('p');
      warning.setAttribute('role','status');
      warning.style.cssText='font-size:13px;color:#ffe2a3;margin:8px 0 0';
      function refresh(){
        const lines=[entry.hint1||d.progressiveHints[0].text];
        if(level()>=2)lines.push(entry.hint2||d.progressiveHints[1].text);
        if(level()>=3)lines.push(entry.hint3||d.progressiveHints[2].text);
        body.replaceChildren();
        for(const [i,line] of lines.entries()){
          const p=document.createElement('p'),tag=document.createElement('strong');
          tag.textContent=i===0?'Free hint: ':'Additional hint: ';
          p.append(tag,document.createTextNode(String(line)));
          body.appendChild(p);
        }
        body.append(warning,buy);
        buy.hidden=price()===0;
        if(!buy.hidden)buy.textContent='Stronger hint · '+price()+' Insight Tokens';
      }
      buy.onclick=()=>{
        const cost=price();if(!cost)return;
        if(!saveHelp(level()+1,cost)){warning.textContent='Hint not purchased; no additional tokens deducted.';return;}
        st.hints[d.id]=level();st.feedback='';bu3857Save();bu3857Render();
        warning.textContent='';refresh();
      };
      refresh();
    };
  }

  function installWheelClueGuard() {
    // The historical wheel binder derives displayed answer letters from hint level.
    // Genesis 12's third paid THINKING clue may never expose a letter.
    if(typeof buHQBind!=='function'||typeof buHQUpdate!=='function')throw Error('Original wheel binder missing');
    const originalBind=buHQBind;
    buHQBind=function genesis12NativeWheel(...args) {
      const result=originalBind.apply(this,args);
      if(bu3857State?.book===CHAPTER_ID){
        const discovery=bu3857Current();
        if(discovery&&typeof buHQHintLetters!=='undefined'){
          buHQHintLetters[discovery.id]=0;
          buHQUpdate();
        }
      }
      return result;
    };
  }

  // The normal picture system doesn't have Chapter 12 scene assets yet.
  // Show a plainly labelled visual placeholder in the DEVELOPMENT preview;
  // never borrow a misleading image of an unrelated Bible event.
  function installScenePlaceholder() {
    if (typeof bu3857Render !== 'function') return;
    const oldRender = bu3857Render;
    bu3857Render = function genesis12Render(...args) {
      const value = oldRender.apply(this, args);
      if (!bu3857State || bu3857State.book !== CHAPTER_ID || bu3857State.complete) return value;
      const discovery = bu3857Current();
      const wrap = document.getElementById('bu3857-content');
      if (!wrap || wrap.querySelector('.bu3863-image, [data-bu-episode12-scene]')) return value;
      const scene = document.createElement('figure');
      scene.className = 'bu3863-image';
      scene.setAttribute('data-bu-episode12-scene', discovery.id);
      scene.style.cssText =
        'display:flex;align-items:center;justify-content:center;flex-direction:column;' +
        'min-height:100px;padding:12px 16px;margin:8px auto 10px;box-sizing:border-box;' +
        'background:linear-gradient(135deg,#233f48,#365c58);border:1px solid #8b977c;' +
        'border-radius:14px;color:#e9e2c7;text-align:center;';
      const line = document.createElement('strong');
      line.textContent = firstLine(discovery.title);
      const sub = document.createElement('small');
      sub.textContent = 'Scene artwork pending · development preview';
      sub.style.cssText = 'display:block;opacity:.82;font-size:11px;margin-top:4px;';
      scene.append(line, sub);
      const heading = wrap.querySelector('.bu3863-heading');
      if (heading) heading.insertAdjacentElement('afterend', scene);
      else wrap.prepend(scene);
      return value;
    };
  }

  async function load() {
    if (typeof BU3857_DATA !== 'object' || typeof BU_HQ_WORDS !== 'object' ||
        !Array.isArray(BU_GENESIS_IDS) || typeof makeEpisodes !== 'function') {
      throw Error('The existing Story Adventure engine did not initialize.');
    }
    const response = await fetch('story-adventure-content/genesis-episode12-return-to-esau-v1.json',
      { cache: 'no-store' });
    if (!response.ok) throw Error('Chapter 12 content HTTP ' + response.status);
    const chapter = await response.json();
    validate(chapter);
    chapter.contentStatus = 'native_development_preview_pending_physical_QA';
    chapter.completionMessage =
      'Jacob and Esau have reunited, and Jacob has returned safely to Canaan. Their story continues beyond this chapter!';
    BU3857_DATA[CHAPTER_ID] = chapter;
    for (const discovery of chapter.discoveries) {
      BU_HQ_WORDS[discovery.id] = chapter.words[discovery.id];
    }

    // Register this chapter as Genesis only in the explicit developer session.
    // Ordinary Journey/book unlock menus remain untouched.
    if (!BU_GENESIS_IDS.includes(CHAPTER_ID)) BU_GENESIS_IDS.push(CHAPTER_ID);
    const saved = bu3857ReadSave(BU_GENESIS_KEY)[CHAPTER_ID];
    if (saved && typeof saved === 'object') {
      bu3857Saved[CHAPTER_ID] = saved;
      if (saved.complete) completedChapters[CHAPTER_ID] = true;
    }

    installHintLadder();
    installWheelClueGuard();
    installScenePlaceholder();
    const originalMakeEpisodes = makeEpisodes;
    makeEpisodes = function genesis12Episodes(...args) {
      const value = originalMakeEpisodes.apply(this, args);
      appendPreviewCard();
      return value;
    };
    appendPreviewCard();
    preview.status = 'ready';
    preview.discoveries = chapter.discoveries.length;
    console.info('Genesis Episode 12 native word-wheel preview registered: 13 scenes, locked outside developer mode.');
  }

  function start() {
    load().catch(error => {
      preview.status = 'failed';
      preview.error = error.message;
      console.error('Genesis Episode 12 preview failed:', error);
      const toast = document.getElementById('toast');
      if (toast) {
        toast.textContent = 'Genesis Episode 12 preview unavailable: ' + error.message;
        toast.hidden = false;
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
