import React from 'react';
import { useRecall, RecallProvider } from '@/contexts/RecallContext';
import { useSession } from '@/contexts/SessionContext';
import RecallIntro from '@/components/recall/RecallIntro';
import PassageDisplay from '@/components/recall/PassageDisplay';
import DistractionInstruction from '@/components/recall/DistractionInstruction';
import DistractionTimer from '@/components/recall/DistractionTimer';
import RecallScoring from '@/components/recall/RecallScoring';
import SessionComplete from '@/components/recall/SessionComplete';
import { useNavigate } from 'react-router-dom';

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

class RecallErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function RecallFallback() {
  const navigate = useNavigate();
  React.useEffect(() => { navigate('/'); }, [navigate]);
  return null;
}

export default function RecallTestPage() {
  return (
    <RecallErrorBoundary fallback={<RecallFallback />}>
      <RecallProvider>
        <RecallFlow />
      </RecallProvider>
    </RecallErrorBoundary>
  );
}
