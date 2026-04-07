import { useState, useEffect, useRef, useCallback } from 'react';
import { useRecall } from '@/contexts/RecallContext';
import { DISTRACTION_TASKS } from '@/lib/content-library';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';

export default function DistractionTimer() {
  const { state, goToScreen, setDistractionCounts } = useRecall();
  const task = DISTRACTION_TASKS[state.assignedForm];
  const [seconds, setSeconds] = useState(90);
  const [validCount, setValidCount] = useState(0);
  const [invalidCount, setInvalidCount] = useState(0);
  const [timeUp, setTimeUp] = useState(false);
  const chimeRef = useRef<boolean>(false);

  useEffect(() => {
    if (timeUp) return;
    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeUp(true);
          // Play chime
          if (!chimeRef.current) {
            chimeRef.current = true;
            try {
              const ctx = new AudioContext();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.frequency.value = 880;
              osc.type = 'sine';
              gain.gain.value = 0.3;
              osc.start();
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
              osc.stop(ctx.currentTime + 0.8);
            } catch {}
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeUp]);

  const handleProceed = useCallback(() => {
    setDistractionCounts(validCount, invalidCount);
    goToScreen(5);
  }, [validCount, invalidCount, setDistractionCounts, goToScreen]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timerColor = seconds <= 0 ? 'text-destructive' : seconds <= 10 ? 'text-warning' : 'text-foreground';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col bg-background relative"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <p className="text-display text-lg text-foreground">DISTRACTION TASK RUNNING</p>
        <p className="text-muted-foreground">{task.category} beginning with {task.letter}</p>
      </div>

      {/* Timer */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-10">
        <div className={`text-display text-8xl tabular-nums ${timerColor} transition-colors`}>
          {mins}:{String(secs).padStart(2, '0')}
        </div>

        {!timeUp && (
          <>
            {/* Counter */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Valid responses:</p>
              <div className="card-elevated inline-block px-12 py-4">
                <span className="text-display text-5xl text-foreground">{validCount}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 w-full max-w-lg">
              <button
                onClick={() => setValidCount(v => v + 1)}
                className="flex-1 min-h-[100px] rounded-xl bg-success/90 hover:bg-success text-primary-foreground flex flex-col items-center justify-center gap-2 transition-colors active:scale-95 tap-target"
              >
                <Check className="w-8 h-8" />
                <span className="text-lg font-bold">VALID</span>
              </button>
              <button
                onClick={() => setInvalidCount(v => v + 1)}
                className="flex-[0.6] min-h-[100px] rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground flex flex-col items-center justify-center gap-2 border border-border transition-colors active:scale-95 tap-target"
              >
                <X className="w-8 h-8" />
                <span className="text-lg font-medium">INVALID / REPEAT</span>
              </button>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Tap VALID for each correct response. Tap INVALID for repeats or errors.
            </p>
          </>
        )}
      </div>

      {/* Time Up overlay */}
      <AnimatePresence>
        {timeUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-background/95 flex items-center justify-center z-20"
          >
            <div className="w-full max-w-md p-8 space-y-6 text-center">
              <p className="text-display text-3xl text-destructive">⏱ TIME UP</p>
              <div className="card-elevated p-6">
                <p className="text-sm text-muted-foreground mb-2">SAY TO PARTICIPANT:</p>
                <p className="text-xl font-medium text-foreground">"Stop there, thank you."</p>
              </div>
              <p className="text-muted-foreground">Valid responses: <span className="font-bold text-foreground">{validCount}</span></p>
              <Button variant="hero" size="xl" className="w-full" onClick={handleProceed}>
                Proceed to Recall
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
