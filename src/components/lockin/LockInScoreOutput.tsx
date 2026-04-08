import { useMemo, useState } from 'react';
import { useLockIn } from '@/contexts/LockInContext';
import { useSession } from '@/contexts/SessionContext';
import { computeLockInScore, computeSegments } from '@/lib/stimulus-engine';
import { savePillarScore, saveParticipant, saveSession } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Save, ArrowRight, Flag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function LockInScoreOutput() {
  const { state, resetLockIn } = useLockIn();
  const { participant, isPractice, currentSessionNumber } = useSession();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const scores = useMemo(() => computeLockInScore(state.responseLog), [state.responseLog]);
  const segments = useMemo(() => computeSegments(
    state.responseLog.map((r, i) => ({ ...r, stimulus_index: i })),
    state.responseLog.length, 3
  ), [state.responseLog]);

  const degradationIndex = segments.length >= 3
    ? Math.round((segments[2].accuracy - segments[0].accuracy) * 1000) / 10 : 0;

  const testDuration = state.testStartTime && state.testEndTime
    ? Math.round((new Date(state.testEndTime).getTime() - new Date(state.testStartTime).getTime()) / 1000) : 0;

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    try {
      if (!participant) {
        toast.error('No participant session found. Please start a session from the hub.');
        return;
      }

      await savePillarScore(participant.participant_id, currentSessionNumber, {
        lockin_raw: scores.pillarScore,
        lockin_degradation_index: degradationIndex,
      });

      // Update session record to mark lockin as done
      const sessionId = `${participant.participant_id}-S${currentSessionNumber}`;
      await saveSession({
        session_id: sessionId,
        participant_id: participant.participant_id,
        session_number: currentSessionNumber,
        timestamp_start: state.testStartTime || new Date().toISOString(),
        timestamp_end: state.testEndTime || new Date().toISOString(),
        lockin_done: true,
        lockin_test_data: {
          responseLog: state.responseLog,
          interruptionFlags: state.interruptionFlags,
          scores,
          segments,
          degradationIndex,
        },
        practice: isPractice,
      });

      const updatedP = { ...participant };
      if (currentSessionNumber > updatedP.session_count) {
        updatedP.session_count = currentSessionNumber;
      }
      updatedP.last_session_date = new Date().toISOString().split('T')[0];
      await saveParticipant(updatedP);

      setSaved(true);
      toast.success('Lock-In session saved successfully');
    } catch (err) {
      console.error('Lock-In save error:', err);
      toast.error('Failed to save session. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleNextOrHub = () => { resetLockIn(); navigate('/'); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-display text-2xl text-foreground">LOCK-IN TEST COMPLETE</h1>
          <p className="text-sm text-muted-foreground">Session {currentSessionNumber}</p>
          {isPractice && <span className="inline-block px-3 py-1 bg-warning/10 text-warning text-sm rounded-full font-medium">Practice</span>}
        </div>

        <div className="card-elevated p-5 space-y-2">
          <InfoRow label="Participant" value={participant?.participant_id || ''} />
          <InfoRow label="Session" value={`Session ${currentSessionNumber}`} />
          <InfoRow label="Test duration" value={`${Math.floor(testDuration / 60)} min ${testDuration % 60} sec`} />
          <InfoRow label="Total stimuli" value={String(state.responseLog.length)} />
        </div>

        <div className="card-elevated p-5 space-y-3">
          <h3 className="text-display text-base text-foreground">RAW METRICS</h3>
          <InfoRow label="Hits" value={`${scores.hits} / ${scores.totalNonTargets} (${scores.hitRate > 0 ? (scores.hitRate * 100).toFixed(1) : 0}%)`} />
          <InfoRow label="Misses" value={`${scores.misses} / ${scores.totalNonTargets} (${scores.totalNonTargets > 0 ? ((scores.misses / scores.totalNonTargets) * 100).toFixed(1) : 0}%)`} />
          <InfoRow label="False Alarms" value={`${scores.falseAlarms} / ${scores.totalTargets} (${scores.faRate > 0 ? (scores.faRate * 100).toFixed(1) : 0}%)`} />
          <InfoRow label="Mean RT" value={`${scores.meanRT}ms`} />
          <InfoRow label="RT Std Dev" value={`${scores.rtStdDev}ms`} />
        </div>

        <div className="card-elevated p-8 text-center space-y-4">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Lock-In Pillar Score</p>
          <p className="text-display text-6xl text-primary">{scores.pillarScore}<span className="text-2xl text-muted-foreground"> / 100</span></p>
          <div className="flex justify-center gap-6 text-xs text-muted-foreground">
            <span>Accuracy: {scores.accuracySubScore}</span>
            <span>Inhibition: {scores.inhibitionSubScore}</span>
            <span>Consistency: {scores.consistencySubScore}</span>
          </div>
        </div>

        <div className="card-elevated p-5 space-y-3">
          <h3 className="text-display text-base text-foreground">DEGRADATION CURVE</h3>
          {segments.map((seg, i) => (
            <InfoRow key={i} label={`Segment ${i + 1} (${seg.range_seconds[0]}-${seg.range_seconds[1]}s)`} value={`${(seg.accuracy * 100).toFixed(1)}% accuracy`} />
          ))}
          <div className="border-t pt-2">
            <InfoRow label="Degradation index" value={`${degradationIndex > 0 ? '+' : ''}${degradationIndex}%`} />
          </div>
        </div>

        {state.interruptionFlags.length > 0 && (
          <div className="card-elevated p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-warning" />
              <h3 className="text-display text-sm text-warning">{state.interruptionFlags.length} interruption(s) flagged</h3>
            </div>
          </div>
        )}

        <div className="card-sunken p-5 space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Say to Participant:</p>
          <p className="text-lg text-foreground leading-relaxed">"Your Lock-In score is {scores.pillarScore} out of 100."</p>
        </div>

        <div className="flex gap-3">
          {!saved ? (
            <Button variant="hero" size="xl" className="flex-1 gap-2" onClick={handleSave} disabled={saving}>
              <Save className="w-5 h-5" /> {saving ? 'Saving...' : 'Save Session'}
            </Button>
          ) : (
            <div className="w-full space-y-3">
              <div className="text-center p-4 bg-success/10 text-success rounded-lg font-medium">✓ Session saved</div>
              <Button variant="hero" size="xl" className="w-full gap-2" onClick={handleNextOrHub}>
                <ArrowRight className="w-5 h-5" /> Back to Hub
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
