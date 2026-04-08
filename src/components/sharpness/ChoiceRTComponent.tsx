import { useState, useEffect, useRef, useCallback } from 'react';
import { useSharpness, ChoiceRTResponseEntry } from '@/contexts/SharpnessContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const TOTAL_DURATION = 60;
const PRACTICE_DURATION = 10;
const RULE_BLOCK_DURATION = 15;
const PRACTICE_RULE_BLOCK = 5; // Rule changes every 5s in practice so participants experience it
const STIMULUS_CYCLE = 1000;
const STIMULUS_DISPLAY = 200;

const RULE_COLORS = {
  compatible: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-300 dark:border-emerald-700',
    bannerBg: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  incompatible: {
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    border: 'border-rose-300 dark:border-rose-700',
    bannerBg: 'bg-rose-500',
    text: 'text-rose-700 dark:text-rose-300',
  },
};

function generateChoiceSequence(count: number): number[] {
  const seq: number[] = [];
  for (let i = 0; i < count; i++) {
    let pos: number;
    do {
      pos = Math.floor(Math.random() * 4) + 1;
    } while (i >= 2 && seq[i - 1] === pos && seq[i - 2] === pos);
    seq.push(pos);
  }
  return seq;
}

function getOpposite(pos: number): number {
  const map: Record<number, number> = { 1: 4, 2: 3, 3: 2, 4: 1 };
  return map[pos];
}

type Phase = 'instructions' | 'practice' | 'practiceComplete' | 'real';

export default function ChoiceRTComponent() {
  const { state, goToScreen, addChoiceRTResponse } = useSharpness();
  const [phase, setPhase] = useState<Phase>('instructions');
  const [timeLeft, setTimeLeft] = useState(PRACTICE_DURATION);
  const [flashingBox, setFlashingBox] = useState<number | null>(null);
  const [currentRule, setCurrentRule] = useState<'compatible' | 'incompatible'>('compatible');
  const [lastFeedback, setLastFeedback] = useState<'correct' | 'wrong' | null>(null);

  const sequenceRef = useRef(generateChoiceSequence(70));
  const indexRef = useRef(0);
  const tappedRef = useRef(false);
  const stimOnsetRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cycleRef = useRef<NodeJS.Timeout | null>(null);
  const activeRef = useRef(false);
  const elapsedRef = useRef(0);
  const phaseRef = useRef<Phase>('instructions');

  const getRuleForElapsed = useCallback((elapsed: number, isPractice: boolean): 'compatible' | 'incompatible' => {
    const blockSize = isPractice ? PRACTICE_RULE_BLOCK : RULE_BLOCK_DURATION;
    const block = Math.floor(elapsed / blockSize);
    return block % 2 === 0 ? 'compatible' : 'incompatible';
  }, []);

  const cleanup = useCallback(() => {
    activeRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    if (cycleRef.current) clearTimeout(cycleRef.current);
  }, []);

  const processResponse = useCallback((isPractice: boolean) => {
    if (!activeRef.current) return;
    const idx = indexRef.current;
    const seq = sequenceRef.current;
    if (idx >= seq.length) return;

    if (!tappedRef.current && !isPractice) {
      const rule = getRuleForElapsed(elapsedRef.current, false);
      addChoiceRTResponse({
        trial_index: idx,
        stimulus_position: seq[idx],
        rule,
        correct_response: rule === 'compatible' ? seq[idx] : getOpposite(seq[idx]),
        actual_response: null,
        stimulus_onset: new Date().toISOString(),
        response_time_ms: null,
        correct: false,
      });
    }
  }, [addChoiceRTResponse, getRuleForElapsed]);

  const runCycle = useCallback((isPractice: boolean) => {
    if (!activeRef.current) return;
    const seq = sequenceRef.current;
    if (indexRef.current >= seq.length) return;

    const pos = seq[indexRef.current];
    tappedRef.current = false;
    stimOnsetRef.current = performance.now();

    setFlashingBox(pos);
    setTimeout(() => { if (activeRef.current) setFlashingBox(null); }, STIMULUS_DISPLAY);
    setTimeout(() => processResponse(isPractice), 800);

    cycleRef.current = setTimeout(() => {
      indexRef.current++;
      runCycle(isPractice);
    }, STIMULUS_CYCLE);
  }, [processResponse]);

  const handleTapZone = useCallback((zone: number) => {
    if (!activeRef.current || tappedRef.current) return;
    tappedRef.current = true;

    const rt = Math.round(performance.now() - stimOnsetRef.current);
    if (rt > 800) return;

    const idx = indexRef.current;
    const seq = sequenceRef.current;
    const isPractice = phaseRef.current === 'practice';
    const rule = getRuleForElapsed(elapsedRef.current, isPractice);
    const correctZone = rule === 'compatible' ? seq[idx] : getOpposite(seq[idx]);
    const isCorrect = zone === correctZone;

    if (isPractice) {
      setLastFeedback(isCorrect ? 'correct' : 'wrong');
      setTimeout(() => setLastFeedback(null), 400);
    } else {
      addChoiceRTResponse({
        trial_index: idx,
        stimulus_position: seq[idx],
        rule,
        correct_response: correctZone,
        actual_response: zone,
        stimulus_onset: new Date().toISOString(),
        response_time_ms: rt,
        correct: isCorrect,
      });
    }
  }, [addChoiceRTResponse, getRuleForElapsed]);

  const startPractice = useCallback(() => {
    phaseRef.current = 'practice';
    setPhase('practice');
    setTimeLeft(PRACTICE_DURATION);
    elapsedRef.current = 0;
    indexRef.current = 0;
    setCurrentRule('compatible');
    activeRef.current = true;

    timerRef.current = setInterval(() => {
      elapsedRef.current++;
      const newRule = getRuleForElapsed(elapsedRef.current, true);
      setCurrentRule(newRule);

      setTimeLeft(prev => {
        if (prev <= 1) {
          cleanup();
          phaseRef.current = 'practiceComplete';
          setPhase('practiceComplete');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    runCycle(true);
  }, [cleanup, runCycle, getRuleForElapsed]);

  const startReal = useCallback(() => {
    phaseRef.current = 'real';
    setPhase('real');
    setTimeLeft(TOTAL_DURATION);
    elapsedRef.current = 0;
    indexRef.current = 0;
    sequenceRef.current = generateChoiceSequence(70);
    setCurrentRule('compatible');
    activeRef.current = true;

    timerRef.current = setInterval(() => {
      elapsedRef.current++;
      const newRule = getRuleForElapsed(elapsedRef.current, false);
      setCurrentRule(newRule);

      setTimeLeft(prev => {
        if (prev <= 1) {
          cleanup();
          goToScreen(9);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    runCycle(false);
  }, [cleanup, goToScreen, runCycle, getRuleForElapsed]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Instructions screen
  if (phase === 'instructions') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-lg space-y-6 text-center">
          <p className="text-display text-sm text-primary">PART 2 — REACTION SPEED</p>
          <div className="card-elevated p-6 space-y-4 text-left">
            <p className="text-lg text-foreground">Four boxes will appear on screen. One will flash at a time.</p>
            <p className="text-base text-foreground">The rule changes — watch for the color:</p>
            <div className="space-y-3 pl-2">
              <div className={`rounded-lg px-4 py-3 ${RULE_COLORS.compatible.bg} border ${RULE_COLORS.compatible.border}`}>
                <span className={`font-bold ${RULE_COLORS.compatible.text}`}>🟢 TAP THE BOX</span>
                <span className="text-foreground ml-2">→ tap the box that flashed</span>
              </div>
              <div className={`rounded-lg px-4 py-3 ${RULE_COLORS.incompatible.bg} border ${RULE_COLORS.incompatible.border}`}>
                <span className={`font-bold ${RULE_COLORS.incompatible.text}`}>🔴 TAP OPPOSITE</span>
                <span className="text-foreground ml-2">→ tap the opposite side (1↔4, 2↔3)</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">The entire screen changes color so you always know which rule is active.</p>
            <p className="text-base font-bold text-foreground">Go as fast as you can.</p>
          </div>
          {state.skipPractice ? (
            <Button variant="hero" size="xl" className="w-full" onClick={startReal}>
              Start Real Test
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">10-second practice with rule changes, then 60-second real test.</p>
              <Button variant="hero" size="xl" className="w-full" onClick={startPractice}>
                Start Practice
              </Button>
              <Button variant="outline" size="lg" className="w-full text-muted-foreground" onClick={startReal}>
                Skip Practice — Start Real Test
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Practice complete screen
  if (phase === 'practiceComplete') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-lg space-y-6 text-center">
          <p className="text-display text-sm text-primary">PART 2 — REACTION SPEED</p>
          <div className="card-elevated p-6 space-y-3">
            <p className="text-display text-lg text-foreground">Practice Complete!</p>
            <p className="text-base text-muted-foreground">
              Good job. Now the real test begins — 60 seconds. Watch the screen color to know the active rule.
            </p>
            <p className="text-base font-bold text-foreground">Go as fast as you can.</p>
          </div>
          <Button variant="hero" size="xl" className="w-full" onClick={startReal}>
            Start Real Test
          </Button>
        </div>
      </motion.div>
    );
  }

  // Active test (practice or real)
  const isPractice = phase === 'practice';
  const colors = RULE_COLORS[currentRule];

  return (
    <motion.div
      key={currentRule}
      initial={{ opacity: 0.7 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen flex flex-col select-none transition-colors duration-300 ${colors.bg}`}
    >
      {/* Big rule banner */}
      <div className={`${colors.bannerBg} px-6 py-4 text-center`}>
        <div className="flex items-center justify-center gap-3">
          <span className="text-white text-2xl font-black tracking-wider">
            {currentRule === 'compatible' ? 'TAP THE BOX' : 'TAP OPPOSITE'}
          </span>
        </div>
        <p className="text-white/80 text-sm font-medium">
          {currentRule === 'compatible' ? 'Tap the box that flashed' : 'Tap the opposite side (1↔4, 2↔3)'}
        </p>
      </div>

      <div className={`px-6 py-2 flex items-center justify-between border-b ${colors.border}`}>
        <div>
          {isPractice && <span className="text-xs font-bold text-amber-500 uppercase">Practice</span>}
        </div>
        <span className="text-sm font-mono text-muted-foreground">
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')} left
        </span>
      </div>

      {/* Feedback during practice */}
      {isPractice && lastFeedback && (
        <div className={`text-center py-1 text-sm font-bold ${lastFeedback === 'correct' ? 'bg-emerald-200/50 text-emerald-700' : 'bg-rose-200/50 text-rose-700'}`}>
          {lastFeedback === 'correct' ? '✓ Correct!' : '✗ Wrong'}
        </div>
      )}

      {/* Stimulus boxes */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="flex gap-4 w-full max-w-md">
          {[1, 2, 3, 4].map(pos => (
            <div
              key={pos}
              className={`flex-1 aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${
                flashingBox === pos
                  ? 'bg-primary border-primary scale-105'
                  : 'bg-background/80 border-border'
              }`}
            >
              <span className={`text-display text-2xl ${flashingBox === pos ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                {pos}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Response tap zones */}
      <div className="px-6 pb-8 flex gap-3">
        {[1, 2, 3, 4].map(zone => (
          <button
            key={zone}
            onClick={() => handleTapZone(zone)}
            className={`flex-1 min-h-[80px] rounded-xl border-2 ${colors.border} bg-background/80 flex items-center justify-center active:bg-primary/20 active:border-primary transition-colors tap-target`}
          >
            <span className="text-display text-xl text-foreground">{zone}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
