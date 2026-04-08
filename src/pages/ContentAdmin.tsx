import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useContentGeneration } from '@/hooks/useContentGeneration';
import { motion } from 'framer-motion';
import { ArrowLeft, Database, RefreshCw, Zap, BookOpen, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ContentAdmin() {
  const navigate = useNavigate();
  const {
    generating, progress, status,
    fetchStatus, generatePassages, generateWordTrials, generateAll,
  } = useContentGeneration();

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-display text-2xl text-foreground">Content Generator</h1>
            <p className="text-muted-foreground">AI-powered test content generation</p>
          </div>
        </div>

        {/* Status */}
        <div className="card-elevated p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-display text-lg text-foreground flex items-center gap-2">
              <Database className="w-5 h-5" /> Content Status
            </h2>
            <Button variant="ghost" size="sm" onClick={fetchStatus} disabled={generating}>
              <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {status && (
            <div className="grid grid-cols-3 gap-4">
              <StatusCard icon={<BookOpen className="w-6 h-6" />} label="Recall Passages" count={status.passages} target={200} />
              <StatusCard icon={<Zap className="w-6 h-6" />} label="Distraction Sets" count={status.distractions} target={200} />
              <StatusCard icon={<Brain className="w-6 h-6" />} label="Word Trials" count={status.wordTrials} target={200} />
            </div>
          )}
        </div>

        {/* Generation Controls */}
        <div className="card-elevated p-6 space-y-4">
          <h2 className="text-display text-lg text-foreground">Generate Content</h2>
          <p className="text-sm text-muted-foreground">
            Uses AI to generate unique test content and save it to the database. Each batch takes ~30 seconds.
          </p>

          <div className="grid grid-cols-1 gap-3">
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-start gap-3"
              onClick={() => generatePassages(5)}
              disabled={generating}
            >
              <BookOpen className="w-5 h-5" />
              Generate 5 Recall Passages + Distraction Sets
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full justify-start gap-3"
              onClick={() => generateWordTrials(25)}
              disabled={generating}
            >
              <Brain className="w-5 h-5" />
              Generate 25 Word Trials
            </Button>

            <div className="border-t pt-3">
              <Button
                variant="hero"
                size="xl"
                className="w-full gap-3"
                onClick={() => generateAll(200, 200)}
                disabled={generating}
              >
                <Zap className="w-5 h-5" />
                Generate All (200 passages + 200 word trials)
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                This will take several minutes. Content is saved incrementally.
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        {(generating || progress) && (
          <div className="card-sunken p-4 space-y-2">
            <p className="text-sm font-medium text-foreground">
              {generating && <RefreshCw className="w-4 h-4 inline mr-2 animate-spin" />}
              {progress}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StatusCard({ icon, label, count, target }: { icon: React.ReactNode; label: string; count: number; target: number }) {
  const pct = Math.min(100, Math.round((count / target) * 100));
  return (
    <div className="bg-muted/50 rounded-lg p-4 text-center space-y-2">
      <div className="flex justify-center text-primary">{icon}</div>
      <p className="text-display text-2xl text-foreground">{count}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="w-full bg-muted rounded-full h-2">
        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">{pct}% of {target}</p>
    </div>
  );
}
