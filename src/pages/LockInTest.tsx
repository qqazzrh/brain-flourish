import { LockInProvider, useLockIn } from '@/contexts/LockInContext';
import LockInHandoff from '@/components/lockin/LockInHandoff';
import LockInExplanation from '@/components/lockin/LockInExplanation';
import LockInActiveTest from '@/components/lockin/LockInActiveTest';
import LockInTestComplete from '@/components/lockin/LockInTestComplete';
import LockInScoreOutput from '@/components/lockin/LockInScoreOutput';

function LockInFlow() {
  const { state } = useLockIn();

  switch (state.currentScreen) {
    case 0: return <LockInHandoff />;
    case 1: return <LockInExplanation />;
    case 2: return <LockInActiveTest />;
    case 3: return <LockInTestComplete />;
    case 4: return <LockInScoreOutput />;
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
