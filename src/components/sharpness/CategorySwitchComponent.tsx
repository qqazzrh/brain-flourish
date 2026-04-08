import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSharpness } from '@/contexts/SharpnessContext';
import { WordTrial } from '@/lib/word-library';
import { getWordTrials } from '@/lib/content-service';
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

const RULE_COLORS: Record<Rule, { bg: string; border: string; text: string; bannerBg: string }> = {
  meaning: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-300 dark:border-blue-700',
    text: 'text-blue-700 dark:text-blue-300',
    bannerBg: 'bg-blue-500',
  },
  letter: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-300 dark:border-amber-700',
    text: 'text-amber-700 dark:text-amber-300',
    bannerBg: 'bg-amber-500',
  },
  syllables: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-300 dark:border-emerald-700',
    text: 'text-emerald-700 dark:text-emerald-300',
    bannerBg: 'bg-emerald-500',
  },
};

const TOTAL_DURATION = 60;
const PRACTICE_DURATION = 10;

type Phase = 'instructions' | 'practice' | 'practice_done' | 'real';

export default function CategorySwitchComponent() {
  const { state, goToScreen, addCategorySwitchResponse } = useSharpness();
  const [phase, setPhase] = useState<Phase>('instructions');
  const [timeLeft, setTimeLeft] = useState(PRACTICE_DURATION);
  const [trialIndex, setTrialIndex] = useState(0);
  const [ruleIndex, setRuleIndex] = useState(0);
  const [trialInBlock, setTrialInBlock] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; key: number } | null>(null);
  const [wrongOption, setWrongOption] = useState<string | null>(null);

  const [practiceWords, setPracticeWords] = useState<WordTrial[]>([]);
  const [realWords, setRealWords] = useState<WordTrial[]>([]);
  const [wordsLoaded, setWordsLoaded] = useState(false);

  // Load words from DB on mount
  useEffect(() => {
    async function load() {
      try {
        const [pw, rw] = await Promise.all([
          getWordTrials(10),
          getWordTrials(30),
        ]);
        setPracticeWords(pw);
        setRealWords(rw);
      } catch {
        // Fallback to hardcoded
        const { getShuffledWordSet } = await import('@/lib/word-library');
        setPracticeWords(getShuffledWordSet(10));
        setRealWords(getShuffledWordSet(30));
      }
      setWordsLoaded(true);
    }
    load();
  }, []);

  const wordSet = phase === 'practice' ? practiceWords : realWords;

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stimOnsetRef = useRef(0);
  const activeRef = useRef(false);
  const feedbackKey = useRef(0);

  const currentRule: Rule = RULES[ruleIndex % 3];
  const currentTrial: WordTrial | undefined = wordSet[trialIndex];
  const isSwitchTrial = trialInBlock === 0 && trialIndex > 0;
  const colors = RULE_COLORS[currentRule];

  const shuffledOptions = useMemo(() => {
    if (!currentTrial) return [];
    const opts = [...currentTrial.options];
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }, [currentTrial]);

  const startPhase = useCallback((p: 'practice' | 'real') => {
    setPhase(p);
    setTrialIndex(0);
    setRuleIndex(0);
    setTrialInBlock(0);
    setTimeLeft(p === 'practice' ? PRACTICE_DURATION : TOTAL_DURATION);
    setFeedback(null);
  }, []);

  useEffect(() => {
    if (phase !== 'practice' && phase !== 'real') return;
    activeRef.current = true;
    stimOnsetRef.current = performance.now();

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          activeRef.current = false;
          if (timerRef.current) clearInterval(timerRef.current);
          if (phase === 'practice') {
            setPhase('practice_done');
          } else {
            goToScreen(10);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      activeRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, goToScreen]);

  const handleOptionTap = useCallback((option: string) => {
    if (!activeRef.current || !currentTrial) return;

    const rt = Math.round(performance.now() - stimOnsetRef.current);
    const correctAnswer = currentTrial.answers[currentRule];
    const isCorrect = option === correctAnswer;

    if (!isCorrect) {
      setWrongOption(option);
      setTimeout(() => setWrongOption(null), 300);
    }

    if (phase === 'practice') {
      feedbackKey.current += 1;
      setFeedback({ correct: isCorrect, key: feedbackKey.current });
      setTimeout(() => setFeedback(prev => prev?.key === feedbackKey.current ? null : prev), 600);
    }

    if (phase === 'real') {
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
    }

    const nextTrialInBlock = trialInBlock + 1;
    if (nextTrialInBlock >= 3) {
      setRuleIndex(prev => prev + 1);
      setTrialInBlock(0);
    } else {
      setTrialInBlock(nextTrialInBlock);
    }
    setTrialIndex(prev => prev + 1);
    stimOnsetRef.current = performance.now();
  }, [currentTrial, currentRule, trialIndex, trialInBlock, isSwitchTrial, phase, addCategorySwitchResponse]);

  // Instructions screen
  if (phase === 'instructions') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-lg space-y-6 text-center">
          <p className="text-display text-sm text-primary">PART 3 — CATEGORY SWITCH</p>
          <div className="card-elevated p-6 space-y-4 text-left">
            <p className="text-lg text-foreground">A word appears. Pick the best match from three options.</p>
            <p className="text-base text-foreground font-medium">The matching rule changes — watch for the color:</p>
            <div className="space-y-3 pl-2">
              <div className={`rounded-lg px-4 py-3 ${RULE_COLORS.meaning.bg} border ${RULE_COLORS.meaning.border}`}>
                <span className={`font-bold ${RULE_COLORS.meaning.text}`}>🔵 MEANING</span>
                <span className="text-foreground ml-2">→ pick the closest meaning</span>
              </div>
              <div className={`rounded-lg px-4 py-3 ${RULE_COLORS.letter.bg} border ${RULE_COLORS.letter.border}`}>
                <span className={`font-bold ${RULE_COLORS.letter.text}`}>🟡 FIRST LETTER</span>
                <span className="text-foreground ml-2">→ pick same first letter</span>
              </div>
              <div className={`rounded-lg px-4 py-3 ${RULE_COLORS.syllables.bg} border ${RULE_COLORS.syllables.border}`}>
                <span className={`font-bold ${RULE_COLORS.syllables.text}`}>🟢 SYLLABLES</span>
                <span className="text-foreground ml-2">→ pick same syllable count</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Rules change every 3 answers. The entire screen changes color so you always know which rule is active.</p>
            <p className="text-base font-bold text-foreground">Speed and accuracy both matter.</p>
          </div>
          {state.skipPractice ? (
            <Button variant="hero" size="xl" className="w-full" onClick={() => startPhase('real')}>
              Start Real Test
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">10-second practice, then 60-second real test.</p>
              <Button variant="hero" size="xl" className="w-full" onClick={() => startPhase('practice')}>
                Start Practice
              </Button>
              <Button variant="outline" size="lg" className="w-full text-muted-foreground" onClick={() => startPhase('real')}>
                Skip Practice — Start Real Test
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Practice complete screen
  if (phase === 'practice_done') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-lg space-y-8 text-center">
          <h1 className="text-display text-2xl text-foreground">PRACTICE COMPLETE</h1>
          <div className="space-y-4">
            <p className="text-lg text-foreground">The real test is about to begin.</p>
            <p className="text-display text-4xl text-primary">60 seconds.</p>
            <p className="text-base text-muted-foreground">Same rules — match words by the rule shown. Watch for color changes!</p>
          </div>
          <div className="card-sunken p-4 space-y-2">
            <p className="text-base text-foreground font-medium">Rules change every 3 answers.</p>
            <p className="text-sm text-muted-foreground">Stay focused. Speed and accuracy both matter.</p>
          </div>
          <Button variant="hero" size="xl" className="w-full" onClick={() => startPhase('real')}>
            Begin Test
          </Button>
        </div>
      </motion.div>
    );
  }

  // Ran out of words
  if (!currentTrial) {
    if (activeRef.current) {
      activeRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (phase === 'practice') {
        setTimeout(() => setPhase('practice_done'), 0);
      } else {
        setTimeout(() => goToScreen(10), 0);
      }
    }
    return null;
  }

  return (
    <motion.div
      key={currentRule}
      initial={{ opacity: 0.7 }}
      animate={{ opacity: 1 }}
      className={`h-[100dvh] flex flex-col select-none transition-colors duration-300 ${colors.bg}`}
    >
      {/* Big rule banner */}
      <div className={`${colors.bannerBg} px-6 py-4 md:py-5 text-center`}>
        <div className="flex items-center justify-center gap-3">
          <span className="text-white text-2xl md:text-3xl font-black tracking-wider">{RULE_LABELS[currentRule]}</span>
        </div>
        <p className="text-white/80 text-sm md:text-base font-medium">{RULE_DESCRIPTIONS[currentRule]}</p>
      </div>

      <div className={`px-6 py-2 flex items-center justify-between border-b ${colors.border}`}>
        <div>
          {phase === 'practice' && <span className="text-xs font-bold text-amber-500 uppercase">Practice</span>}
          <p className="text-xs text-muted-foreground">Trial {trialIndex + 1} • {3 - trialInBlock} left on this rule</p>
        </div>
        <div className="text-right">
          <span className="text-sm md:text-base font-mono text-muted-foreground">
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')} left
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <motion.span
          key={`${phase}-${trialIndex}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-display text-[48px] md:text-[64px] text-foreground"
        >
          {currentTrial.word}
        </motion.span>
        {phase === 'practice' && feedback && (
          <motion.span
            key={feedback.key}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-lg font-bold ${feedback.correct ? 'text-green-500' : 'text-red-500'}`}
          >
            {feedback.correct ? '✓ Correct!' : '✗ Wrong'}
          </motion.span>
        )}
      </div>

      <div className="px-6 pb-8 flex gap-3 md:gap-5">
        {shuffledOptions.map(option => (
          <button
            key={option}
            onClick={() => handleOptionTap(option)}
            className={`flex-1 min-h-[80px] md:min-h-[100px] rounded-xl border-2 flex items-center justify-center transition-colors tap-target ${wrongOption === option ? 'border-red-500 bg-red-200/60 dark:bg-red-900/40' : `${colors.border} bg-background/80 active:bg-primary/20 active:border-primary`}`}
          >
            <span className="text-display text-base md:text-lg text-foreground">{option}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
