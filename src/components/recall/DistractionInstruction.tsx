import { useRecall } from '@/contexts/RecallContext';
import { useSession } from '@/contexts/SessionContext';
import { DISTRACTION_OPTIONS } from '@/lib/distraction-options';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function DistractionInstruction() {
  const { goToScreen, setDistractionTimerStart } = useRecall();
  const { assignedForm } = useSession();
  const optionSet = DISTRACTION_OPTIONS[assignedForm];

  const handleStartTimer = () => {
    setDistractionTimerStart(new Date().toISOString());
    goToScreen(4);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-background"
    >
      <div className="w-full max-w-2xl space-y-8">
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-6 py-3">
          <p className="text-display text-lg text-primary">READ THIS VERBATIM</p>
        </div>

        <div className="card-elevated p-8 space-y-4">
          <p className="text-2xl leading-relaxed text-foreground">
            "{optionSet.instruction}"
          </p>
        </div>

        <div className="card-sunken p-4 space-y-1">
          <p className="text-sm text-muted-foreground">
            Category and letter auto-assigned for this form.
          </p>
          <p className="text-sm font-medium text-warning">
            Do not start the timer until you have finished reading this instruction.
          </p>
        </div>

        <Button variant="hero" size="xl" className="w-full" onClick={handleStartTimer}>
          Start Timer
        </Button>
      </div>
    </motion.div>
  );
}
