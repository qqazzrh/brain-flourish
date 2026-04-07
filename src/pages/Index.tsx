import { useSession } from '@/contexts/SessionContext';
import FacilitatorLogin from '@/components/shared/FacilitatorLogin';
import SessionSetup from '@/components/shared/SessionSetup';
import TestHub from '@/components/shared/TestHub';

export default function Index() {
  const { facilitator, participant } = useSession();

  // Step 1: Facilitator login
  if (!facilitator) return <FacilitatorLogin />;
  
  // Step 2: Participant setup
  if (!participant) return <SessionSetup />;
  
  // Step 3: Test hub - select which test to run
  return <TestHub />;
}
