import { useState, useEffect, useRef, useCallback } from 'react';
import { useLockIn } from '@/contexts/LockInContext';
import { generateSequence } from '@/lib/stimulus-engine';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedbackState {
  type: 'hit' | 'miss' | 'false_alarm' | 'correct_withhold';
  message: string;
}

export default function LockInPractice() {
  const { goToScreen, setPracticeCompleted } = useLockIn();
  const [currentDigit, setCurrentDigit] = useState<number | null>(null);
  const [showDigit, setShowDigit] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [started, setStarted] = useState(false);
  
  const sequenceRef = useRef(generateSequence(26, 0.10, 1)); // ~26 stimuli for 30s
  const indexRef = useRef(0);
  const stimulusOnsetRef = useRef(0);
  const tappedRef = useRef(false);
  const prevDigitRef = useRef<number | null>(null);
  const isTargetRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cycleRef = useRef<NodeJS.Timeout | null>(null);

  const showFeedback = useCallback((fb: FeedbackState) => {
    setFeedback(fb);
    setTimeout(() => setFeedback(null), 400);
  }, []);

  const processResponse = useCallback(() => {
    // Called at end of response window (900ms from onset)
    const idx = indexRef.current;
    const seq = sequenceRef.current;
    if (idx >= seq.digits.length) return;
    
    const isTarget = seq.targetIndices.has(idx);
    
    if (!tappedRef.current) {
      if (isTarget) {
        showFeedback({ type: 'correct_withhold', message: 'Correct — that was 7 then 3' });
      } else {
        showFeedback({ type: 'miss', message: 'Too slow — tap next time' });
      }
    }
  }, [showFeedback]);

  const handleTap = useCallback(() => {
    if (!started || tappedRef.current) return;
    tappedRef.current = true;
    
    const idx = indexRef.current;
    const seq = sequenceRef.current;
    const isTarget = seq.targetIndices.has(idx);
    
    if (isTarget) {
      showFeedback({ type: 'false_alarm', message: 'Hold — that was 7 then 3' });
      setWrongFlash(true);
      setTimeout(() => setWrongFlash(false), 300);
    } else {
      showFeedback({ type: 'hit', message: 'Good' });
    }
  }, [started, showFeedback]);

  const runCycle = useCallback(() => {
    const seq = sequenceRef.current;
    if (indexRef.current >= seq.digits.length || timeLeft <= 0) return;
    
    const digit = seq.digits[indexRef.current];
    tappedRef.current = false;
    isTargetRef.current = seq.targetIndices.has(indexRef.current);
    
    setCurrentDigit(digit);
    setShowDigit(true);
    stimulusOnsetRef.current = performance.now();
    
    // Hide digit after 250ms
    setTimeout(() => setShowDigit(false), 250);
    
    // Process response at 900ms
    setTimeout(() => processResponse(), 900);
    
    // Next stimulus at 1150ms
    cycleRef.current = setTimeout(() => {
      indexRef.current++;
      prevDigitRef.current = digit;
      runCycle();
    }, 1150);
  }, [timeLeft, processResponse]);

  useEffect(() => {
    if (!started) return;
    
    // Start countdown
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time up - stop everything
          if (cycleRef.current) clearTimeout(cycleRef.current);
          if (timerRef.current) clearInterval(timerRef.current);
          setPracticeCompleted();
          setTimeout(() => goToScreen(3), 500);
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

  const feedbackColor = feedback?.type === 'hit' || feedback?.type === 'correct_withhold' 
    ? 'text-success bg-success/10' 
    : 'text-destructive bg-destructive/10';

  return (
    <div className={`min-h-screen flex flex-col select-none transition-colors duration-150 ${wrongFlash ? 'bg-red-100 dark:bg-red-950/30' : 'bg-background'}`} onClick={handleTap}>
      {/* Header */}
      <div className="px-6 py-3 flex items-center justify-between border-b">
        <span className="text-display text-base text-warning">PRACTICE</span>
        <span className="text-sm font-mono text-muted-foreground">0:{String(timeLeft).padStart(2, '0')} left</span>
      </div>

      {/* Stimulus area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="h-40 flex items-center justify-center">
          <AnimatePresence>
            {showDigit && currentDigit !== null && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.05 }}
                className="text-display text-[120px] text-foreground"
              >
                {currentDigit}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Feedback zone */}
      <div className="h-16 flex items-center justify-center">
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`px-6 py-2 rounded-lg font-medium ${feedbackColor}`}
            >
              {feedback.type === 'hit' && '✓ '}
              {feedback.type === 'correct_withhold' && '✓ '}
              {feedback.type === 'miss' && '✗ '}
              {feedback.type === 'false_alarm' && '✗ '}
              {feedback.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tap zone */}
      <div className={`h-[35vh] flex items-center justify-center border-t border-dashed mx-6 mb-6 rounded-xl transition-colors duration-150 ${wrongFlash ? 'border-red-500 bg-red-200/50 dark:bg-red-900/30' : 'border-border/50 bg-muted/30'}`}>
        <span className="text-lg text-muted-foreground font-medium">TAP HERE</span>
      </div>
    </div>
  );
}
