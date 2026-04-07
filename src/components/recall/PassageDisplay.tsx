import { useRecall } from '@/contexts/RecallContext';
import { useSession } from '@/contexts/SessionContext';
import { PASSAGE_FORMS } from '@/lib/content-library';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function PassageDisplay() {
  const { goToScreen } = useRecall();
  const { assignedForm } = useSession();
  const passage = PASSAGE_FORMS[assignedForm];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col bg-background">
      <div className="sticky top-0 z-10 bg-primary/5 border-b px-6 py-4">
        <p className="text-display text-lg text-primary">READ ALOUD — ONE WORD PER SECOND</p>
        <p className="text-sm text-muted-foreground">Do not rush. Do not repeat.</p>
      </div>
      <div className="flex-1 px-6 py-8 max-w-3xl mx-auto w-full">
        <div className="text-passage text-foreground whitespace-pre-line leading-[1.8]">
          {passage.passage_text}
        </div>
      </div>
      <div className="sticky bottom-0 bg-background border-t px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <Button variant="hero" size="xl" className="w-full" onClick={() => goToScreen(3)}>
            Done Reading — Continue
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
