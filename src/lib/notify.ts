let audioCtx: AudioContext | null = null;
let unlocked = false;

function ctx() {
  const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  audioCtx = audioCtx || new C();
  return audioCtx;
}

export function unlockAudio() {
  try {
    const c = ctx();
    if (c.state === "suspended") c.resume();
    if (!unlocked && "speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      window.speechSynthesis.speak(u);
    }
    unlocked = true;
  } catch {
    return;
  }
}

function beep() {
  try {
    const c = ctx();
    if (c.state === "suspended") c.resume();
    [0, 0.22, 0.44].forEach((t, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "sine";
      o.frequency.value = [880, 1175, 1568][i];
      g.gain.setValueAtTime(0.0001, c.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.35, c.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t + 0.2);
      o.connect(g);
      g.connect(c.destination);
      o.start(c.currentTime + t);
      o.stop(c.currentTime + t + 0.22);
    });
  } catch {
    return;
  }
}

function speak(text: string) {
  try {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ru-RU";
    u.rate = 1;
    window.speechSynthesis.speak(u);
  } catch {
    return;
  }
}

export function pushNotify(text?: string) {
  beep();
  if (navigator.vibrate) navigator.vibrate([300, 150, 300]);
  if (text) setTimeout(() => speak(text), 750);
}
