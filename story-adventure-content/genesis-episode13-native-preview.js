/* Genesis 13 native wheel integration — isolated Visual Lab developer preview.
 * This script runs only with ?bu_story_dev=genesis13, does not publish or unlock
 * chapters in the ordinary book/Journey progression, and never overwrites saves. */
(() => {
  'use strict';
  const CHAPTER_ID = 'genesis_ep13';
  const query = new URLSearchParams(location.search);
  if (query.get('bu_story_dev') !== 'genesis13') return;
  if (location.hostname.endsWith('github.io') &&
      !location.pathname.includes('/Bible-Unfolded-Visual-Lab/')) return;

  const preview = { status: 'loading', chapterId: CHAPTER_ID, discoveries: 0 };
  window.BUGenesis13DevPreview = preview;

  const text = value => String(value == null ? '' : value);
  const firstLine = value => text(value).replace(/\s+/g, ' ').trim();

  function validate(chapter) {
    if (!chapter || chapter.chapterId !== CHAPTER_ID ||
        chapter.chapterNumber !== 13 ||
        !Array.isArray(chapter.discoveries) || chapter.discoveries.length !== 12 ||
        !chapter.words || !chapter.artPlan) {
      throw Error('Genesis 13 content package is incomplete.');
    }
    const ids = new Set();
    for (const [i, d] of chapter.discoveries.entries()) {
      const expected = 'g13-d' + String(i + 1).padStart(2, '0');
      if (d.id !== expected || ids.has(d.id) || d.sequence !== i + 1 ||
          d.interaction?.type !== 'word_connect' ||
          !/^[A-Z]{4,12}$/.test(d.interaction.answer) ||
          chapter.words[d.id]?.answer !== d.interaction.answer ||
          chapter.words[d.id]?.clue !== d.interaction.prompt ||
          d.progressiveHints?.length !== 3) {
        throw Error('Invalid Episode 13 wheel configuration: ' + expected);
      }
      ids.add(d.id);
    }
  }

  function appendPreviewCard() {
    if (typeof bu3854EpisodeBook === 'undefined' || bu3854EpisodeBook !== 'genesis') return;
    const list = document.getElementById('episode-list');
    if (!list || list.querySelector('[data-bu-genesis13-dev]')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'episode-card available';
    button.setAttribute('data-bu-genesis13-dev', '');
    button.setAttribute("aria-label", "Developer preview: Genesis Episode 13, Jacob’s Household at Bethel");
    button.innerHTML =
      '<div class="episode-thumb" aria-label="Scene illustration pending"><span aria-hidden="true">◇</span></div>' +
      '<div class="episode-copy">' +
      '<span class="episode-status">DEVELOPMENT PREVIEW · ARTWORK PENDING</span>' +
      '<strong>Episode 13 · Jacob’s Household at Bethel</strong>' +
      '<small>Genesis 34–35 · 12 new word-wheel discoveries</small>' +
      '</div>';
    button.addEventListener('click', () => {
      if (typeof bu3857Open === 'function') bu3857Open(CHAPTER_ID);
    });
    list.appendChild(button);
  }

  function installHintLadder() {
    if (typeof bu3857Hint !== 'function') throw Error('Native Story help handler is unavailable.');
    const oldHint = bu3857Hint;
    bu3857Hint = function genesis13Hint(...args) {
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
    // Genesis 13's third paid THINKING clue may never expose a letter.
    if(typeof buHQBind!=='function'||typeof buHQUpdate!=='function')throw Error('Original wheel binder missing');
    const originalBind=buHQBind;
    buHQBind=function genesis13NativeWheel(...args) {
      if(bu3857State?.book===CHAPTER_ID)buHQHintLetters[bu3857Current().id]=0;
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

  // The normal picture system doesn't have Episode 13 scene assets yet.
  // Show a plainly labelled visual placeholder in the DEVELOPMENT preview;
  // never borrow a misleading image of an unrelated Bible event.
  function installScenePlaceholder() {
    const oldRender=bu3857Render;
    bu3857Render=function genesis13Render(...args){
      if(bu3857State?.book!==CHAPTER_ID)return oldRender.apply(this,args);
      const value=withGenesisRegistration(()=>oldRender.apply(this,args));
      const wrap=document.getElementById('bu3857-content');
      if(!wrap)return value;
      if(bu3857State.complete){
        const message=wrap.querySelector('.bu3863-finale p');
        if(message)message.textContent=BU3857_DATA[CHAPTER_ID].completionMessage;
        // The original finale keeps its existing Replay and Chapters handlers.
        // Its primary action returns to the current book, not a nonexistent Episode 14.
        const next=document.getElementById('bu3857-next-episode');
        if(next){next.textContent='Return to Genesis →';next.onclick=bu3857Exit;}
        const card=wrap.querySelector('.bu3863-finale');
        if(card&&!card.querySelector('[data-bu-genesis13-art-pending]')){
          const note=document.createElement('p');note.dataset.buGenesis13ArtPending='';
          note.textContent='Bethel scene illustration pending · review candidate';
          note.style.fontSize='12px';card.appendChild(note);
        }
        return value;
      }
      const discovery=bu3857Current(),stage=wrap.querySelector('.bu3863-stage');
      if(stage&&!stage.querySelector(':scope > figure.bu3863-image')){
        const scene=document.createElement('figure');scene.className='bu3863-image';
        scene.dataset.buGenesis13Scene=discovery.id;
        scene.style.cssText='display:flex;align-items:center;justify-content:center;flex-direction:column;background:linear-gradient(135deg,#173943,#31524e);color:#e9e2c7;text-align:center;';
        const line=document.createElement('strong');line.textContent=firstLine(discovery.title);
        const sub=document.createElement('small');sub.textContent='Scene illustration pending · development preview';
        sub.style.cssText='display:block;font-size:11px;margin:6px 12px;';scene.append(line,sub);
        stage.prepend(scene);
      }
      const next=document.getElementById('bu3857-continue');
      if(next&&bu3857State.solved[discovery.id])next.textContent=bu3857State.step===11?'Complete Chapter ✦':'Next Discovery →';
      // Fit the unchanged native wheel AFTER inserting the pending-art figure.
      bu3863Fit();
      return value;
    };
  }

  // Delegate to the native Genesis engine only while it needs chapter identity.
  // Never append Episode 13 to public episode/unlock/Journey arrays.
  function withGenesisRegistration(run){
    const added=!BU_GENESIS_IDS.includes(CHAPTER_ID);
    if(added)BU_GENESIS_IDS.push(CHAPTER_ID);
    try{return run();}finally{if(added){const i=BU_GENESIS_IDS.indexOf(CHAPTER_ID);if(i>=0)BU_GENESIS_IDS.splice(i,1);}}
  }
  // Native solving happens on pointerdown. If that redraw removes the last tile,
  // Chromium can retarget its compatibility click to the newly opened Next button.
  // Scope this guard to Episode 13; a new intentional pointerdown always clears it.
  function installCompletionClickGuard(){
    let wheelClickPending=false,lastWheelDown=0;
    document.addEventListener('pointerdown',event=>{
      wheelClickPending=bu3857State?.book===CHAPTER_ID&&!!event.target.closest?.('#buhq-wheel [data-buhq]');
      if(wheelClickPending)lastWheelDown=Date.now();
    },true);
    document.addEventListener('click',event=>{
      if(!wheelClickPending||bu3857State?.book!==CHAPTER_ID)return;
      if(event.target.closest?.('[data-buhq]')){wheelClickPending=false;return;}
      if(event.isTrusted&&event.detail>0&&Date.now()-lastWheelDown<1000&&event.target.closest?.('button')){
        event.preventDefault();event.stopImmediatePropagation();wheelClickPending=false;
        preview.suppressedCompletionClicks=(preview.suppressedCompletionClicks||0)+1;
      }
    },true);
  }

  function installChapterDelegates(){
    const save=bu3857Save,exit=bu3857Exit,wordMode=bu3868Genesis,modal=bu3863Modal;
    bu3863Modal=function(title,body,options={}){
      const result=modal.call(this,title,body,options);
      if(bu3857State?.book===CHAPTER_ID&&options.next&&bu3857State.step===11){
        const next=document.querySelector('#bu3863-dialog-layer .bu3863-dialog-done');
        if(next)next.textContent='Complete Chapter ✦';
      }
      return result;
    };
    bu3857Save=function(...args){return bu3857State?.book===CHAPTER_ID?withGenesisRegistration(()=>save.apply(this,args)):save.apply(this,args);};
    bu3857Exit=function(...args){if(bu3857State?.book!==CHAPTER_ID)return exit.apply(this,args);bu3857Save();openEpisodes('genesis');};
    bu3868Genesis=function(...args){return bu3857State?.book===CHAPTER_ID||wordMode.apply(this,args);};
    const back=document.getElementById('bu3857-back'),oldBack=back?.onclick;
    if(back)back.onclick=function(...args){return bu3857State?.book===CHAPTER_ID?bu3857Exit():oldBack?.apply(this,args);};
  }

  async function load() {
    if(BU3857_DATA?.[CHAPTER_ID])throw Error('Episode 13 already registered; refusing to overwrite it');
    if (typeof BU3857_DATA !== 'object' || typeof BU_HQ_WORDS !== 'object' ||
        !Array.isArray(BU_GENESIS_IDS) || typeof makeEpisodes !== 'function') {
      throw Error('The existing Story Adventure engine did not initialize.');
    }
    const response = await fetch('story-adventure-content/genesis-episode13-bethel-v1.json',
      { cache: 'no-store' });
    if (!response.ok) throw Error('Episode 13 content HTTP ' + response.status);
    const chapter = await response.json();
    validate(chapter);
    chapter.contentStatus = 'native_development_preview_pending_physical_QA';
    if(!chapter.completionMessage)throw Error('Episode 13 ending text missing');
    BU3857_DATA[CHAPTER_ID] = chapter;
    for (const discovery of chapter.discoveries) {
      BU_HQ_WORDS[discovery.id] = chapter.words[discovery.id];
    }

    // Register this chapter as Genesis only in the explicit developer session.
    // Ordinary Journey/book unlock menus remain untouched.
    // The save/render delegates below provide temporary native identity; no public array mutation.
    const saved = bu3857ReadSave(BU_GENESIS_KEY)[CHAPTER_ID];
    if (saved && typeof saved === 'object') {
      bu3857Saved[CHAPTER_ID] = saved;
      if (saved.complete) completedChapters[CHAPTER_ID] = true;
    }

    installChapterDelegates();
    installCompletionClickGuard();
    installHintLadder();
    installWheelClueGuard();
    installScenePlaceholder();
    const originalMakeEpisodes = makeEpisodes;
    makeEpisodes = function genesis13Episodes(...args) {
      const value = originalMakeEpisodes.apply(this, args);
      appendPreviewCard();
      return value;
    };
    appendPreviewCard();
    preview.status = 'ready';
    preview.discoveries = chapter.discoveries.length;
    console.info('Genesis Episode 13 native word-wheel preview registered: 12 scenes, locked outside developer mode.');
  }

  function start() {
    load().catch(error => {
      preview.status = 'failed';
      preview.error = error.message;
      console.error('Genesis Episode 13 preview failed:', error);
      const toast = document.getElementById('toast');
      if (toast) {
        toast.textContent = 'Genesis Episode 13 preview unavailable: ' + error.message;
        toast.hidden = false;
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
