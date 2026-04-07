import { useState, useEffect } from 'react';
import { useSharpness } from '@/contexts/SharpnessContext';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SharpnessTestComplete() {
  const { goToScreen, setTestEndTime } = useSharpness();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setTestEndTime(new Date().toISOString());
    const interval = setInterval(() => {
      setElapsed(prev => {
        if (prev >= 8) {
          clearInterval(interval);
          goToScreen(11);
          return 8;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [goToScreen, setTestEndTime]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-8 bg-background"
      onClick={() => goToScreen(11)}
    >
      <div className="text-center space-y-6">
        <CheckCircle2 className="w-20 h-20 text-success mx-auto" />
        <h1 className="text-display text-3xl text-foreground">SHARPNESS TEST COMPLETE</h1>
        <p className="text-lg text-muted-foreground">All three parts done.</p>
        <p className="text-base text-muted-foreground">Please return the tablet to your facilitator.</p>
      </div>
    </motion.div>
  );
}
