# -*- coding: utf-8 -*-
"""Fit journey videos SANS emploi — réutilise la voix Gemini d'origine.

Supprime le segment board (missions) vidéo+audio des 2 côtés :
FR : retire fr-board-live x3 + fr-bh (23.90 s) -> total ~98.10 s / 2943 f
EN : retire v-jobs + en-jh (20.33 s) -> total ~101.67 s / 3050 f
Audio reconstruit depuis gemini-vo-*/ (hook/punch/globe/honesty/close),
mêmes gaps 0.6 s + tail ~1.1 s. Video 1200x2670, 30fps.
"""
import subprocess, os, sys

V = os.path.dirname(os.path.abspath(__file__))
FR = r'C:/Users/admin/Desktop/PUNCH/punch-native/_shots/demo-v165'
EN = r'C:/Users/admin/Desktop/PUNCH/punch-native/_shots/demo-v169-en'
J = os.path.join(V, '_journey')
K = os.path.join(V, '_v169')
W = os.path.join(V, '_vfit')
os.makedirs(W, exist_ok=True)

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print('FAILED:', ' '.join(cmd[:8]))
        print(r.stderr[-1200:])
        sys.exit(1)

def freeze(img, dur, name):
    out = os.path.join(W, name)
    if not os.path.exists(out):
        assert os.path.exists(img), 'missing still ' + img
        run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-framerate', '30',
             '-t', str(dur), '-i', img, '-c:v', 'libx264', '-preset', 'medium',
             '-crf', '17', '-pix_fmt', 'yuv420p', out])
    return out

def build_video(segs, outname, frames):
    ins = []
    for s in segs:
        ins += ['-i', s]
    n = len(segs)
    chain = (''.join('[%d:v]' % i for i in range(n)) +
             'concat=n=%d:v=1:a=0,trim=start_frame=0:end_frame=%d,'
             'setpts=PTS-STARTPTS[v]' % (n, frames))
    out = os.path.join(V, outname)
    run(['ffmpeg', '-v', 'error', '-y'] + ins + ['-filter_complex', chain,
         '-map', '[v]', '-c:v', 'libx264', '-preset', 'medium',
         '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out])
    return out

def build_audio(lang, offsets, names, total, outname):
    d = os.path.join(V, 'gemini-vo-' + lang)
    ins = []
    flt = []
    for i, nm in enumerate(names):
        p = os.path.join(d, nm + '.wav')
        assert os.path.exists(p), 'missing ' + p
        ins += ['-i', p]
        ms = int(offsets[nm] * 1000)
        flt.append('[%d]adelay=%d|%d[v%d]' % (i, ms, ms, i))
    flt.append(''.join('[v%d]' % i for i in range(len(names))) +
               'amix=inputs=%d:normalize=0:dropout_transition=0,apad[lv];'
               '[lv]loudnorm=I=-16:TP=-1.5:LRA=11[aa]' % len(names))
    out = os.path.join(V, outname)
    run(['ffmpeg', '-v', 'error', '-y'] + ins +
        ['-filter_complex', ';'.join(flt), '-map', '[aa]',
         '-c:a', 'aac', '-b:a', '192k', '-t', str(total), out])
    return out

def mux(vid, aud, total, outname):
    out = os.path.join(V, outname)
    run(['ffmpeg', '-v', 'error', '-y', '-i', vid, '-i', aud,
         '-map', '0:v', '-map', '1:a', '-c', 'copy',
         '-movflags', '+faststart', '-t', str(total), out])
    print('BUILT', out)

NAMES = ['hook', 'punch', 'globe', 'honesty', 'close']

# ---------------- FR (~98.10 s / 2943 f, sans emploi) ----------------
fj = lambda n: os.path.join(J, n)
fr_segs = [
    fj('fr-a.mp4'),
    freeze(fj('fr-120.png'), 1.30, 'fr-title-hold.mp4'),
    freeze(fj('fr-245.png'), 10.00, 'fr-t1.mp4'),
    freeze(fj('fr-380.png'), 10.25, 'fr-cut1.mp4'),
    fj('fr-b.mp4'),
    fj('fr-live21.mp4'),
    freeze(fj('fr-245.png'), 11.41, 'fr-t2.mp4'),
    # --- board retiré (fr-board-live x3 + fr-bh) ---
    freeze(os.path.join(FR, '05-wallet.png'), 5.05, 'fr-w.mp4'),
    fj('fr-globe.mp4'),
    fj('fr-globe.mp4'),
    fj('fr-hist.mp4'),
    freeze(os.path.join(FR, '08-settings.png'), 11.09, 'fr-s.mp4'),
    freeze(os.path.join(FR, '09-final.png'), 3.00, 'fr-f.mp4'),
    freeze(fj('card-fr.png'), 7.01, 'fr-card.mp4'),
]
FR_TOTAL = 98.10
FR_FRAMES = 2943
FR_OFF = {'hook': 5.30, 'punch': 25.55, 'globe': 48.96, 'honesty': 73.01, 'close': 88.10}

# ---------------- EN (~101.67 s / 3050 f, sans emploi) ----------------
import sys as _s
_es = lambda n: os.path.join(EN, n)
def _live(src, ss, dur, name):
    out = os.path.join(W, name)
    if not os.path.exists(out):
        run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-ss', str(ss),
             '-t', str(dur), '-vf', 'fps=30,setpts=PTS-STARTPTS',
             '-c:v', 'libx264', '-preset', 'medium', '-crf', '17',
             '-pix_fmt', 'yuv420p', out])
    return out
en_segs = [
    os.path.join(K, 'v-welcome.mp4'),
    os.path.join(K, 'v-connect.mp4'),
    freeze(_es('01-connecte.png'), 3.27, 'en-ch.mp4'),
    _live(_es('seg-01-punch.mp4'), 0, 8.00, 'en-punch.mp4'),
    freeze(_es('03-ticket.png'), 6.00, 'en-tk.mp4'),
    _live(_es('seg-06-cut.mp4'), 0, 7.81, 'en-cut.mp4'),
    # --- emploi retiré (v-jobs + en-jh) ---
    os.path.join(K, 'v-money.mp4'),
    _live(_es('seg-04-world.mp4'), 0, 13.49, 'en-world.mp4'),
    _live(_es('seg-05-hellos.mp4'), 0, 5.52, 'en-hellos.mp4'),
    _live(_es('seg-08-arc.mp4'), 0, 9.00, 'en-leave.mp4'),
    _live(_es('seg-07-settings.mp4'), 0, 4.00, 'en-set2.mp4'),
    freeze(_es('08-settings.png'), 2.49, 'en-sh.mp4'),
    freeze(_es('05-hellos-paye.png'), 5.00, 'en-paye.mp4'),
    freeze(os.path.join(J, 'card-en.png'), 10.09, 'en-card.mp4'),
]
EN_TOTAL = 101.67
EN_FRAMES = 3050
EN_OFF = {'hook': 5.30, 'punch': 25.27, 'globe': 47.08, 'honesty': 71.09, 'close': 86.58}

WANT = sys.argv[1:] or ['fr', 'en']
if 'fr' in WANT:
    v = build_video(fr_segs, 'punch-final-fr-NOEMPLOI-v.mp4', FR_FRAMES)
    a = build_audio('fr', FR_OFF, NAMES, FR_TOTAL, 'vo-noemploi-fr.m4a')
    mux(v, a, FR_TOTAL, 'punch-final-fr-NOEMPLOI.mp4')
if 'en' in WANT:
    v = build_video(en_segs, 'punch-final-en-NOEMPLOI-v.mp4', EN_FRAMES)
    a = build_audio('en', EN_OFF, NAMES, EN_TOTAL, 'vo-noemploi-en.m4a')
    mux(v, a, EN_TOTAL, 'punch-final-en-NOEMPLOI.mp4')
print('ALL DONE')
