#!/usr/bin/env python3
from pathlib import Path
import json,re,subprocess,os
p=Path('bible_unfolded_core_part5.js')
src=p.read_text()
m=re.search(r'(?m)^(window\.__BU_STAGE41_CORE_PARTS__\[4\] = )("(?:\\.|[^"\\])*")(;)',src)
if not m:raise RuntimeError('Stage41 source mismatch')
raw=json.loads(m.group(2))
old="""const notes=correct?[[659.25,0,.18,.12],[880,.105,.18,.18]]:
                      [[392,0,.17,.15],[329.63,.12,.16,.19]];"""
new="""const notes=correct?[[659.25,0,.18,.12],[880,.105,.18,.18]]:
                      [[587.33,0,.23,.23],[493.88,.13,.22,.27]];"""
if raw.count(old)!=1:raise RuntimeError('expected unique original answer tone')
raw=raw.replace(old,new,1)
old2="""osc.type='sine';osc.frequency.setValueAtTime(hz,start);"""
new2="""osc.type=correct?'sine':'triangle';osc.frequency.setValueAtTime(hz,start);"""
# Only target the narrow Daily helper; do not alter other modes.
start=raw.index('function buDailyAnswerAudio20261104(')
end=raw.index('function bu375Choose(index){',start)
section=raw[start:end]
if section.count(old2)!=1:raise RuntimeError('wrong oscillator anchor')
section=section.replace(old2,new2,1)
raw=raw[:start]+section+raw[end:]
assert raw.count(new)==1
assert 'if(!sfxOn||sfxVolume<=0)return' in section
p.write_text(src[:m.start(2)]+json.dumps(raw)+src[m.end(2):])
subprocess.run(['node','--check',str(p)],check=True)
code=raw[raw.index('function buDailyAnswerAudio20261104('):raw.index('function bu375Choose(index){')]
test=Path('/tmp/bu_daily_wrong_audible_test.cjs')
test.write_text("""const vm=require('vm'),assert=require('assert');
let sound=[],gains=[],enabled=true,vol=80;
const ctx={state:'running',currentTime:1,destination:{},
createOscillator(){const v={type:'sine',frequency:{setValueAtTime(x){sound.push([v.type,x])}},connect(){},start(){},stop(){},disconnect(){}};return v;},
createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(v){if(v>.001)gains.push(v)}},connect(){},disconnect(){}}}};
const e={audioContext:()=>ctx,get sfxOn(){return enabled},get sfxVolume(){return vol}};
vm.createContext(e);vm.runInContext(process.env.CODE,e);
e.buDailyAnswerAudio20261104(false);
assert.deepEqual(sound,[['triangle',587.33],['triangle',493.88]]);
assert(gains[0]>.18 && gains[1]>.17);
sound=[];gains=[];
e.buDailyAnswerAudio20261104(true);
assert.deepEqual(sound,[['sine',659.25],['sine',880]]);
enabled=false;sound=[];e.buDailyAnswerAudio20261104(false);assert.equal(sound.length,0);
enabled=true;vol=0;e.buDailyAnswerAudio20261104(false);assert.equal(sound.length,0);
console.log('PASS: stronger wrong-tone frequencies/harmonics, correct sound unchanged, Effects controls honored');
""")
subprocess.run(['node',str(test)],env={**os.environ,'CODE':code},check=True)
print('PASS: targeted Daily wrong-answer tonal repair')
