import { useEffect, useRef, useState } from 'react';
import { useRecall } from '@/contexts/RecallContext';
import { useSession } from '@/contexts/SessionContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Loader2, Play, Pause, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type PlayState = 'idle' | 'loading' | 'playing' | 'paused' | 'ended';

export default function PassageDisplay() {
  const { goToScreen } = useRecall();
  const { passage, contentLoading } = useSession();
  const [playState, setPlayState] = useState<PlayState>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const passageIdRef = useRef<string | null>(null);

  // Reset cached audio if passage changes
  useEffect(() => {
    if (passage && passageIdRef.current !== passage.form_id + ':' + passage.passage_text.slice(0, 32)) {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
      audioRef.current?.pause();
      audioRef.current = null;
      setPlayState('idle');
      passageIdRef.current = passage ? passage.form_id + ':' + passage.passage_text.slice(0, 32) : null;
    }
  }, [passage]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const playAudio = async () => {
    if (!passage) return;

    // If already loaded, just play
    if (audioRef.current && blobUrlRef.current) {
      try {
        await audioRef.current.play();
        setPlayState('playing');
      } catch (err) {
        console.error('Audio play failed:', err);
      }
      return;
    }

    setPlayState('loading');
    try {
      const { data, error } = await supabase.functions.invoke('recall-tts', {
        body: { text: passage.passage_text },
      });
      if (error) throw error;

      // data should be a Blob when the function returns audio/mpeg
      const blob = data instanceof Blob ? data : new Blob([data as ArrayBuffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;

      const audio = new Audio(url);
      audio.onended = () => setPlayState('ended');
      audio.onpause = () => {
        if (!audio.ended) setPlayState('paused');
      };
      audio.onplay = () => setPlayState('playing');
      audioRef.current = audio;
      await audio.play();
    } catch (err) {
      console.error('TTS failed:', err);
      toast({
        title: 'Could not generate audio',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
      setPlayState('idle');
    }
  };

  const pauseAudio = () => {
    audioRef.current?.pause();
    setPlayState('paused');
  };

  const replayAudio = async () => {
    if (!audioRef.current) return playAudio();
    audioRef.current.currentTime = 0;
    try {
      await audioRef.current.play();
      setPlayState('playing');
    } catch (err) {
      console.error('Replay failed:', err);
    }
  };

  if (contentLoading || !passage) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderAudioButton = () => {
    switch (playState) {
      case 'loading':
        return (
          <Button variant="secondary" size="lg" disabled className="gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Generating audio…
          </Button>
        );
      case 'playing':
        return (
          <Button variant="secondary" size="lg" onClick={pauseAudio} className="gap-2">
            <Pause className="w-5 h-5" /> Pause
          </Button>
        );
      case 'paused':
        return (
          <Button variant="secondary" size="lg" onClick={playAudio} className="gap-2">
            <Play className="w-5 h-5" /> Resume
          </Button>
        );
      case 'ended':
        return (
          <Button variant="secondary" size="lg" onClick={replayAudio} className="gap-2">
            <RotateCcw className="w-5 h-5" /> Replay
          </Button>
        );
      default:
        return (
          <Button variant="secondary" size="lg" onClick={playAudio} className="gap-2">
            <Play className="w-5 h-5" /> Play passage aloud
          </Button>
        );
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[100dvh] flex flex-col bg-background">
      <div className="sticky top-0 z-10 bg-primary/5 border-b px-6 py-4">
        <p className="text-display text-lg text-primary">READ ALOUD — or tap Play to hear it</p>
        <p className="text-sm text-muted-foreground">Do not rush. Do not repeat.</p>
      </div>
      <div className="flex-1 px-6 py-8 max-w-3xl mx-auto w-full">
        <div className="mb-6 flex justify-center">
          {renderAudioButton()}
        </div>
        <div className="text-passage text-foreground whitespace-pre-line leading-[1.8]">
          {passage.passage_text}
        </div>
      </div>
      <div className="sticky bottom-0 bg-background border-t px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <Button variant="hero" size="xl" className="w-full" onClick={() => goToScreen(3)}>
            Done Reading — Continue
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
