/* Bible Unfolded Word Trails NEXT - native wheel visual effects port.
   From original main game's bu3821/bu3822/bu3823 patterns:
   - curved cubic ribbon with selected-letter anchors and moving finger tip
   - diffuse fading gesture mist and micro-glitter
   - sparkles at each newly selected wheel letter and finger release
   Visual only. The puzzle engine owns pointer capture, selected letters,
   answer submission, scoring, sound and timing. No new reward charges. */
(()=>{'use strict';
const ns='http://www.w3.org/2000/svg';
const $=id=>document.getElementById(id);
const wheel=()=>document.getElementById('wheel');
const perf=()=>performance.now();
const motion=()=>window.BUWTPolish?.motionEnabled?.()!==false&&
 !document.documentElement.classList.contains('reduce-motion')&&
 !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const theme=()=>document.documentElement.classList.contains('sea-wheel')?'sea':
 document.documentElement.classList.contains('moon-wheel')?'moon':
 document.documentElement.classList.contains('gold-wheel')?'gold':'classic';
const palette=()=>theme()==='sea'?['#a3ffe6','#50e5d3']:
 theme()==='moon'?['#bfedff','#81c8f8']:['#ffe8a0','#f4c36c'];
const rgba=(hex,a)=>{const k=hex.slice(1),n=parseInt(k,16);
 return 'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+a+')'};
let active=null,closing=null,raf=0;
let anchorPoints=[],svgRef=null,pathRef=null,haloRef=null,tipRef=null;
let priorIndices=[],lastMoveGlint=0,glints=0;
function elt(tag,cls){const x=document.createElementNS(ns,tag);x.setAttribute('class',cls);return x}
function curve(p){
 if(p.length<2)return '';
 const f=n=>Number(n.toFixed(2));
 let d='M'+f(p[0].x)+' '+f(p[0].y);
 const tangent=(a,b,c,seg)=>{
  const dx=(c.x-a.x)*.19,dy=(c.y-a.y)*.19;
  const mag=Math.hypot(dx,dy),limit=Math.hypot(seg.x,seg.y)*.34;
  const k=mag>limit&&mag>0?limit/mag:1;
  return {x:dx*k,y:dy*k};
 };
 for(let i=0;i<p.length-1;i++){
  const a=p[i],b=p[i+1],prev=p[Math.max(0,i-1)],next=p[Math.min(p.length-1,i+2)];
  const seg={x:b.x-a.x,y:b.y-a.y};
  const t1=tangent(prev,a,b,seg),t2=tangent(a,b,next,seg);
  d+=' C'+f(a.x+t1.x)+' '+f(a.y+t1.y)+' '+f(b.x-t2.x)+' '+f(b.y-t2.y)+' '+f(b.x)+' '+f(b.y);
 }
 return d;
}
function paintRibbon(){
 if(!pathRef||!pathRef.isConnected||!svgRef?.isConnected)return;
 const pts=anchorPoints.slice(),s=active;
 if(s?.moved&&pts.length){
  const p={x:s.x,y:s.y-s.fingerGap},last=pts[pts.length-1];
  if(Math.hypot(p.x-last.x,p.y-last.y)>3)pts.push(p);
 }
 const d=curve(pts);
 haloRef.setAttribute('d',d);pathRef.setAttribute('d',d);
 const tip=pts[pts.length-1];
 tipRef.setAttribute('visibility',s?.moved&&tip&&pts.length>1?'visible':'hidden');
 if(tip){tipRef.setAttribute('cx',tip.x.toFixed(2));tipRef.setAttribute('cy',tip.y.toFixed(2))}
}
function burst(x,y,count=1,kind='bu3821-trace-glint'){
 if(!motion())return;
 for(let j=0;j<count;j++){
  const el=document.createElement('i');el.className=kind;
  const dx=j?((j*7)%11)-5:0,dy=j?((j*13)%11)-5:0;
  el.style.left=(x+dx)+'px';el.style.top=(y+dy)+'px';
  document.body.append(el);
  el.addEventListener('animationend',()=>el.remove(),{once:true});
  // Browsers under load may throttle animations; never leave stale nodes.
  setTimeout(()=>el.remove(),630);
  glints++;
 }
}
function selection(svg,indices,points){
 if(!svg)return;
 svgRef=svg;
 anchorPoints=points.map(p=>({x:p.x,y:p.y}));
 const halo=elt('path','bu3822-halo'),ribbon=elt('path','bu3822-ribbon'),tip=elt('circle','bu3822-tip');
 tip.setAttribute('r','4');tip.setAttribute('visibility','hidden');
 svg.replaceChildren(halo,ribbon,tip);
 haloRef=halo;pathRef=ribbon;tipRef=tip;
 paintRibbon();
 const w=wheel(),b=w?.getBoundingClientRect();
 if(b&&motion()){
  const additions=indices.filter(i=>!priorIndices.includes(i));
  for(const i of additions){
   const pos=points[indices.indexOf(i)];
   if(pos)burst(b.left+pos.x,b.top+pos.y,2);
  }
 }
 priorIndices=indices.slice();
}
function sample(s,x,y,t){
 const last=s.history[s.history.length-1];
 if(last&&Math.hypot(last.x-x,last.y-y)<2.6)return;
 s.history.push({x,y,t});
 const k=s.history.length;
 for(let j=0;j<3;j++){
  const theta=k*2.39996+j*2.11,spread=3+(k+j*7)%14;
  s.grains.push({x:x+Math.cos(theta)*spread,y:y+Math.sin(theta)*spread*.76,
    t,sz:.35+((k*3+j*5)%8)*.16,twinkle:j===2?1.5:1});
 }
 if(s.history.length>46)s.history.splice(0,s.history.length-46);
 if(s.grains.length>105)s.grains.splice(0,s.grains.length-105);
}
function cleanup(s){
 s?.canvas?.remove();
 if(active===s)active=null;
 if(closing===s)closing=null;
}
function paintMist(s,t){
 if(!s?.canvas?.isConnected){cleanup(s);return}
 const r=s.wheel.getBoundingClientRect(),c=s.canvas;
 if(!r.width||!r.height){cleanup(s);return}
 const dpr=Math.min(window.devicePixelRatio||1,1.5),w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);
 if(c.width!==w||c.height!==h){c.width=w;c.height=h}
 const ctx=c.getContext('2d');if(!ctx)return;
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,r.width,r.height);
 const colors=palette();
 s.history=s.history.filter(p=>t-p.t<500);
 s.grains=s.grains.filter(p=>t-p.t<570);
 ctx.lineCap='round';ctx.lineJoin='round';
 for(let layer=0;layer<3;layer++){
  const widths=[29,18,7],alphas=[.09,.17,.28];
  ctx.filter=layer===0?'blur(9px)':layer===1?'blur(4px)':'blur(1px)';
  ctx.strokeStyle=rgba(colors[layer===2?0:1],1);
  for(let i=1;i<s.history.length;i++){
   const p=s.history[i-1],q=s.history[i],age=t-q.t,life=Math.max(0,1-age/500);
   if(life<=0)continue;
   ctx.globalAlpha=alphas[layer]*life;ctx.lineWidth=widths[layer]*(.5+.5*life);
   ctx.beginPath();ctx.moveTo(p.x,p.y);
   ctx.quadraticCurveTo((p.x+q.x)/2,(p.y+q.y)/2,q.x,q.y);ctx.stroke();
  }
 }
 ctx.filter='none';
 for(const grain of s.grains){
  const life=Math.max(0,1-(t-grain.t)/570);
  ctx.globalAlpha=Math.min(.62,life*.42)*grain.twinkle;ctx.fillStyle=colors[0];
  const q=grain.sz*(.75+life*.6);
  ctx.fillRect(grain.x-q/2,grain.y-q/2,q,q);
 }
 ctx.globalAlpha=1;
 if(!s.history.length&&!s.grains.length&&!s.down)cleanup(s);
}
function tick(t){
 raf=0;
 const s=active||closing;
 if(s?.canvas?.isConnected)paintMist(s,t);
 if(active){paintRibbon()}
 if((active?.canvas?.isConnected&&(active.history.length||active.grains.length))||closing?.canvas?.isConnected)raf=requestAnimationFrame(tick);
}
function schedule(){
 if(!raf)raf=requestAnimationFrame(tick);
}
function begin(e){
 if(active)cleanup(active);if(closing)cleanup(closing);
 const w=wheel();if(!w)return;
 const rect=w.getBoundingClientRect(),touch=e.pointerType==='touch';
 active={id:e.pointerId,wheel:w,x:e.clientX-rect.left,y:e.clientY-rect.top,
  sx:e.clientX,sy:e.clientY,moved:false,down:true,fingerGap:touch?18:0,
  history:[],grains:[],canvas:null};
 if(motion()){
  const c=document.createElement('canvas');c.className='bu3823-mist';
  c.setAttribute('aria-hidden','true');w.append(c);active.canvas=c;
  burst(e.clientX,e.clientY-(touch?18:0),2);
 }
 schedule();
}
function move(e){
 const s=active;if(!s||s.id!==e.pointerId)return;
 const rect=s.wheel.getBoundingClientRect();
 s.x=e.clientX-rect.left;s.y=e.clientY-rect.top;
 if(Math.hypot(e.clientX-s.sx,e.clientY-s.sy)>5)s.moved=true;
 if(motion()&&s.moved){
  sample(s,s.x,s.y-s.fingerGap,perf());
  const now=perf();
  if(now-lastMoveGlint>74){lastMoveGlint=now;burst(e.clientX,e.clientY-s.fingerGap,1)}
 }
 schedule();
}
function finish(e,show){
 const s=active;if(!s||e?.pointerId!==s.id)return;
 s.down=false;active=null;closing=s;
 if(show&&s.moved&&motion()){
  for(let i=0;i<7;i++){
   const a=i*2*Math.PI/7,dist=15+i%3*7;
   const el=document.createElement('i');el.className='bu3822-finish-glint';
   el.style.left=e.clientX+'px';el.style.top=(e.clientY-s.fingerGap)+'px';
   el.style.setProperty('--fx',Math.cos(a)*dist+'px');
   el.style.setProperty('--fy',Math.sin(a)*dist+'px');
   document.body.append(el);
   el.addEventListener('animationend',()=>el.remove(),{once:true});
   setTimeout(()=>el.remove(),630);glints++;
  }
 }
 paintRibbon();
 schedule();
}
function cancel(){
 if(active)cleanup(active);
 if(closing)cleanup(closing);
 if(raf){cancelAnimationFrame(raf);raf=0}
 anchorPoints=[];priorIndices=[];
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel()});
window.addEventListener('pagehide',cancel);
window.BUWTWheelNative=Object.freeze({
 render:selection,begin,move,end:e=>finish(e,true),cancel,
 debug:()=>({theme:theme(),glints,active:!!active,curve:pathRef?.getAttribute('d')||'',
  halo:haloRef?.getAttribute('d')||'',canvas:!!wheel()?.querySelector('.bu3823-mist')})
});
})();