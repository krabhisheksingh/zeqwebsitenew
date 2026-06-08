// Utility to play synthetic ringtones using the Web Audio API
export const playRingtone = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playTone = (freq, type, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + startTime + 0.05);
      gain.gain.setValueAtTime(0.5, ctx.currentTime + startTime + duration - 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    switch (type) {
      case 'chime':
        // A pleasant two-tone chime
        playTone(523.25, 'sine', 0, 0.3); // C5
        playTone(659.25, 'sine', 0.4, 0.5); // E5
        break;
      case 'buzzer':
        // Urgent repeated buzz
        for (let i = 0; i < 4; i++) {
          playTone(400, 'sawtooth', i * 0.25, 0.15);
        }
        break;
      case 'beep':
      default:
        // Classic digital double beep
        playTone(880, 'square', 0, 0.1);
        playTone(880, 'square', 0.2, 0.1);
        break;
    }
  } catch (e) {
    console.error('AudioContext failed:', e);
  }
};
