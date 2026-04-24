import { useState, useEffect, useRef, useCallback } from 'react';
import { useLockIn, StimulusLogEntry } from '@/contexts/LockInContext';
import { useSession } from '@/contexts/SessionContext';
import { generateSequence } from '@/lib/stimulus-engine';
import { motion, AnimatePresence } from 'framer-motion';

const TOTAL_STIMULI = 182;
const TEST_DURATION = 120; // 2 minutes for Game 2

export default function LockInActiveTest2() {
  const { goToScreen, setSequence2, addResponse2, setTestStartTime2, setTestEndTime2 } = useLockIn();
  const { isPractice } = useSession();
  const actualDuration = isPractice ? 60 : TEST_DURATION;
  const actualStimuli = isPractice ? 52 : TOTAL_STIMULI;
  
  const [currentDigit, setCurrentDigit] = useState<number | null>(null);
  const [showDigit, setShowDigit] = useState(false);
  const [timeLeft, setTimeLeft] = useState(actualDuration);
  const [started, setStarted] = useState(false);
  const [tapFlash, setTapFlash] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);

  // Dual mode: both 7→3 and 6→5
  const sequenceRef = useRef(generateSequence(actualStimuli, 0.22, 3, 'dual'));
  const indexRef = useRef(0);
  const stimulusOnsetRef = useRef<number>(0);
  const stimulusOnsetISORef = useRef<string>('');
  const tappedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cycleRef = useRef<NodeJS.Timeout | null>(null);
  const testOverRef = useRef(false);

  const logResponse = useCallback((entry: StimulusLogEntry) => {
    addResponse2(entry);
  }, [addResponse2]);

  const processResponse = useCallback(() => {
    if (testOverRef.current) return;
    const idx = indexRef.current;
    const seq = sequenceRef.current;
    if (idx >= seq.digits.length) return;
    
    const isTarget = seq.targetIndices.has(idx);
    
    if (!tappedRef.current) {
      logResponse({
        stimulus_index: idx,
        digit: seq.digits[idx],
        is_target_sequence: isTarget,
        stimulus_onset: stimulusOnsetISORef.current,
        response_time_ms: null,
        response_type: isTarget ? 'correct_withhold' : 'miss',
      });
    }
  }, [logResponse]);

  const handleTap = useCallback(() => {
    if (!started || tappedRef.current || testOverRef.current) return;
    tappedRef.current = true;
    
    const rt = Math.round(performance.now() - stimulusOnsetRef.current);
    if (rt > 900) return;
    
    const idx = indexRef.current;
    const seq = sequenceRef.current;
    const isTarget = seq.targetIndices.has(idx);
    
    if (isTarget) {
      setWrongFlash(true);
      setTimeout(() => setWrongFlash(false), 300);
    } else {
      setTapFlash(true);
      setTimeout(() => setTapFlash(false), 100);
    }
    
    logResponse({
      stimulus_index: idx,
      digit: seq.digits[idx],
      is_target_sequence: isTarget,
      stimulus_onset: stimulusOnsetISORef.current,
      response_time_ms: rt,
      response_type: isTarget ? 'false_alarm' : 'hit',
    });
  }, [started, logResponse]);

  const runCycle = useCallback(() => {
    if (testOverRef.current) return;
    const seq = sequenceRef.current;
    if (indexRef.current >= seq.digits.length) return;
    
    const digit = seq.digits[indexRef.current];
    tappedRef.current = false;
    
    setCurrentDigit(digit);
    setShowDigit(true);
    stimulusOnsetRef.current = performance.now();
    stimulusOnsetISORef.current = new Date().toISOString();
    
    setTimeout(() => { if (!testOverRef.current) setShowDigit(false); }, 250);
    setTimeout(() => processResponse(), 900);
    
    cycleRef.current = setTimeout(() => {
      indexRef.current++;
      runCycle();
    }, 1150);
  }, [processResponse]);

  const endTest = useCallback(() => {
    testOverRef.current = true;
    if (cycleRef.current) clearTimeout(cycleRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setTestEndTime2(new Date().toISOString());
    setTimeout(() => goToScreen(5), 1000);
  }, [goToScreen, setTestEndTime2]);

  useEffect(() => {
    if (!started) return;
    
    const seq = sequenceRef.current;
    setSequence2(seq.seed, seq.digits, seq.targetIndices);
    setTestStartTime2(new Date().toISOString());
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    runCycle();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (cycleRef.current) clearTimeout(cycleRef.current);
    };
  }, [started]);

  useEffect(() => {
    setStarted(true);
  }, []);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div 
      className={`h-[100dvh] flex flex-col bg-background select-none transition-colors duration-100 ${wrongFlash ? 'bg-red-100 dark:bg-red-950/30' : tapFlash ? 'bg-muted' : ''}`}
      onClick={handleTap}
    >
      {/* Header */}
      <div className="px-6 py-3 flex justify-between items-center">
        <span className="text-xs font-medium text-destructive uppercase tracking-wider">Round 2 — Withhold 7→3 &amp; 6→5</span>
        <span className="text-sm md:text-base font-mono text-muted-foreground">
          {mins}:{String(secs).padStart(2, '0')}
        </span>
      </div>

      {/* Stimulus area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="h-40 md:h-56 flex items-center justify-center">
          <AnimatePresence>
            {showDigit && currentDigit !== null && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.03 }}
                className="text-display text-[120px] md:text-[180px] text-foreground"
              >
                {currentDigit}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Tap zone */}
      <div className={`h-[35vh] mx-6 mb-6 rounded-xl border transition-colors duration-150 ${wrongFlash ? 'border-red-500 bg-red-200/50 dark:bg-red-900/30' : 'border-border/20'}`} />
    </div>
  );
}
