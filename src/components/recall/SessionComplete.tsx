import { useMemo, useState } from 'react';
import { useRecall } from '@/contexts/RecallContext';
import { useSession } from '@/contexts/SessionContext';
import { PASSAGE_FORMS, FORM_DOMAINS, DISTRACTION_TASKS } from '@/lib/content-library';
import { Button } from '@/components/ui/button';
import { UnitCategory, SessionRecord, CategoryScore } from '@/lib/types';
import { saveSession, generateSessionId, saveParticipant, savePillarScore } from '@/lib/storage';
import { motion } from 'framer-motion';
import { Check, X, Edit3, Save, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORY_ORDER: UnitCategory[] = ['WHO', 'WHAT', 'WHERE', 'WHEN', 'SPECIFIC'];
const CAT_LABEL: Record<UnitCategory, string> = { WHO: 'Who', WHAT: 'What', WHERE: 'Where', WHEN: 'When', SPECIFIC: 'Specific' };

export default function SessionComplete() {
  const { state, goToScreen, setScoreEdited, resetRecall } = useRecall();
  const { participant, participantType, facilitator, location, assignedForm, isPractice, sessionStartTime, currentSessionNumber } = useSession();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const passage = PASSAGE_FORMS[assignedForm];
  const task = DISTRACTION_TASKS[assignedForm];
  const units = passage.scoreable_units;

  const categoryScores = useMemo(() => {
    const result: Record<string, CategoryScore> = {};
    for (const cat of CATEGORY_ORDER) {
      const catUnits = units.filter(u => u.category === cat);
      const recalled = catUnits.filter(u => state.recalledUnits.has(u.unit_id)).map(u => u.unit_id);
      const missed = catUnits.filter(u => !state.recalledUnits.has(u.unit_id)).map(u => u.unit_id);
      result[cat.toLowerCase() === 'specific' ? 'specific_detail' : cat.toLowerCase()] = {
        recalled, missed, score: recalled.length, max: catUnits.length,
      };
    }
    return result as SessionRecord['recall_test']['category_scores'];
  }, [units, state.recalledUnits]);

  const rawScore = state.recalledUnits.size;
  const pillarScore = Math.round((rawScore / 20) * 100);
  const sessionDuration = sessionStartTime ? Math.round((Date.now() - new Date(sessionStartTime).getTime()) / 1000) : 0;

  const handleEditScore = () => { setScoreEdited(); goToScreen(5); };

  const handleSave = async () => {
    if (!participant || saving) return;
    setSaving(true);

    try {
      const sessionId = await generateSessionId();
      const now = new Date().toISOString();
      const session: SessionRecord = {
        session_id: sessionId,
        participant_id: participant.participant_id,
        participant_type: participantType,
        session_number: currentSessionNumber,
        facilitator_id: facilitator?.id || '',
        location,
        timestamp_start: sessionStartTime || now,
        timestamp_end: now,
        session_duration_seconds: sessionDuration,
        practice: isPractice,
        recall_test: {
          form_id: assignedForm,
          passage_domain: FORM_DOMAINS[assignedForm],
          distraction_category: task.category,
          distraction_letter: task.letter,
          distraction_valid_count: state.distractionValidCount,
          distraction_invalid_count: state.distractionInvalidCount,
          distraction_duration_seconds: 90,
          distraction_timer_start: state.distractionTimerStart,
          one_time_prompt_used: state.oneTimePromptUsed,
          recall_duration_seconds: state.recallStartTime ? Math.round((Date.now() - new Date(state.recallStartTime).getTime()) / 1000) : 0,
          recall_timer_used: state.recallTimerUsed,
          units_recalled: Array.from(state.recalledUnits),
          units_missed: units.filter(u => !state.recalledUnits.has(u.unit_id)).map(u => u.unit_id),
          recall_order_timestamps: state.recallOrderTimestamps,
          raw_score: rawScore,
          pillar_score: pillarScore,
          fluency_score: state.distractionValidCount,
          category_scores: categoryScores,
          score_edited_before_save: state.scoreEdited,
          sync_status: 'local_only',
        },
      };

      await saveSession(session);
      await savePillarScore(participant.participant_id, currentSessionNumber, {
        recall_raw: pillarScore,
        recall_fluency: state.distractionValidCount,
      });

      const updatedP = { ...participant };
      if (currentSessionNumber > updatedP.session_count) {
        updatedP.session_count = currentSessionNumber;
      }
      updatedP.last_session_date = now.split('T')[0];
      await saveParticipant(updatedP);
      setSaved(true);
    } catch (err) {
      console.error('handleSave error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleBackToHub = () => {
    resetRecall();
    navigate('/');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-display text-2xl text-foreground">RECALL TEST COMPLETE</h1>
          <p className="text-sm text-muted-foreground">Session {currentSessionNumber}</p>
          {isPractice && <span className="inline-block px-3 py-1 bg-warning/10 text-warning text-sm rounded-full font-medium">Practice Session</span>}
        </div>

        <div className="card-elevated p-5 space-y-2">
          <InfoRow label="Participant" value={participant?.participant_id || ''} />
          <InfoRow label="Session" value={`Session ${currentSessionNumber}`} />
          <InfoRow label="Form used" value={`${assignedForm} (${FORM_DOMAINS[assignedForm]})`} />
          <InfoRow label="Session time" value={`${Math.floor(sessionDuration / 60)} min ${sessionDuration % 60} sec`} />
        </div>

        <div className="card-elevated p-8 text-center space-y-4">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Raw Score</p>
          <p className="text-display text-6xl text-primary">{rawScore}<span className="text-2xl text-muted-foreground"> / 20</span></p>
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground">Pillar Score</p>
            <p className="text-display text-3xl text-foreground">{pillarScore}<span className="text-lg text-muted-foreground"> / 100</span></p>
          </div>
        </div>

        <div className="card-elevated p-5 space-y-4">
          <h3 className="text-display text-base text-foreground">Category Breakdown</h3>
          {CATEGORY_ORDER.map(cat => {
            const key = cat.toLowerCase() === 'specific' ? 'specific_detail' : cat.toLowerCase();
            const cs = categoryScores[key as keyof typeof categoryScores];
            return (
              <div key={cat} className="flex items-center gap-3">
                <span className="w-20 text-sm text-muted-foreground">{CAT_LABEL[cat]} ({cs.max})</span>
                <div className="flex-1 flex gap-1">
                  {Array.from({ length: cs.max }).map((_, i) => (
                    <span key={i} className={`w-6 h-6 rounded flex items-center justify-center ${i < cs.score ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {i < cs.score ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    </span>
                  ))}
                </div>
                <span className="text-sm font-medium text-foreground">{cs.score} / {cs.max} {cs.score === cs.max && '✓'}</span>
              </div>
            );
          })}
          <div className="border-t pt-3">
            <InfoRow label="Distraction" value={`${state.distractionValidCount} valid responses`} />
          </div>
        </div>

        <div className="card-sunken p-5 space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Say to Participant:</p>
          <p className="text-lg text-foreground leading-relaxed">
            "Your Recall score today is {rawScore} out of 20 — that's {pillarScore} out of 100."
          </p>
        </div>

        <div className="flex gap-3">
          {!saved ? (
            <>
              <Button variant="hero" size="xl" className="flex-1 gap-2" onClick={handleSave} disabled={saving}>
                <Save className="w-5 h-5" /> {saving ? 'Saving...' : 'Save Session'}
              </Button>
              <Button variant="outline" size="xl" className="gap-2" onClick={handleEditScore}>
                <Edit3 className="w-5 h-5" /> Edit Score
              </Button>
            </>
          ) : (
            <div className="w-full space-y-3">
              <div className="text-center p-4 bg-success/10 text-success rounded-lg font-medium">✓ Session saved successfully</div>
              <Button variant="hero" size="xl" className="w-full gap-2" onClick={handleBackToHub}>
                <ArrowRight className="w-5 h-5" /> Back to Tests
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
