import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSharpness, CategorySwitchResponseEntry } from '@/contexts/SharpnessContext';
import { getShuffledWordSet, WordTrial } from '@/lib/word-library';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const RULES = ['meaning', 'letter', 'syllables'] as const;
type Rule = typeof RULES[number];
const RULE_LABELS: Record<Rule, string> = { meaning: 'MEANING', letter: 'FIRST LETTER', syllables: 'SYLLABLES' };
const RULE_DESCRIPTIONS: Record<Rule, string> = {
  meaning: 'Pick the closest meaning',
  letter: 'Pick same first letter',
  syllables: 'Pick same syllable count',
};
const TOTAL_DURATION = 60;

export default function CategorySwitchComponent() {
  const { goToScreen, addCategorySwitchResponse } = useSharpness();
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_DURATION);
  const [trialIndex, setTrialIndex] = useState(0);
  const [ruleIndex, setRuleIndex] = useState(0);
  const [trialInBlock, setTrialInBlock] = useState(0);

  const wordSet = useMemo(() => getShuffledWordSet(30), []);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stimOnsetRef = useRef(0);
  const activeRef = useRef(false);

  const currentRule: Rule = RULES[ruleIndex % 3];
  const currentTrial: WordTrial | undefined = wordSet[trialIndex];
  const isSwitchTrial = trialInBlock === 0 && trialIndex > 0;

  useEffect(() => {
    if (!started) return;
    activeRef.current = true;
    stimOnsetRef.current = performance.now();

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          activeRef.current = false;
          if (timerRef.current) clearInterval(timerRef.current);
          goToScreen(10);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      activeRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, goToScreen]);

  const handleOptionTap = useCallback((option: string) => {
    if (!activeRef.current || !currentTrial) return;

    const rt = Math.round(performance.now() - stimOnsetRef.current);
    const correctAnswer = currentTrial.answers[currentRule];
    const isCorrect = option === correctAnswer;

    addCategorySwitchResponse({
      trial_index: trialIndex,
      word: currentTrial.word,
      rule: currentRule,
      correct_option: correctAnswer,
      selected_option: option,
      is_switch_trial: isSwitchTrial,
      stimulus_onset: new Date().toISOString(),
      response_time_ms: rt,
      correct: isCorrect,
    });

    // Advance to next trial
    const nextTrialInBlock = trialInBlock + 1;
    if (nextTrialInBlock >= 3) {
      // Switch rule
      setRuleIndex(prev => prev + 1);
      setTrialInBlock(0);
    } else {
      setTrialInBlock(nextTrialInBlock);
    }
    setTrialIndex(prev => prev + 1);
    stimOnsetRef.current = performance.now();
  }, [currentTrial, currentRule, trialIndex, trialInBlock, isSwitchTrial, addCategorySwitchResponse]);

  if (!started) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-lg space-y-6 text-center">
          <p className="text-display text-sm text-primary">PART 3 — CATEGORY SWITCH</p>
          <div className="card-elevated p-6 space-y-4 text-left">
            <p className="text-lg text-foreground">A word appears. Pick the best match from three options.</p>
            <p className="text-base text-foreground font-medium">The matching rule changes:</p>
            <div className="space-y-2 pl-2">
              <p className="text-base text-foreground"><span className="font-bold text-primary">MEANING</span> → pick the closest meaning</p>
              <p className="text-base text-foreground"><span className="font-bold text-primary">FIRST LETTER</span> → pick same first letter</p>
              <p className="text-base text-foreground"><span className="font-bold text-primary">SYLLABLES</span> → pick same syllable count</p>
            </div>
            <p className="text-sm text-muted-foreground">The current rule is always shown at the top. Rules change every 3 answers.</p>
            <p className="text-base font-bold text-foreground">Speed and accuracy both matter.</p>
          </div>
          <p className="text-sm text-muted-foreground">60 seconds.</p>
          <Button variant="hero" size="xl" className="w-full" onClick={() => setStarted(true)}>
            Start
          </Button>
        </div>
      </motion.div>
    );
  }

  if (!currentTrial) {
    // Ran out of words
    activeRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    goToScreen(10);
    return null;
  }

  // Shuffle options for display
  const shuffledOptions = useMemo(() => {
    const opts = [...currentTrial.options];
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }, [currentTrial]);

  return (
    <div className="min-h-screen flex flex-col bg-background select-none">
      {/* Header */}
      <div className="px-6 py-3 flex items-center justify-between border-b">
        <div>
          <span className="text-sm text-muted-foreground">Rule: </span>
          <span className="text-display text-lg text-primary">{RULE_LABELS[currentRule]}</span>
          <p className="text-xs text-muted-foreground">{RULE_DESCRIPTIONS[currentRule]}</p>
        </div>
        <div className="text-right">
          <span className="text-sm font-mono text-muted-foreground">
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')} left
          </span>
          <p className="text-xs text-muted-foreground">Trial {trialIndex + 1}</p>
        </div>
      </div>

      {/* Stimulus word */}
      <div className="flex-1 flex items-center justify-center">
        <motion.span
          key={trialIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-display text-[48px] text-foreground"
        >
          {currentTrial.word}
        </motion.span>
      </div>

      {/* Response options */}
      <div className="px-6 pb-8 flex gap-3">
        {shuffledOptions.map(option => (
          <button
            key={option}
            onClick={() => handleOptionTap(option)}
            className="flex-1 min-h-[80px] rounded-xl border-2 border-border bg-muted/30 flex items-center justify-center active:bg-primary/20 active:border-primary transition-colors tap-target"
          >
            <span className="text-display text-base text-foreground">{option}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
