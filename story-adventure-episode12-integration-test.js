/* TEST-only Genesis Episode 12: native engine integration. No LIVE changes.
 * Reuses original wheel/score/save/modal/sound; gated by Episode 11 completion.
 * Distinct original scene art still missing, and browser/phone QA is pending. */
(function(){'use strict';
const ID='genesis_ep12';
if(typeof BU3857_DATA==='undefined'||typeof BU_HQ_WORDS==='undefined'||typeof makeEpisodes!=='function'){console.warn('[G12] Story engine unavailable');return;}
if(BU3857_DATA[ID])return;
const chapter={"schemaVersion":"1.0.0","chapterId":"genesis_ep12","chapterNumber":12,"title":"Jacob and Esau — The Road Home","coverage":"Genesis 32–33","translation":"New World Translation (2013 revision), jw.org","contentStatus":"native_integrated_TEST_candidate_art_and_phone_QA_pending","saveKey":"bible-unfolded-genesis-adventure-v3860","rules":"Reuse existing Story Adventure word wheel. Preserve approved v3.9.00 wheel sizing and all saved IDs. Three contextual clue levels per Episode 11 precedent; do not add automatic paid letter reveals. Existing progression locks remain. Content is not playable until engine integration, artwork, and QA.","sourceReview":{"status":"assistant_first_pass_not_independent_human_signoff","primarySources":["https://www.jw.org/en/library/bible/nwt/books/genesis/32/","https://www.jw.org/en/library/bible/nwt/books/genesis/33/"],"supportingSource":"https://www.jw.org/en/library/books/Insight-on-the-Scriptures/Jacob/"},"discoveries":[{"id":"g12-d01","sequence":1,"title":"The Camp of God","narration":"Jacob has just left Laban behind when God's angels meet him on the road. He recognizes the place as God's camp and gives it a name. Yet there's another meeting ahead—one he has good reason to approach carefully.","scripture":[{"reference":"Genesis 32:1–2","url":"https://www.jw.org/en/library/bible/nwt/books/genesis/32/"}],"interaction":{"type":"word_connect","prompt":"After seeing God's angels, what did Jacob call the place?","answer":"MAHANAIM"},"progressiveHints":[{"level":1,"text":"It was the name of a location, not the name of an angel."},{"level":2,"text":"Jacob thought of a camp that belonged to God."},{"level":3,"text":"The place name refers to two camps."}],"explanation":"The name Mahanaim means “Two Camps.” Jacob used it when he recognized God's camp. It's a brief moment, but it comes just before a difficult reunion with his brother.","tone":"conversational_story","graphicViolence":false},{"id":"g12-d02","sequence":2,"title":"A Message Before the Meeting","narration":"Jacob hasn't seen Esau for years. Rather than walking straight into an uncertain reunion, he reaches out first. He sends a respectful message explaining where he has been and that he's returning with a large household.","scripture":[{"reference":"Genesis 32:3–6","url":"https://www.jw.org/en/library/bible/nwt/books/genesis/32/"}],"interaction":{"type":"word_connect","prompt":"Before meeting Esau face-to-face, whom did Jacob send ahead?","answer":"MESSENGERS"},"progressiveHints":[{"level":1,"text":"Jacob wanted his brother to hear from him before they met."},{"level":2,"text":"He chose people who could carry his words to Seir."},{"level":3,"text":"They returned with news that Esau was approaching."}],"explanation":"Jacob's messengers carried his respectful words to Esau. They returned with unsettling news: Esau was on his way with 400 men. Jacob still didn't know how the reunion would go.","tone":"conversational_story","graphicViolence":false},{"id":"g12-d03","sequence":3,"title":"Two Camps, One Concern","narration":"The messengers return with alarming news: Esau is coming with 400 men. Genesis doesn't pretend Jacob was fearless. He becomes anxious and divides his household and animals into two groups. There's a practical reason behind that decision.","scripture":[{"reference":"Genesis 32:6–8","url":"https://www.jw.org/en/library/bible/nwt/books/genesis/32/"}],"interaction":{"type":"word_connect","prompt":"If one of Jacob's two camps was attacked, what could the other do?","answer":"ESCAPE"},"progressiveHints":[{"level":1,"text":"Jacob was planning for danger, not arranging a celebration."},{"level":2,"text":"The two groups would not necessarily face the same outcome."},{"level":3,"text":"The other group could get away if the first was attacked."}],"explanation":"Jacob hoped that dividing the household would leave one camp able to escape if the other was attacked. Genesis openly mentions his fear. Courage doesn't have to mean pretending danger isn't there.","tone":"conversational_story","graphicViolence":false},{"id":"g12-d04","sequence":4,"title":"He Spoke to Jehovah","narration":"Jacob has taken precautions, but he doesn't stop there. He speaks to Jehovah about the promise to bring him home safely and admits that he's afraid of Esau. His words bring his fear and his trust into the same conversation.","scripture":[{"reference":"Genesis 32:9–12","url":"https://www.jw.org/en/library/bible/nwt/books/genesis/32/"}],"interaction":{"type":"word_connect","prompt":"Jacob remembered Jehovah's promise and asked for protection. What did he offer?","answer":"PRAYER"},"progressiveHints":[{"level":1,"text":"This was more than planning where everyone would camp."},{"level":2,"text":"He addressed Jehovah and asked for help."},{"level":3,"text":"He spoke directly to God about his fear and the promise."}],"explanation":"Jacob's prayer recalls Jehovah's instructions and promises, expresses gratitude, and honestly asks for rescue from Esau. The account shows both practical planning and reliance on Jehovah.","tone":"conversational_story","graphicViolence":false},{"id":"g12-d05","sequence":5,"title":"From One Staff to Two Camps","narration":"In that prayer, Jacob remembers the man he was when he first crossed the Jordan: he had almost nothing with him. Now his household and possessions fill two camps. The contrast makes his gratitude especially vivid.","scripture":[{"reference":"Genesis 32:9–10","url":"https://www.jw.org/en/library/bible/nwt/books/genesis/32/"}],"interaction":{"type":"word_connect","prompt":"What single possession did Jacob mention having when he first crossed the Jordan?","answer":"STAFF"},"progressiveHints":[{"level":1,"text":"He's remembering how little he carried on his earlier journey."},{"level":2,"text":"It was something useful for walking and shepherding."},{"level":3,"text":"It was a simple wooden object carried by a traveler."}],"explanation":"Jacob said he crossed the Jordan with only his staff, but now he had become two camps. Rather than taking credit for his prosperity, he spoke of Jehovah's loyal love and faithfulness.","tone":"conversational_story","graphicViolence":false},{"id":"g12-d06","sequence":6,"title":"Gifts Sent in Stages","narration":"Jacob selects animals from his possessions as a gift for Esau. He doesn't send them all in one cluster. He has servants bring separate groups ahead of him, leaving spaces between them. Every arriving group carries the same message.","scripture":[{"reference":"Genesis 32:13–21","url":"https://www.jw.org/en/library/bible/nwt/books/genesis/32/"}],"interaction":{"type":"word_connect","prompt":"Jacob sent Esau's animals in separate traveling groups. What were those groups called?","answer":"DROVES"},"progressiveHints":[{"level":1,"text":"The animals did not all move together."},{"level":2,"text":"Servants guided each group with space between groups."},{"level":3,"text":"The Bible uses a word for groups of livestock being driven along."}],"explanation":"Jacob arranged the gift in separate droves so the groups would arrive one after another. He hoped the gift would help Esau receive him kindly; the Bible explains Jacob's thinking rather than guaranteeing how Esau would respond.","tone":"conversational_story","graphicViolence":false},{"id":"g12-d07","sequence":7,"title":"A Crossing in the Night","narration":"During the night, Jacob moves his household across a ford, along with everything he has. Afterward he is left alone. The account is about to take an unexpected turn, and the location matters enough for Genesis to name it.","scripture":[{"reference":"Genesis 32:22–24","url":"https://www.jw.org/en/library/bible/nwt/books/genesis/32/"}],"interaction":{"type":"word_connect","prompt":"Which ford did Jacob's household cross before he was left alone?","answer":"JABBOK"},"progressiveHints":[{"level":1,"text":"This was a crossing in a stream, not a city."},{"level":2,"text":"The location was a named watercourse on the journey."},{"level":3,"text":"Genesis 32:22 gives the name of the ford."}],"explanation":"Jacob brought his family and belongings across the ford of Jabbok. Then he was left alone. The Bible places the striking encounter that followed in this very specific setting.","tone":"conversational_story","graphicViolence":false},{"id":"g12-d08","sequence":8,"title":"The Name He Would Carry","narration":"When Jacob is alone, a man wrestles with him until dawn. Even after his hip is injured, Jacob won't let go without a blessing. His perseverance leads to an unforgettable change: he receives a new name.","scripture":[{"reference":"Genesis 32:24–29","url":"https://www.jw.org/en/library/bible/nwt/books/genesis/32/"}],"interaction":{"type":"word_connect","prompt":"What new name did Jacob receive after the night of wrestling?","answer":"ISRAEL"},"progressiveHints":[{"level":1,"text":"The name reflects the unusual struggle that just took place."},{"level":2,"text":"This name later becomes closely connected with Jacob's descendants."},{"level":3,"text":"Its meaning relates to contending or persevering with God."}],"explanation":"Jacob received the name Israel, associated with contending or persevering with God. The account emphasizes his determination to seek a blessing, even after the socket of his hip was injured.","tone":"conversational_story","graphicViolence":false},{"id":"g12-d09","sequence":9,"title":"The Place He Remembered","narration":"The night ends with a blessing. Jacob gives the location a new name because of what happened there, and he walks away limping. It's a moment he won't easily forget, and the name itself helps explain why.","scripture":[{"reference":"Genesis 32:29–32","url":"https://www.jw.org/en/library/bible/nwt/books/genesis/32/"}],"interaction":{"type":"word_connect","prompt":"What did Jacob name the place after the extraordinary encounter?","answer":"PENIEL"},"progressiveHints":[{"level":1,"text":"It's a place name, separate from his new personal name."},{"level":2,"text":"Jacob connected the name with having seen God face-to-face."},{"level":3,"text":"The name means “Face of God.”"}],"explanation":"Jacob called the place Peniel, meaning “Face of God.” Genesis records his words about seeing God face-to-face and surviving. The encounter involved God's angelic representative; the text also explains why Jacob was limping afterward.","tone":"conversational_story","graphicViolence":false},{"id":"g12-d10","sequence":10,"title":"Seven Times to the Ground","narration":"The long-awaited meeting finally arrives. Esau is coming with the 400 men. Jacob arranges his household, then goes out ahead of them himself. As he approaches his brother, he repeatedly lowers himself to the ground.","scripture":[{"reference":"Genesis 33:1–3","url":"https://www.jw.org/en/library/bible/nwt/books/genesis/33/"}],"interaction":{"type":"word_connect","prompt":"What did Jacob do seven times as he approached Esau?","answer":"BOWED"},"progressiveHints":[{"level":1,"text":"He moved toward his brother rather than hiding behind the family."},{"level":2,"text":"This was a visible gesture of respect and humility."},{"level":3,"text":"He lowered himself toward the ground repeatedly."}],"explanation":"Jacob bowed seven times as he approached Esau. That's a striking picture of humility when we remember the brothers' troubled history. Genesis describes the action, then lets us see Esau's response in the next verse.","tone":"conversational_story","graphicViolence":false},{"id":"g12-d11","sequence":11,"title":"A Reunion Nobody Could Assume","narration":"Jacob feared that Esau might attack, but the Bible now tells us plainly what happens. Esau runs toward him, closes the distance, and welcomes him with affection. Both brothers cry.","scripture":[{"reference":"Genesis 33:4–11","url":"https://www.jw.org/en/library/bible/nwt/books/genesis/33/"}],"interaction":{"type":"word_connect","prompt":"When Esau ran to meet Jacob, what did he do instead of attacking him?","answer":"EMBRACED"},"progressiveHints":[{"level":1,"text":"The reaction was very different from the danger Jacob feared."},{"level":2,"text":"Esau welcomed Jacob with physical affection."},{"level":3,"text":"He put his arms around his brother."}],"explanation":"Esau embraced Jacob and kissed him, and both burst into tears. Esau initially declined the gifts; Jacob urged him to accept them. The account shows a moving reunion without pretending that Jacob had known how it would unfold.","tone":"conversational_story","graphicViolence":false},{"id":"g12-d12","sequence":12,"title":"Travel at Their Speed","narration":"Esau suggests that they travel together. Jacob explains something practical: children and nursing animals need care, and moving too quickly could harm the flocks. So he chooses a slower journey suited to those in his care.","scripture":[{"reference":"Genesis 33:12–16","url":"https://www.jw.org/en/library/bible/nwt/books/genesis/33/"}],"interaction":{"type":"word_connect","prompt":"What did Jacob adjust so the children and nursing animals could travel safely?","answer":"PACE"},"progressiveHints":[{"level":1,"text":"It's about how the group moved, not where they were going."},{"level":2,"text":"They couldn't be driven as quickly as strong adult travelers."},{"level":3,"text":"He chose a slower traveling speed suited to the youngest and weakest."}],"explanation":"Jacob said he would travel at the pace of his livestock and children. Genesis gives a thoughtful practical reason: driving the animals too hard could endanger them. Esau went ahead toward Seir.","tone":"conversational_story","graphicViolence":false},{"id":"g12-d13","sequence":13,"title":"Safely Back in Canaan","narration":"After the brothers separate, Jacob travels on. He builds shelters for his livestock at Succoth and later arrives safely in Canaan. Near a city, he pitches his camp, buys a piece of land, and builds an altar.","scripture":[{"reference":"Genesis 33:17–20","url":"https://www.jw.org/en/library/bible/nwt/books/genesis/33/"}],"interaction":{"type":"word_connect","prompt":"Near which city did Jacob set up camp after reaching Canaan safely?","answer":"SHECHEM"},"progressiveHints":[{"level":1,"text":"This was in the land Jacob had been traveling back toward."},{"level":2,"text":"The city is named after he leaves Succoth."},{"level":3,"text":"Genesis 33:18 names the city near his new camp."}],"explanation":"Jacob arrived safely near Shechem in Canaan, bought land there, and built an altar. His journey home didn't end with a dramatic speech; Genesis gives these practical details of where the household settled next.","tone":"conversational_story","graphicViolence":false}],"completionMessage":"Jacob and Esau are reunited, and Jacob arrives safely in Canaan. You followed the account from an anxious journey to a peaceful reunion."};
const words={"g12-d01":{"clue":"After seeing God's angels, what did Jacob call the place?","answer":"MAHANAIM","explanation":"The name Mahanaim means “Two Camps.” Jacob used it when he recognized God's camp. It's a brief moment, but it comes just before a difficult reunion with his brother.","hint1":"It was the name of a location, not the name of an angel.","hint2":"Jacob thought of a camp that belonged to God.","hint3":"The place name refers to two camps.","basis":"scripture","reference":"Genesis 32:1–2"},"g12-d02":{"clue":"Before meeting Esau face-to-face, whom did Jacob send ahead?","answer":"MESSENGERS","explanation":"Jacob's messengers carried his respectful words to Esau. They returned with unsettling news: Esau was on his way with 400 men. Jacob still didn't know how the reunion would go.","hint1":"Jacob wanted his brother to hear from him before they met.","hint2":"He chose people who could carry his words to Seir.","hint3":"They returned with news that Esau was approaching.","basis":"scripture","reference":"Genesis 32:3–6"},"g12-d03":{"clue":"If one of Jacob's two camps was attacked, what could the other do?","answer":"ESCAPE","explanation":"Jacob hoped that dividing the household would leave one camp able to escape if the other was attacked. Genesis openly mentions his fear. Courage doesn't have to mean pretending danger isn't there.","hint1":"Jacob was planning for danger, not arranging a celebration.","hint2":"The two groups would not necessarily face the same outcome.","hint3":"The other group could get away if the first was attacked.","basis":"scripture","reference":"Genesis 32:6–8"},"g12-d04":{"clue":"Jacob remembered Jehovah's promise and asked for protection. What did he offer?","answer":"PRAYER","explanation":"Jacob's prayer recalls Jehovah's instructions and promises, expresses gratitude, and honestly asks for rescue from Esau. The account shows both practical planning and reliance on Jehovah.","hint1":"This was more than planning where everyone would camp.","hint2":"He addressed Jehovah and asked for help.","hint3":"He spoke directly to God about his fear and the promise.","basis":"scripture","reference":"Genesis 32:9–12"},"g12-d05":{"clue":"What single possession did Jacob mention having when he first crossed the Jordan?","answer":"STAFF","explanation":"Jacob said he crossed the Jordan with only his staff, but now he had become two camps. Rather than taking credit for his prosperity, he spoke of Jehovah's loyal love and faithfulness.","hint1":"He's remembering how little he carried on his earlier journey.","hint2":"It was something useful for walking and shepherding.","hint3":"It was a simple wooden object carried by a traveler.","basis":"scripture","reference":"Genesis 32:9–10"},"g12-d06":{"clue":"Jacob sent Esau's animals in separate traveling groups. What were those groups called?","answer":"DROVES","explanation":"Jacob arranged the gift in separate droves so the groups would arrive one after another. He hoped the gift would help Esau receive him kindly; the Bible explains Jacob's thinking rather than guaranteeing how Esau would respond.","hint1":"The animals did not all move together.","hint2":"Servants guided each group with space between groups.","hint3":"The Bible uses a word for groups of livestock being driven along.","basis":"scripture","reference":"Genesis 32:13–21"},"g12-d07":{"clue":"Which ford did Jacob's household cross before he was left alone?","answer":"JABBOK","explanation":"Jacob brought his family and belongings across the ford of Jabbok. Then he was left alone. The Bible places the striking encounter that followed in this very specific setting.","hint1":"This was a crossing in a stream, not a city.","hint2":"The location was a named watercourse on the journey.","hint3":"Genesis 32:22 gives the name of the ford.","basis":"scripture","reference":"Genesis 32:22–24"},"g12-d08":{"clue":"What new name did Jacob receive after the night of wrestling?","answer":"ISRAEL","explanation":"Jacob received the name Israel, associated with contending or persevering with God. The account emphasizes his determination to seek a blessing, even after the socket of his hip was injured.","hint1":"The name reflects the unusual struggle that just took place.","hint2":"This name later becomes closely connected with Jacob's descendants.","hint3":"Its meaning relates to contending or persevering with God.","basis":"scripture","reference":"Genesis 32:24–29"},"g12-d09":{"clue":"What did Jacob name the place after the extraordinary encounter?","answer":"PENIEL","explanation":"Jacob called the place Peniel, meaning “Face of God.” Genesis records his words about seeing God face-to-face and surviving. The encounter involved God's angelic representative; the text also explains why Jacob was limping afterward.","hint1":"It's a place name, separate from his new personal name.","hint2":"Jacob connected the name with having seen God face-to-face.","hint3":"The name means “Face of God.”","basis":"scripture","reference":"Genesis 32:29–32"},"g12-d10":{"clue":"What did Jacob do seven times as he approached Esau?","answer":"BOWED","explanation":"Jacob bowed seven times as he approached Esau. That's a striking picture of humility when we remember the brothers' troubled history. Genesis describes the action, then lets us see Esau's response in the next verse.","hint1":"He moved toward his brother rather than hiding behind the family.","hint2":"This was a visible gesture of respect and humility.","hint3":"He lowered himself toward the ground repeatedly.","basis":"scripture","reference":"Genesis 33:1–3"},"g12-d11":{"clue":"When Esau ran to meet Jacob, what did he do instead of attacking him?","answer":"EMBRACED","explanation":"Esau embraced Jacob and kissed him, and both burst into tears. Esau initially declined the gifts; Jacob urged him to accept them. The account shows a moving reunion without pretending that Jacob had known how it would unfold.","hint1":"The reaction was very different from the danger Jacob feared.","hint2":"Esau welcomed Jacob with physical affection.","hint3":"He put his arms around his brother.","basis":"scripture","reference":"Genesis 33:4–11"},"g12-d12":{"clue":"What did Jacob adjust so the children and nursing animals could travel safely?","answer":"PACE","explanation":"Jacob said he would travel at the pace of his livestock and children. Genesis gives a thoughtful practical reason: driving the animals too hard could endanger them. Esau went ahead toward Seir.","hint1":"It's about how the group moved, not where they were going.","hint2":"They couldn't be driven as quickly as strong adult travelers.","hint3":"He chose a slower traveling speed suited to the youngest and weakest.","basis":"scripture","reference":"Genesis 33:12–16"},"g12-d13":{"clue":"Near which city did Jacob set up camp after reaching Canaan safely?","answer":"SHECHEM","explanation":"Jacob arrived safely near Shechem in Canaan, bought land there, and built an altar. His journey home didn't end with a dramatic speech; Genesis gives these practical details of where the household settled next.","hint1":"This was in the land Jacob had been traveling back toward.","hint2":"The city is named after he leaves Succoth.","hint3":"Genesis 33:18 names the city near his new camp.","basis":"scripture","reference":"Genesis 33:17–20"}};
if(chapter.discoveries.length!==13||Object.keys(words).length!==13)throw Error('G12 count mismatch');
for(const d of chapter.discoveries){
 if(!words[d.id]||words[d.id].answer!==d.interaction.answer||d.interaction.type!=='word_connect'||d.progressiveHints?.length!==3)throw Error('G12 puzzle mismatch: '+d.id);
}
BU3857_DATA[ID]=chapter;Object.assign(BU_HQ_WORDS,words);
chapter.illustrationStatus='13 individual approved 640x360 historical reconstructions';
const G12_ART=Object.freeze(Object.fromEntries(chapter.discoveries.map(d=>{
 if(!/^g12-d(0[1-9]|1[0-3])$/.test(d.id))throw Error('Invalid Genesis 12 image id '+d.id);
 const plan=chapter.artPlan?.[d.id];
 return [d.id,Object.freeze({
  src:'story-adventure-art/genesis12/'+d.id+'.webp',
  alt:(plan?.alt||('Historical reconstruction: '+d.title+' (Genesis 32–33)'))+'; artistic reconstruction'
 })];
})));
/* Let the original engine use its own figure styling whenever its maps
   support extension. Otherwise add the exact same image to its rendered
   native discovery, without touching earlier chapter art or the wheel. */
if(typeof BU3857_SCENE_ART!=='undefined'&&typeof BU3857_SCENE_ALT!=='undefined'&&
   Object.isExtensible(BU3857_SCENE_ART)&&Object.isExtensible(BU3857_SCENE_ALT)){
 for(const [id,a] of Object.entries(G12_ART)){
  BU3857_SCENE_ART[id]=a.src;BU3857_SCENE_ALT[id]=a.alt;
 }
}
const originalG12Render=bu3857Render;
bu3857Render=function(){
 const result=originalG12Render.apply(this,arguments);
 if(bu3857State?.book!==ID)return result;
 const d=bu3857Current?.(),a=d&&G12_ART[d.id];
 if(!a)return result;
 const root=document.getElementById('bu3857-content');
 if(!root)return result;
 let figure=root.querySelector('figure.bu3863-image');
 if(!figure){
  figure=document.createElement('figure');figure.className='bu3863-image';
  const story=root.querySelector('#bu3863-story');
  const anchor=story||root.querySelector('#buhq-wheel');
  if(anchor?.parentNode)anchor.parentNode.insertBefore(figure,anchor);
  else root.prepend(figure);
 }
 let img=figure.querySelector('img');
 if(!img){img=document.createElement('img');figure.prepend(img)}
 if(img.getAttribute('src')!==a.src)img.setAttribute('src',a.src);
 img.alt=a.alt;img.loading='eager';img.decoding='async';
 return result;
};
if(!BU_GENESIS_IDS.includes(ID))BU_GENESIS_IDS.push(ID);
if(!EPISODES.some(e=>e[0]===chapter.title))EPISODES.push([chapter.title,'Genesis 32–33 · 13 interactive discoveries']);
try{
 const saved=bu3857ReadSave(BU_GENESIS_KEY)[ID];
 if(saved&&typeof saved==='object'&&!Array.isArray(saved)){bu3857Saved[ID]=saved;if(saved.complete)completedChapters[ID]=true;}
}catch(e){console.warn('[G12] Chapter save recovery failed',e)}
const originalEpisodes=makeEpisodes;
makeEpisodes=function(){
 originalEpisodes();
 if(bu3854EpisodeBook==='exodus')return;
 const card=document.querySelector('#episode-list [data-episode="11"]');
 if(!card)return;
 const available=!!completedChapters.genesis_ep11||!!completedChapters[ID];
 const status=completedChapters[ID]?'✓ COMPLETE · REPLAY ANY TIME':available?'✦ PLAYABLE CHAPTER':'◇ LOCKED · COMPLETE PRIOR EPISODE';
 card.classList.toggle('available',available);
 const statusNode=card.querySelector('.episode-status');if(statusNode)statusNode.textContent=status;
 const image=card.querySelector('.episode-thumb img');
 if(image){image.src=G12_ART['g12-d01'].src;image.alt='Jacob encounters angels near Mahanaim; Episode 12 artwork';}
 card.setAttribute('aria-label',chapter.title+': '+status);
 card.onclick=function(){if(available)bu3857Open(ID);else notify('Finish Genesis Episode 11 to unlock this chapter.');};
 const sub=document.querySelector('#episodes .episode-headline small');
 if(sub){const list=['genesis','eden','cain','noah','babel','abraham'].concat(BU_GENESIS_IDS);
  const n=list.reduce((count,id,i)=>count+(i===0||!!completedChapters[list[i-1]]?1:0),0);
  sub.textContent=n+' of 12 episodes available · progress to unlock the next';
 }
};
const originalJourney=updateJourney;
updateJourney=function(celebrate){
 originalJourney(celebrate);
 const list=['genesis','eden','cain','noah','babel','abraham'].concat(BU_GENESIS_IDS),done=list.filter(id=>!!completedChapters[id]).length;
 const label=document.getElementById('journey-progress-label');if(label)label.textContent='Genesis adventures: '+done+' of 12 playable episodes complete';
 const bar=document.getElementById('journey-progress-fill');
 if(bar){bar.style.width=(done/12*100)+'%';bar.setAttribute('aria-valuemax','12');bar.setAttribute('aria-valuenow',String(done));}
 const stop=document.querySelector('#journey-stops [data-stop="1"]');
 if(stop){const n=stop.querySelector('.route-number'),s=stop.querySelector('small');
  if(n)n.textContent=n.textContent.replace('5 EPISODES','6 EPISODES');
  if(s)s.textContent=s.textContent.replace('Episodes 7–11','Episodes 7–12');}
};
const originalRender=bu3857Render;
bu3857Render=function(){
 originalRender();
 const s=bu3857State;if(!s||!s.complete||s.book!=='genesis_ep11')return;
 const next=document.getElementById('bu3857-next-episode');
 if(next){next.textContent='Next Genesis Episode →';next.onclick=function(){bu3857Open(ID);};}
};
const originalBind=buHQBind;
buHQBind=function(){
 const s=bu3857State,d=s&&s.book===ID?bu3857Current():null;
 if(d)buHQHintLetters[d.id]=0;
 originalBind();
 if(d){buHQHintLetters[d.id]=0;buHQUpdate();}
};
// Native Episode 12 has the same 3 contextual hints as Episode 11,
// not the older progression into letter reveals.
const originalHint=bu3857Hint;
bu3857Hint=function(){
 const st=bu3857State;
 if(!st||st.book!==ID)return originalHint();
 if(st.complete)return;
 const d=bu3857Current();if(!d||st.solved[d.id])return;
 const word=BU_HQ_WORDS[d.id],receipt='story-assist-v1:'+ID+':'+d.id;
 const num=v=>Math.max(0,Math.trunc(Number(v)||0));
 function level(){bu3824RefreshWallet();return Math.min(3,Math.max(num(st.hints[d.id]),num(economy.hints[receipt])));}
 function charge(next,cost){
  bu3824RefreshWallet();if(num(economy.hints[receipt])>=next)return true;
  if(num(economy.coins)<cost)return false;
  const before=JSON.parse(JSON.stringify(economy));
  economy.hints[receipt]=next;economy.coins-=cost;
  if(saveEconomy()!==true){economy=before;updateWallet();return false;}
  updateWallet();if(cost)playCoinFx('spend');return true;
 }
 if(level()===0){
  if(!charge(1,0)){bu3864Modal('Hints unavailable','The free clue could not be saved. No tokens deducted.');return;}
  st.hints[d.id]=1;st.feedback='';bu3857Save();bu3857Render();
 }else st.hints[d.id]=level();
 bu3864Modal('Discovery hint','');
 const layer=document.getElementById('bu3864-modal-layer');if(!layer)return;
 const body=layer.querySelector('.bu3864-modal-body'),buy=document.createElement('button'),warning=document.createElement('p');
 buy.type='button';buy.className='gold-button';buy.style.cssText='width:100%;min-height:44px;padding:10px 13px;border-radius:12px;font-weight:800;margin-top:8px';
 warning.setAttribute('role','status');warning.style.cssText='font-size:13px;color:#ffe2a3;margin:8px 0 0';
 function refresh(){
  const n=level();body.replaceChildren();
  [word.hint1,n>=2?word.hint2:null,n>=3?word.hint3:null].forEach((line,i)=>{
   if(!line)return;
   const p=document.createElement('p'),label=document.createElement('strong');
   label.textContent=i===0?'Free hint: ':'Additional hint: ';
   p.append(label,document.createTextNode(String(line)));body.append(p);
  });
  buy.hidden=n>=3;
  if(n<3){buy.textContent='Stronger hint · '+(n===1?15:25)+' Insight Tokens';buy.setAttribute('aria-label',buy.textContent);}
  body.append(warning,buy);
 }
 buy.onclick=function(){
  const before=level(),price=before===1?15:25;
  if(before>=3)return;
  if(num(economy.coins)<price){warning.textContent='Not enough Insight Tokens. No tokens deducted.';return;}
  if(!charge(before+1,price)){warning.textContent='Hint not purchased. No additional charge made.';return;}
  st.hints[d.id]=before+1;st.feedback='';buHQHintLetters[d.id]=0;
  bu3857Save();bu3857Render();warning.textContent='';refresh();
 };
 refresh();
};
window.BUStoryGenesis12Test=Object.freeze({chapterId:ID,discoveryCount:13,wordCount:13,artStatus:'13 individual 640x360 approved scene illustrations'});
})();