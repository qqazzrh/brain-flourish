import { useLockIn } from '@/contexts/LockInContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function LockInGame2Explanation() {
  const { goToScreen } = useLockIn();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[100dvh] flex flex-col items-center justify-center p-8 bg-background">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-display text-3xl text-foreground">LOCK-IN TEST</h1>
          <p className="text-sm text-muted-foreground">Round 2 of 2 — Harder</p>
        </div>

        <div className="space-y-4 text-center">
          <p className="text-xl text-foreground leading-relaxed">
            Same task — digits appear one at a time. TAP each digit.
          </p>
          <p className="text-lg text-foreground leading-relaxed font-bold">
            But now there are <span className="text-destructive">TWO</span> rules to follow:
          </p>
        </div>

        <div className="card-elevated border-2 border-warning/40 p-6 space-y-6">
          <p className="text-lg font-bold text-warning text-center">⚠ TWO EXCEPTIONS:</p>
          
          {/* Rule 1 */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground text-center">Rule 1:</p>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <span className="text-display text-5xl text-foreground">3</span>
              </div>
              <p className="text-base text-muted-foreground">after</p>
              <div className="text-center">
                <span className="text-display text-5xl text-foreground">7</span>
              </div>
              <p className="text-lg font-bold text-destructive">→ DON'T TAP</p>
            </div>
          </div>

          <div className="border-t border-border/30" />

          {/* Rule 2 */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground text-center">Rule 2 (NEW):</p>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <span className="text-display text-5xl text-foreground">5</span>
              </div>
              <p className="text-base text-muted-foreground">after</p>
              <div className="text-center">
                <span className="text-display text-5xl text-foreground">6</span>
              </div>
              <p className="text-lg font-bold text-destructive">→ DON'T TAP</p>
            </div>
          </div>
        </div>

        <div className="card-sunken p-4 space-y-2 text-center">
          <p className="text-base text-foreground">Tap for everything.</p>
          <p className="text-base text-foreground">Hold back for <span className="font-bold">3</span> after <span className="font-bold">7</span>, AND <span className="font-bold">5</span> after <span className="font-bold">6</span>.</p>
        </div>

        <div className="space-y-3">
          <Button variant="hero" size="xl" className="w-full" onClick={() => goToScreen(4)}>
            Start Round 2
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
