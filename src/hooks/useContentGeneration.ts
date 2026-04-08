import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface GenerationStatus {
  passages: number;
  distractions: number;
  wordTrials: number;
}

export function useContentGeneration() {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  const [status, setStatus] = useState<GenerationStatus | null>(null);

  const fetchStatus = useCallback(async () => {
    const { data, error } = await supabase.functions.invoke('generate-content', {
      body: { type: 'status' },
    });
    if (error) {
      console.error('Status fetch error:', error);
      return;
    }
    setStatus(data);
  }, []);

  const generatePassages = useCallback(async (batchSize: number = 5) => {
    setGenerating(true);
    setProgress(`Generating ${batchSize} passages...`);

    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { type: 'passages', batchSize },
      });

      if (error) throw error;

      setProgress(`Generated ${data.generated} passages (${data.inserted} saved). Total: ${data.totalPassages}`);
      toast({ title: 'Passages generated', description: `${data.inserted} new passages saved to database.` });
      await fetchStatus();
    } catch (err) {
      console.error('Generate passages error:', err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setProgress(`Error: ${msg}`);
      toast({ variant: 'destructive', title: 'Generation failed', description: msg });
    } finally {
      setGenerating(false);
    }
  }, [fetchStatus]);

  const generateWordTrials = useCallback(async (batchSize: number = 25) => {
    setGenerating(true);
    setProgress(`Generating ${batchSize} word trials...`);

    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { type: 'word_trials', batchSize },
      });

      if (error) throw error;

      setProgress(`Generated ${data.generated} trials (${data.inserted} saved). Total: ${data.totalTrials}`);
      toast({ title: 'Word trials generated', description: `${data.inserted} new word trials saved to database.` });
      await fetchStatus();
    } catch (err) {
      console.error('Generate word trials error:', err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setProgress(`Error: ${msg}`);
      toast({ variant: 'destructive', title: 'Generation failed', description: msg });
    } finally {
      setGenerating(false);
    }
  }, [fetchStatus]);

  const generateAll = useCallback(async (targetPassages: number = 200, targetWordTrials: number = 200) => {
    setGenerating(true);

    try {
      // Get current counts
      await fetchStatus();

      // Generate passages in batches
      const passageBatchSize = 5;
      let currentPassages = status?.passages || 0;

      while (currentPassages < targetPassages) {
        const remaining = targetPassages - currentPassages;
        const batch = Math.min(passageBatchSize, remaining);
        setProgress(`Generating passages: ${currentPassages}/${targetPassages}...`);

        const { data, error } = await supabase.functions.invoke('generate-content', {
          body: { type: 'passages', batchSize: batch },
        });

        if (error) throw error;
        currentPassages = data.totalPassages;

        // Small delay to avoid rate limits
        await new Promise(r => setTimeout(r, 2000));
      }

      // Generate word trials in batches
      const trialBatchSize = 25;
      let currentTrials = status?.wordTrials || 0;

      while (currentTrials < targetWordTrials) {
        const remaining = targetWordTrials - currentTrials;
        const batch = Math.min(trialBatchSize, remaining);
        setProgress(`Generating word trials: ${currentTrials}/${targetWordTrials}...`);

        const { data, error } = await supabase.functions.invoke('generate-content', {
          body: { type: 'word_trials', batchSize: batch },
        });

        if (error) throw error;
        currentTrials = data.totalTrials;

        await new Promise(r => setTimeout(r, 2000));
      }

      setProgress('Complete!');
      toast({ title: 'Content generation complete', description: `${currentPassages} passages, ${currentTrials} word trials.` });
      await fetchStatus();
    } catch (err) {
      console.error('Generate all error:', err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setProgress(`Error: ${msg}`);
      toast({ variant: 'destructive', title: 'Generation failed', description: msg });
    } finally {
      setGenerating(false);
    }
  }, [fetchStatus, status]);

  return {
    generating,
    progress,
    status,
    fetchStatus,
    generatePassages,
    generateWordTrials,
    generateAll,
  };
}
