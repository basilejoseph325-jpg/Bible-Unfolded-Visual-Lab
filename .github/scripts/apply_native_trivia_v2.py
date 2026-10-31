#!/usr/bin/env python3
"""Integrate the approved Visual Lab Trivia V2 artwork into the native Trivia controller.
Run only on the isolated repair branch. Do not modify the five external JS files.
"""
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[2]
INDEX = ROOT / 'index.html'
V2 = ROOT / 'trivia-landing-test-v2.html'
source = INDEX.read_text(encoding='utf-8')
v2 = V2.read_text(encoding='utf-8')
marker = 'id="bu-trivia-native-landing-approved-v2"'
if marker in source:
    raise SystemExit('Already integrated; will not apply twice')

style_match = re.search(r'<style>([\s\S]*?)</style>', v2, re.I)
main_match = re.search(r'<main id="triviaLab"[\s\S]*?</main>', v2, re.I)
if not style_match or not main_match:
    raise SystemExit('V2 approved style or landing HTML missing')
original_css = style_match.group(1)
hero_match = re.search(r'data:image/webp;base64,[A-Za-z0-9+/=]+', original_css)
if not hero_match or '#triviaLab:before' not in original_css:
    raise SystemExit('Approved hero image unavailable')
hero = hero_match.group()
css = original_css[original_css.index('#triviaLab:before'):]
css = css.replace('#triviaLab:before', '#bu34-trivia .bu-native-trivia:before', 1)
css = css.replace('position:fixed;inset:0;background-image:', 'position:absolute;inset:0;background-image:', 1)
css = css.replace("url('" + hero + "')", 'var(--bu-native-hero)')
css = (
    '#bu34-trivia .bu-native-trivia{--bu-native-hero:url(\'' + hero + '\');'
    'position:relative;isolation:isolate;min-height:100%;width:100%;'
    'background:#0b2431;overflow:hidden;font-family:Georgia,serif;color:#fff5d7}\n'
    '#bu34-trivia:has(.bu-native-trivia) .bu34-top{display:none!important}\n'
    '#bu34-trivia #bu34-body:has(.bu-native-trivia){padding:0!important;max-width:none!important;width:100%!important}\n'
    '#bu34-trivia .bu-native-exit{display:inline-block;background:#143a48;color:#ffebae;'
    'border:1px solid #e8c17f;border-radius:12px;padding:12px 20px;margin:12px;cursor:pointer}\n'
) + css

art = main_match.group()
art = art.replace('<main id="triviaLab" aria-label="Bible Trivia landing visual experiment">',
                  '<main class="bu-native-trivia" aria-label="Bible Trivia landing">', 1)
art = re.sub(r'<div id="labStatus"[^>]*></div>', '', art, count=1)
art = art.replace('Bible Unfolded • Visual Lab landing-page experiment',
                  'Bible Unfolded • Explore Scripture<br><button type="button" class="bu-native-exit" id="bu-native-exit">‹ Back to Home</button>', 1)
art = art.replace('data-target="Scholar Research"', 'id="bu3834-entry"', 1)
art = art.replace('1,122 questions', '{{TRIVIA_QUESTION_COUNT}}', 1).replace('40 topics', '{{TRIVIA_TOPIC_COUNT}}', 1)
for activity in ('Play Mixed Trivia', 'Choose a Topic', 'Bible Master', 'Scholar Research', 'Play Trivia Together'):
    if activity not in art:
        raise SystemExit('Required activity missing: ' + activity)
if art.count('data:image/webp;base64,') < 4 or '<iframe' in art:
    raise SystemExit('Artwork missing or iframe detected')

body = '''
  const body=document.getElementById('bu34-body');
  body.innerHTML=ART_JSON.replace('{{TRIVIA_QUESTION_COUNT}}',Number(bu37Count()).toLocaleString()+' questions').replace('{{TRIVIA_TOPIC_COUNT}}',BU34_KEYS.length+' topics');
  const wallet=(typeof economy!=='undefined'&&economy)?economy:{points:0,coins:0};
  document.getElementById('labPoints').textContent=Number(wallet.points||0).toLocaleString()+' Points';
  document.getElementById('labTokens').textContent=Number(wallet.coins||0).toLocaleString()+' Tokens';
  document.getElementById('labMenu').onclick=()=>document.getElementById('bu34-menu').click();
  document.getElementById('labReward').onclick=()=>document.getElementById('home-rewards').click();
  body.querySelector('[data-target="Play Mixed Trivia"]').onclick=()=>bu386OpenSetup();
  body.querySelector('[data-target="Choose a Topic"]').onclick=()=>{bu386Trivia.page='browse';bu386TriviaRender()};
  body.querySelector('[data-target="Bible Master"]').onclick=()=>bu34Start('master');
  body.querySelector('#bu3834-entry').onclick=()=>{if(typeof bu3834Start==='function')bu3834Start();else if(typeof bu3835TrackMenu==='function')bu3835TrackMenu();};
  body.querySelector('[data-target="Play Trivia Together"]').onclick=()=>{bu35Setup.quick='trivia';bu35Open('setup')};
  document.getElementById('bu-native-exit').onclick=()=>document.getElementById('bu34-back').click();
  body.scrollTop=0;
'''.replace('ART_JSON', json.dumps(art, ensure_ascii=True))
startkey = 'function bu386TriviaRender(){'
if source.count(startkey) != 1 or source.count('</head>') != 1:
    raise SystemExit('Unexpected base game structure')
function_offset = source.index(startkey)
start = source.find(" if(page==='main'){", function_offset)
end = source.find(" }else if(page==='browse'){", start)
if start < 0 or end < start or end - start > 7000:
    raise SystemExit('Original Trivia renderer changed; refusing unsafe update')
result = source[:start] + " if(page==='main'){" + body + source[end:]
result = result.replace('</head>', '<style ' + marker + '>\n' + css + '\n</style>\n'
                        '<meta name="bu-native-trivia" content="visual-lab-1">\n</head>', 1)
if result.count(marker) != 1 or 'id="realGame"' in result or result.count(startkey) != 1:
    raise SystemExit('Native integration structural validation failed')
INDEX.write_text(result, encoding='utf-8')
print(f'Native Trivia integrated: {len(source):,} -> {len(result):,} characters; 5 activities retained; external JS unchanged.')
