import { useRecall, RecallProvider } from '@/contexts/RecallContext';
import PassageDisplay from '@/components/recall/PassageDisplay';
import DistractionInstruction from '@/components/recall/DistractionInstruction';
import DistractionTimer from '@/components/recall/DistractionTimer';
import RecallScoring from '@/components/recall/RecallScoring';
import SessionComplete from '@/components/recall/SessionComplete';

function RecallFlow() {
  const { state } = useRecall();

  // Screens: 0=passage, 1=unused, 2=passage, 3=distraction instruction, 4=timer, 5=scoring, 6=complete
  // Since login/participant is now outside, recall starts at passage display
  switch (state.currentScreen) {
    case 0:
    case 2: return <PassageDisplay />;
    case 3: return <DistractionInstruction />;
    case 4: return <DistractionTimer />;
    case 5: return <RecallScoring />;
    case 6: return <SessionComplete />;
    default: return <PassageDisplay />;
  }
}

export default function RecallTestPage() {
  return (
    <RecallProvider>
      <RecallFlow />
    </RecallProvider>
  );
}
