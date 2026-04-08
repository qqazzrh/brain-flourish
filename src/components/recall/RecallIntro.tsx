import { useRecall } from '@/contexts/RecallContext';
import { useSession } from '@/contexts/SessionContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { BookOpen, Loader2 } from 'lucide-react';

export default function RecallIntro() {
  const { goToScreen } = useRecall();
  const { assignedForm, passage, formDomain, contentLoading } = useSession();

  if (contentLoading || !passage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-display text-3xl text-foreground">RECALL TEST</h1>
          <p className="text-muted-foreground">Module 1 of 3 — Episodic Verbal Memory</p>
        </div>

        <div className="card-elevated p-6 space-y-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">SAY TO PARTICIPANT:</p>
          <p className="text-lg text-foreground leading-relaxed">
            "I'm going to read you a short passage. Listen carefully — afterwards, I'll ask you to tell me everything you can remember."
          </p>
        </div>

        <div className="card-sunken p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Form</span>
            <span className="font-medium text-foreground">{assignedForm} — {formDomain}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Word count</span>
            <span className="font-medium text-foreground">{passage.word_count} words</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Scoreable units</span>
            <span className="font-medium text-foreground">{passage.scoreable_units.length}</span>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Read the passage aloud at one word per second. Do not rush or repeat.
        </p>

        <Button variant="hero" size="xl" className="w-full" onClick={() => goToScreen(2)}>
          Begin — Show Passage
        </Button>
      </div>
    </motion.div>
  );
}
