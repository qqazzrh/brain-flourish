import { useState, useEffect, useRef, useCallback } from 'react';
import { useRecall } from '@/contexts/RecallContext';
import { useSession } from '@/contexts/SessionContext';
import { PASSAGE_FORMS } from '@/lib/content-library';
import { Button } from '@/components/ui/button';
import { UnitCategory, ScoreableUnit } from '@/lib/types';
import { motion } from 'framer-motion';
import { Check, Lock, Clock, MessageSquare } from 'lucide-react';

const CATEGORY_ORDER: UnitCategory[] = ['WHO', 'WHAT', 'WHERE', 'WHEN', 'SPECIFIC'];
const CATEGORY_COLORS: Record<UnitCategory, string> = {
  WHO: 'bg-cat-who', WHAT: 'bg-cat-what', WHERE: 'bg-cat-where', WHEN: 'bg-cat-when', SPECIFIC: 'bg-cat-specific',
};
const CATEGORY_TEXT: Record<UnitCategory, string> = {
  WHO: 'text-cat-who', WHAT: 'text-cat-what', WHERE: 'text-cat-where', WHEN: 'text-cat-when', SPECIFIC: 'text-cat-specific',
};

export default function RecallScoring() {
  const { state, toggleUnit, goToScreen, setRecallStartTime, setOneTimePromptUsed, setRecallTimerUsed } = useRecall();
  const { assignedForm } = useSession();
  const passage = PASSAGE_FORMS[assignedForm];
  const units = passage.scoreable_units;
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(state.oneTimePromptUsed);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(180);
  const [timerExpired, setTimerExpired] = useState(false);
  const lastTapRef = useRef(Date.now());
  const promptTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!state.recallStartTime) setRecallStartTime(new Date().toISOString());
  }, []);

  useEffect(() => {
    if (promptDismissed) return;
    const check = () => {
      if (Date.now() - lastTapRef.current >= 20000 && !promptDismissed) setShowPrompt(true);
    };
    promptTimerRef.current = setInterval(check, 2000);
    return () => { if (promptTimerRef.current) clearInterval(promptTimerRef.current); };
  }, [promptDismissed]);

  useEffect(() => {
    if (!timerEnabled || timerExpired) return;
    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) { clearInterval(interval); setTimerExpired(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerEnabled, timerExpired]);

  const handleTap = useCallback((unitId: number) => {
    lastTapRef.current = Date.now();
    toggleUnit(unitId);
  }, [toggleUnit]);

  const handleDismissPrompt = () => { setPromptDismissed(true); setShowPrompt(false); setOneTimePromptUsed(); };
  const handleToggleTimer = () => { if (!timerEnabled) { setTimerEnabled(true); setRecallTimerUsed(true); } };

  const grouped = CATEGORY_ORDER.map(cat => ({ category: cat, units: units.filter(u => u.category === cat) }));
  const totalRecalled = state.recalledUnits.size;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col bg-background">
      <div className="sticky top-0 z-10 bg-background border-b px-6 py-3">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div>
            <p className="text-display text-lg text-foreground">RECALL PHASE</p>
            <p className="text-sm text-muted-foreground">SAY: "Tell me everything you remember from the passage."</p>
          </div>
          <div className="flex items-center gap-3">
            {timerEnabled && (
              <span className={`font-mono text-lg font-bold ${timerSeconds <= 30 ? 'text-warning' : 'text-muted-foreground'}`}>
                {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}
              </span>
            )}
            {!timerEnabled && (
              <button onClick={handleToggleTimer} className="text-muted-foreground hover:text-foreground p-2 tap-target" title="Start 3-min timer">
                <Clock className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 max-w-3xl mx-auto w-full space-y-6">
        {grouped.map(({ category, units: catUnits }) => {
          const recalled = catUnits.filter(u => state.recalledUnits.has(u.unit_id)).length;
          const total = catUnits.length;
          const complete = recalled === total;
          return (
            <div key={category}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[category]}`} />
                <span className={`text-display text-base ${CATEGORY_TEXT[category]}`}>
                  {category === 'SPECIFIC' ? 'SPECIFIC DETAIL' : category} ({total})
                </span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${CATEGORY_COLORS[category]} transition-all duration-300 rounded-full`} style={{ width: `${(recalled / total) * 100}%` }} />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{recalled} / {total} {complete && '✓'}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {catUnits.map(unit => (
                  <UnitTile key={unit.unit_id} unit={unit} isRecalled={state.recalledUnits.has(unit.unit_id)}
                    isLocked={complete && !state.recalledUnits.has(unit.unit_id)} onTap={handleTap} category={category} />
                ))}
              </div>
            </div>
          );
        })}
        {showPrompt && !promptDismissed && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-elevated border-2 animate-pulse-border p-4 flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">One-time prompt available:</p>
              <p className="text-sm text-muted-foreground">SAY: "Anything else you remember?"</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleDismissPrompt}>Used — dismiss</Button>
          </motion.div>
        )}
        {timerExpired && (
          <div className="card-elevated border-warning/50 border-2 p-4 text-center">
            <p className="text-warning font-medium">Time limit reached — tap Recall Complete to proceed.</p>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-background border-t px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <span className="text-display text-xl text-foreground">Score so far: <span className="text-primary">{totalRecalled}</span> / 20</span>
          <Button variant="hero" size="xl" onClick={() => goToScreen(6)}>Recall Complete</Button>
        </div>
      </div>
    </motion.div>
  );
}

function UnitTile({ unit, isRecalled, isLocked, onTap, category }: {
  unit: ScoreableUnit; isRecalled: boolean; isLocked: boolean; onTap: (id: number) => void; category: UnitCategory;
}) {
  const lastTapTime = useRef(0);
  const handleClick = () => {
    const now = Date.now();
    if (isRecalled && now - lastTapTime.current < 400) onTap(unit.unit_id);
    else if (!isRecalled && !isLocked) onTap(unit.unit_id);
    lastTapTime.current = now;
  };

  if (isLocked) {
    return (
      <div className="min-h-[60px] px-3 py-2 rounded-lg bg-muted/50 flex items-center justify-center gap-2 opacity-50">
        <Lock className="w-4 h-4" /><span className="text-sm text-muted-foreground">{unit.label}</span>
      </div>
    );
  }

  return (
    <button onClick={handleClick} className={`min-h-[60px] px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 tap-target ${
      isRecalled ? `${CATEGORY_COLORS[category]} text-primary-foreground font-medium shadow-md` : 'bg-muted/70 hover:bg-muted text-foreground'
    }`}>
      {isRecalled && <Check className="w-4 h-4 shrink-0" />}
      <span className="text-sm leading-tight">{unit.label}</span>
    </button>
  );
}
