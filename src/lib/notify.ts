export function askNotifyPermission() {
  return;
}

let audioCtx: AudioContext | null = null;

function beep() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const ctx = audioCtx;
    [0, 0.25, 0.5].forEach((t) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 880;
      g.gain.value = 0.2;
      o.connect(g);
      g.connect(ctx.destination);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + 0.15);
    });
  } catch {
    return;
  }
}

export function pushNotify(_title?: string, _body?: string) {
  beep();
  if (navigator.vibrate) navigator.vibrate([300, 150, 300]);
}
