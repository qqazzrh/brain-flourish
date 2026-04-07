import { useSharpness } from '@/contexts/SharpnessContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';

export default function SharpnessHandoff() {
  const { goToScreen, setTestStartTime } = useSharpness();

  const handleHandoff = () => {
    setTestStartTime(new Date().toISOString());
    goToScreen(1);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-2xl space-y-8">
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-6 py-3">
          <p className="text-display text-lg text-primary">NEXT: SHARPNESS TEST</p>
        </div>

        <div className="card-elevated p-8 space-y-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">SAY TO PARTICIPANT:</p>
          <p className="text-2xl leading-relaxed text-foreground">
            "The final test measures how sharp and flexible your brain is under pressure. There are three short parts — each one is different.
          </p>
          <p className="text-2xl leading-relaxed text-foreground">
            The screen will guide you through all of them. I'll be right here but won't be speaking during the test.
          </p>
          <p className="text-2xl leading-relaxed text-foreground">
            One thing — make sure you can hear the tablet speaker clearly. You'll need to listen as well as watch."
          </p>
        </div>

        <div className="card-sunken p-4 flex items-center gap-3">
          <Volume2 className="w-5 h-5 text-warning shrink-0" />
          <p className="text-sm font-medium text-warning">
            Check room volume before proceeding. Ensure speaker is audible to participant.
          </p>
        </div>

        <Button variant="hero" size="xl" className="w-full" onClick={handleHandoff}>
          Hand Tablet to Participant
        </Button>
      </div>
    </motion.div>
  );
}
