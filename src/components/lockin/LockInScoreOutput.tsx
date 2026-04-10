import { useMemo, useState, useEffect, useRef } from 'react';
import { useLockIn } from '@/contexts/LockInContext';
import { useSession } from '@/contexts/SessionContext';
import { computeLockInScore, computeCombinedLockInScore, computeSegments } from '@/lib/stimulus-engine';
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

  const combined = useMemo(() => computeCombinedLockInScore(state.responseLog, state.responseLog2), [state.responseLog, state.responseLog2]);
  const g1 = combined.game1;
  const g2 = combined.game2;

  const segments1 = useMemo(() => computeSegments(
    state.responseLog.map((r, i) => ({ ...r, stimulus_index: i })),
    state.responseLog.length, 3
  ), [state.responseLog]);

  const segments2 = useMemo(() => computeSegments(
    state.responseLog2.map((r, i) => ({ ...r, stimulus_index: i })),
    state.responseLog2.length, 3
  ), [state.responseLog2]);

  const degradationIndex1 = segments1.length >= 3
    ? Math.round((segments1[2].accuracy - segments1[0].accuracy) * 1000) / 10 : 0;
  const degradationIndex2 = segments2.length >= 3
    ? Math.round((segments2[2].accuracy - segments2[0].accuracy) * 1000) / 10 : 0;

  const testDuration1 = state.testStartTime && state.testEndTime
    ? Math.round((new Date(state.testEndTime).getTime() - new Date(state.testStartTime).getTime()) / 1000) : 0;
  const testDuration2 = state.testStartTime2 && state.testEndTime2
    ? Math.round((new Date(state.testEndTime2).getTime() - new Date(state.testStartTime2).getTime()) / 1000) : 0;

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    try {
      if (!participant) {
        toast.error('No participant session found. Please start a session from the hub.');
        return;
      }

      await savePillarScore(participant.participant_id, currentSessionNumber, {
        lockin_raw: combined.combinedPillarScore,
        lockin_degradation_index: degradationIndex1,
      });

      const sessionId = `${participant.participant_id}-S${currentSessionNumber}`;
      await saveSession({
        session_id: sessionId,
        participant_id: participant.participant_id,
        session_number: currentSessionNumber,
        timestamp_start: state.testStartTime || new Date().toISOString(),
        timestamp_end: state.testEndTime2 || state.testEndTime || new Date().toISOString(),
        lockin_done: true,
        lockin_test_data: {
          game1: {
            responseLog: state.responseLog,
            scores: g1,
            segments: segments1,
            degradationIndex: degradationIndex1,
          },
          game2: {
            responseLog: state.responseLog2,
            scores: g2,
            segments: segments2,
            degradationIndex: degradationIndex2,
          },
          combinedPillarScore: combined.combinedPillarScore,
          interruptionFlags: state.interruptionFlags,
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

        {/* Combined Score */}
        <div className="card-elevated p-8 text-center space-y-4">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Combined Lock-In Score</p>
          <p className="text-display text-6xl text-primary">{combined.combinedPillarScore}<span className="text-2xl text-muted-foreground"> / 100</span></p>
          <div className="flex justify-center gap-6 text-xs text-muted-foreground">
            <span>Round 1: {g1.pillarScore}/100</span>
            <span>Round 2: {g2.pillarScore}/100</span>
          </div>
          <p className="text-xs text-muted-foreground">(40% Round 1 + 60% Round 2)</p>
        </div>

        {/* Game 1 Details */}
        <div className="card-elevated p-5 space-y-3">
          <h3 className="text-display text-base text-foreground">ROUND 1 — Withhold 7→3</h3>
          <InfoRow label="Duration" value={`${Math.floor(testDuration1 / 60)}m ${testDuration1 % 60}s`} />
          <InfoRow label="Stimuli" value={String(state.responseLog.length)} />
          <InfoRow label="Hits" value={`${g1.hits}/${g1.totalNonTargets} (${(g1.hitRate * 100).toFixed(1)}%)`} />
          <InfoRow label="False Alarms" value={`${g1.falseAlarms}/${g1.totalTargets} (${(g1.faRate * 100).toFixed(1)}%)`} />
          <InfoRow label="Mean RT" value={`${g1.meanRT}ms`} />
          <InfoRow label="Score" value={`${g1.pillarScore}/100`} />
        </div>

        {/* Game 2 Details */}
        <div className="card-elevated p-5 space-y-3">
          <h3 className="text-display text-base text-foreground">ROUND 2 — Withhold 7→3 &amp; 6→5</h3>
          <InfoRow label="Duration" value={`${Math.floor(testDuration2 / 60)}m ${testDuration2 % 60}s`} />
          <InfoRow label="Stimuli" value={String(state.responseLog2.length)} />
          <InfoRow label="Hits" value={`${g2.hits}/${g2.totalNonTargets} (${(g2.hitRate * 100).toFixed(1)}%)`} />
          <InfoRow label="False Alarms" value={`${g2.falseAlarms}/${g2.totalTargets} (${(g2.faRate * 100).toFixed(1)}%)`} />
          <InfoRow label="Mean RT" value={`${g2.meanRT}ms`} />
          <InfoRow label="Score" value={`${g2.pillarScore}/100`} />
        </div>

        {/* Degradation */}
        <div className="card-elevated p-5 space-y-3">
          <h3 className="text-display text-base text-foreground">DEGRADATION</h3>
          <InfoRow label="Round 1 degradation" value={`${degradationIndex1 > 0 ? '+' : ''}${degradationIndex1}%`} />
          <InfoRow label="Round 2 degradation" value={`${degradationIndex2 > 0 ? '+' : ''}${degradationIndex2}%`} />
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
          <p className="text-lg text-foreground leading-relaxed">"Your Lock-In score is {combined.combinedPillarScore} out of 100."</p>
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
