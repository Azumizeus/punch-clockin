# -*- coding: utf-8 -*-
"""Rebuild EN final video from real EN rushes (demo-v169-en), 1200x2670, 95.5s/2865f.

Slots (match Piper EN VO offsets hook 5.3 / punch 22.7 / board 38 /
globe 55 / honesty 74 / close 84.5):
  0-22    home/guide   : 00-welcome freeze 4.72 + seg-00-connect live 17.28
  22-30   ticket       : 03-ticket freeze 8.0
  30-38   cut 92/3/5   : seg-06-cut live 8.0
  38-55   board        : seg-02-jobs live 8.55 + 02-jobs-scroll freeze 8.45
  55-60   wallet       : 03-money freeze 5.0
  60-70   globe        : seg-04-world live 10.0
  70-74   hellos       : seg-05-hellos live 4.0
  74-84.5 settings     : seg-07-settings live 9.66 + last-frame freeze 0.84
  84.5-88.5 paid       : 05-hellos-paye freeze 4.0
  88.5-95.5 card       : card-en freeze 7.0
Audio: copied untouched from current releases EN (Piper-synced).
"""
import subprocess, os, sys

V = os.path.dirname(os.path.abspath(__file__))
SHOT = r'C:/Users/admin/Desktop/PUNCH/punch-native/_shots/demo-v169-en'
W = os.path.join(V, '_v169')
os.makedirs(W, exist_ok=True)

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print('FAILED:', ' '.join(cmd[:7]))
        print(r.stderr[-1200:])
        sys.exit(1)

def live(src, ss, dur, name):
    out = os.path.join(W, name)
    if not os.path.exists(out):
        run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-ss', str(ss),
             '-t', str(dur), '-vf', 'fps=30,setpts=PTS-STARTPTS',
             '-c:v', 'libx264', '-preset', 'medium', '-crf', '17',
             '-pix_fmt', 'yuv420p', out])
    return out

def freeze(img, dur, name):
    out = os.path.join(W, name)
    if not os.path.exists(out):
        run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-framerate', '30',
             '-t', str(dur), '-i', img, '-c:v', 'libx264', '-preset', 'medium',
             '-crf', '17', '-pix_fmt', 'yuv420p', out])
    return out

def still_seek(src, ss, name):
    out = os.path.join(W, name)
    if not os.path.exists(out):
        run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-ss', str(ss),
             '-frames:v', '1', out])
    return out

cardEN = os.path.join(V, '_journey', 'card-en.png')
assert os.path.exists(cardEN), 'card-en.png missing'

S = lambda n: os.path.join(SHOT, n)
segs = [
    freeze(S('00-welcome.png'), 4.72, 'v-welcome.mp4'),
    live(S('seg-00-connect.mp4'), 0, 17.28, 'v-connect.mp4'),
    freeze(S('03-ticket.png'), 8.0, 'v-ticket.mp4'),
    live(S('seg-06-cut.mp4'), 0, 8.0, 'v-cut.mp4'),
    live(S('seg-02-jobs.mp4'), 0, 8.55, 'v-jobs.mp4'),
    freeze(S('02-jobs-scroll.png'), 8.45, 'v-jobs-hold.mp4'),
    freeze(S('03-money.png'), 5.0, 'v-money.mp4'),
    live(S('seg-04-world.mp4'), 0, 10.0, 'v-world.mp4'),
    live(S('seg-05-hellos.mp4'), 0, 4.0, 'v-hellos.mp4'),
    live(S('seg-07-settings.mp4'), 0, 9.66, 'v-settings.mp4'),
    freeze(S('08-settings.png'), 0.84, 'v-settings-hold.mp4'),
    freeze(S('05-hellos-paye.png'), 4.0, 'v-paye.mp4'),
    freeze(cardEN, 7.0, 'v-card.mp4'),
]
ins = []
for s in segs:
    ins += ['-i', s]
ins += ['-i', os.path.join(V, '..', 'releases', 'punch-final-en.mp4')]
n = len(segs)
chain = (''.join('[%d:v]' % i for i in range(n)) +
         'concat=n=%d:v=1:a=0,trim=start_frame=0:end_frame=2865,'
         'setpts=PTS-STARTPTS[v]' % n)
run(['ffmpeg', '-v', 'error', '-y'] + ins + ['-filter_complex', chain,
     '-map', '[v]', '-map', '%d:a' % n, '-c:v', 'libx264', '-preset', 'medium',
     '-crf', '17', '-pix_fmt', 'yuv420p', '-c:a', 'copy',
     '-movflags', '+faststart', os.path.join(V, 'punch-final-en-V169.mp4')])
print('EN V169 BUILT')
