# -*- coding: utf-8 -*-
"""Fit journey videos to the Gemini (Charon) voice — 122 s / 3660 f, 1200x2670.

Video slot boundaries == VO segment offsets, so each screen matches its topic:
FR offsets: hook 5.30 / punch 25.55 / board 48.96 / globe 72.85 /
  honesty 96.90 / close 111.99  (durs 19.65/22.81/23.29/23.45/14.49/8.93)
EN offsets: hook 5.30 / punch 25.27 / board 47.08 / globe 67.41 /
  honesty 91.42 / close 106.91 (durs 19.37/21.21/19.73/23.41/14.89/13.97)
Audio rebuilt from gemini-vo-*/ wavs with the same recipe as make-gemini-vo.
"""
import subprocess, os, sys

V = os.path.dirname(os.path.abspath(__file__))
FR = r'C:/Users/admin/Desktop/PUNCH/punch-native/_shots/demo-v165'
EN = r'C:/Users/admin/Desktop/PUNCH/punch-native/_shots/demo-v169-en'
J = os.path.join(V, '_journey')
K = os.path.join(V, '_v169')
W = os.path.join(V, '_vfit')
os.makedirs(W, exist_ok=True)
TOTAL = 122.0
FRAMES = 3660

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print('FAILED:', ' '.join(cmd[:8]))
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
        assert os.path.exists(img), 'missing still ' + img
        run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-framerate', '30',
             '-t', str(dur), '-i', img, '-c:v', 'libx264', '-preset', 'medium',
             '-crf', '17', '-pix_fmt', 'yuv420p', out])
    return out

def build_video(segs, outname):
    ins = []
    for s in segs:
        ins += ['-i', s]
    n = len(segs)
    chain = (''.join('[%d:v]' % i for i in range(n)) +
             'concat=n=%d:v=1:a=0,trim=start_frame=0:end_frame=%d,'
             'setpts=PTS-STARTPTS[v]' % (n, FRAMES))
    out = os.path.join(V, outname)
    run(['ffmpeg', '-v', 'error', '-y'] + ins + ['-filter_complex', chain,
         '-map', '[v]', '-c:v', 'libx264', '-preset', 'medium',
         '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out])
    return out

def build_audio(lang, offsets, outname):
    d = os.path.join(V, 'gemini-vo-' + lang)
    names = ['hook', 'punch', 'board', 'globe', 'honesty', 'close']
    ins = []
    flt = []
    for i, nm in enumerate(names):
        p = os.path.join(d, nm + '.wav')
        assert os.path.exists(p), 'missing ' + p
        ins += ['-i', p]
        ms = int(offsets[nm] * 1000)
        flt.append('[%d]adelay=%d|%d[v%d]' % (i, ms, ms, i))
    flt.append(''.join('[v%d]' % i for i in range(0, 6)) +
               'amix=inputs=6:normalize=0:dropout_transition=0,apad[lv];'
               '[lv]loudnorm=I=-16:TP=-1.5:LRA=11[aa]')
    out = os.path.join(V, outname)
    run(['ffmpeg', '-v', 'error', '-y'] + ins +
        ['-filter_complex', ';'.join(flt), '-map', '[aa]',
         '-c:a', 'aac', '-b:a', '192k', '-t', str(TOTAL), out])
    return out

def mux(vid, aud, outname):
    out = os.path.join(V, outname)
    run(['ffmpeg', '-v', 'error', '-y', '-i', vid, '-i', aud,
         '-map', '0:v', '-map', '1:a', '-c', 'copy',
         '-movflags', '+faststart', '-t', str(TOTAL), out])
    print('BUILT', out)

# ---------------- FR ----------------
fj = lambda n: os.path.join(J, n)
fr_segs = [
    fj('fr-a.mp4'),                                            #   4.00 ->  4.00
    freeze(fj('fr-120.png'), 1.30, 'fr-title-hold.mp4'),       #         ->  5.30
    freeze(fj('fr-245.png'), 10.00, 'fr-t1.mp4'),              # ticket  -> 15.30
    freeze(fj('fr-380.png'), 10.25, 'fr-cut1.mp4'),            # regle   -> 25.55
    fj('fr-b.mp4'),                                            # tap     -> 34.05
    fj('fr-live21.mp4'),                                       # live    -> 37.55
    freeze(fj('fr-245.png'), 11.41, 'fr-t2.mp4'),              # ticket  -> 48.96
    fj('fr-board-live.mp4'),                                   #   6.71 -> 55.67
    fj('fr-board-live.mp4'),                                   #   6.71 -> 62.38
    fj('fr-board-live.mp4'),                                   #   6.71 -> 69.08
    freeze(fj('fr-board-last.png'), 3.77, 'fr-bh.mp4'),        #         -> 72.85
    freeze(os.path.join(FR, '05-wallet.png'), 5.05, 'fr-w.mp4'),  #      -> 77.90
    fj('fr-globe.mp4'),                                        #   9.50 -> 87.40
    fj('fr-globe.mp4'),                                        #   9.50 -> 96.90
    fj('fr-hist.mp4'),                                         #   4.00 ->100.90
    freeze(os.path.join(FR, '08-settings.png'), 11.09, 'fr-s.mp4'),  #  ->111.99
    freeze(os.path.join(FR, '09-final.png'), 3.00, 'fr-f.mp4'),       #  ->114.99
    freeze(fj('card-fr.png'), 7.01, 'fr-card.mp4'),            #         ->122.00
]
WANT = sys.argv[1:] or ['fr', 'en']
fr_vid = fr_aud = None
if 'fr' in WANT:
    fr_vid = build_video(fr_segs, 'punch-final-fr-FIT.mp4')
    fr_aud = build_audio('fr',
    {'hook': 5.30, 'punch': 25.55, 'board': 48.96, 'globe': 72.85,
     'honesty': 96.90, 'close': 111.99}, 'vo-fit-fr.m4a')
    mux(fr_vid, fr_aud, 'punch-final-fr-GEMINI.mp4')

# ---------------- EN ----------------
es = lambda n: os.path.join(EN, n)
en_segs = [
    os.path.join(K, 'v-welcome.mp4'),                          #   4.72 ->  4.72
    os.path.join(K, 'v-connect.mp4'),                          #  17.28 -> 22.00
    freeze(es('01-connecte.png'), 3.27, 'en-ch.mp4'),          #         -> 25.27
    live(es('seg-01-punch.mp4'), 0, 8.00, 'en-punch.mp4'),     #         -> 33.27
    freeze(es('03-ticket.png'), 6.00, 'en-tk.mp4'),            #         -> 39.27
    live(es('seg-06-cut.mp4'), 0, 7.81, 'en-cut.mp4'),         #         -> 47.08
    os.path.join(K, 'v-jobs.mp4'),                             #   8.55 -> 55.63
    freeze(es('02-jobs-scroll.png'), 11.78, 'en-jh.mp4'),      #         -> 67.41
    os.path.join(K, 'v-money.mp4'),                            #   5.00 -> 72.41
    live(es('seg-04-world.mp4'), 0, 13.49, 'en-world.mp4'),    #         -> 85.90
    live(es('seg-05-hellos.mp4'), 0, 5.52, 'en-hellos.mp4'),   #         -> 91.42
    live(es('seg-08-arc.mp4'), 0, 9.00, 'en-leave.mp4'),       # quitter ->100.42
    live(es('seg-07-settings.mp4'), 0, 4.00, 'en-set2.mp4'),   # compteurs->104.42
    freeze(es('08-settings.png'), 2.49, 'en-sh.mp4'),          #         ->106.91
    freeze(es('05-hellos-paye.png'), 5.00, 'en-paye.mp4'),     #         ->111.91
    freeze(os.path.join(J, 'card-en.png'), 10.09, 'en-card.mp4'),  #    ->122.00
]
en_vid = en_aud = None
if 'en' in WANT:
    en_vid = build_video(en_segs, 'punch-final-en-FIT.mp4')
    en_aud = build_audio('en',
    {'hook': 5.30, 'punch': 25.27, 'board': 47.08, 'globe': 67.41,
     'honesty': 91.42, 'close': 106.91}, 'vo-fit-en.m4a')
    mux(en_vid, en_aud, 'punch-final-en-GEMINI.mp4')
print('ALL DONE')
