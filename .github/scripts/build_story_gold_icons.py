#!/usr/bin/env python3
"""Create metallic 64x64 icon masters for Story Adventure in Visual Lab ONLY."""
from pathlib import Path
defs='''<defs><linearGradient id="gold" x1="0" y1="0" x2=".82" y2="1"><stop offset="0" stop-color="#fff8d6"/><stop offset=".17" stop-color="#fbe7a0"/><stop offset=".39" stop-color="#ba7d2a"/><stop offset=".6" stop-color="#ffe084"/><stop offset=".8" stop-color="#d0983b"/><stop offset="1" stop-color="#fff1b3"/></linearGradient><linearGradient id="bronze" x1="0" y1="0" x2=".6" y2="1"><stop stop-color="#fff1bd"/><stop offset=".48" stop-color="#c68c39"/><stop offset="1" stop-color="#71411d"/></linearGradient><filter id="sh"><feDropShadow dx="0" dy="1.4" stdDeviation="1.4" flood-color="#010c12" flood-opacity=".82"/></filter></defs>'''
glyphs={
'shuffle':'''<path d="M8 18h9c6 0 10 4 15 13s10 13 17 13h5M47 37l8 7-8 7" fill="none" stroke="url(#gold)" stroke-width="4.1" stroke-linecap="round"/><path d="M8 45h9c6 0 10-4 14-12s11-15 18-15h5M47 11l8 7-8 7" fill="none" stroke="url(#bronze)" stroke-width="3.6" stroke-linecap="round"/><path d="M9 16h9M9 43h9" stroke="#fff1bc" stroke-width="1.1"/>''',
'clear':'''<path d="M18 17a21 21 0 1 1-6 19" stroke="url(#gold)" stroke-width="4" stroke-linecap="round" fill="none"/><path d="M10 13v14h14" fill="none" stroke="url(#bronze)" stroke-width="4.2" stroke-linecap="round"/><path d="M22 13a21 21 0 0 1 27 17" fill="none" stroke="#fff4c6" stroke-width="1.2" opacity=".72"/>''',
'restart':'''<path d="M49 23A22 22 0 1 0 54 36" stroke="url(#gold)" stroke-width="4.2" fill="none" stroke-linecap="round"/><path d="M47 13l3 12-13-2" stroke="url(#bronze)" stroke-width="4.4" fill="none" stroke-linecap="round"/><path d="M25 30l7 4 8-9" fill="none" stroke="#ffe5a1" stroke-width="2.1"/>''',
'back':'''<path d="M40 11L18 32l22 21" stroke="url(#gold)" stroke-width="6.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M35 15L19 32" stroke="#fff4c4" stroke-width="1.6" stroke-linecap="round"/>''',
'check':'''<path d="M10 33l14 14 30-33" fill="none" stroke="url(#gold)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 32l11 11 27-29" fill="none" stroke="#fff5be" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>''',
'menu':'''<path d="M12 17h40M12 32h40M12 47h40" stroke="url(#gold)" stroke-width="5.1" stroke-linecap="round"/><path d="M14 15h35M14 30h35M14 45h35" stroke="#fff8d3" stroke-width="1.1" stroke-linecap="round" opacity=".72"/>'''
}
for k,paths in glyphs.items():
 out=Path('assets/ui')/('story-gold-'+k+'-v1.svg')
 out.parent.mkdir(parents=True,exist_ok=True)
 svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none">'+defs+'<g stroke-linejoin="round" filter="url(#sh)">'+paths+'</g></svg>'
 out.write_text(svg)
 print('PASS',out)
