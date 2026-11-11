/* Bible Unfolded · Meaningful Daily Discovery · editorial TEST collection
 * Each source was checked against the NWT (2013), JW.org Study Bible,
 * or official Insight/history material on 2026-11-10 and 2026-11-11.
 * This is freshly written synopsis/reflect/share copy, NOT Bible quotation.
 * Historical statements are explicitly identified as such, and personal
 * applications are framed as reflections, not invented Bible quotations.
 * The 30-item catalog is an editorial pilot, not an infinite library.
 * Days 19–30 are sourced in docs/DAILY_DISCOVERY_EDITORIAL_19_TO_30_2026-11-11.md.
 */
(()=>{'use strict';
const B='https://www.jw.org/en/library/bible/nwt/books/';
const I='https://www.jw.org/en/library/books/Insight-on-the-Scriptures/';
/* Permanent reusable in-repository visual pool. Add to this array only after
 * curating and approving an image; never request one photo per discovery.
 * Entry order determines artwork, so Saved / Today / Share show the same
 * image for a given discovery, even when opened weeks later. */
const ROTATING_ART=Object.freeze([
 'daily-discovery-hero.webp',
 'journey-art/01_the_beginning.webp',
 'journey-art/02_faith_promises.webp',
 'journey-art/03_deliverance.webp',
 'journey-art/04_judges_kings.webp',
 'journey-art/05_exile_return.webp',
 'journey-art/06_the_messiah.webp',
 'journey-art/07_good_news_spreads.webp'
]);
const items=[
{
 id:'nile',category:'ANCIENT EGYPT',title:'A River That Helped Sustain an Empire',
 subtitle:'The Nile was much more than scenery in the Bible accounts.',
 source:'Nile — Insight on the Scriptures',reference:'Insight on the Scriptures · Nile',url:I+'Nile/',
 body:[
 "It's hard to imagine ancient Egypt without the Nile! Farmers depended on its water, people caught fish there, and boats carried travelers and goods. Even the papyrus used for writing grew along its banks.",
 'Now picture Moses being placed among the reeds by that same river. The setting was not a quiet, insignificant stream. It was part of the daily life of an entire civilization.',
 "Doesn't that make Moses' early life easier to picture? These weren't just figures in an old story. They were real families living beside a river that shaped everyday life."
 ],takeaway:'Historical details can make a familiar Bible account feel like a real place, not just a story.',
 reflect:'When you read a Bible account, what detail about everyday life might help you picture it more clearly?',
 share:{moment:'When someone enjoys history, travel, or interesting facts.',opener:'Did you know how important the Nile was to everyday life in ancient Egypt?',thought:'Its water affected farming, travel, and even writing materials. That is the setting behind parts of the Moses account.',question:'Do you find Bible history more interesting when you can picture the world people lived in?',bridge:'If they are interested, you could read the opening of Exodus 2 together.',reference:'Exodus 2:1–10',url:B+'exodus/2/'}
},
{
 id:'peter',category:'ENCOURAGEMENT',title:'Jesus Saw Potential Where Peter Saw Imperfection',
 subtitle:'A surprising response after the remarkable catch of fish.',
 source:'Luke 5:8–11 — New World Translation',reference:'Luke 5:8–11',url:B+'luke/5/',
 body:[
 "When Peter saw that enormous catch of fish, he didn't start congratulating himself. Instead, he told Jesus he was a sinful man. At that moment, Peter could see his own imperfections all too clearly.",
 "But look at how Jesus responded! He didn't turn Peter away. He reassured him and gave him a meaningful work to do. Peter went on to follow him.",
 "Isn't that a comforting contrast? Peter saw his weaknesses, but Jesus could see what Peter might become. He didn't have to be perfect before he could do something worthwhile."
 ],takeaway:'Recognizing our shortcomings does not mean our efforts have no value.',
 reflect:'Am I sometimes so focused on what I lack that I overlook the good I can still do?',
 share:{moment:'When someone says they are not good enough or have made too many mistakes.',opener:'Have you ever felt that your weaknesses mattered more than your good intentions?',thought:'Peter felt unworthy, yet Jesus reassured him and invited him to do meaningful work.',question:'Could it be encouraging to know that imperfections do not have to define a person?',bridge:'Luke 5 shows that moment in just a few verses.',reference:'Luke 5:8–11',url:B+'luke/5/'}
},
{
 id:'early-students',category:'ORGANIZATIONAL HISTORY',title:'A Small Bible Study That Kept Asking Questions',
 subtitle:'A look at the early Bible Students near Pittsburgh.',
 source:'Proclaiming the Lord’s Return (1870–1914) — JW.org',reference:'Historical account · 1870',url:'https://www.jw.org/en/library/books/Jehovahs-Witnesses-Proclaimers-of-Gods-Kingdom/You-Are-My-Witnesses-Says-Jehovah/Proclaiming-the-Lords-Return-1870-1914/',
 body:[
 "Picture a small group near Pittsburgh in 1870, sitting together with their Bibles. Charles Taze Russell and some acquaintances would raise a question, look up related scriptures, and compare what they found. Nothing fancy—just people who wanted to understand.",
 "They didn't have the online search tools we use today. They had questions, Bibles, and the willingness to keep studying.",
 'Their story is a reminder of how powerful a sincere question can be. Careful study is not simply about collecting answers; it can change the way we see an entire subject.'
 ],takeaway:'Good questions can open the door to deeper Bible understanding.',
 reflect:'Is there a Bible question I have always wondered about but never taken time to explore?',
 share:{moment:'When someone is curious about how Jehovah’s Witnesses began studying the Bible.',opener:'Did you know that early Bible Students often started with a question, then compared related scriptures?',thought:'A small group near Pittsburgh used that method in 1870, long before the digital study tools we have now.',question:'Is there a question about the Bible you would enjoy exploring together?',bridge:'If they want the history, the JW.org article traces those early meetings.',reference:'Historical account on JW.org',url:'https://www.jw.org/en/library/books/Jehovahs-Witnesses-Proclaimers-of-Gods-Kingdom/You-Are-My-Witnesses-Says-Jehovah/Proclaiming-the-Lords-Return-1870-1914/'}
},
{
 id:'gleaning',category:'LIFE IN ANCIENT ISRAEL',title:'Why Farmers Were Told Not to Take Everything',
 subtitle:'One law quietly protected people in need.',
 source:'Leviticus 19:9–10 — New World Translation',reference:'Leviticus 19:9–10',url:B+'leviticus/19/',
 body:[
 "Imagine working hard to grow a crop, then being told not to gather every last bit of it. That's exactly what Israel's Law required! Farmers were to leave some food behind for people in need and for foreign residents.",
 'This was more than a rule about farming. It made room for vulnerable people to obtain food while working to gather it. Ruth later benefited from the practice of gleaning.',
 "Isn't it moving that this concern for others was built right into an everyday job like harvesting?"
 ],takeaway:'Compassion can be shown through practical arrangements, not only kind words.',
 reflect:'Is there a simple way I could make life a little easier for someone around me?',
 share:{moment:'When a conversation turns to fairness, kindness, or concern for people in need.',opener:'Have you ever heard of the ancient Israelite practice of leaving some of a harvest for others?',thought:'The Law told farmers to leave part of their crops for people in need and foreign residents.',question:'What do you think that says about the value of practical kindness?',bridge:'Leviticus 19:9–10 explains the arrangement.',reference:'Leviticus 19:9–10',url:B+'leviticus/19/'}
},
{
 id:'naaman-girl',category:'BIBLE PEOPLE',title:'One Young Girl Spoke Up for Someone Else',
 subtitle:'A brief moment in the account of Naaman.',
 source:'2 Kings 5:1–5 — New World Translation',reference:'2 Kings 5:1–5',url:B+'2-kings/5/',
 body:[
 "Here's a young Israelite girl who'd been taken captive and was serving in Naaman's home in Syria. When she heard about his illness, she spoke up. She told Naaman's wife about a prophet in Samaria who could help.",
 "We don't even know this girl's name! Yet the Bible remembers her words, and what she said helped set remarkable events in motion. Her difficult circumstances didn't silence her concern for someone else.",
 'It is remarkable that such a short statement from someone with so little status is included in the record.'
 ],takeaway:'A thoughtful word can matter even when the person speaking feels overlooked.',
 reflect:'Have I ever held back a kind or encouraging thought because I felt my voice would not matter?',
 share:{moment:'When someone feels too young, shy, or unimportant to make a difference.',opener:'There is a young girl in the Bible whose name we never learn, but her words made a difference.',thought:'Although she was a captive servant, she told Naaman’s wife where help might be found.',question:'Isn’t it interesting that a person’s age or position did not make her words unimportant?',bridge:'You can find her brief story at 2 Kings 5:1–5.',reference:'2 Kings 5:1–5',url:B+'2-kings/5/'}
},
{
 id:'stars',category:'JEHOVAH’S QUALITIES',title:'Why Isaiah Invited People to Look Up',
 subtitle:'The stars were part of a message meant to give strength.',
 source:'Isaiah 40:26–31 — New World Translation',reference:'Isaiah 40:26–31',url:B+'isaiah/40/',
 body:[
 "Have you ever looked at a sky full of stars and wondered how many there are? Isaiah tells us Jehovah knows them individually. Then, in the same passage, he speaks about people who are worn out and need strength.",
 'Those ideas belong together. The God described as having immense power is also presented as giving strength to the weary.',
 "That doesn't mean we'll never feel exhausted. But what a reassuring thought: our strength has limits, while Jehovah's doesn't."
 ],takeaway:'A night sky can become a quiet reminder that Jehovah’s strength is not exhausted.',
 reflect:'When I feel overwhelmed, what could help me remember that I do not need to rely on my strength alone?',
 share:{moment:'When someone admires nature or mentions feeling worn out.',opener:'Have you ever thought about why the Bible talks about the stars and tired people in the same passage?',thought:'Isaiah 40 moves from the vastness of the stars to the idea that God can give strength to people who are weary.',question:'Would you find that connection comforting?',bridge:'Isaiah 40:26–31 brings those thoughts together.',reference:'Isaiah 40:26–31',url:B+'isaiah/40/'}
},
{
 id:'radio',category:'ORGANIZATIONAL HISTORY',title:'The Night the Bible Students Went on the Air',
 subtitle:'A remarkable evening in February 1924.',
 source:'Broadcasting the Good News — From Our Archives',reference:'WBBR · February 24, 1924',url:'https://www.jw.org/en/library/series/from-our-archives-1/Broadcasting-the-Good-News/',
 body:[
 "Think about this: on February 24, 1924, the Bible Students began broadcasting from their own radio station, WBBR, on Staten Island, New York. Their first program lasted two whole hours!",
 "Today we can reach people with a phone or a video. But in 1924, radio was a very different way to share a message. Imagine someone at home turning a dial and hearing Bible information over the air!",
 'The station was part of a new way to share Bible information with people who might never have attended a public meeting.'
 ],takeaway:'The methods of sharing Bible knowledge have changed enormously, even while the message remains rooted in Scripture.',
 reflect:'What modern tool has helped me discover or share something encouraging?',
 share:{moment:'When someone talks about radio, technology, or how communication has changed.',opener:'Here is a piece of history I found surprising: Bible Students had their own radio station back in 1924.',thought:'Its first broadcast was made from Staten Island, when radio was still an exciting new technology.',question:'Isn’t it interesting how people have used new technology to share ideas they care about?',bridge:'There is an illustrated history of WBBR on JW.org.',reference:'Broadcasting the Good News',url:'https://www.jw.org/en/library/series/from-our-archives-1/Broadcasting-the-Good-News/'}
},
{
 id:'philip',category:'FIRST-CENTURY PREACHING',title:'Philip Started With a Question',
 subtitle:'An interesting lesson from an unexpected conversation.',
 source:'Acts 8:26–35 — New World Translation',reference:'Acts 8:26–35',url:B+'acts/8/',
 body:[
 "Philip met an Ethiopian official who was reading Isaiah as he traveled. And how did Philip start the conversation? Not with a long speech! He asked whether the man understood what he was reading.",
 'The official welcomed help, and Philip used the passage as a starting point to explain the good news about Jesus.',
 "That's what makes this moment so helpful. Philip took an interest in what the man was already thinking about, then built the conversation from there."
 ],takeaway:'A respectful question can open a better conversation than a prepared speech.',
 reflect:'Do I make room for the other person’s interests and questions when we talk?',
 share:{moment:'When someone is reading, curious about faith, or has a question about a Bible passage.',opener:'One conversation in Acts began with a simple question about what a person was reading.',thought:'Philip listened to the Ethiopian official’s question and explained the passage he was interested in.',question:'Would you like to look at the passage together and see what it says?',bridge:'Acts 8:26–35 describes the whole exchange.',reference:'Acts 8:26–35',url:B+'acts/8/'}
},
{
 id:'ruth',category:'BIBLE PEOPLE',title:'Ruth Was a Foreigner, But Not Invisible',
 subtitle:'Why one field became a place of kindness.',
 source:'Ruth 2:1–16 — New World Translation',reference:'Ruth 2:1–16',url:B+'ruth/2/',
 body:[
 "When Ruth arrived in Bethlehem, she was a Moabite woman caring for her mother-in-law, Naomi. She needed food, so she went into the fields to gather grain that harvesters had left behind. Imagine how unfamiliar everything must have been!",
 'Boaz noticed her. He offered protection, allowed her to stay near his workers, and made sure she could get water. His kindness reached someone who might otherwise have felt like an outsider.',
 "What makes Boaz's kindness stand out? He didn't just say something nice. He helped Ruth feel safer and made it easier for her to get what she needed."
 ],takeaway:'Noticing someone who feels like an outsider can be the beginning of real kindness.',
 reflect:'Who might appreciate being included, remembered, or offered a little practical help?',
 share:{moment:'When someone speaks about being new to a place, alone, or overlooked.',opener:'There’s a Bible account about a woman who moved to a new place and had to gather food from leftover grain.',thought:'A man named Boaz noticed Ruth and went beyond politeness by arranging practical help.',question:'What do you think makes someone truly feel welcome?',bridge:'Ruth chapter 2 tells the story.',reference:'Ruth 2:1–16',url:B+'ruth/2/'}
},
{
 id:'joseph',category:'ANCIENT EGYPT',title:'Joseph’s Advice Was a Plan, Not Just a Prediction',
 subtitle:'A practical detail in Pharaoh’s dream.',
 source:'Genesis 41:25–49 — New World Translation',reference:'Genesis 41:25–49',url:B+'genesis/41/',
 body:[
 "Joseph explained that Egypt would have seven years of plenty followed by seven years of famine. But here's what makes his response so interesting: he didn't stop at explaining the dreams.",
 'He proposed collecting and storing part of the food during the good years. Pharaoh accepted the advice, and food was stored ahead of the famine.',
 "It's easy to remember the seven cows and forget the next part! Joseph's advice included a practical plan that would help people through the difficult years ahead."
 ],takeaway:'Sometimes wisdom means preparing carefully while there is still time.',
 reflect:'Is there a small, wise step I could take today that would make something easier later?',
 share:{moment:'When someone discusses preparing for uncertainty or making sensible plans.',opener:'Have you ever noticed that Joseph did more than interpret Pharaoh’s dreams?',thought:'He also proposed a practical food-storage plan before the years of famine.',question:'Do you think good advice matters most when we act on it?',bridge:'Genesis 41:33–36 contains the proposal.',reference:'Genesis 41:33–36',url:B+'genesis/41/'}
},
{
 id:'samaritan',category:'JESUS’ TEACHINGS',title:'The Samaritan Did Not Just Feel Sorry',
 subtitle:'Look closely at how Jesus described compassion.',
 source:'Luke 10:30–37 — New World Translation',reference:'Luke 10:30–37',url:B+'luke/10/',
 body:[
 "In Jesus' illustration, a Samaritan came across a wounded traveler. He felt pity for the man—but he didn't stop at feeling sorry for him.",
 'He tended the man’s wounds, helped him reach an inn, and arranged for his ongoing care. Compassion cost him time, attention, and money.',
 "Isn't that the part that brings the lesson to life? Compassion wasn't just something the Samaritan felt. It changed what he did."
 ],takeaway:'A compassionate feeling becomes especially powerful when it leads to action.',
 reflect:'Is there a practical kindness I have been thinking about but have not yet acted on?',
 share:{moment:'When someone mentions people showing kindness across differences.',opener:'Do you remember the good Samaritan? There’s an interesting detail in that story.',thought:'He did not only feel sorry for the injured man. He arranged care for him afterward.',question:'What do you think makes kindness truly meaningful?',bridge:'Luke 10:33–37 gives the details.',reference:'Luke 10:33–37',url:B+'luke/10/'}
},
{
 id:'bereans',category:'FIRST-CENTURY HISTORY',title:'The Bereans Checked What They Heard',
 subtitle:'They were eager to learn—and careful to verify.',
 source:'Acts 17:10–12 — New World Translation',reference:'Acts 17:10–12',url:B+'acts/17/',
 body:[
 "When Paul spoke in Beroea, many people were eager to listen. But they didn't simply accept everything they heard. They wanted to check it for themselves.",
 'Acts says they carefully examined the Scriptures daily to see whether what they were hearing was so.',
 "What a fine balance! The Bereans were willing to listen, but they also took the time to make sure what they heard agreed with the Scriptures."
 ],takeaway:'Being willing to learn and being willing to verify can go together.',
 reflect:'When I hear an important claim, do I take time to examine the evidence for myself?',
 share:{moment:'When someone is skeptical of religion or values checking facts.',opener:'The Bible actually praises a group of people for checking whether a religious teacher’s words were true.',thought:'The Bereans listened carefully to Paul but also examined the Scriptures for themselves.',question:'Would you agree that faith should stand up to honest questions?',bridge:'The account is at Acts 17:10–12.',reference:'Acts 17:10–12',url:B+'acts/17/'}
},
{
 id:'mustard',category:'JESUS’ ILLUSTRATIONS',title:'Why Jesus Chose Such a Tiny Seed',
 subtitle:'A simple picture of something that grows.',
 source:'Mark 4:30–32 — New World Translation',reference:'Mark 4:30–32',url:B+'mark/4/',
 body:[
 "Imagine holding a tiny mustard seed between your fingers. Jesus used something that small to help people picture how the Kingdom of God would grow. What a memorable comparison!",
 'People listening to him understood planting and growing. An ordinary part of life became a memorable way to picture the Kingdom’s development.',
 "That's one reason Jesus was such an effective teacher. He could take something people saw every day and use it to explain a much bigger idea."
 ],takeaway:'A simple illustration can help a deep idea stay with us.',
 reflect:'What ordinary sight in nature helps me remember something meaningful from the Bible?',
 share:{moment:'When someone gardens, enjoys plants, or likes practical comparisons.',opener:'Jesus once used a tiny mustard seed to explain something much bigger.',thought:'His illustration made the Kingdom’s growth easier to picture using a familiar plant.',question:'Do you find it easier to remember an idea when someone gives you a good illustration?',bridge:'Mark 4:30–32 records it.',reference:'Mark 4:30–32',url:B+'mark/4/'}
},
{
 id:'ezra',category:'ANCIENT ISRAEL',title:'They Did More Than Read the Words',
 subtitle:'A detail about how the Law was explained.',
 source:'Nehemiah 8:1–12 — New World Translation',reference:'Nehemiah 8:1–12',url:B+'nehemiah/8/',
 body:[
 "After the Jews returned from exile, crowds gathered to hear God's Law read aloud. Ezra read it, and the Levites helped people understand what the words meant. They weren't expected to figure everything out on their own.",
 'The aim was not just for people to hear many words. They needed to grasp the meaning.',
 "Isn't that a beautiful model for teaching? It's not enough for someone to hear the words. We want them to understand what they're hearing."
 ],takeaway:'Understanding a few meaningful words can help more than hearing many words without explanation.',
 reflect:'When I explain something, do I check whether the other person truly understands?',
 share:{moment:'When someone talks about children learning, teaching, or confusion about Bible language.',opener:'Did you know that when the Law was read in ancient Israel, people also helped explain its meaning?',thought:'Nehemiah 8 says they made the reading understandable, not just audible.',question:'What makes an explanation truly helpful to you?',bridge:'Nehemiah 8:7–8 describes it.',reference:'Nehemiah 8:7–8',url:B+'nehemiah/8/'}
},
{
 id:'paul-work',category:'LIFE IN BIBLE TIMES',title:'Paul Had a Trade as Well as a Ministry',
 subtitle:'An overlooked glimpse into his life in Corinth.',
 source:'Acts 18:1–4 — New World Translation',reference:'Acts 18:1–4',url:B+'acts/18/',
 body:[
 "We often picture Paul traveling and preaching. But did you know he also had a trade? When he came to Corinth, he stayed with Aquila and Priscilla. All three worked as tentmakers!",
 'Paul is remembered for traveling and preaching, but the account also shows ordinary work and a friendship built around a skill.',
 "Doesn't that make the first-century congregation feel more real? Like us, those Christians had jobs, homes, friendships, and everyday responsibilities."
 ],takeaway:'Bible characters were real people with everyday work alongside their faith.',
 reflect:'What helps me balance ordinary responsibilities with the things I value most?',
 share:{moment:'When someone talks about work, balancing responsibilities, or life in Bible times.',opener:'Did you know the apostle Paul worked at a trade alongside other people?',thought:'Acts says he stayed with a married couple because all three were tentmakers.',question:'Does knowing that make him feel more like a real person to you?',bridge:'Acts 18:1–4 shows the detail.',reference:'Acts 18:1–4',url:B+'acts/18/'}
},
{
 id:'tears',category:'ENCOURAGEMENT',title:'David Spoke as Though His Tears Were Recorded',
 subtitle:'A moving image from Psalm 56.',
 source:'Psalm 56:3–11 — New World Translation',reference:'Psalm 56:3–11',url:B+'psalms/56/',
 body:[
 "David wrote Psalm 56 during a frightening time. And in verse 8, he used such a tender picture: he spoke as though God could collect his tears and keep a record of them.",
 'It is poetic language, not a statement that literal tears were placed in a container. The image expresses how deeply David wanted his suffering to matter to God.',
 "And notice something comforting: David spoke about fear and trust in the same psalm. He didn't have to pretend he was never afraid."
 ],takeaway:'Being afraid or emotional does not mean a person lacks faith.',
 reflect:'When I feel frightened or upset, can I be honest in prayer instead of pretending everything is fine?',
 share:{moment:'When someone mentions grief, anxiety, or feeling forgotten.',opener:'There is a beautiful picture in the Psalms about tears being remembered.',thought:'David uses poetic language to express the hope that his pain was not invisible to God.',question:'Would you find it comforting to read what he wrote?',bridge:'Psalm 56:3, 8–11 contains the thought.',reference:'Psalm 56:3, 8–11',url:B+'psalms/56/'}
},
{
 id:'well',category:'JESUS’ MINISTRY',title:'Jesus Began With a Drink of Water',
 subtitle:'A conversation at a well led somewhere unexpected.',
 source:'John 4:6–15 — New World Translation',reference:'John 4:6–15',url:B+'john/4/',
 body:[
 "Jesus was tired from traveling, so he stopped beside a well. A Samaritan woman came to draw water, and Jesus simply asked her for a drink. That's how the conversation began!",
 'That simple, everyday request opened a longer conversation about something spiritual. The woman was surprised that he spoke to her because Jews and Samaritans usually kept their distance.',
 "Isn't that a natural way to start? Jesus spoke about something right in front of them, then gently led the conversation toward a deeper subject."
 ],takeaway:'A thoughtful spiritual conversation can begin with something ordinary and natural.',
 reflect:'Do I notice opportunities to listen and connect before bringing up a deeper thought?',
 share:{moment:'When chatting casually with a neighbor, coworker, or someone nearby.',opener:'Jesus once began a spiritual conversation in a remarkably ordinary way—by asking for a drink of water.',thought:'He started with their immediate situation and went on to speak about something more meaningful.',question:'Do you think a good conversation begins with listening rather than a speech?',bridge:'John 4:6–15 tells the story.',reference:'John 4:6–15',url:B+'john/4/'}
},
{
 id:'abigail',category:'BIBLE PEOPLE',title:'Abigail Chose Her Words at a Dangerous Moment',
 subtitle:'Courage and good judgment worked together.',
 source:'1 Samuel 25:14–35 — New World Translation',reference:'1 Samuel 25:14–35',url:B+'1-samuel/25/',
 body:[
 "When Nabal treated David's men badly, the situation quickly became dangerous. Abigail heard what had happened and acted fast! She brought supplies and spoke to David with respect.",
 'She did not pretend there was no problem. She recognized the danger and appealed to David to avoid bloodguilt. He listened and thanked her for stopping him from acting rashly.',
 "Abigail didn't need angry words to show courage. She stayed thoughtful and respectful, even in a tense situation. That's worth remembering."
 ],takeaway:'Carefully chosen words can help calm a difficult situation.',
 reflect:'When tension rises, what helps me speak clearly without making things worse?',
 share:{moment:'When someone mentions arguments, misunderstandings, or difficult family conversations.',opener:'There is a Bible account about a woman whose calm words helped prevent a terrible decision.',thought:'Abigail approached an angry David with courage, respect, and a thoughtful appeal.',question:'Have you ever seen a calm response change the direction of a disagreement?',bridge:'The story is at 1 Samuel 25:14–35.',reference:'1 Samuel 25:14–35',url:B+'1-samuel/25/'}
}
,
{
 id:'hezekiah-water',category:'ANCIENT ENGINEERING',title:'The King Who Had to Think About Water',
 subtitle:'An easy-to-miss detail from ancient Jerusalem.',
 source:'2 Kings 20:20; 2 Chronicles 32:1–8, 30 — New World Translation',
 reference:'2 Kings 20:20; 2 Chronicles 32:1–8, 30',url:B+'2-chronicles/32/',
 body:[
  'Imagine trying to protect a city when an enemy army was approaching. Food and walls mattered, but so did something people used every day: water.',
  'King Hezekiah made preparations to protect Jerusalem. The Bible describes how he arranged to bring water into the city and stop outside sources from helping the invaders. It even mentions a pool and a water channel.',
  "Doesn't that bring the account to life? Hezekiah trusted Jehovah, and he also took practical steps to help protect the city."
 ],takeaway:'Faith and practical preparation can go hand in hand.',
 reflect:'When I face a difficult problem, what useful step can I take while I pray for help?',
 share:{moment:'When someone likes engineering, history, or ancient cities.',opener:'Did you know that an ancient king in the Bible had a major water-supply problem to solve?',thought:'Hezekiah arranged for water to reach Jerusalem while the city faced a threat.',question:'Does it surprise you how many everyday engineering details the Bible preserves?',bridge:'The account is in 2 Chronicles 32 and 2 Kings 20.',reference:'2 Kings 20:20; 2 Chronicles 32:1–8, 30',url:B+'2-kings/20/'}
},
{
 id:'jeremiah-field',category:'HOPE IN DIFFICULT TIMES',title:'Why Buy a Field During a Siege?',
 subtitle:'Jeremiah made a strange-looking purchase for a reason.',
 source:'Jeremiah 32:1–15 — New World Translation',reference:'Jeremiah 32:1–15',url:B+'jeremiah/32/',
 body:[
  "Jerusalem was surrounded by an enemy army, and Jeremiah was under guard. So what did Jehovah tell him to do? Buy a field from a relative! Doesn't that sound like the strangest time to buy property?",
  'Jeremiah paid for the field, arranged for witnesses, and had the purchase documents stored in a clay jar. It was a real transaction, not just a symbolic speech.',
  'Jehovah explained why: people would one day buy houses, fields, and vineyards in that land again. Even while the present looked frightening, the purchase pointed to a future beyond it.'
 ],takeaway:'A hard chapter in life does not have to be the final chapter.',
 reflect:'What promise from Jehovah helps me look beyond a difficult situation right now?',
 share:{moment:'When someone talks about feeling uncertain about the future.',opener:'Here is an unusual Bible detail: Jeremiah bought land while Jerusalem was under siege.',thought:'Jehovah used that ordinary purchase to show that life in the land would not always be as it was then.',question:'Have you ever found hope in a promise when present circumstances looked discouraging?',bridge:'Jeremiah 32:1–15 gives the background.',reference:'Jeremiah 32:1–15',url:B+'jeremiah/32/'}
},
{
 id:'dorcas-clothes',category:'FIRST-CENTURY LIFE',title:'The Clothes That Told a Story',
 subtitle:'What people held up when they remembered Dorcas.',
 source:'Acts 9:36–42 — New World Translation',reference:'Acts 9:36–42',url:B+'acts/9/',
 body:[
  "When Dorcas died in Joppa, the widows who knew her were devastated. And when Peter arrived, what did they show him? The clothes and robes she'd made for others.",
  'Think about what they chose to show him. Not a long list of achievements or a grand speech, but actual clothes that had helped real people. The Bible says she was known for good deeds and gifts of mercy.',
  'Peter later raised Dorcas from the dead. But even before that wonderful event, the account had already shown why she was so loved.'
 ],takeaway:'The kindness we show can leave a lasting impression on people.',
 reflect:'What small, practical kindness could make someone feel cared for this week?',
 share:{moment:'When someone enjoys sewing, volunteering, or helping neighbors.',opener:'There is a woman in Acts whose kindness was remembered through the clothes she made.',thought:'When Dorcas died, widows showed Peter the garments she had made for them.',question:'Is there a simple act of kindness someone did for you that you still remember?',bridge:'You can read that moving scene at Acts 9:36–42.',reference:'Acts 9:36–42',url:B+'acts/9/'}
},
{
 id:'lydia-purple',category:'EVERYDAY LIFE IN BIBLE TIMES',title:'A Purple-Cloth Seller by the River',
 subtitle:'A little trade detail from the first-century congregation.',
 source:'Acts 16:11–15, 40 — New World Translation; Insight on the Scriptures · Lydia',
 reference:'Acts 16:11–15, 40',url:B+'acts/16/',
 body:[
  'Lydia was a seller of purple goods from Thyatira. The city was known for dyeing, and purple cloth was an important trade. She was living in Philippi when Paul arrived.',
  "Paul met Lydia near a river, where some women had gathered for prayer. She listened to his message, accepted what she learned, and invited him and his companions to stay in her home. What a warm welcome!",
  'Those details make her feel like a real person with a livelihood, a home, and a generous spirit. Her story is also a reminder that a good conversation can begin in an ordinary place.'
 ],takeaway:'Everyday routines can lead to meaningful conversations and friendships.',
 reflect:'Where in my normal routine could I show someone genuine interest or hospitality?',
 share:{moment:'When someone talks about clothing, old trades, or the world of the first Christians.',opener:'Did you know that one of the first people Paul met in Philippi sold purple goods?',thought:'Lydia was at a riverside place of prayer when Paul spoke with her, and she later welcomed the visitors into her home.',question:'What everyday detail makes that Bible account come alive for you?',bridge:'Acts 16:11–15 tells how they met.',reference:'Acts 16:11–15',url:B+'acts/16/'}
},
{
 id:'widow-coins',category:'JESUS’ TEACHINGS',title:'Two Small Coins, and Someone Who Noticed',
 subtitle:'Why Jesus drew attention to a quiet contribution.',
 source:'Mark 12:41–44 — New World Translation',reference:'Mark 12:41–44',url:B+'mark/12/',
 body:[
  'Jesus was watching people put money into the temple treasury. Many wealthy people gave large amounts. Then a poor widow dropped in just two very small coins.',
  "Others might've overlooked her small gift. Jesus didn't. He called his disciples over and showed them why those two coins represented such a great personal sacrifice.",
  'This is not a reason to pressure people who are struggling to give away money. The moving part of the account is how Jesus saw the person and the effort behind a gift, not just the amount.'
 ],takeaway:'A modest effort can mean far more than its outward size suggests.',
 reflect:'Do I sometimes judge my efforts by their size instead of by the care behind them?',
 share:{moment:'When someone feels that their little contribution cannot matter.',opener:'Jesus once stopped to talk about a donation that amounted to only two tiny coins.',thought:'He noticed the effort of a poor widow when many larger donations were being made.',question:'Is it reassuring to know that the value of a kind act is not always measured by its size?',bridge:'The account is at Mark 12:41–44.',reference:'Mark 12:41–44',url:B+'mark/12/'}
},
{
 id:'rahab-cord',category:'COURAGE AND FAITH',title:'A Red Cord in a Window',
 subtitle:'One small visible detail in the account of Rahab.',
 source:'Joshua 2:8–21; 6:22–25 — New World Translation',reference:'Joshua 2:8–21; 6:22–25',url:B+'joshua/2/',
 body:[
  'In Jericho, Rahab hid two Israelite spies and told them she believed Jehovah had given the land to Israel. She asked that her family be spared when the city fell.',
  'The spies told her to tie a scarlet cord in her window and gather her family inside the house. Rahab tied the cord in place. Later, the spies brought her family out safely.',
  "That scarlet cord wasn't magical. It was the sign the spies had given her, and Rahab followed their instructions. Her faith wasn't just something she said she had—she acted on it."
 ],takeaway:'Courage often becomes visible through a practical step.',
 reflect:'Is there a good decision I know I should make but have been putting off?',
 share:{moment:'When someone likes the small, vivid details in Bible history.',opener:'Do you remember why there was a red cord hanging from a window in Jericho?',thought:'It was the sign the spies arranged with Rahab so she and her family could be identified when the city fell.',question:'What do you think her quick action tells us about her faith?',bridge:'Joshua 2 gives the promise, and Joshua 6 tells what happened afterward.',reference:'Joshua 2:8–21; 6:22–25',url:B+'joshua/6/'}
}

,
{
 id:'widow-oil',category:'JEHOVAH’S CARE',title:'What Was Left in the House?',
 subtitle:'A widow had almost nothing, but Elisha asked a question.',
 source:'2 Kings 4:1–7 — New World Translation',reference:'2 Kings 4:1–7',url:B+'2-kings/4/',
 body:[
  'A widow was worried that a creditor would take her two sons as slaves. She asked Elisha for help. His first question was simple: What do you have in the house?',
  'All she had was a jar of oil. Elisha told her to borrow empty containers from her neighbors. As her sons handed them over, she kept pouring. The oil continued until there were no more containers.',
  "Elisha told her to sell the oil, pay her debts, and live on what was left. Isn't it touching that the help met the family's very real, everyday needs?"
 ],takeaway:'Jehovah cares about the everyday burdens people carry.',
 reflect:'What practical concern could I bring to Jehovah in prayer today?',
 share:{moment:'When someone is worried about providing for their family.',opener:'There is a beautiful Bible account that starts with a widow saying she has almost nothing left.',thought:'Elisha helped her, and the account specifically mentions paying her debt and caring for her sons.',question:'Do you like that the Bible records concern for practical family problems?',bridge:'You can read the seven-verse account at 2 Kings 4:1–7.',reference:'2 Kings 4:1–7',url:B+'2-kings/4/'}
},
{
 id:'nehemiah-builders',category:'ANCIENT JERUSALEM',title:'Goldsmiths, Families, and a City Wall',
 subtitle:'The surprising variety of people who helped rebuild Jerusalem.',
 source:'Nehemiah 3:1–32 — New World Translation',reference:'Nehemiah 3:1–32',url:B+'nehemiah/3/',
 body:[
  "At first, Nehemiah chapter 3 might look like nothing but a long list of names. But take another look! You'll find a whole community working together to rebuild Jerusalem's wall.",
  'Priests worked on one gate. Goldsmiths and makers of ointment repaired other sections. A man named Shallum worked alongside his daughters. Some people repaired a stretch close to their own home.',
  'These were not all professional builders. Different people took responsibility for different parts. The result was a shared effort, and the Bible remembered many of their names.'
 ],takeaway:'There is value in doing the part we are able to do.',
 reflect:'What strength or skill could I use to support people around me?',
 share:{moment:'When a friend talks about teamwork, family projects, or volunteering.',opener:'Did you know Jerusalem’s wall was repaired by people with very different jobs?',thought:'Nehemiah mentions priests, goldsmiths, ointment makers, and even a family whose daughters helped.',question:'Does that change how you picture the work of rebuilding an ancient city?',bridge:'The details are tucked into Nehemiah chapter 3.',reference:'Nehemiah 3:1–32',url:B+'nehemiah/3/'}
},
{
 id:'paul-storm',category:'COURAGE UNDER PRESSURE',title:'The Most Encouraging Meal on a Stormy Ship',
 subtitle:'Paul gave people a reason to eat when they were terrified.',
 source:'Acts 27:20–38 — New World Translation',reference:'Acts 27:20–38',url:B+'acts/27/',
 body:[
  'A fierce storm battered the ship carrying Paul toward Rome. For days there was no sun or starlight, and the people on board feared they might not survive.',
  'Paul told them to take courage. He explained that God had assured him their lives would be spared, although the ship would be lost. Then, after many anxious days, he urged everyone to eat, gave thanks to God, and began eating himself.',
  "The others took courage and ate too. What a practical kind of encouragement! Paul shared a reassuring message, then helped everyone focus on something they could do right then."
 ],takeaway:'Hope can steady us enough to care for our immediate needs.',
 reflect:'When someone is overwhelmed, could a reassuring word and practical help make a difference?',
 share:{moment:'When someone is stressed, frightened, or going through a crisis.',opener:'Have you ever noticed that Paul encouraged people on a storm-tossed ship to do something very ordinary—eat?',thought:'After explaining why they could have hope, he gave thanks and shared a moment of calm in the middle of danger.',question:'Why do you think a small practical action can help when people are afraid?',bridge:'Acts 27:20–38 tells the whole scene.',reference:'Acts 27:20–38',url:B+'acts/27/'}
},
{
 id:'sparrows',category:'JEHOVAH’S QUALITIES',title:'The Fifth Sparrow',
 subtitle:'A little marketplace detail behind Jesus’ comforting words.',
 source:'Luke 12:6–7 — New World Translation; Study Bible note on Luke 12:6',
 reference:'Luke 12:6–7',url:'https://www.jw.org/en/library/bible/study-bible/books/luke/12/',
 body:[
  'Jesus once used a little market purchase to teach something tender. He said five sparrows could be bought for two coins of small value. The Study Bible explains that the fifth bird may have been added at no extra cost.',
  'Sparrows were not expensive or impressive. Yet Jesus said that not one of them was forgotten by God. Then he told his disciples that they were worth far more than many sparrows.',
  "Isn't that a wonderfully tender illustration? Jesus used a tiny, inexpensive bird to remind his disciples just how much they mattered to God."
 ],takeaway:'We are never too ordinary to matter to Jehovah.',
 reflect:'When I feel overlooked, what does Jesus’ comparison remind me about my worth?',
 share:{moment:'When someone enjoys birds, nature, or little facts from ancient daily life.',opener:'Did you know Jesus once mentioned five sparrows being sold for just two small coins?',thought:'He used that familiar scene to remind his listeners that God does not overlook even a small bird.',question:'How might that thought help someone who feels forgotten?',bridge:'Luke 12:6–7 is brief but really comforting.',reference:'Luke 12:6–7',url:B+'luke/12/'}
},
{
 id:'baruch-scroll',category:'BIBLE HISTORY AND WRITING',title:'A Scroll Was Burned. The Message Was Not Lost.',
 subtitle:'A remarkable moment involving Jeremiah and his secretary Baruch.',
 source:'Jeremiah 36:1–32 — New World Translation',reference:'Jeremiah 36:1–32',url:B+'jeremiah/36/',
 body:[
  'Before printing presses, a message could be written by hand on a scroll. Jeremiah dictated words from Jehovah, and Baruch wrote them down in ink and later read the scroll aloud.',
  "Eventually, the message reached King Jehoiakim. He cut up the scroll and threw it into the fire. You might think that was the end of it. But it wasn't!",
  'Jehovah told Jeremiah to take another scroll. Baruch wrote the words again, and more were added. The event reminds us that destroying the paper was not the same as silencing the message.'
 ],takeaway:'Truth does not lose its worth when someone refuses to hear it.',
 reflect:'What helps me remain calm when something important to me is dismissed?',
 share:{moment:'When someone talks about old books, writing, or how ancient texts survived.',opener:'There is a surprising Bible story about a king who burned a scroll while it was being read.',thought:'Jeremiah later dictated the message again, and Baruch put it on another scroll.',question:'Does that make you curious about how people preserved important words before printing presses?',bridge:'Jeremiah 36 gives the details.',reference:'Jeremiah 36:1–32',url:B+'jeremiah/36/'}
},
{
 id:'amos-work',category:'BIBLE PEOPLE AND THEIR WORK',title:'The Prophet Who Looked After Fig Trees',
 subtitle:'Amos had a very ordinary job before being sent to speak.',
 source:'Amos 7:10–15 — New World Translation',reference:'Amos 7:10–15',url:B+'amos/7/',
 body:[
  "When you picture a prophet, do you imagine someone who's always held a special position? Amos had quite a different background!",
  'He said that he was a herdsman and that he cared for sycamore fig trees. Then Jehovah took him from following the flock and told him to prophesy to Israel. Later, when a priest tried to send him away, Amos explained how he had received his assignment.',
  'His story is a memorable reminder that a person’s earlier job or social position does not tell us everything about what they can do.'
 ],takeaway:'A humble background does not limit the good a person can accomplish.',
 reflect:'Could I be underestimating someone because of the work they do or where they started?',
 share:{moment:'When someone discusses jobs, farming, or feeling unqualified.',opener:'Here is a Bible detail I did not expect: one prophet used to care for sycamore fig trees.',thought:'Amos said he had been a herdsman before Jehovah sent him to speak to Israel.',question:'Doesn’t that challenge the idea that someone must have an impressive background to make a difference?',bridge:'Amos 7:10–15 tells us how he described his work.',reference:'Amos 7:10–15',url:B+'amos/7/'}
}

];
window.BUDailyDiscoveryImagePool=ROTATING_ART;
window.BUDailyDiscoveryLibrary=Object.freeze(items.map((x,i)=>Object.freeze({
 ...x,art:ROTATING_ART[i%ROTATING_ART.length],
 body:Object.freeze([...x.body]),share:Object.freeze({...x.share})
})));
})();
