import { useRecall, RecallProvider } from '@/contexts/RecallContext';
import RecallIntro from '@/components/recall/RecallIntro';
import PassageDisplay from '@/components/recall/PassageDisplay';
import DistractionInstruction from '@/components/recall/DistractionInstruction';
import DistractionTimer from '@/components/recall/DistractionTimer';
import RecallScoring from '@/components/recall/RecallScoring';
import SessionComplete from '@/components/recall/SessionComplete';

function RecallFlow() {
  const { state } = useRecall();

  switch (state.currentScreen) {
    case 0: return <RecallIntro />;
    case 2: return <PassageDisplay />;
    case 3: return <DistractionInstruction />;
    case 4: return <DistractionTimer />;
    case 5: return <RecallScoring />;
    case 6: return <SessionComplete />;
    default: return <RecallIntro />;
  }
}

export default function RecallTestPage() {
  return (
    <RecallProvider>
      <RecallFlow />
    </RecallProvider>
  );
}
