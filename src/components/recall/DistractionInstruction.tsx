import { useRecall } from '@/contexts/RecallContext';
import { DISTRACTION_TASKS } from '@/lib/content-library';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function DistractionInstruction() {
  const { state, goToScreen, setDistractionTimerStart } = useRecall();
  const task = DISTRACTION_TASKS[state.assignedForm];

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
        {/* Header */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-6 py-3">
          <p className="text-display text-lg text-primary">READ THIS VERBATIM</p>
        </div>

        {/* Instruction card */}
        <div className="card-elevated p-8 space-y-4">
          <p className="text-2xl leading-relaxed text-foreground">
            "Now — for the next 90 seconds, I want you to name as many{' '}
            <span className="font-bold text-primary uppercase">{task.category}</span>{' '}
            as you can think of that begin with the letter{' '}
            <span className="font-bold text-primary">{task.letter}</span>.
          </p>
          <p className="text-2xl leading-relaxed text-foreground">
            Speak out loud.<br />
            Keep going until I tell you to stop.
          </p>
          <p className="text-2xl leading-relaxed text-foreground">
            Start whenever you're ready."
          </p>
        </div>

        {/* Note */}
        <div className="card-sunken p-4 space-y-1">
          <p className="text-sm text-muted-foreground">
            Category and letter auto-assigned for this form.
          </p>
          <p className="text-sm font-medium text-warning">
            Do not start the timer until you have finished reading this instruction.
          </p>
        </div>

        {/* CTA */}
        <Button variant="hero" size="xl" className="w-full" onClick={handleStartTimer}>
          Start Timer
        </Button>
      </div>
    </motion.div>
  );
}
