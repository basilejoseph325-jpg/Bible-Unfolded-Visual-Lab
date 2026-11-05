#!/usr/bin/env python3
"""Construct a reusable clean, photo-based parchment from existing Word Builder roller art.
No baked explanation text or controls; keep the original assets unchanged."""
from PIL import Image,ImageDraw,ImageFilter,ImageEnhance
import random, math
from pathlib import Path
random.seed(6815)
W,H=720,1040
bg=Image.open("scrolls.jpg").convert("RGB")
ratio=max(W/bg.width,H/bg.height)
bg=bg.resize((int(bg.width*ratio),int(bg.height*ratio)),Image.Resampling.LANCZOS)
left=(bg.width-W)//2;top=(bg.height-H)//2
bg=bg.crop((left,top,left+W,top+H))
bg=ImageEnhance.Brightness(bg).enhance(.23).convert("RGBA")
# Natural parchment, with photo roller surfaces overlaying it. Text-free center.
paper=Image.new("RGBA",(W,H),(0,0,0,0)); px=paper.load()
for y in range(83,955):
 for x in range(62,658):
  nx=x/W; ny=y/H
  light=18*math.exp(-(((nx-.48)/.47)**2+((ny-.46)/.70)**2))
  edge=17*((abs(nx-.5)/.46)**2)
  grain=random.gauss(0,5.5)
  fleck=random.gauss(0,3)
  shade=light-edge+grain
  rgb=(int(max(0,min(255,217+shade))),int(max(0,min(255,173+shade*.87+fleck))),int(max(0,min(255,111+shade*.65+fleck*.65))))
  paper.putpixel((x,y),rgb+(255,))
# Realistic organic leaf-edge silhouette; no straight CSS box.
outline=Image.new("L",(W,H),0);d=ImageDraw.Draw(outline)
ptsL=[];ptsR=[]
for y in range(99,936,8):
 wave=math.sin(y*.036)*5+math.sin(y*.1)*2+random.uniform(-3,3)
 ptsL.append((int(69+wave),y));ptsR.append((int(652-wave),y))
d.polygon([(77,90),(645,90)]+list(reversed(ptsR))+[(647,945),(75,945)]+list(reversed(ptsL)),fill=255)
mask=outline.filter(ImageFilter.GaussianBlur(.8))
paper.putalpha(mask)
# Faint natural wrinkles / fibers, with no text.
fib=Image.new("RGBA",(W,H),(0,0,0,0)); f=ImageDraw.Draw(fib)
for i in range(1700):
 x=random.randint(76,640);y=random.randint(112,917)
 l=random.randint(1,9)
 f.line((x,y,x+l,y+random.randint(-2,2)),fill=(85,55,30,random.randint(3,14)),width=1)
fib.putalpha(Image.composite(fib.getchannel("A"),Image.new("L",(W,H),0),mask))
paper=Image.alpha_composite(paper,fib)
bg.alpha_composite(paper)
# Actual engraved roller art previously used in Word Builder.
for source,y,height in [("word-builder-scroll-top.webp",14,146),("word-builder-scroll-bottom.webp",884,139)]:
 im=Image.open(source).convert("RGBA")
 im=im.resize((W,height),Image.Resampling.LANCZOS)
 bg.alpha_composite(im,(0,y))
# Output as single photographic background for a dynamic text overlay.
out=Path("assets/ui/daily-discovery-explanation-scroll-v1.webp")
out.parent.mkdir(parents=True,exist_ok=True)
bg.convert("RGB").save(out,"WEBP",quality=83,method=6)
print("PASS image",out,out.stat().st_size,"bytes",W,H)
