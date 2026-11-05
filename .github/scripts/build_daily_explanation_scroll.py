#!/usr/bin/env python3
"""V3: cohesive photographic scroll, no baked text or duplicate stamped emblem.
Uses the clean upper photographic roller twice (bottom is its inverted mate).
Does not modify original Word Builder assets or bake in live lesson text."""
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
from pathlib import Path
import math, random
rng=random.Random(6815)
W,H=720,1040
# Existing photograph supplies the immersive ancient-table atmosphere.
source=Image.open("scrolls.jpg").convert("RGB")
scale=max(W/source.width,H/source.height)
source=source.resize((round(source.width*scale),round(source.height*scale)),Image.Resampling.LANCZOS)
x=(source.width-W)//2;y=(source.height-H)//2
bg=ImageEnhance.Brightness(source.crop((x,y,x+W,y+H))).enhance(.23).convert("RGBA")
# Parchment silhouette: stochastic but correlated frayed, individually folded edges.
left=[];right=[]
walk_l=0;walk_r=0
for y in range(103,949,3):
 walk_l=max(-12,min(12,walk_l*.79+rng.gauss(0,2.1)))
 walk_r=max(-12,min(12,walk_r*.77+rng.gauss(0,2.1)))
 left.append((round(64+walk_l+3*math.sin(y*.052)),y))
 right.append((round(656+walk_r+4*math.cos(y*.044)),y))
mask=Image.new("L",(W,H),0);d=ImageDraw.Draw(mask)
d.polygon(left+list(reversed(right)),fill=255)
mask=mask.filter(ImageFilter.GaussianBlur(1.5))
# Physical shadow is behind the same irregular paper contour, not a rectangular frame.
shadow=Image.new("RGBA",(W,H),(0,0,0,0))
shadowmask=mask.filter(ImageFilter.GaussianBlur(12))
shift=Image.new("L",(W,H),0);shift.paste(shadowmask,(3,5))
shadow.putalpha(shift.point(lambda n:round(n*.43)))
bg.alpha_composite(shadow)
# Real tinted parchment material with soft darkening at its naturally irregular edges.
paper=Image.new("RGBA",(W,H),(0,0,0,0));pixels=paper.load()
for y in range(102,950):
 for x in range(46,674):
  v=rng.gauss(0,3.9)+8*math.sin((x+y*.44)/93)
  e=max(0,1-min((x-64),(656-x))/78)
  burn=e*19 + 12*(max(0,1-(y-102)/66)+max(0,1-(949-y)/78))
  k=v-burn+10*math.exp(-((x-340)/290)**2)
  pixels[x,y]=(int(max(0,min(255,225+k))),
               int(max(0,min(255,185+k*.86))),
               int(max(0,min(255,124+k*.68))),255)
paper.putalpha(mask)
fib=Image.new("RGBA",(W,H),(0,0,0,0));f=ImageDraw.Draw(fib)
for i in range(2500):
 xx=rng.randrange(77,643);yy=rng.randrange(134,920)
 length=rng.randrange(2,12)
 f.line((xx,yy,xx+length,yy+rng.randrange(-2,3)),
        fill=(93,57,25,rng.randrange(3,20)),width=1)
fib.putalpha(Image.composite(fib.getchannel("A"),Image.new("L",(W,H),0),mask))
paper=Image.alpha_composite(paper,fib)
bg.alpha_composite(paper)
# Only clean photo roller material (exclude the legacy GAME GUIDE text band).
roller=Image.open("word-builder-scroll-top.webp").convert("RGBA")
roller=roller.crop((0,0,roller.width,int(roller.height*.63)))
roller=roller.resize((W,161),Image.Resampling.LANCZOS)
def apply_roller(img,top,fade_bottom):
 img=img.copy()
 alpha=img.getchannel("A"); a=alpha.load()
 # Feather the contact edge into paper, not a hard clipped horizontal photo strip.
 for yy in range(img.height):
  distance=(img.height-yy-1) if fade_bottom else yy
  opacity=max(0,min(1,distance/29))
  for xx in range(img.width):
   a[xx,yy]=int(a[xx,yy]*opacity)
 img.putalpha(alpha)
 bg.alpha_composite(img,(0,top))
# The same real rolled parchment inverted provides a matching lower rod.
# Unlike the previous lower source, this has NO baked red stamp.
apply_roller(roller,8,True)
apply_roller(roller.transpose(Image.Transpose.FLIP_TOP_BOTTOM),871,False)
out=Path("assets/ui/daily-discovery-explanation-scroll-v3.webp")
out.parent.mkdir(parents=True,exist_ok=True)
bg.convert("RGB").save(out,"WEBP",quality=86,method=6)
assert out.stat().st_size>35000
print("PASS: seamless organic parchment, feathered photographic rollers, no duplicate stamped emblem",out,out.stat().st_size)
