import { useMemo, useState } from 'react';
import { useSharpness } from '@/contexts/SharpnessContext';
import { useSession } from '@/contexts/SessionContext';
import { computeDualTaskScore, computeChoiceRTScore, computeCategorySwitchScore, computeSharpnessPillarScore } from '@/lib/sharpness-scoring';
import { savePillarScore, saveParticipant } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Save, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SharpnessScoreOutput() {
  const { state, resetSharpness } = useSharpness();
  const { participant, isPractice, currentSessionNumber } = useSession();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  const dualTask = useMemo(() => computeDualTaskScore(state.blockALog, state.blockBLog, state.blockCLog), [state.blockALog, state.blockBLog, state.blockCLog]);
  const choiceRT = useMemo(() => computeChoiceRTScore(state.choiceRTLog), [state.choiceRTLog]);
  const categorySwitch = useMemo(() => computeCategorySwitchScore(state.categorySwitchLog), [state.categorySwitchLog]);
  const pillarScore = useMemo(() => computeSharpnessPillarScore(dualTask.dualTaskScore, choiceRT.choiceRTScore, categorySwitch.categorySwitchingScore), [dualTask, choiceRT, categorySwitch]);

  const testDuration = state.testStartTime && state.testEndTime
    ? Math.round((new Date(state.testEndTime).getTime() - new Date(state.testStartTime).getTime()) / 1000)
    : 0;

  const handleSave = () => {
    const existing = JSON.parse(localStorage.getItem('bfs_sharpness_sessions') || '[]');
    existing.push({
      participant_id: participant?.participant_id,
      session_number: currentSessionNumber,
      timestamp: new Date().toISOString(),
      practice: isPractice,
      dual_task: dualTask,
      choice_rt: choiceRT,
      category_switching: categorySwitch,
      sharpness_pillar_score: pillarScore,
    });
    localStorage.setItem('bfs_sharpness_sessions', JSON.stringify(existing));
    if (participant) {
      savePillarScore(participant.participant_id, currentSessionNumber, {
        sharpness_raw: pillarScore,
        sharpness_simon_effect_ms: choiceRT.simonEffect,
        sharpness_rt_switch_cost_ms: categorySwitch.rtSwitchCost,
      });
      // Update participant metadata
      const updatedP = { ...participant };
      if (currentSessionNumber > updatedP.session_count) {
        updatedP.session_count = currentSessionNumber;
      }
      updatedP.last_session_date = new Date().toISOString().split('T')[0];
      saveParticipant(updatedP);
    }
    setSaved(true);
  };

  const handleBackToHub = () => {
    resetSharpness();
    navigate('/');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 px-6 py-6 max-w-2xl mx-auto w-full space-y-5 overflow-y-auto">
        <div className="text-center space-y-1">
          <h1 className="text-display text-2xl text-foreground">SHARPNESS TEST COMPLETE</h1>
          <p className="text-sm text-muted-foreground">Session {currentSessionNumber}</p>
          {isPractice && <span className="inline-block px-3 py-1 bg-warning/10 text-warning text-sm rounded-full font-medium">Practice</span>}
        </div>

        <div className="card-elevated p-4 space-y-2">
          <InfoRow label="Participant" value={participant?.participant_id || ''} />
          <InfoRow label="Session" value={`Session ${currentSessionNumber}`} />
          <InfoRow label="Test duration" value={`${Math.floor(testDuration / 60)} min ${testDuration % 60} sec`} />
        </div>

        {/* Dual Task */}
        <div className="card-elevated p-4 space-y-2">
          <h3 className="text-display text-sm text-foreground">DUAL TASK</h3>
          <InfoRow label="Visual baseline" value={`${(dualTask.blockA.baselineAccuracy * 100).toFixed(1)}%`} />
          <InfoRow label="Auditory baseline" value={`${(dualTask.blockB.baselineAccuracy * 100).toFixed(1)}%`} />
          <InfoRow label="Visual dual-task" value={`${(dualTask.blockC.visualDualAccuracy * 100).toFixed(1)}%`} />
          <InfoRow label="Auditory dual-task" value={`${(dualTask.blockC.auditoryDualAccuracy * 100).toFixed(1)}%`} />
          <InfoRow label="Visual cost" value={`${(dualTask.visualDualTaskCost * 100).toFixed(1)}%`} />
          <InfoRow label="Auditory cost" value={`${(dualTask.auditoryDualTaskCost * 100).toFixed(1)}%`} />
          <div className="border-t pt-2">
            <InfoRow label="Dual Task Score" value={`${dualTask.dualTaskScore} / 100`} />
          </div>
        </div>

        {/* Choice RT */}
        <div className="card-elevated p-4 space-y-2">
          <h3 className="text-display text-sm text-foreground">CHOICE REACTION TIME</h3>
          <InfoRow label="Compatible mean RT" value={`${choiceRT.compatibleMeanRT}ms`} />
          <InfoRow label="Incompatible mean RT" value={`${choiceRT.incompatibleMeanRT}ms`} />
          <InfoRow label="Simon Effect" value={`${choiceRT.simonEffect}ms`} />
          <InfoRow label="Accuracy" value={`${(choiceRT.overallAccuracy * 100).toFixed(1)}%`} />
          <div className="border-t pt-2">
            <InfoRow label="Choice RT Score" value={`${choiceRT.choiceRTScore} / 100`} />
          </div>
        </div>

        {/* Category Switching */}
        <div className="card-elevated p-4 space-y-2">
          <h3 className="text-display text-sm text-foreground">CATEGORY SWITCHING</h3>
          <InfoRow label="Overall accuracy" value={`${(categorySwitch.overallAccuracy * 100).toFixed(1)}%`} />
          <InfoRow label="Switch accuracy" value={`${(categorySwitch.switchAccuracy * 100).toFixed(1)}%`} />
          <InfoRow label="Stay accuracy" value={`${(categorySwitch.stayAccuracy * 100).toFixed(1)}%`} />
          <InfoRow label="Accuracy switch cost" value={`${(categorySwitch.accuracySwitchCost * 100).toFixed(1)}%`} />
          <InfoRow label="RT switch cost" value={`${categorySwitch.rtSwitchCost}ms`} />
          <div className="border-t pt-2">
            <InfoRow label="Category Switch Score" value={`${categorySwitch.categorySwitchingScore} / 100`} />
          </div>
        </div>

        {/* Pillar Score */}
        <div className="card-elevated p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Sharpness Pillar Score</p>
          <p className="text-display text-5xl text-primary">{pillarScore}<span className="text-xl text-muted-foreground"> / 100</span></p>
          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
            <span>Dual: {dualTask.dualTaskScore}</span>
            <span>Choice: {choiceRT.choiceRTScore}</span>
            <span>Switch: {categorySwitch.categorySwitchingScore}</span>
          </div>
        </div>

        {/* Script */}
        <div className="card-sunken p-4 space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Say to Participant:</p>
          <p className="text-lg text-foreground leading-relaxed">
            "Your Sharpness score is {pillarScore} out of 100."
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-4">
          {!saved ? (
            <Button variant="hero" size="xl" className="flex-1 gap-2" onClick={handleSave}>
              <Save className="w-5 h-5" /> Save Session
            </Button>
          ) : (
            <div className="w-full space-y-3">
              <div className="text-center p-4 bg-success/10 text-success rounded-lg font-medium">✓ Session saved</div>
              <Button variant="hero" size="xl" className="w-full gap-2" onClick={handleBackToHub}>
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
