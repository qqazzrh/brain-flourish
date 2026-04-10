import { useState, useEffect, useRef, useCallback } from 'react';
import { useSharpness, DualTaskResponseEntry } from '@/contexts/SharpnessContext';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

function generateVisualSequence(count: number): number[] {
  const digits: number[] = [];
  for (let i = 0; i < count; i++) {
    let d: number;
    do {
      d = Math.floor(Math.random() * 9) + 1;
    } while (
      i >= 3 && digits[i - 1] === d && digits[i - 2] === d && digits[i - 3] === d
    );
    if (i > 0 && i % 5 < 2 && d % 2 !== 0) d = [2, 4, 6, 8][Math.floor(Math.random() * 4)];
    digits.push(d);
  }
  return digits;
}

function generateToneSchedule(durationMs: number): { time: number; isHigh: boolean }[] {
  const tones: { time: number; isHigh: boolean }[] = [];
  let t = 1000 + Math.random() * 500;
  while (t < durationMs - 200) {
    tones.push({ time: t, isHigh: Math.random() < 0.5 });
    t += 1200 + Math.random() * 1600;
  }
  return tones;
}

// Shared AudioContext — created once, unlocked on first user gesture
let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return sharedAudioCtx;
}

/** Call during a user tap/click to unlock audio on iOS/iPad */
function unlockAudio() {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  // Play a silent buffer to fully unlock on iOS
  const buf = ctx.createBuffer(1, 1, 22050);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.connect(ctx.destination);
  src.start(0);
}

function playTone(frequency: number, duration: number = 200) {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    osc.type = 'sine';
    gain.gain.value = 0.4;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
    osc.stop(ctx.currentTime + duration / 1000);
  } catch {}
}

const BLOCK_COLORS = {
  blockA: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-300 dark:border-blue-700',
    bannerBg: 'bg-blue-500',
    label: 'VISUAL TASK',
    desc: 'Tap LEFT for EVEN numbers',
  },
  blockB: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-300 dark:border-amber-700',
    bannerBg: 'bg-amber-500',
    label: 'AUDITORY TASK',
    desc: 'Tap RIGHT for HIGH tones',
  },
  blockC: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-300 dark:border-purple-700',
    bannerBg: 'bg-purple-500',
    label: 'BOTH TASKS',
    desc: 'LEFT = even numbers • RIGHT = high tones',
  },
};

type DualTaskPhase = 'instrA' | 'blockA' | 'instrB' | 'blockB' | 'instrC' | 'blockC';

export default function DualTaskComponent() {
  const { goToScreen, addBlockAResponse, addBlockBResponse, addBlockCResponse } = useSharpness();
  const [phase, setPhase] = useState<DualTaskPhase>('instrA');
  const [timeLeft, setTimeLeft] = useState(10);
  const [currentDigit, setCurrentDigit] = useState<number | null>(null);
  const [showDigit, setShowDigit] = useState(false);
  const [toneActive, setToneActive] = useState(false);
  const [leftWrong, setLeftWrong] = useState(false);
  const [rightWrong, setRightWrong] = useState(false);
  const [leftCorrect, setLeftCorrect] = useState(false);
  const [rightCorrect, setRightCorrect] = useState(false);

  const visualSeqRef = useRef<number[]>([]);
  const toneScheduleRef = useRef<{ time: number; isHigh: boolean }[]>([]);
  const visualIndexRef = useRef(0);
  const toneIndexRef = useRef(0);
  const visualTappedRef = useRef(false);
  const auditoryTappedRef = useRef(false);
  const stimOnsetRef = useRef(0);
  const toneOnsetRef = useRef(0);
  const currentDigitIsEvenRef = useRef(false);
  const currentToneIsHighRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cycleRef = useRef<NodeJS.Timeout | null>(null);
  const toneTimerRef = useRef<NodeJS.Timeout | null>(null);
  const blockStartRef = useRef(0);
  const activeRef = useRef(false);

  const addResponse = useCallback((entry: DualTaskResponseEntry) => {
    if (phase === 'blockA') addBlockAResponse(entry);
    else if (phase === 'blockB') addBlockBResponse(entry);
    else if (phase === 'blockC') addBlockCResponse(entry);
  }, [phase, addBlockAResponse, addBlockBResponse, addBlockCResponse]);

  const cleanup = useCallback(() => {
    activeRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    if (cycleRef.current) clearTimeout(cycleRef.current);
    if (toneTimerRef.current) clearTimeout(toneTimerRef.current);
  }, []);

  const runVisualCycle = useCallback(() => {
    if (!activeRef.current) return;
    const seq = visualSeqRef.current;
    if (visualIndexRef.current >= seq.length) return;

    const digit = seq[visualIndexRef.current];
    const isEven = digit % 2 === 0;
    currentDigitIsEvenRef.current = isEven;
    visualTappedRef.current = false;
    stimOnsetRef.current = performance.now();

    setCurrentDigit(digit);
    setShowDigit(true);

    setTimeout(() => { if (activeRef.current) setShowDigit(false); }, 800);

    const idx = visualIndexRef.current;
    setTimeout(() => {
      if (!activeRef.current) return;
      if (!visualTappedRef.current) {
        addResponse({
          channel: 'visual', stimulus_index: idx, stimulus_value: digit,
          is_target: isEven, stimulus_onset: new Date().toISOString(),
          response_time_ms: null,
          response_type: isEven ? 'miss' : 'correct_withhold',
        });
      }
    }, 800);

    cycleRef.current = setTimeout(() => {
      visualIndexRef.current++;
      runVisualCycle();
    }, 1200);
  }, [addResponse]);

  const scheduleTones = useCallback(() => {
    const schedule = toneScheduleRef.current;
    const startTime = blockStartRef.current;

    const playNext = (index: number) => {
      if (!activeRef.current || index >= schedule.length) return;
      const tone = schedule[index];
      const delay = tone.time - (performance.now() - startTime);

      toneTimerRef.current = setTimeout(() => {
        if (!activeRef.current) return;
        currentToneIsHighRef.current = tone.isHigh;
        auditoryTappedRef.current = false;
        toneOnsetRef.current = performance.now();
        toneIndexRef.current = index;

        playTone(tone.isHigh ? 880 : 220);
        setToneActive(true);
        setTimeout(() => setToneActive(false), 200);

        setTimeout(() => {
          if (!activeRef.current) return;
          if (!auditoryTappedRef.current) {
            addResponse({
              channel: 'auditory', stimulus_index: index,
              stimulus_value: tone.isHigh ? 'high' : 'low',
              is_target: tone.isHigh, stimulus_onset: new Date().toISOString(),
              response_time_ms: null,
              response_type: tone.isHigh ? 'miss' : 'correct_withhold',
            });
          }
        }, 600);

        playNext(index + 1);
      }, Math.max(0, delay));
    };

    playNext(0);
  }, [addResponse]);

  const startBlock = useCallback((blockPhase: DualTaskPhase) => {
    const dur = blockPhase === 'blockC' ? 60 : 10;
    setTimeLeft(dur);
    activeRef.current = true;
    blockStartRef.current = performance.now();
    visualIndexRef.current = 0;
    toneIndexRef.current = 0;

    if (blockPhase === 'blockA' || blockPhase === 'blockC') {
      visualSeqRef.current = generateVisualSequence(blockPhase === 'blockC' ? 50 : 10);
      runVisualCycle();
    }
    if (blockPhase === 'blockB' || blockPhase === 'blockC') {
      toneScheduleRef.current = generateToneSchedule(dur * 1000);
      scheduleTones();
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          cleanup();
          if (blockPhase === 'blockA') setPhase('instrB');
          else if (blockPhase === 'blockB') setPhase('instrC');
          else if (blockPhase === 'blockC') goToScreen(7);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [runVisualCycle, scheduleTones, cleanup, goToScreen]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const handleLeftTap = useCallback(() => {
    if (!activeRef.current) return;
    if (visualTappedRef.current) return;
    visualTappedRef.current = true;
    const rt = Math.round(performance.now() - stimOnsetRef.current);
    const isEven = currentDigitIsEvenRef.current;

    if (!isEven) {
      setLeftWrong(true);
      setTimeout(() => setLeftWrong(false), 300);
    } else {
      setLeftCorrect(true);
      setTimeout(() => setLeftCorrect(false), 300);
    }

    addResponse({
      channel: 'visual', stimulus_index: visualIndexRef.current,
      stimulus_value: visualSeqRef.current[visualIndexRef.current] || 0,
      is_target: isEven, stimulus_onset: new Date().toISOString(),
      response_time_ms: rt,
      response_type: isEven ? 'hit' : 'false_alarm',
    });
  }, [addResponse]);

  const handleRightTap = useCallback(() => {
    if (!activeRef.current) return;
    if (auditoryTappedRef.current) return;
    auditoryTappedRef.current = true;
    const rt = Math.round(performance.now() - toneOnsetRef.current);
    const isHigh = currentToneIsHighRef.current;

    if (!isHigh) {
      setRightWrong(true);
      setTimeout(() => setRightWrong(false), 300);
    } else {
      setRightCorrect(true);
      setTimeout(() => setRightCorrect(false), 300);
    }

    addResponse({
      channel: 'auditory', stimulus_index: toneIndexRef.current,
      stimulus_value: isHigh ? 'high' : 'low',
      is_target: isHigh, stimulus_onset: new Date().toISOString(),
      response_time_ms: rt,
      response_type: isHigh ? 'hit' : 'false_alarm',
    });
  }, [addResponse]);

  // Instruction screens
  if (phase === 'instrA') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-lg space-y-6 text-center">
          <p className="text-display text-sm text-primary">PART 1 — DUAL TASK</p>
          <p className="text-display text-lg text-muted-foreground">Step 1 of 3: Visual task only</p>
          <div className="card-elevated p-6 space-y-3 text-left">
            <div className={`rounded-lg px-4 py-3 ${BLOCK_COLORS.blockA.bg} border ${BLOCK_COLORS.blockA.border}`}>
              <span className="font-bold text-blue-700 dark:text-blue-300">🔵 VISUAL TASK</span>
              <span className="text-foreground ml-2">— screen will be blue</span>
            </div>
            <p className="text-lg text-foreground">Numbers will appear on screen.</p>
            <p className="text-lg text-foreground font-bold">TAP when you see an EVEN number.</p>
            <p className="text-base text-muted-foreground">(2, 4, 6, 8)</p>
            <p className="text-base text-foreground">Do NOT tap for odd numbers.</p>
          </div>
          <p className="text-sm text-muted-foreground">10 seconds. Starting now.</p>
          <Button variant="hero" size="xl" className="w-full" onClick={() => { unlockAudio(); setPhase('blockA'); startBlock('blockA'); }}>
            I'm ready — Start
          </Button>
        </div>
      </motion.div>
    );
  }

  if (phase === 'instrB') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-lg space-y-6 text-center">
          <p className="text-display text-sm text-primary">PART 1 — DUAL TASK</p>
          <p className="text-display text-lg text-muted-foreground">Step 2 of 3: Listening task only</p>
          <div className="card-elevated p-6 space-y-3 text-left">
            <div className={`rounded-lg px-4 py-3 ${BLOCK_COLORS.blockB.bg} border ${BLOCK_COLORS.blockB.border}`}>
              <span className="font-bold text-amber-700 dark:text-amber-300">🟡 AUDITORY TASK</span>
              <span className="text-foreground ml-2">— screen will be amber</span>
            </div>
            <p className="text-lg text-foreground">You will hear tones through the speaker.</p>
            <p className="text-lg text-foreground font-bold">TAP when you hear a HIGH tone.</p>
            <p className="text-base text-foreground">Do NOT tap for low tones.</p>
          </div>
          <p className="text-sm text-muted-foreground">10 seconds. Starting now.</p>
          <Button variant="hero" size="xl" className="w-full" onClick={() => { setPhase('blockB'); startBlock('blockB'); }}>
            I'm ready — Start
          </Button>
        </div>
      </motion.div>
    );
  }

  if (phase === 'instrC') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-lg space-y-6 text-center">
          <p className="text-display text-sm text-primary">PART 1 — DUAL TASK</p>
          <p className="text-display text-lg text-muted-foreground">Step 3 of 3: Both at the same time</p>
          <div className="card-elevated p-6 space-y-3 text-left">
            <div className={`rounded-lg px-4 py-3 ${BLOCK_COLORS.blockC.bg} border ${BLOCK_COLORS.blockC.border}`}>
              <span className="font-bold text-purple-700 dark:text-purple-300">🟣 BOTH TASKS</span>
              <span className="text-foreground ml-2">— screen will be purple</span>
            </div>
            <p className="text-lg text-foreground font-bold">Now do BOTH tasks simultaneously.</p>
            <p className="text-base text-foreground"><span className="font-bold">LEFT zone</span> → tap for EVEN numbers</p>
            <p className="text-base text-foreground"><span className="font-bold">RIGHT zone</span> → tap for HIGH tones</p>
            <p className="text-sm text-muted-foreground mt-2">Do your best — it is meant to be challenging.</p>
          </div>
          <p className="text-sm text-muted-foreground">60 seconds.</p>
          <Button variant="hero" size="xl" className="w-full" onClick={() => { setPhase('blockC'); startBlock('blockC'); }}>
            Start — Both Tasks
          </Button>
        </div>
      </motion.div>
    );
  }

  // Active block display
  const blockKey = phase as 'blockA' | 'blockB' | 'blockC';
  const blockStyle = BLOCK_COLORS[blockKey];
  const showVisual = phase === 'blockA' || phase === 'blockC';
  const showAuditory = phase === 'blockB' || phase === 'blockC';

  return (
    <motion.div
      key={phase}
      initial={{ opacity: 0.7 }}
      animate={{ opacity: 1 }}
      className={`h-[100dvh] flex flex-col select-none transition-colors duration-300 ${blockStyle.bg}`}
    >
      {/* Big block banner */}
      <div className={`${blockStyle.bannerBg} px-6 py-4 md:py-5 text-center`}>
        <span className="text-white text-2xl md:text-3xl font-black tracking-wider">{blockStyle.label}</span>
        <p className="text-white/80 text-sm md:text-base font-medium">{blockStyle.desc}</p>
      </div>

      <div className={`px-6 py-2 flex items-center justify-between border-b ${blockStyle.border}`}>
        <div />
        <span className="text-sm md:text-base font-mono text-muted-foreground">
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')} left
        </span>
      </div>

      {/* Stimulus area */}
      <div className="flex-1 flex items-center justify-center">
        {showVisual && (
          <div className="h-32 md:h-48 flex items-center justify-center">
            <AnimatePresence>
              {showDigit && currentDigit !== null && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-display text-[80px] md:text-[120px] text-foreground">
                  {currentDigit}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        )}
        {!showVisual && showAuditory && (
          <div className="text-center space-y-3">
            <div className={`text-6xl md:text-8xl transition-transform ${toneActive ? 'scale-125' : ''}`}>🔊</div>
            <p className="text-lg md:text-xl text-muted-foreground">Listen carefully</p>
          </div>
        )}
      </div>

      {/* Tap zones */}
      <div className="px-6 pb-8 flex gap-6">
        {(phase === 'blockA' || phase === 'blockC') && (
          <button
            onClick={handleLeftTap}
            className={`flex-1 min-h-[120px] md:min-h-[150px] rounded-xl border-2 flex items-center justify-center transition-colors tap-target ${leftWrong ? 'border-red-500 bg-red-200/60 dark:bg-red-900/40' : leftCorrect ? 'border-green-500 bg-green-200/60 dark:bg-green-900/40' : `${blockStyle.border} bg-background/80 active:bg-primary/20`}`}
          >
            <div className="text-center">
              <p className="text-lg md:text-xl font-bold text-primary">EVEN</p>
              <p className="text-sm md:text-base text-primary/70">NUMBER</p>
            </div>
          </button>
        )}
        {(phase === 'blockB' || phase === 'blockC') && (
          <button
            onClick={handleRightTap}
            className={`flex-1 min-h-[120px] md:min-h-[150px] rounded-xl border-2 flex items-center justify-center transition-colors tap-target ${rightWrong ? 'border-red-500 bg-red-200/60 dark:bg-red-900/40' : rightCorrect ? 'border-green-500 bg-green-200/60 dark:bg-green-900/40' : `${blockStyle.border} bg-background/80 active:bg-warning/20`}`}
          >
            <div className="text-center">
              <p className="text-lg md:text-xl font-bold text-warning">HIGH</p>
              <p className="text-sm md:text-base text-warning/70">TONE</p>
            </div>
          </button>
        )}
      </div>
    </motion.div>
  );
}
