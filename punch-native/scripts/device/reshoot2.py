# -*- coding: utf-8 -*-
"""Re-tourne les segments UI avec screenrecord AUTO-TERMINAL (--time-limit).
Aucun signal envoye : on attend time-limit + marge, le mp4 est finalise par
screenrecord lui-meme -> fichiers toujours valides."""
import os
import subprocess
import sys
import time

sys.stdout.reconfigure(errors="replace")

ADB = os.path.join(os.environ["LOCALAPPDATA"], "Android", "Sdk", "platform-tools", "adb.exe")
PKG = "com.anonymous.punchnative"
SHOTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "_shots", "demo-v165")

def adb(*args, timeout=30):
    return subprocess.run([ADB, *args], capture_output=True, timeout=timeout).stdout.decode("utf-8", "replace")

def sh(cmd, timeout=30):
    return adb("shell", cmd, timeout=timeout)

def focus():
    return sh("dumpsys window | grep -E mCurrentFocus").strip()

def goto(tab):
    sh("am start -a android.intent.action.VIEW -d 'punc:///%s'" % tab)
    time.sleep(3.0)
    if PKG not in focus():
        sh("am start -n %s/.MainActivity" % PKG)
        time.sleep(4)

def shoot(seg, tab, duration, mid=None):
    """duration = time-limit du screenrecord ; mid = action a mi-course."""
    goto(tab)
    time.sleep(2)
    rec = subprocess.Popen([ADB, "shell", "screenrecord", "--bit-rate", "8000000",
                            "--time-limit", str(duration), "/sdcard/punchdemo/%s.mp4" % seg],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(duration / 2.0)
    if mid == "swipe":
        sh("input swipe 540 1600 540 900 300")
    elif mid == "globe":
        sh("input swipe 900 1100 200 1100 400")
        time.sleep(2)
        sh("input swipe 200 1100 900 1100 400")
    # attendre la FIN NATURELLE (time-limit + finalisation + pull)
    rec.wait(timeout=duration + 25)
    time.sleep(2)
    local = os.path.join(SHOTS, "%s.mp4" % seg)
    adb("pull", "/sdcard/punchdemo/%s.mp4" % seg, local, timeout=60)
    sh("rm /sdcard/punchdemo/%s.mp4" % seg)
    print("  [rec] %s.mp4 (%d Ko)" % (seg, os.path.getsize(local) // 1024))

shoot("segB-03-board", "board", 12, mid="swipe")
shoot("segB-04-wallet", "wallet", 10)
shoot("segB-05-globe", "globe", 14, mid="globe")
shoot("segB-06-hellos", "hellos", 10)
shoot("segB-07-history", "history", 10)
shoot("segB-08-final", "punch", 10)

print("Re-shoot auto-terminal termine")
