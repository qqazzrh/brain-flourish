import { useState, useEffect } from 'react';
import { useLockIn } from '@/contexts/LockInContext';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export default function LockInTestComplete() {
  const { goToScreen } = useLockIn();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(prev => {
        if (prev >= 8) {
          clearInterval(interval);
          goToScreen(6);
          return 8;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [goToScreen]);

  const handleTap = () => {
    goToScreen(6);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-8 bg-background"
      onClick={handleTap}
    >
      <div className="text-center space-y-6">
        <CheckCircle2 className="w-20 h-20 text-success mx-auto" />
        <h1 className="text-display text-3xl text-foreground">TEST COMPLETE</h1>
        <p className="text-lg text-muted-foreground">
          Please return the tablet to your facilitator.
        </p>
      </div>
    </motion.div>
  );
}
