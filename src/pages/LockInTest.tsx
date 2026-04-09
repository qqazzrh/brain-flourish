import { LockInProvider, useLockIn } from '@/contexts/LockInContext';
import LockInHandoff from '@/components/lockin/LockInHandoff';
import LockInExplanation from '@/components/lockin/LockInExplanation';
import LockInActiveTest from '@/components/lockin/LockInActiveTest';
import LockInGame2Explanation from '@/components/lockin/LockInGame2Explanation';
import LockInActiveTest2 from '@/components/lockin/LockInActiveTest2';
import LockInTestComplete from '@/components/lockin/LockInTestComplete';
import LockInScoreOutput from '@/components/lockin/LockInScoreOutput';

function LockInFlow() {
  const { state } = useLockIn();

  switch (state.currentScreen) {
    case 0: return <LockInHandoff />;
    case 1: return <LockInExplanation />;
    case 2: return <LockInActiveTest />;        // Game 1: 7→3 only
    case 3: return <LockInGame2Explanation />;   // Explain Game 2 rules
    case 4: return <LockInActiveTest2 />;        // Game 2: 7→3 + 6→5
    case 5: return <LockInTestComplete />;
    case 6: return <LockInScoreOutput />;
    default: return <LockInHandoff />;
  }
}

export default function LockInTestPage() {
  return (
    <LockInProvider>
      <LockInFlow />
    </LockInProvider>
  );
}
