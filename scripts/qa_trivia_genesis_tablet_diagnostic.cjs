const p=require('puppeteer-core'),{execSync}=require('child_process');
(async()=>{
 const browser=await p.launch({headless:true,executablePath:execSync('command -v google-chrome || command -v chromium',{encoding:'utf8'}).trim(),args:['--no-sandbox','--disable-setuid-sandbox']});
 try{
  const page=await browser.newPage();
  await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2});
  page.on('pageerror',e=>console.log('PAGE_ERROR',e.message));
  await page.goto('http://127.0.0.1:8899/index.html',{waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForSelector('#home-trivia',{timeout:50000});
  await page.evaluate(()=>{document.getElementById('daily-continue')?.click();document.getElementById('home-trivia').click();if(typeof bu34Start==='function')bu34Start('quick')});
  await page.waitForSelector('#bu34-body [data-answer]',{timeout:30000});
  const d=await page.evaluate(()=>{
   const a=[...document.querySelectorAll('#bu34-body [data-answer]')];
   const inspect=a.map(b=>{
    const c=getComputedStyle(b),before=getComputedStyle(b,'::before');
    return {html:b.outerHTML.slice(0,330),className:b.className,attrs:[...b.attributes].map(x=>[x.name,x.value]).slice(0,8),
     bg:c.backgroundImage,bgPosition:c.backgroundPosition,opacity:c.opacity,cssText:c.cssText,
     before:{image:before.backgroundImage,position:before.backgroundPosition,size:before.backgroundSize,opacity:before.opacity,filter:before.filter,display:before.display},
     rect:{w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height}};
   });
   const values=typeof bu34Quiz!=='undefined'?bu34Quiz:null;
   const matches=values?.items?.filter(x=>/foods assigned|genesis 1:29|seed-bearing plants and fruit/i.test(JSON.stringify(x))).map(x=>x)||[];
   return {
    answerCount:a.length,quizKeys:values?Object.keys(values):null,first:values?.items?.slice(0,2),
    matches,queryAnswer:values?.items?.find(x=>/foods assigned/i.test(JSON.stringify(x)))||null,
    functionNames:Object.keys(window).filter(x=>x.startsWith('bu34')).slice(0,45),
    stone:inspect,
    styles:[...document.querySelectorAll('link[rel=stylesheet]')].filter(x=>/trivia|tablet|stone/.test(x.href)).map(x=>x.href)
   };
  });
  console.log('DIAG_TRIVIA',JSON.stringify(d).slice(0,19000));
  await page.screenshot({path:'/tmp/BU-TRIVIA-D-BASE.png'});
  const image=await page.evaluate(()=>new Promise(resolve=>{
   const m=getComputedStyle(document.querySelector('#bu34-body [data-answer="3"]'),'::before').backgroundImage.match(/url\(["']?([^"')]+)/);
   if(!m)return resolve({error:'no-image'});const img=new Image();img.onload=()=>resolve({src:m[1],size:[img.naturalWidth,img.naturalHeight],ok:true});img.onerror=()=>resolve({src:m[1],error:true});img.src=m[1];
  }));
  console.log('DIAG_IMAGE',JSON.stringify(image));
  const deeper=await page.evaluate(async()=>{
   const fns={};for(const k of ['bu34Start','bu34Draw','bu34Choose','bu34Next','bu34RenderHome']){try{fns[k]=window[k]?.toString().slice(0,4800)}catch(e){fns[k]=String(e)}}
   const globalNames=Object.keys(window).filter(x=>/BU_HQ|CREATION|TRIVIA|QUESTION|QUESTIONS|TOPIC|BANK|ITEMS|PACK/i.test(x)).slice(0,90);
   const b=document.querySelector('#bu34-body [data-answer="3"]'),r=b.getBoundingClientRect();
   const url=getComputedStyle(b,'::before').backgroundImage.match(/url\(["']?([^"')]+)/)?.[1];const img=new Image();img.src=url;await img.decode();
   const widths=[r.width,r.height];const size=r.width,pos=[0,.33,.67,1];const stats=[];
   for(const x of pos){
    const c=document.createElement('canvas');c.width=widths[0];c.height=widths[1];const ctx=c.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(img,0,-(size-r.height)*x,size,size);
    const pixels=ctx.getImageData(0,0,c.width,c.height).data;let avg=0,q=0,n=0;
    for(let i=0;i<pixels.length;i+=16){const v=(pixels[i]+pixels[i+1]+pixels[i+2])/3;avg+=v;q+=v*v;n++}
    avg/=n;stats.push({pos:x,mean:Math.round(avg),standardDeviation:Math.round(Math.sqrt(q/n-avg*avg))});
   }
   return {fns,globalNames,photoCropStats:stats};
  });
  console.log('DIAG_DEEP',JSON.stringify(deeper).slice(0,27000));
  const candidates=await page.evaluate(()=>{
   const names=['BU39148_CREATION_QUALITY','bu3826Questions','bu35Questions','BU_SCHOLAR_BANK','bu3830Question','bu3829QuestionIdentity','bu3829UnseenTrivia','bu35Trivia'];
   const out={};for(const name of names){
    try{
     const obj=window[name];const val=typeof obj==='function'?'[function]':JSON.stringify(obj);
     const idx=typeof val==='string'?val.toLowerCase().indexOf('foods assigned'):-1;
     const idx2=typeof val==='string'?val.toLowerCase().indexOf('humans received seed-bearing'):-1;
     out[name]={type:typeof obj,array:Array.isArray(obj),keys:obj&&typeof obj==='object'?Object.keys(obj).slice(0,25):[],
      length:val?.length||0,hit:idx,hit2:idx2,
      excerpt:idx>=0?val.slice(Math.max(0,idx-250),idx+1000):idx2>=0?val.slice(Math.max(0,idx2-300),idx2+600):val?.slice(0,220)};
    }catch(e){out[name]={error:String(e)}}
   }
   return out;
  });
  console.log('DIAG_QUESTION_SOURCES',JSON.stringify(candidates).slice(0,24000));
  const functions=await page.evaluate(()=>{
   const names=['bu3826Questions','bu35Questions','bu3848TopicBatch','bu39148CreationQuality','bu34Start','bu34Draw'];
   const out={};for(const n of names){try{out[n]=window[n]?.toString().slice(0,6500)||'absent'}catch(e){out[n]=String(e)}}return out;
  });
  console.log('DIAG_FUNCTIONS',JSON.stringify(functions).slice(0,22000));
  const sourceBank=await page.evaluate(()=>{
   try{
    if(typeof BU34_BANK==='undefined')return {available:false};
    const keys=Object.keys(BU34_BANK);const hits=[];
    for(const [key,list] of Object.entries(BU34_BANK)){
     if(!Array.isArray(list))continue;
     for(let i=0;i<list.length;i++){
      const q=list[i];if(/foods assigned|seed-bearing plants and fruit; other land creatures/i.test(JSON.stringify(q)))
       hits.push({key,index:i,record:q});
     }
    }
    return {available:true,keys:keys.slice(0,50),total:keys.reduce((n,k)=>n+(Array.isArray(BU34_BANK[k])?BU34_BANK[k].length:0),0),hits};
   }catch(e){return {error:String(e)}}
  });
  console.log('DIAG_BANK',JSON.stringify(sourceBank).slice(0,24000));

 }finally{await browser.close()}
})();
