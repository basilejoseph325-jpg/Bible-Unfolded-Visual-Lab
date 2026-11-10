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
 }finally{await browser.close()}
})();
