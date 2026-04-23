import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, X, RotateCcw, Play, Trophy, Sparkles, Target, TrendingUp, Lightbulb } from 'lucide-react';
import { shuffleOptions } from '@/lib/distraction-options';

type Phase = 'intro' | 'letter' | 'category' | 'report';

interface Section {
  id: 'letter' | 'category';
  title: string;
  prompt: string;
  // For letter: any word starting with letter counts (free entry).
  // For category: predefined valid options grid.
  letter?: string;
  category?: string;
  validOptions?: string[];
}

const LETTER_POOL = ['B', 'C', 'F', 'M', 'P', 'S', 'T'];
const CATEGORIES: { category: string; validOptions: string[] }[] = [
  {
    category: 'Fruits',
    validOptions: ['Apple','Banana','Orange','Mango','Grape','Pineapple','Strawberry','Watermelon','Peach','Pear','Cherry','Kiwi','Lemon','Plum','Papaya','Blueberry'],
  },
  {
    category: 'Animals',
    validOptions: ['Dog','Cat','Lion','Tiger','Elephant','Horse','Cow','Sheep','Goat','Bear','Wolf','Fox','Rabbit','Monkey','Zebra','Giraffe'],
  },
  {
    category: 'Countries',
    validOptions: ['India','China','Japan','Brazil','France','Germany','Spain','Italy','Canada','Mexico','Egypt','Kenya','Norway','Sweden','Greece','Turkey'],
  },
];

const SECTION_DURATION = 30; // seconds each
const TOTAL_DURATION = 60;

export default function MiniGame() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('intro');

  // pick once per mount
  const letter = useMemo(() => LETTER_POOL[Math.floor(Math.random() * LETTER_POOL.length)], []);
  const cat = useMemo(() => CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)], []);

  // Letter section state (free-form text entries)
  const [letterEntries, setLetterEntries] = useState<string[]>([]);
  const [letterInput, setLetterInput] = useState('');
  const [letterSeconds, setLetterSeconds] = useState(SECTION_DURATION);

  // Category section state (tap grid, like distraction task)
  const [categoryTapped, setCategoryTapped] = useState<string[]>([]);
  const [categorySeconds, setCategorySeconds] = useState(SECTION_DURATION);
  const displayCategoryOptions = useMemo(() => shuffleOptions([...cat.validOptions]), [cat]);
  const [lastTap, setLastTap] = useState<{ option: string; valid: boolean } | null>(null);

  const chimeRef = useRef(false);
  const playChime = useCallback(() => {
    if (chimeRef.current) return;
    chimeRef.current = true;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880; osc.type = 'sine'; gain.gain.value = 0.3;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.stop(ctx.currentTime + 0.6);
    } catch {}
  }, []);

  // Letter timer
  useEffect(() => {
    if (phase !== 'letter') return;
    if (letterSeconds <= 0) {
      setPhase('category');
      chimeRef.current = false;
      return;
    }
    const t = setTimeout(() => setLetterSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, letterSeconds]);

  // Category timer
  useEffect(() => {
    if (phase !== 'category') return;
    if (categorySeconds <= 0) {
      playChime();
      setPhase('report');
      return;
    }
    const t = setTimeout(() => setCategorySeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, categorySeconds, playChime]);

  const submitLetterWord = () => {
    const w = letterInput.trim();
    if (!w) return;
    setLetterEntries(prev => [...prev, w]);
    setLetterInput('');
  };

  const handleTapCategory = (option: string) => {
    const isRepeat = categoryTapped.includes(option);
    setCategoryTapped(prev => [...prev, option]);
    setLastTap({ option, valid: !isRepeat });
    setTimeout(() => setLastTap(null), 700);
  };

  // Scoring
  const letterValid = useMemo(() => {
    const seen = new Set<string>();
    let count = 0;
    for (const w of letterEntries) {
      const norm = w.trim().toLowerCase();
      if (!norm) continue;
      if (seen.has(norm)) continue;
      if (norm[0].toUpperCase() !== letter) continue;
      seen.add(norm);
      count++;
    }
    return count;
  }, [letterEntries, letter]);
  const letterRepeats = letterEntries.length - letterValid;

  const categoryValid = useMemo(() => {
    const seen = new Set<string>();
    let count = 0;
    for (const o of categoryTapped) {
      if (seen.has(o)) continue;
      if (cat.validOptions.includes(o)) { seen.add(o); count++; }
    }
    return count;
  }, [categoryTapped, cat]);
  const categoryRepeats = categoryTapped.filter((o, i) => categoryTapped.indexOf(o) !== i).length;

  const totalScore = letterValid + categoryValid;

  // Benchmark bands (simple verbal-fluency-inspired)
  const benchmark = useMemo(() => {
    if (totalScore >= 22) return { band: 'Exceptional', textClass: 'text-success', bgClass: 'bg-success/15', borderClass: 'border-success/30', desc: 'Top-tier verbal fluency. Lightning-fast retrieval and category access.' };
    if (totalScore >= 16) return { band: 'Above Average', textClass: 'text-success', bgClass: 'bg-success/15', borderClass: 'border-success/30', desc: 'Strong fluency. Your brain is retrieving words faster than most.' };
    if (totalScore >= 10) return { band: 'Average', textClass: 'text-primary', bgClass: 'bg-primary/15', borderClass: 'border-primary/30', desc: 'Healthy baseline. You\'re in the typical range for adults.' };
    if (totalScore >= 6) return { band: 'Below Average', textClass: 'text-warning', bgClass: 'bg-warning/15', borderClass: 'border-warning/30', desc: 'Slight slowing. Could indicate fatigue, stress, or worth practicing.' };
    return { band: 'Needs Practice', textClass: 'text-destructive', bgClass: 'bg-destructive/15', borderClass: 'border-destructive/30', desc: 'Word retrieval was slow today. Try again rested for a fairer reading.' };
  }, [totalScore]);

  const reset = () => {
    setPhase('intro');
    setLetterEntries([]); setLetterInput(''); setLetterSeconds(SECTION_DURATION);
    setCategoryTapped([]); setCategorySeconds(SECTION_DURATION);
    chimeRef.current = false;
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <header className="px-6 py-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div>
            <h1 className="text-display text-lg text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Brain Sprint Mini Game
            </h1>
            <p className="text-xs text-muted-foreground">60-second verbal fluency challenge</p>
          </div>
        </div>
        {(phase === 'letter' || phase === 'category') && (
          <div className="text-display text-3xl tabular-nums text-foreground">
            {phase === 'letter' ? letterSeconds : categorySeconds}s
          </div>
        )}
      </header>

      <main className="flex-1 px-6 py-6 max-w-3xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="card-elevated p-8 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                    <Play className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-display text-2xl text-foreground">How it works</h2>
                    <p className="text-sm text-muted-foreground">No login. No setup. Just 60 seconds.</p>
                  </div>
                </div>
                <ol className="space-y-3 text-foreground">
                  <li className="flex gap-3">
                    <span className="font-bold text-primary">1.</span>
                    <span><strong>Round 1 — First Letter (30s):</strong> Type as many words as you can starting with the letter <span className="px-2 py-0.5 rounded bg-primary/15 text-primary font-bold">{letter}</span>.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary">2.</span>
                    <span><strong>Round 2 — Name Things (30s):</strong> Tap as many <span className="font-semibold text-primary">{cat.category}</span> as you can. No repeats.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary">3.</span>
                    <span>Get a personal report with score, benchmark, and next steps.</span>
                  </li>
                </ol>
                <Button variant="hero" size="xl" className="w-full" onClick={() => setPhase('letter')}>
                  Start Game
                </Button>
              </div>
            </motion.div>
          )}

          {phase === 'letter' && (
            <motion.div key="letter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="card-elevated p-6">
                <p className="text-sm text-muted-foreground">Round 1 of 2 — First Letter</p>
                <h2 className="text-display text-3xl text-foreground mt-1">
                  Words starting with <span className="text-primary">{letter}</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Type a word and press Enter. Repeats and wrong-letter words don't count.</p>
              </div>

              <div className="flex gap-2">
                <input
                  autoFocus
                  value={letterInput}
                  onChange={e => setLetterInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') submitLetterWord(); }}
                  placeholder={`Type a word starting with ${letter}...`}
                  className="flex-1 h-14 rounded-lg border border-border bg-card px-4 text-lg text-foreground focus:border-primary focus:outline-none"
                />
                <Button size="lg" onClick={submitLetterWord} className="h-14">Add</Button>
              </div>

              <div className="flex gap-4 text-sm">
                <div>Valid: <span className="text-display text-2xl text-success">{letterValid}</span></div>
                <div>Invalid/Repeats: <span className="text-display text-2xl text-destructive">{letterRepeats}</span></div>
              </div>

              <div className="flex flex-wrap gap-2">
                {letterEntries.map((w, i) => {
                  const norm = w.trim().toLowerCase();
                  const wrongLetter = norm[0]?.toUpperCase() !== letter;
                  const firstIdx = letterEntries.findIndex(e => e.trim().toLowerCase() === norm);
                  const isRepeat = firstIdx !== i;
                  const bad = wrongLetter || isRepeat;
                  return (
                    <span key={i} className={`px-3 py-1.5 rounded-full text-sm font-medium ${bad ? 'bg-destructive/15 text-destructive line-through' : 'bg-success/15 text-success'}`}>
                      {w}
                    </span>
                  );
                })}
              </div>
            </motion.div>
          )}

          {phase === 'category' && (
            <motion.div key="category" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="card-elevated p-6">
                <p className="text-sm text-muted-foreground">Round 2 of 2 — Name Things</p>
                <h2 className="text-display text-3xl text-foreground mt-1">
                  Tap as many <span className="text-primary">{cat.category}</span> as you can
                </h2>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <div>Valid: <span className="text-display text-2xl text-success">{categoryValid}</span></div>
                  <div>Repeats: <span className="text-display text-2xl text-destructive">{categoryRepeats}</span></div>
                </div>
                {lastTap && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold ${lastTap.valid ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                    {lastTap.valid ? <Check className="inline w-4 h-4 mr-1" /> : <RotateCcw className="inline w-4 h-4 mr-1" />}
                    {lastTap.option}
                  </motion.div>
                )}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {displayCategoryOptions.map(option => {
                  const tapCount = categoryTapped.filter(t => t === option).length;
                  const isTapped = tapCount > 0;
                  const isRepeat = tapCount > 1;
                  return (
                    <button key={option} onClick={() => handleTapCategory(option)}
                      className={`min-h-[56px] px-3 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 ${
                        isRepeat ? 'bg-destructive/20 text-destructive border-2 border-destructive/30'
                        : isTapped ? 'bg-success/20 text-success border-2 border-success/30'
                        : 'bg-muted hover:bg-muted/80 text-foreground border border-border'
                      }`}>
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
            </motion.div>
          )}

          {phase === 'report' && (
            <motion.div key="report" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="card-elevated p-8 text-center space-y-3">
                <div className="inline-flex w-16 h-16 rounded-full bg-primary/15 items-center justify-center mx-auto">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Your Brain Sprint Score</p>
                <p className="text-display text-7xl text-foreground">{totalScore}</p>
                <p className={`text-display text-xl ${benchmark.textClass}`}>{benchmark.band}</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">{benchmark.desc}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="card-elevated p-5">
                  <p className="text-xs text-muted-foreground uppercase">Round 1 — Letter "{letter}"</p>
                  <p className="text-display text-3xl text-success mt-1">{letterValid}</p>
                  <p className="text-xs text-muted-foreground">{letterRepeats} invalid · {letterEntries.length} total</p>
                </div>
                <div className="card-elevated p-5">
                  <p className="text-xs text-muted-foreground uppercase">Round 2 — {cat.category}</p>
                  <p className="text-display text-3xl text-success mt-1">{categoryValid}</p>
                  <p className="text-xs text-muted-foreground">{categoryRepeats} repeats · {categoryTapped.length} taps</p>
                </div>
              </div>

              <div className="card-elevated p-6 space-y-3">
                <h3 className="text-display text-lg flex items-center gap-2"><Target className="w-5 h-5 text-primary" /> Why this score?</h3>
                <ul className="space-y-2 text-sm text-foreground">
                  <li>• Verbal fluency measures how quickly your brain searches and retrieves words from memory under time pressure.</li>
                  <li>• <strong>Letter fluency</strong> taps phonological search (left frontal cortex) — you scored {letterValid}.</li>
                  <li>• <strong>Category fluency</strong> taps semantic memory (temporal lobe) — you scored {categoryValid}.</li>
                  <li>• A balanced ratio between the two suggests healthy executive control.</li>
                </ul>
              </div>

              <div className="card-elevated p-6 space-y-3">
                <h3 className="text-display text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Benchmark</h3>
                <div className="space-y-1.5 text-sm">
                  <BenchmarkRow label="Needs Practice" range="0–5" active={totalScore < 6} textClass="text-destructive" bgClass="bg-destructive/15" borderClass="border-destructive/30" />
                  <BenchmarkRow label="Below Average" range="6–9" active={totalScore >= 6 && totalScore < 10} textClass="text-warning" bgClass="bg-warning/15" borderClass="border-warning/30" />
                  <BenchmarkRow label="Average" range="10–15" active={totalScore >= 10 && totalScore < 16} textClass="text-primary" bgClass="bg-primary/15" borderClass="border-primary/30" />
                  <BenchmarkRow label="Above Average" range="16–21" active={totalScore >= 16 && totalScore < 22} textClass="text-success" bgClass="bg-success/15" borderClass="border-success/30" />
                  <BenchmarkRow label="Exceptional" range="22+" active={totalScore >= 22} textClass="text-success" bgClass="bg-success/15" borderClass="border-success/30" />
                </div>
              </div>

              <div className="card-elevated p-6 space-y-3">
                <h3 className="text-display text-lg flex items-center gap-2"><Lightbulb className="w-5 h-5 text-primary" /> Next steps</h3>
                <ul className="space-y-2 text-sm text-foreground">
                  {totalScore < 10 && <li>• Try again after rest, hydration, or a short walk — fluency is highly sensitive to fatigue.</li>}
                  {totalScore >= 10 && totalScore < 16 && <li>• Practice daily 60-second sprints with new letters and categories to push into the above-average band.</li>}
                  {totalScore >= 16 && <li>• Maintain with regular reading, conversation, and varied novel inputs — your retrieval system is humming.</li>}
                  <li>• For a complete picture, run the full <button onClick={() => navigate('/')} className="text-primary underline">Brain Fitness Score</button> battery (Lock-In + Recall + Sharpness).</li>
                  <li>• Sleep 7–9 hours and limit alcohol the night before testing to get your true baseline.</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="xl" className="flex-1" onClick={reset}>Play Again</Button>
                <Button variant="hero" size="xl" className="flex-1" onClick={() => navigate('/')}>Back to Home</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function BenchmarkRow({ label, range, active, textClass, bgClass, borderClass }: { label: string; range: string; active: boolean; textClass: string; bgClass: string; borderClass: string }) {
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${active ? `${bgClass} border ${borderClass}` : 'bg-muted/40'}`}>
      <span className={`font-medium ${active ? textClass : 'text-muted-foreground'}`}>{label}</span>
      <span className={`tabular-nums text-sm ${active ? 'font-bold' : 'text-muted-foreground'}`}>{range}</span>
    </div>
  );
}