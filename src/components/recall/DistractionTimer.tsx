import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRecall } from '@/contexts/RecallContext';
import { useSession } from '@/contexts/SessionContext';
import { DISTRACTION_OPTIONS, shuffleOptions } from '@/lib/distraction-options';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RotateCcw } from 'lucide-react';

export default function DistractionTimer() {
  const { state, goToScreen, setDistractionCounts } = useRecall();
  const { assignedForm } = useSession();
  const optionSet = DISTRACTION_OPTIONS[assignedForm];
  
  const [seconds, setSeconds] = useState(90);
  const [timeUp, setTimeUp] = useState(false);
  const [tappedOptions, setTappedOptions] = useState<string[]>([]);
  const [lastTapResult, setLastTapResult] = useState<{ option: string; valid: boolean } | null>(null);
  const chimeRef = useRef<boolean>(false);

  // Generate shuffled list of options to display
  const displayOptions = useMemo(() => {
    return shuffleOptions([...optionSet.validOptions]);
  }, [optionSet]);

  const validCount = tappedOptions.filter((opt, idx) => {
    // Valid if it's the first occurrence AND in validOptions
    const isValid = optionSet.validOptions.includes(opt);
    const isFirstOccurrence = tappedOptions.indexOf(opt) === idx;
    return isValid && isFirstOccurrence;
  }).length;

  const invalidCount = tappedOptions.length - validCount;

  useEffect(() => {
    if (timeUp) return;
    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeUp(true);
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

  const handleTapOption = useCallback((option: string) => {
    const isRepeat = tappedOptions.includes(option);
    setTappedOptions(prev => [...prev, option]);
    setLastTapResult({ option, valid: !isRepeat });
    setTimeout(() => setLastTapResult(null), 800);
  }, [tappedOptions]);

  const handleProceed = useCallback(() => {
    setDistractionCounts(validCount, invalidCount);
    goToScreen(5);
  }, [validCount, invalidCount, setDistractionCounts, goToScreen]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timerColor = seconds <= 0 ? 'text-destructive' : seconds <= 10 ? 'text-warning' : 'text-foreground';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col bg-background relative">
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <div>
          <p className="text-display text-lg text-foreground">DISTRACTION TASK RUNNING</p>
          <p className="text-muted-foreground">{optionSet.category} beginning with {optionSet.letter}</p>
        </div>
        <div className={`text-display text-4xl tabular-nums ${timerColor} transition-colors`}>
          {mins}:{String(secs).padStart(2, '0')}
        </div>
      </div>

      {!timeUp && (
        <div className="flex-1 flex flex-col px-6 py-4 overflow-hidden">
          {/* Counter */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Valid</p>
                <p className="text-display text-3xl text-success">{validCount}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Repeats</p>
                <p className="text-display text-xl text-destructive">{invalidCount}</p>
              </div>
            </div>
            {lastTapResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`px-4 py-2 rounded-lg text-sm font-bold ${
                  lastTapResult.valid
                    ? 'bg-success/20 text-success'
                    : 'bg-destructive/20 text-destructive'
                }`}
              >
                {lastTapResult.valid ? (
                  <span className="flex items-center gap-1"><Check className="w-4 h-4" /> {lastTapResult.option}</span>
                ) : (
                  <span className="flex items-center gap-1"><RotateCcw className="w-4 h-4" /> REPEAT — {lastTapResult.option}</span>
                )}
              </motion.div>
            )}
          </div>

          {/* Tappable option grid */}
          <div className="flex-1 overflow-y-auto">
            <p className="text-sm text-muted-foreground mb-3">
              Tap each {optionSet.category.toLowerCase()} the participant names. Repeats are automatically marked invalid.
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {displayOptions.map((option) => {
                const tapCount = tappedOptions.filter(t => t === option).length;
                const isTapped = tapCount > 0;
                const isRepeat = tapCount > 1;
                
                return (
                  <button
                    key={option}
                    onClick={() => handleTapOption(option)}
                    className={`min-h-[56px] px-3 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 tap-target ${
                      isRepeat
                        ? 'bg-destructive/20 text-destructive border-2 border-destructive/30'
                        : isTapped
                        ? 'bg-success/20 text-success border-2 border-success/30'
                        : 'bg-muted hover:bg-muted/80 text-foreground border border-border'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-1">
                      {isRepeat && <RotateCcw className="w-3 h-3" />}
                      {isTapped && !isRepeat && <Check className="w-3 h-3" />}
                      {option}
                    </span>
                    {isRepeat && <span className="text-xs">×{tapCount}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
              <div className="flex justify-center gap-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Valid</p>
                  <p className="text-display text-2xl text-success">{validCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Repeats</p>
                  <p className="text-display text-2xl text-destructive">{invalidCount}</p>
                </div>
              </div>
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
