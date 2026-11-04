#!/usr/bin/env python3
from pathlib import Path
import json,re,subprocess,os
p=Path("bible_unfolded_core_part5.js")
src=p.read_text()
m=re.search(r'(?m)^(window\.__BU_STAGE41_CORE_PARTS__\[4\] = )("(?:\\.|[^"\\])*")(;)',src)
if not m:raise RuntimeError("Stage41 core part5 format mismatch")
raw=json.loads(m.group(2))
if 'data-equip-classic' in raw:
 print('Already installed; nothing to change')
 raise SystemExit(0)
def one(s,a,b,label):
 if s.count(a)!=1:raise RuntimeError(label+': expected 1 anchor, got '+str(s.count(a)))
 return s.replace(a,b,1)
a="function setWheelTheme(id){economy.equippedWheel=id;document.documentElement.classList.toggle('gold-wheel',id==='goldwheel');document.documentElement.classList.toggle('moon-wheel',id==='moonwheel');document.documentElement.classList.toggle('sea-wheel',id==='seawheel');saveEconomy();openRewards();}"
b="""function setWheelTheme(id){
 if(id!=='classic'&&!BU_WHEEL_IDS.includes(id))return;
 if(id!=='classic'&&!economy.purchases.includes(id))return;
 const previous=economy.equippedWheel;
 economy.equippedWheel=id;
 if(!saveEconomy()){economy.equippedWheel=previous;notify('Wheel selection could not be saved.');openRewards();return;}
 document.documentElement.classList.toggle('gold-wheel',id==='goldwheel');
 document.documentElement.classList.toggle('moon-wheel',id==='moonwheel');
 document.documentElement.classList.toggle('sea-wheel',id==='seawheel');
 openRewards();
}"""
raw=one(raw,a,b,'Setter')
d='$'+'{'
classic='<div class="reward-product"><div class="reward-product-copy"><strong>Classic Puzzle Wheel</strong><small>Original letter wheel, always free.</small></div><button type="button" data-equip-classic="yes" '+d+"economy.equippedWheel==='classic'?'disabled':''}"+'>'+d+"economy.equippedWheel==='classic'?'✓ Equipped':'Equip — Free'}"+'</button></div>'
raw=one(raw,"$('reward-products').innerHTML=available.map(x=>","$('reward-products').innerHTML="+chr(96)+classic+chr(96)+"+available.map(x=>",'Free Classic card')
a="const repairWheelBtn=document.getElementById('bu3824-wheel-restore');"
raw=one(raw,a,"const classicWheelBtn=$('reward-products').querySelector('[data-equip-classic]');if(classicWheelBtn)classicWheelBtn.onclick=()=>setWheelTheme('classic');\n "+a,'Classic click handler')
a="if(economy.purchases.includes('goldwheel')&&(!economy.equippedWheel||economy.equippedWheel==='classic'))economy.equippedWheel='goldwheel';"
raw=one(raw,a,"// Never auto-equip Gold over the player's intentional Classic selection.",'Auto Gold override')
assert raw.count('data-equip-classic')==2
assert all(i in raw for i in ["'goldwheel',cost:180","'moonwheel',cost:135","'seawheel',cost:235"])
out=src[:m.start(2)]+json.dumps(raw)+src[m.end(2):]
p.write_text(out)
subprocess.run(['node','--check',str(p)],check=True)
start=raw.index('function setWheelTheme(id){')
end=raw.index('function purchase(id,cost){',start)
test=Path('/tmp/classic_test.cjs')
test.write_text("""const vm=require('vm'),assert=require('assert');
let economy={equippedWheel:'goldwheel',coins:321,purchases:['goldwheel','moonwheel']},classes={},ok=true;
const env={economy,BU_WHEEL_IDS:['goldwheel','moonwheel','seawheel'],document:{documentElement:{classList:{toggle:(k,v)=>classes[k]=v}}},saveEconomy:()=>ok,openRewards:()=>{},notify:()=>{}};
vm.createContext(env);vm.runInContext(process.env.CODE,env);
env.setWheelTheme('classic');assert.equal(economy.equippedWheel,'classic');assert.equal(economy.coins,321);assert.equal(economy.purchases.length,2);assert.equal(classes['gold-wheel'],false);assert.equal(classes['moon-wheel'],false);assert.equal(classes['sea-wheel'],false);
env.setWheelTheme('moonwheel');assert.equal(economy.equippedWheel,'moonwheel');
env.setWheelTheme('classic');ok=false;env.setWheelTheme('goldwheel');assert.equal(economy.equippedWheel,'classic');
env.setWheelTheme('seawheel');assert.equal(economy.equippedWheel,'classic');
console.log('PASS: default free, saved toggle, original appearance, purchase retention, failed-save rollback');
""")
subprocess.run(['node',str(test)],env={**os.environ,'CODE':raw[start:end]},check=True)
print('Classic wheel patch and regression checks PASS')
