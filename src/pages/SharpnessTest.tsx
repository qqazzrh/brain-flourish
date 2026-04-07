import { SharpnessProvider, useSharpness } from '@/contexts/SharpnessContext';
import SharpnessHandoff from '@/components/sharpness/SharpnessHandoff';
import SharpnessOverview from '@/components/sharpness/SharpnessOverview';
import DualTaskComponent from '@/components/sharpness/DualTaskComponent';
import ChoiceRTComponent from '@/components/sharpness/ChoiceRTComponent';
import CategorySwitchComponent from '@/components/sharpness/CategorySwitchComponent';
import SharpnessTestComplete from '@/components/sharpness/SharpnessTestComplete';
import SharpnessScoreOutput from '@/components/sharpness/SharpnessScoreOutput';

function SharpnessFlow() {
  const { state } = useSharpness();

  switch (state.currentScreen) {
    case 0: return <SharpnessHandoff />;
    case 1: return <SharpnessOverview />;
    // Dual Task: screens 2-6
    case 2: case 3: case 4: case 5: case 6:
      return <DualTaskComponent />;
    // Choice RT: screens 7-8
    case 7: case 8:
      return <ChoiceRTComponent />;
    // Category Switching: screens 9
    case 9:
      return <CategorySwitchComponent />;
    // Complete
    case 10: return <SharpnessTestComplete />;
    case 11: return <SharpnessScoreOutput />;
    default: return <SharpnessHandoff />;
  }
}

export default function SharpnessTestPage() {
  return (
    <SharpnessProvider>
      <SharpnessFlow />
    </SharpnessProvider>
  );
}
