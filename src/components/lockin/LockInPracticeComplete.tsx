import { useLockIn } from '@/contexts/LockInContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function LockInPracticeComplete() {
  const { goToScreen } = useLockIn();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[100dvh] flex flex-col items-center justify-center p-8 bg-background">
      <div className="w-full max-w-lg space-y-8 text-center">
        <h1 className="text-display text-2xl text-foreground">PRACTICE COMPLETE</h1>

        <div className="space-y-4">
          <p className="text-lg text-foreground">The real test is about to begin.</p>
          <p className="text-display text-4xl text-primary">3.5 minutes.</p>
          <p className="text-base text-muted-foreground">
            Same rules — tap for every digit except <span className="font-bold text-foreground">3</span> immediately after <span className="font-bold text-foreground">7</span>.
          </p>
        </div>

        <div className="card-sunken p-4 space-y-2">
          <p className="text-base text-foreground font-medium">No feedback will be shown during the test.</p>
          <p className="text-sm text-muted-foreground">
            Stay focused. Keep going even if you make mistakes.
          </p>
        </div>

        <Button variant="hero" size="xl" className="w-full" onClick={() => goToScreen(4)}>
          Begin Test
        </Button>
      </div>
    </motion.div>
  );
}
