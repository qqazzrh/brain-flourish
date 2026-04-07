import { useState, useEffect, useRef, useCallback } from 'react';
import { useSharpness, ChoiceRTResponseEntry } from '@/contexts/SharpnessContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const TOTAL_DURATION = 60;
const PRACTICE_DURATION = 10;
const RULE_BLOCK_DURATION = 15;
const STIMULUS_CYCLE = 1000;
const STIMULUS_DISPLAY = 200;

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
  const [phase, setPhase] = useState<Phase>(state.skipPractice ? 'instructions' : 'instructions');
  const [timeLeft, setTimeLeft] = useState(PRACTICE_DURATION);
  const [flashingBox, setFlashingBox] = useState<number | null>(null);
  const [currentRule, setCurrentRule] = useState<'compatible' | 'incompatible'>('compatible');
  const [ruleFlash, setRuleFlash] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<'correct' | 'wrong' | null>(null);

  const sequenceRef = useRef(generateChoiceSequence(70));
  const indexRef = useRef(0);
  const tappedRef = useRef(false);
  const stimOnsetRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cycleRef = useRef<NodeJS.Timeout | null>(null);
  const activeRef = useRef(false);
  const elapsedRef = useRef(0);

  const getCurrentRule = useCallback((): 'compatible' | 'incompatible' => {
    const block = Math.floor(elapsedRef.current / RULE_BLOCK_DURATION);
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

    if (!tappedRef.current) {
      if (!isPractice) {
        addChoiceRTResponse({
          trial_index: idx,
          stimulus_position: seq[idx],
          rule: getCurrentRule(),
          correct_response: getCurrentRule() === 'compatible' ? seq[idx] : getOpposite(seq[idx]),
          actual_response: null,
          stimulus_onset: new Date().toISOString(),
          response_time_ms: null,
          correct: false,
        });
      }
    }
  }, [addChoiceRTResponse, getCurrentRule]);

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
    const rule = getCurrentRule();
    const correctZone = rule === 'compatible' ? seq[idx] : getOpposite(seq[idx]);
    const isCorrect = zone === correctZone;

    if (phase === 'practice') {
      // Show feedback during practice
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
  }, [addChoiceRTResponse, getCurrentRule, phase]);

  const startPractice = useCallback(() => {
    setPhase('practice');
    setTimeLeft(PRACTICE_DURATION);
    elapsedRef.current = 0;
    indexRef.current = 0;
    setCurrentRule('compatible');
    activeRef.current = true;

    timerRef.current = setInterval(() => {
      elapsedRef.current++;
      setTimeLeft(prev => {
        if (prev <= 1) {
          cleanup();
          setPhase('practiceComplete');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    runCycle(true);
  }, [cleanup, runCycle]);

  const startReal = useCallback(() => {
    setPhase('real');
    setTimeLeft(TOTAL_DURATION);
    elapsedRef.current = 0;
    indexRef.current = 0;
    sequenceRef.current = generateChoiceSequence(70);
    setCurrentRule('compatible');
    activeRef.current = true;

    timerRef.current = setInterval(() => {
      elapsedRef.current++;
      const newRule = elapsedRef.current % (RULE_BLOCK_DURATION * 2) < RULE_BLOCK_DURATION ? 'compatible' : 'incompatible';
      setCurrentRule(prev => {
        if (prev !== newRule) {
          setRuleFlash(true);
          setTimeout(() => setRuleFlash(false), 300);
        }
        return newRule;
      });

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
  }, [cleanup, goToScreen, runCycle]);

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
            <p className="text-base text-foreground">The rule changes every 15 seconds:</p>
            <div className="space-y-2 pl-2">
              <p className="text-base text-foreground"><span className="font-bold text-success">TAP THE BOX</span> → tap the box that flashed</p>
              <p className="text-base text-foreground"><span className="font-bold text-destructive">TAP OPPOSITE</span> → tap the box on the opposite side (1↔4, 2↔3)</p>
            </div>
            <p className="text-sm text-muted-foreground">The current rule is always shown at the top of the screen.</p>
            <p className="text-base font-bold text-foreground">Go as fast as you can.</p>
          </div>
          <p className="text-sm text-muted-foreground">Let's try a quick 10-second practice first.</p>
          <Button variant="hero" size="xl" className="w-full" onClick={startPractice}>
            Start Practice
          </Button>
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
              Good job. Now the real test begins — 60 seconds. The rule will switch between TAP THE BOX and TAP OPPOSITE every 15 seconds.
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
  const label = isPractice ? 'PRACTICE' : (currentRule === 'compatible' ? 'TAP THE BOX' : 'TAP OPPOSITE');

  return (
    <div className="min-h-screen flex flex-col bg-background select-none">
      {/* Header with rule */}
      <div className={`px-6 py-3 flex items-center justify-between border-b transition-colors ${ruleFlash ? 'bg-warning/20' : ''}`}>
        <div>
          {isPractice ? (
            <span className="text-display text-lg text-warning">PRACTICE</span>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">Rule: </span>
              <span className={`text-display text-lg ${currentRule === 'compatible' ? 'text-success' : 'text-destructive'}`}>
                {currentRule === 'compatible' ? 'TAP THE BOX' : 'TAP OPPOSITE'}
              </span>
            </>
          )}
        </div>
        <span className="text-sm font-mono text-muted-foreground">
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')} left
        </span>
      </div>

      {/* Feedback during practice */}
      {isPractice && lastFeedback && (
        <div className={`text-center py-1 text-sm font-bold ${lastFeedback === 'correct' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
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
                  : 'bg-muted/50 border-border'
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
            className="flex-1 min-h-[80px] rounded-xl border-2 border-border bg-muted/30 flex items-center justify-center active:bg-primary/20 active:border-primary transition-colors tap-target"
          >
            <span className="text-display text-xl text-foreground">{zone}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
