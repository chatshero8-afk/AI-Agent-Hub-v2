export const playClickSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Crisp "blink" UI sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(3200, ctx.currentTime + 0.03);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  } catch (e) {
    // Ignore audio context errors (e.g. before user interaction)
  }
};

export const playSuccessSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const playNote = (freq: number, startTime: number, duration: number, vol = 0.1) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + startTime + Math.min(0.05, duration * 0.1));
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    // Triumphant 8-bit level up (G4, C5, E5, G5, C6)
    playNote(392.00, 0, 0.1);
    playNote(523.25, 0.1, 0.1);
    playNote(659.25, 0.2, 0.1);
    playNote(783.99, 0.3, 0.1);
    playNote(1046.50, 0.4, 0.6);
  } catch (e) {
    // Ignore
  }
};

export const playWinningSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const playNote = (freq: number, startTime: number, duration: number, vol = 0.1) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + startTime + duration * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    // A victorious, ascending melody (C5, E5, G5, C6 with a rhythm)
    playNote(523.25, 0.0, 0.1, 0.1); // C5
    playNote(659.25, 0.15, 0.1, 0.1); // E5
    playNote(783.99, 0.3, 0.1, 0.1); // G5
    playNote(1046.50, 0.5, 0.4, 0.15); // C6 long
  } catch (e) {
    // Ignore
  }
};

export const playGlorySound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const playNote = (freq: number, startTime: number, duration: number, vol = 0.15, type: OscillatorType = 'triangle') => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + startTime + duration * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    // A long, grand, sweeping chord (C major 7th rolled)
    playNote(261.63, 0.0, 1.5, 0.2, 'sine');     // C4
    playNote(329.63, 0.1, 1.4, 0.15, 'triangle'); // E4
    playNote(392.00, 0.2, 1.3, 0.15, 'triangle'); // G4
    playNote(493.88, 0.3, 1.2, 0.1, 'sine');     // B4
    playNote(523.25, 0.4, 2.0, 0.2, 'square');   // C5
    playNote(659.25, 0.5, 2.0, 0.1, 'sine');     // E5
    
  } catch (e) {
    // Ignore
  }
};

export const playEpicGamingAlert = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Sci-fi synth/retro gaming alert
    const playNote = (freq: number, startTime: number, duration: number, vol = 0.1, type: OscillatorType = 'sawtooth') => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    // Intense fast arpeggio (A minor to an epic high A)
    playNote(440.00, 0.00, 0.15, 0.1, 'sawtooth'); // A4
    playNote(523.25, 0.08, 0.15, 0.1, 'sawtooth'); // C5
    playNote(659.25, 0.16, 0.15, 0.1, 'square');   // E5
    playNote(880.00, 0.24, 0.60, 0.15, 'square');  // A5 long

    // Underlying bass thud
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(110, ctx.currentTime + 0.24);
    bassOsc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.7);
    bassGain.gain.setValueAtTime(0, ctx.currentTime + 0.24);
    bassGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.26);
    bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    bassOsc.connect(bassGain);
    bassGain.connect(ctx.destination);
    bassOsc.start(ctx.currentTime + 0.24);
    bassOsc.stop(ctx.currentTime + 0.8);

  } catch (e) {
  }
};

let lastTransitionTime = 0;

export const playTransitionSound = () => {
  const now = Date.now();
  if (now - lastTransitionTime < 100) return; // debounce double-firings
  lastTransitionTime = now;

  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Smooth "whoosh" or "pop" transition
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    // Ignore empty
  }
};
