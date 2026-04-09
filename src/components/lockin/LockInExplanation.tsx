import { useLockIn } from '@/contexts/LockInContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function LockInExplanation() {
  const { goToScreen } = useLockIn();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-display text-3xl text-foreground">LOCK-IN TEST</h1>
          <p className="text-sm text-muted-foreground">Round 1 of 2</p>
        </div>

        <div className="space-y-6 text-center">
          <p className="text-xl text-foreground leading-relaxed">
            Digits will appear on screen one at a time.
          </p>
          <p className="text-xl text-foreground leading-relaxed font-bold">
            TAP the screen each time you see a digit.
          </p>
        </div>

        <div className="card-elevated border-2 border-warning/40 p-6 space-y-4">
          <p className="text-lg font-bold text-warning text-center">⚠ ONE EXCEPTION:</p>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">If you see a</p>
              <span className="text-display text-7xl text-foreground">3</span>
            </div>
            <p className="text-lg text-muted-foreground">immediately after a</p>
            <div className="text-center">
              <span className="text-display text-7xl text-foreground">7</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-destructive text-center">DO NOT TAP.</p>
        </div>

        <div className="card-sunken p-4 space-y-2 text-center">
          <p className="text-base text-foreground">Tap for everything.</p>
          <p className="text-base text-foreground">Hold back only for <span className="font-bold">3</span> after <span className="font-bold">7</span>.</p>
          <p className="text-sm text-muted-foreground mt-2">⚡ Note: You'll see many 3s — only hold back when a 3 comes right after a 7.</p>
        </div>

        <div className="space-y-3">
          <Button variant="hero" size="xl" className="w-full" onClick={() => goToScreen(2)}>
            Start Round 1
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
