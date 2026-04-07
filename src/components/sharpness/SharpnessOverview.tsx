import { useSharpness } from '@/contexts/SharpnessContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function SharpnessOverview() {
  const { goToScreen, setSkipPractice } = useSharpness();

  const handleWithPractice = () => {
    setSkipPractice(false);
    goToScreen(2);
  };

  const handleSkipPractice = () => {
    setSkipPractice(true);
    goToScreen(2);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      <div className="w-full max-w-lg space-y-8">
        <h1 className="text-display text-3xl text-foreground text-center">SHARPNESS TEST</h1>

        <p className="text-center text-muted-foreground">
          Three short parts. Each one is different. Instructions appear before each part.
        </p>

        <div className="space-y-4">
          <div className="card-elevated p-5">
            <p className="text-display text-sm text-primary mb-1">PART 1 — Dual Task</p>
            <p className="text-sm text-muted-foreground">Watch the screen AND listen. Tap two different zones.</p>
          </div>
          <div className="card-elevated p-5">
            <p className="text-display text-sm text-primary mb-1">PART 2 — Reaction Speed</p>
            <p className="text-sm text-muted-foreground">React to flashing boxes. Follow the rule on screen.</p>
          </div>
          <div className="card-elevated p-5">
            <p className="text-display text-sm text-primary mb-1">PART 3 — Category Switch</p>
            <p className="text-sm text-muted-foreground">Match words by changing rules. Speed and accuracy both count.</p>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">Total time: about 4 minutes.</p>

        <div className="space-y-3">
          <Button variant="hero" size="xl" className="w-full" onClick={handleWithPractice}>
            Begin with Practice Rounds
          </Button>
          <Button variant="outline" size="lg" className="w-full text-muted-foreground" onClick={handleSkipPractice}>
            Skip Practices — Start Real Tests
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
