#!/usr/bin/env python3
from pathlib import Path
import json,re,subprocess,os
files=[Path(f'bible_unfolded_core_part{i}.js') for i in range(1,6)]
payload=[]
for p in files:
 s=p.read_text()
 m=re.search(r'(?m)^(window\.__BU_STAGE41_CORE_PARTS__\[\d+\] = )("(?:\\.|[^"\\])*")(;)',s)
 if not m:raise RuntimeError("Unexpected Stage41 encoding "+p.name)
 payload.append([p,s,m,json.loads(m.group(2))])
target="function bu375Choose(index){"
matches=[i for i,(_,_,_,raw) in enumerate(payload) if target in raw]
assert len(matches)==1, "Expected one native Daily answer handler"
j=matches[0]
p,s,m,raw=payload[j]
if "function buDailyAnswerAudio20261104(" in raw:
 print("Daily answer sound already installed")
 raise SystemExit(0)
old=""" const q=bu375Items(r)[r.step];
 if(index!==q.correct){"""
new=""" const q=bu375Items(r)[r.step];
 // Start audio synchronously with the answer gesture, including Safari/mobile
 // sessions where music has not created a shared AudioContext yet.
 buDailyAnswerAudio20261104(index===q.correct);
 if(index!==q.correct){"""
assert raw.count(old)==1, "Daily choice entry changed"
raw=raw.replace(old,new,1)
old="r.missed[r.step]=bad;bu375Save();bu3846WrongTone();bu375Draw();return;"
new="r.missed[r.step]=bad;bu375Save();bu375Draw();return;"
assert raw.count(old)==1, "Daily wrong-answer path changed"
raw=raw.replace(old,new,1)
old="r.answers[r.step]=index;bu375Save();\n if(sfxOn)playChime();\n bu375Draw();"
new="r.answers[r.step]=index;bu375Save();\n bu375Draw();"
assert raw.count(old)==1, "Daily correct-answer path changed"
raw=raw.replace(old,new,1)
fn="""// Only Daily Discovery: softly audible feedback on EACH valid answer tap.
// Uses the engine's Effects preference and volume, not music or any old knock.
// Called within the button's direct user gesture so mobile audio unlocks reliably.
function buDailyAnswerAudio20261104(correct){
 if(!sfxOn||sfxVolume<=0)return;
 try{
  const ctx=audioContext();if(!ctx)return;
  if(ctx.state==='suspended')ctx.resume().catch(()=>{});
  const scale=Math.max(0,Math.min(1,sfxVolume/100));
  // Contact: brief soft marimba-like ping, no clack or knocking sample.
  const notes=correct?[[659.25,0,.075,.12],[880,.105,.073,.18]]:
                      [[392,0,.072,.15],[329.63,.12,.067,.19]];
  for(const [hz,offset,peak,duration] of notes){
   const start=ctx.currentTime+offset,osc=ctx.createOscillator(),g=ctx.createGain();
   osc.type='sine';osc.frequency.setValueAtTime(hz,start);
   g.gain.setValueAtTime(.0001,start);
   g.gain.exponentialRampToValueAtTime(Math.max(.0002,peak*scale),start+.014);
   g.gain.exponentialRampToValueAtTime(.0001,start+duration);
   osc.connect(g);g.connect(ctx.destination);
   osc.start(start);osc.stop(start+duration+.012);
   osc.onended=()=>{try{osc.disconnect();g.disconnect()}catch(_){}};
  }
 }catch(_){/* Answer remains playable if Effects audio is unavailable. */}
}
"""
assert raw.count(target)==1
raw=raw.replace(target,fn+target,1)
assert raw.count('buDailyAnswerAudio20261104(')==2
assert "bu3846WrongTone();bu375Draw();return;" not in raw[raw.index(target):raw.index(target)+1600]
assert "if(sfxOn)playChime();\n bu375Draw();" not in raw[raw.index(target):raw.index(target)+1600]
p.write_text(s[:m.start(2)]+json.dumps(raw)+s[m.end(2):])
subprocess.run(['node','--check',str(p)],check=True)
# Validate exact helper with a mock WebAudio engine and Effects on/off.
start=raw.index('function buDailyAnswerAudio20261104(')
end=raw.index(target,start)
test=Path('/tmp/daily_answer_audio_test.cjs')
test.write_text("""const vm=require('vm'),assert=require('assert');
let events=[],enabled=true,volume=80,resumes=0;
const audio={state:'suspended',currentTime:1,destination:{},
 resume(){resumes++;return Promise.resolve()},
 createOscillator(){return {type:'',frequency:{setValueAtTime(v){events.push(['note',v])}},connect(){},start(){},stop(){},disconnect(){},set onended(v){}}},
 createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(v){events.push(['gain',v])}},connect(){},disconnect(){}}}};
const env={audioContext:()=>audio,get sfxOn(){return enabled},get sfxVolume(){return volume}};
vm.createContext(env);vm.runInContext(process.env.CODE,env);
env.buDailyAnswerAudio20261104(false);assert.equal(events.filter(x=>x[0]==='note').length,2);assert.equal(resumes,1);
events=[];env.buDailyAnswerAudio20261104(true);assert.equal(events.filter(x=>x[0]==='note').length,2);
enabled=false;events=[];env.buDailyAnswerAudio20261104(false);assert.equal(events.length,0);
enabled=true;volume=0;env.buDailyAnswerAudio20261104(true);assert.equal(events.length,0);
console.log('PASS: audible correct/wrong cues, suspended audio resume, Effects toggle and volume respect');
""")
subprocess.run(['node',str(test)],env={**os.environ,'CODE':raw[start:end]},check=True)
print("PASS: Daily Discovery sound patch tested in",p.name)
