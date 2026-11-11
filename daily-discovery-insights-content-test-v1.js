/* Bible Unfolded · Meaningful Daily Discovery · editorial TEST collection
 * Each source link was checked against the actual NWT (2013) or official
 * JW.org history/Insight source on 2026-11-10.
 * This is freshly written synopsis/reflect/share copy, NOT Bible quotation.
 * Historical statements are explicitly identified as such, and personal
 * applications are framed as reflections, not invented Bible quotations.
 * The 18-item catalog is a working editorial pilot, not an infinite library.
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
 'Ancient Egypt depended heavily on the Nile. Its water helped farmers grow crops, supported fishing, and provided a major route for travel. Papyrus plants along the river supplied material that Egyptians used for writing.',
 'Now picture Moses being placed among the reeds by that same river. The setting was not a quiet, insignificant stream. It was part of the daily life of an entire civilization.',
 'Something as familiar as the Nile helps the Bible account become more real. It happened among people who worked, traveled, worried, and raised families just as people do today.'
 ],takeaway:'Historical details can make a familiar Bible account feel like a real place, not just a story.',
 reflect:'When you read a Bible account, what detail about everyday life might help you picture it more clearly?',
 share:{moment:'When someone enjoys history, travel, or interesting facts.',opener:'Did you know how important the Nile was to everyday life in ancient Egypt?',thought:'Its water affected farming, travel, and even writing materials. That is the setting behind parts of the Moses account.',question:'Do you find Bible history more interesting when you can picture the world people lived in?',bridge:'If they are interested, you could read the opening of Exodus 2 together.',reference:'Exodus 2:1–10',url:B+'exodus/2/'}
},
{
 id:'peter',category:'ENCOURAGEMENT',title:'Jesus Saw Potential Where Peter Saw Imperfection',
 subtitle:'A surprising response after the remarkable catch of fish.',
 source:'Luke 5:8–11 — New World Translation',reference:'Luke 5:8–11',url:B+'luke/5/',
 body:[
 'When Peter saw the enormous catch of fish, he did not simply congratulate himself. He told Jesus that he was a sinful man. Peter seemed painfully aware of his shortcomings.',
 'Jesus did not send Peter away. He reassured him and spoke of the meaningful work ahead of him. Peter went on to follow Jesus.',
 'It is a comforting contrast: Peter saw his imperfections; Jesus saw someone who could still be useful. The account does not say that Peter had to become perfect before he could respond.'
 ],takeaway:'Recognizing our shortcomings does not mean our efforts have no value.',
 reflect:'Am I sometimes so focused on what I lack that I overlook the good I can still do?',
 share:{moment:'When someone says they are not good enough or have made too many mistakes.',opener:'Have you ever felt that your weaknesses mattered more than your good intentions?',thought:'Peter felt unworthy, yet Jesus reassured him and invited him to do meaningful work.',question:'Could it be encouraging to know that imperfections do not have to define a person?',bridge:'Luke 5 shows that moment in just a few verses.',reference:'Luke 5:8–11',url:B+'luke/5/'}
},
{
 id:'early-students',category:'ORGANIZATIONAL HISTORY',title:'A Small Bible Study That Kept Asking Questions',
 subtitle:'A look at the early Bible Students near Pittsburgh.',
 source:'Proclaiming the Lord’s Return (1870–1914) — JW.org',reference:'Historical account · 1870',url:'https://www.jw.org/en/library/books/Jehovahs-Witnesses-Proclaimers-of-Gods-Kingdom/You-Are-My-Witnesses-Says-Jehovah/Proclaiming-the-Lords-Return-1870-1914/',
 body:[
 'In 1870, Charles Taze Russell and a few acquaintances in the Pittsburgh area formed a Bible study group. An account of their meetings describes a simple approach: someone raised a question, they looked up related scriptures, and they compared what they found.',
 'They did not have online searches or digital Bible libraries. They were people trying to understand Scripture more carefully.',
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
 'In ancient Israel, harvesters were instructed not to gather every last bit from their fields and vineyards. The remaining food was to be left for people in need and for foreign residents.',
 'This was more than a rule about farming. It made room for vulnerable people to obtain food while working to gather it. Ruth later benefited from the practice of gleaning.',
 'A small detail about harvesting gives us a glimpse of the practical concern built into Israel’s Law.'
 ],takeaway:'Compassion can be shown through practical arrangements, not only kind words.',
 reflect:'Is there a simple way I could make life a little easier for someone around me?',
 share:{moment:'When a conversation turns to fairness, kindness, or concern for people in need.',opener:'Have you ever heard of the ancient Israelite practice of leaving some of a harvest for others?',thought:'The Law told farmers to leave part of their crops for people in need and foreign residents.',question:'What do you think that says about the value of practical kindness?',bridge:'Leviticus 19:9–10 explains the arrangement.',reference:'Leviticus 19:9–10',url:B+'leviticus/19/'}
},
{
 id:'naaman-girl',category:'BIBLE PEOPLE',title:'One Young Girl Spoke Up for Someone Else',
 subtitle:'A brief moment in the account of Naaman.',
 source:'2 Kings 5:1–5 — New World Translation',reference:'2 Kings 5:1–5',url:B+'2-kings/5/',
 body:[
 'A young Israelite girl had been taken captive and was serving in Naaman’s household in Syria. When she learned about his illness, she spoke to his wife about the prophet in Samaria who could help.',
 'The Bible does not give us the girl’s name. Yet her words set important events in motion. Her circumstances were difficult, but the account remembers what she said.',
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
 'Isaiah points people toward the stars and says that Jehovah knows them individually. The same passage goes on to speak about people who feel tired or exhausted.',
 'Those ideas belong together. The God described as having immense power is also presented as giving strength to the weary.',
 'The point is not that tired people will never struggle. It is that they have a reason to look for help beyond their own limited strength.'
 ],takeaway:'A night sky can become a quiet reminder that Jehovah’s strength is not exhausted.',
 reflect:'When I feel overwhelmed, what could help me remember that I do not need to rely on my strength alone?',
 share:{moment:'When someone admires nature or mentions feeling worn out.',opener:'Have you ever thought about why the Bible talks about the stars and tired people in the same passage?',thought:'Isaiah 40 moves from the vastness of the stars to the idea that God can give strength to people who are weary.',question:'Would you find that connection comforting?',bridge:'Isaiah 40:26–31 brings those thoughts together.',reference:'Isaiah 40:26–31',url:B+'isaiah/40/'}
},
{
 id:'radio',category:'ORGANIZATIONAL HISTORY',title:'The Night the Bible Students Went on the Air',
 subtitle:'A remarkable evening in February 1924.',
 source:'Broadcasting the Good News — From Our Archives',reference:'WBBR · February 24, 1924',url:'https://www.jw.org/en/library/series/from-our-archives-1/Broadcasting-the-Good-News/',
 body:[
 'On February 24, 1924, the Bible Students broadcast the first program from their own radio station, WBBR, on Staten Island, New York. The opening program lasted two hours.',
 'Today it is easy to imagine reaching someone through a phone or a video. In 1924, the question was much more basic: would people even be able to hear the broadcast?',
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
 'Philip met an Ethiopian official who was reading from Isaiah while traveling. Instead of immediately delivering a long speech, Philip asked whether the man understood what he was reading.',
 'The official welcomed help, and Philip used the passage as a starting point to explain the good news about Jesus.',
 'The conversation began with genuine interest in what the other man was already thinking about. That is a useful detail worth noticing.'
 ],takeaway:'A respectful question can open a better conversation than a prepared speech.',
 reflect:'Do I make room for the other person’s interests and questions when we talk?',
 share:{moment:'When someone is reading, curious about faith, or has a question about a Bible passage.',opener:'One conversation in Acts began with a simple question about what a person was reading.',thought:'Philip listened to the Ethiopian official’s question and explained the passage he was interested in.',question:'Would you like to look at the passage together and see what it says?',bridge:'Acts 8:26–35 describes the whole exchange.',reference:'Acts 8:26–35',url:B+'acts/8/'}
},
{
 id:'ruth',category:'BIBLE PEOPLE',title:'Ruth Was a Foreigner, But Not Invisible',
 subtitle:'Why one field became a place of kindness.',
 source:'Ruth 2:1–16 — New World Translation',reference:'Ruth 2:1–16',url:B+'ruth/2/',
 body:[
 'Ruth arrived in Bethlehem as a Moabite woman caring for her mother-in-law, Naomi. To get food, she went out to glean grain left after harvesters had passed through the fields.',
 'Boaz noticed her. He offered protection, allowed her to stay near his workers, and made sure she could get water. His kindness reached someone who might otherwise have felt like an outsider.',
 'The account is memorable partly because the kindness is so practical. It was more than a friendly greeting.'
 ],takeaway:'Noticing someone who feels like an outsider can be the beginning of real kindness.',
 reflect:'Who might appreciate being included, remembered, or offered a little practical help?',
 share:{moment:'When someone speaks about being new to a place, alone, or overlooked.',opener:'There’s a Bible account about a woman who moved to a new place and had to gather food from leftover grain.',thought:'A man named Boaz noticed Ruth and went beyond politeness by arranging practical help.',question:'What do you think makes someone truly feel welcome?',bridge:'Ruth chapter 2 tells the story.',reference:'Ruth 2:1–16',url:B+'ruth/2/'}
},
{
 id:'joseph',category:'ANCIENT EGYPT',title:'Joseph’s Advice Was a Plan, Not Just a Prediction',
 subtitle:'A practical detail in Pharaoh’s dream.',
 source:'Genesis 41:25–49 — New World Translation',reference:'Genesis 41:25–49',url:B+'genesis/41/',
 body:[
 'Joseph explained that Egypt would experience seven years of abundance followed by seven years of famine. But he did not stop at explaining the dreams.',
 'He proposed collecting and storing part of the food during the good years. Pharaoh accepted the advice, and food was stored ahead of the famine.',
 'That practical response is easy to miss if we only remember the dreams and the seven cows. The account shows planning and action alongside understanding.'
 ],takeaway:'Sometimes wisdom means preparing carefully while there is still time.',
 reflect:'Is there a small, wise step I could take today that would make something easier later?',
 share:{moment:'When someone discusses preparing for uncertainty or making sensible plans.',opener:'Have you ever noticed that Joseph did more than interpret Pharaoh’s dreams?',thought:'He also proposed a practical food-storage plan before the years of famine.',question:'Do you think good advice matters most when we act on it?',bridge:'Genesis 41:33–36 contains the proposal.',reference:'Genesis 41:33–36',url:B+'genesis/41/'}
},
{
 id:'samaritan',category:'JESUS’ TEACHINGS',title:'The Samaritan Did Not Just Feel Sorry',
 subtitle:'Look closely at how Jesus described compassion.',
 source:'Luke 10:30–37 — New World Translation',reference:'Luke 10:30–37',url:B+'luke/10/',
 body:[
 'In Jesus’ illustration, a Samaritan found a wounded traveler. He felt pity, but the account does not stop with his feelings.',
 'He tended the man’s wounds, helped him reach an inn, and arranged for his ongoing care. Compassion cost him time, attention, and money.',
 'That extra detail helps us see what Jesus was emphasizing. Being a good neighbor can mean doing something useful for someone who needs help.'
 ],takeaway:'A compassionate feeling becomes especially powerful when it leads to action.',
 reflect:'Is there a practical kindness I have been thinking about but have not yet acted on?',
 share:{moment:'When someone mentions people showing kindness across differences.',opener:'Do you remember the good Samaritan? There’s an interesting detail in that story.',thought:'He did not only feel sorry for the injured man. He arranged care for him afterward.',question:'What do you think makes kindness truly meaningful?',bridge:'Luke 10:33–37 gives the details.',reference:'Luke 10:33–37',url:B+'luke/10/'}
},
{
 id:'bereans',category:'FIRST-CENTURY HISTORY',title:'The Bereans Checked What They Heard',
 subtitle:'They were eager to learn—and careful to verify.',
 source:'Acts 17:10–12 — New World Translation',reference:'Acts 17:10–12',url:B+'acts/17/',
 body:[
 'When Paul spoke in Beroea, many listeners were eager to hear what he had to say. But their interest did not mean they accepted every statement without investigation.',
 'Acts says they carefully examined the Scriptures daily to see whether what they were hearing was so.',
 'What stands out is the combination: open-minded enough to listen, thoughtful enough to check. That is a useful attitude in any serious search for truth.'
 ],takeaway:'Being willing to learn and being willing to verify can go together.',
 reflect:'When I hear an important claim, do I take time to examine the evidence for myself?',
 share:{moment:'When someone is skeptical of religion or values checking facts.',opener:'The Bible actually praises a group of people for checking whether a religious teacher’s words were true.',thought:'The Bereans listened carefully to Paul but also examined the Scriptures for themselves.',question:'Would you agree that faith should stand up to honest questions?',bridge:'The account is at Acts 17:10–12.',reference:'Acts 17:10–12',url:B+'acts/17/'}
},
{
 id:'mustard',category:'JESUS’ ILLUSTRATIONS',title:'Why Jesus Chose Such a Tiny Seed',
 subtitle:'A simple picture of something that grows.',
 source:'Mark 4:30–32 — New World Translation',reference:'Mark 4:30–32',url:B+'mark/4/',
 body:[
 'Jesus compared the Kingdom of God to a mustard grain. He pointed to something very small at the start and the impressive growth that could follow.',
 'People listening to him understood planting and growing. An ordinary part of life became a memorable way to picture the Kingdom’s development.',
 'Jesus could explain an important truth without making it sound complicated. One familiar image carried the lesson.'
 ],takeaway:'A simple illustration can help a deep idea stay with us.',
 reflect:'What ordinary sight in nature helps me remember something meaningful from the Bible?',
 share:{moment:'When someone gardens, enjoys plants, or likes practical comparisons.',opener:'Jesus once used a tiny mustard seed to explain something much bigger.',thought:'His illustration made the Kingdom’s growth easier to picture using a familiar plant.',question:'Do you find it easier to remember an idea when someone gives you a good illustration?',bridge:'Mark 4:30–32 records it.',reference:'Mark 4:30–32',url:B+'mark/4/'}
},
{
 id:'ezra',category:'ANCIENT ISRAEL',title:'They Did More Than Read the Words',
 subtitle:'A detail about how the Law was explained.',
 source:'Nehemiah 8:1–12 — New World Translation',reference:'Nehemiah 8:1–12',url:B+'nehemiah/8/',
 body:[
 'After the Jews returned from exile, people gathered to hear the Law read aloud. Ezra read, but the account also describes Levites helping the listeners understand what was being read.',
 'The aim was not just for people to hear many words. They needed to grasp the meaning.',
 'That is a lovely standard for teaching. Real learning happens when information becomes clear enough to understand and use.'
 ],takeaway:'Understanding a few meaningful words can help more than hearing many words without explanation.',
 reflect:'When I explain something, do I check whether the other person truly understands?',
 share:{moment:'When someone talks about children learning, teaching, or confusion about Bible language.',opener:'Did you know that when the Law was read in ancient Israel, people also helped explain its meaning?',thought:'Nehemiah 8 says they made the reading understandable, not just audible.',question:'What makes an explanation truly helpful to you?',bridge:'Nehemiah 8:7–8 describes it.',reference:'Nehemiah 8:7–8',url:B+'nehemiah/8/'}
},
{
 id:'paul-work',category:'LIFE IN BIBLE TIMES',title:'Paul Had a Trade as Well as a Ministry',
 subtitle:'An overlooked glimpse into his life in Corinth.',
 source:'Acts 18:1–4 — New World Translation',reference:'Acts 18:1–4',url:B+'acts/18/',
 body:[
 'When Paul arrived in Corinth, he stayed with Aquila and Priscilla. Acts explains why: they shared the same trade. All three were tentmakers.',
 'Paul is remembered for traveling and preaching, but the account also shows ordinary work and a friendship built around a skill.',
 'It is a little glimpse of how first-century Christians lived. Their days included real jobs, homes, and responsibilities.'
 ],takeaway:'Bible characters were real people with everyday work alongside their faith.',
 reflect:'What helps me balance ordinary responsibilities with the things I value most?',
 share:{moment:'When someone talks about work, balancing responsibilities, or life in Bible times.',opener:'Did you know the apostle Paul worked at a trade alongside other people?',thought:'Acts says he stayed with a married couple because all three were tentmakers.',question:'Does knowing that make him feel more like a real person to you?',bridge:'Acts 18:1–4 shows the detail.',reference:'Acts 18:1–4',url:B+'acts/18/'}
},
{
 id:'tears',category:'ENCOURAGEMENT',title:'David Spoke as Though His Tears Were Recorded',
 subtitle:'A moving image from Psalm 56.',
 source:'Psalm 56:3–11 — New World Translation',reference:'Psalm 56:3–11',url:B+'psalms/56/',
 body:[
 'David wrote Psalm 56 while facing danger and fear. In verse 8 he uses a striking image, speaking as though God could collect his tears and keep a record of them.',
 'It is poetic language, not a statement that literal tears were placed in a container. The image expresses how deeply David wanted his suffering to matter to God.',
 'The same psalm speaks of fear and trust together. David did not pretend that he never felt afraid.'
 ],takeaway:'Being afraid or emotional does not mean a person lacks faith.',
 reflect:'When I feel frightened or upset, can I be honest in prayer instead of pretending everything is fine?',
 share:{moment:'When someone mentions grief, anxiety, or feeling forgotten.',opener:'There is a beautiful picture in the Psalms about tears being remembered.',thought:'David uses poetic language to express the hope that his pain was not invisible to God.',question:'Would you find it comforting to read what he wrote?',bridge:'Psalm 56:3, 8–11 contains the thought.',reference:'Psalm 56:3, 8–11',url:B+'psalms/56/'}
},
{
 id:'well',category:'JESUS’ MINISTRY',title:'Jesus Began With a Drink of Water',
 subtitle:'A conversation at a well led somewhere unexpected.',
 source:'John 4:6–15 — New World Translation',reference:'John 4:6–15',url:B+'john/4/',
 body:[
 'Jesus was tired after traveling and stopped at a well. When a Samaritan woman arrived, he asked her for a drink of water.',
 'That simple, everyday request opened a longer conversation about something spiritual. The woman was surprised that he spoke to her because Jews and Samaritans usually kept their distance.',
 'Jesus started with something happening right in front of them and moved gently into a deeper subject.'
 ],takeaway:'A thoughtful spiritual conversation can begin with something ordinary and natural.',
 reflect:'Do I notice opportunities to listen and connect before bringing up a deeper thought?',
 share:{moment:'When chatting casually with a neighbor, coworker, or someone nearby.',opener:'Jesus once began a spiritual conversation in a remarkably ordinary way—by asking for a drink of water.',thought:'He started with their immediate situation and went on to speak about something more meaningful.',question:'Do you think a good conversation begins with listening rather than a speech?',bridge:'John 4:6–15 tells the story.',reference:'John 4:6–15',url:B+'john/4/'}
},
{
 id:'abigail',category:'BIBLE PEOPLE',title:'Abigail Chose Her Words at a Dangerous Moment',
 subtitle:'Courage and good judgment worked together.',
 source:'1 Samuel 25:14–35 — New World Translation',reference:'1 Samuel 25:14–35',url:B+'1-samuel/25/',
 body:[
 'After Nabal treated David’s men badly, the situation became dangerous. Abigail learned what had happened and acted quickly, bringing supplies and speaking respectfully to David.',
 'She did not pretend there was no problem. She recognized the danger and appealed to David to avoid bloodguilt. He listened and thanked her for stopping him from acting rashly.',
 'Her example shows that courage can be calm, thoughtful, and respectful at the same time.'
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
  'That little detail puts us right into the practical side of Bible history. Facing a threat involved courage, trust in Jehovah, and thoughtful work.'
 ],takeaway:'Faith and practical preparation can go hand in hand.',
 reflect:'When I face a difficult problem, what useful step can I take while I pray for help?',
 share:{moment:'When someone likes engineering, history, or ancient cities.',opener:'Did you know that an ancient king in the Bible had a major water-supply problem to solve?',thought:'Hezekiah arranged for water to reach Jerusalem while the city faced a threat.',question:'Does it surprise you how many everyday engineering details the Bible preserves?',bridge:'The account is in 2 Chronicles 32 and 2 Kings 20.',reference:'2 Kings 20:20; 2 Chronicles 32:1–8, 30',url:B+'2-kings/20/'}
},
{
 id:'jeremiah-field',category:'HOPE IN DIFFICULT TIMES',title:'Why Buy a Field During a Siege?',
 subtitle:'Jeremiah made a strange-looking purchase for a reason.',
 source:'Jeremiah 32:1–15 — New World Translation',reference:'Jeremiah 32:1–15',url:B+'jeremiah/32/',
 body:[
  'Jerusalem was surrounded by an army. Jeremiah was being held under guard. That hardly sounds like the right moment to buy real estate. Yet Jehovah told him to buy a field from a relative.',
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
  'When Dorcas died in Joppa, the widows who knew her were deeply upset. When Peter arrived, they showed him the garments and robes she had made.',
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
  'Paul met her near a river, where women had gathered for prayer. Lydia listened, accepted what she learned, and invited Paul and his companions to stay in her home.',
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
  'Most people might barely have noticed her. Jesus did. He called his disciples over and explained that her gift represented a far greater personal sacrifice than the larger gifts given out of surplus.',
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
  'A little cord was not magic. It was the agreed sign in a promise that Rahab took seriously. Her faith was shown by what she did.'
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
  'Elisha told her to sell the oil, pay her debts, and live on what remained. The account is striking because the help addressed the actual problem the family faced.'
 ],takeaway:'Jehovah cares about the everyday burdens people carry.',
 reflect:'What practical concern could I bring to Jehovah in prayer today?',
 share:{moment:'When someone is worried about providing for their family.',opener:'There is a beautiful Bible account that starts with a widow saying she has almost nothing left.',thought:'Elisha helped her, and the account specifically mentions paying her debt and caring for her sons.',question:'Do you like that the Bible records concern for practical family problems?',bridge:'You can read the seven-verse account at 2 Kings 4:1–7.',reference:'2 Kings 4:1–7',url:B+'2-kings/4/'}
},
{
 id:'nehemiah-builders',category:'ANCIENT JERUSALEM',title:'Goldsmiths, Families, and a City Wall',
 subtitle:'The surprising variety of people who helped rebuild Jerusalem.',
 source:'Nehemiah 3:1–32 — New World Translation',reference:'Nehemiah 3:1–32',url:B+'nehemiah/3/',
 body:[
  'Nehemiah chapter 3 may look like a long list of names. But read it slowly and you will find a whole community at work on Jerusalem’s wall.',
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
  'The account says the others took courage and ate too. Sometimes encouragement is a hopeful word. Sometimes it also includes helping someone take the next practical step.'
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
  'What a gentle way to make the point. He used something familiar and small to help people feel that they mattered.'
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
  'The message eventually reached King Jehoiakim. He cut up the scroll and threw the pieces into a fire. That sounds like the end of the document, but it was not the end of the account.',
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
  'When you picture a prophet, you might imagine someone who had spent his whole life in a special position. Amos described a different background.',
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
