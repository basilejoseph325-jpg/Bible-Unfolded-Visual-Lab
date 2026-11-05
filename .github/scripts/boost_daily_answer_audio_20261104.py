#!/usr/bin/env python3
from pathlib import Path
import re,json,subprocess,os
p=Path('bible_unfolded_core_part5.js')
s=p.read_text()
m=re.search(r'(?m)^(window\.__BU_STAGE41_CORE_PARTS__\[4\] = )("(?:\\.|[^"\\])*")(;)',s)
if not m:raise RuntimeError('unexpected Stage41 core format')
raw=json.loads(m.group(2))
old="""const notes=correct?[[659.25,0,.075,.12],[880,.105,.073,.18]]:
                      [[392,0,.072,.15],[329.63,.12,.067,.19]];"""
new="""const notes=correct?[[659.25,0,.18,.12],[880,.105,.18,.18]]:
                      [[392,0,.17,.15],[329.63,.12,.16,.19]];"""
if raw.count(old)!=1:raise RuntimeError('expected exactly one Daily audio level section; found '+str(raw.count(old)))
raw=raw.replace(old,new,1)
assert raw.count(new)==1
assert raw.count('buDailyAnswerAudio20261104(')==2
p.write_text(s[:m.start(2)]+json.dumps(raw)+s[m.end(2):])
subprocess.run(['node','--check',str(p)],check=True)
start=raw.index('function buDailyAnswerAudio20261104(')
end=raw.index('function bu375Choose(index){',start)
code=raw[start:end]
test=Path('/tmp/daily_audio_gain_test.cjs')
test.write_text("""const vm=require('vm'),assert=require('assert');
let peaks=[],notes=[],on=true,vol=80;
const ctx={state:'running',currentTime:1,destination:{},
createOscillator:()=>({frequency:{setValueAtTime(v){notes.push(v)}},connect(){},start(){},stop(){},disconnect(){}}),
createGain:()=>({gain:{setValueAtTime(){},exponentialRampToValueAtTime(v){if(v>.001)peaks.push(v)}},connect(){},disconnect(){}})};
const env={get sfxOn(){return on},get sfxVolume(){return vol},audioContext:()=>ctx};
vm.createContext(env);vm.runInContext(process.env.AUDIO_CODE,env);
env.buDailyAnswerAudio20261104(true);assert.equal(notes.length,2);assert(peaks.every(x=>x>.13&&x<.16));
peaks=[];notes=[];env.buDailyAnswerAudio20261104(false);assert.equal(notes.length,2);assert(peaks.every(x=>x>.12&&x<.15));
on=false;peaks=[];env.buDailyAnswerAudio20261104(true);assert.equal(peaks.length,0);
on=true;vol=0;env.buDailyAnswerAudio20261104(false);assert.equal(peaks.length,0);
console.log('PASS: stronger isolated Daily success/wrong tones, no other effects, volume and mute respected');
""")
subprocess.run(['node',str(test)],env={**os.environ,'AUDIO_CODE':code},check=True)
print('PASS daily answer gain adjustment, no other code changed')
