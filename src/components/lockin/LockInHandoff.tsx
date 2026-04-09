import { useLockIn } from '@/contexts/LockInContext';
import { useSession } from '@/contexts/SessionContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function LockInHandoff() {
  const { goToScreen } = useLockIn();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-2xl space-y-8">
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-6 py-3">
          <p className="text-display text-lg text-primary">NEXT: LOCK-IN TEST</p>
        </div>

        <div className="card-elevated p-8 space-y-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">SAY TO PARTICIPANT:</p>
          <p className="text-2xl leading-relaxed text-foreground">
            "The next test measures how well your brain can stay focused and resist distraction.
          </p>
          <p className="text-2xl leading-relaxed text-foreground">
            There are two short rounds. The second round is harder than the first.
          </p>
          <p className="text-2xl leading-relaxed text-foreground">
            You'll be tapping the screen directly this time. I'll hand you the tablet and the instructions will guide you from there.
          </p>
          <p className="text-2xl leading-relaxed text-foreground">
            Take a breath — there's no rush."
          </p>
        </div>

        <div className="card-sunken p-4">
          <p className="text-sm text-muted-foreground">
            When the participant is ready, tap below to transition to the participant-facing screen.
          </p>
        </div>

        <Button variant="hero" size="xl" className="w-full" onClick={() => goToScreen(1)}>
          Hand Tablet to Participant
        </Button>
      </div>
    </motion.div>
  );
}
