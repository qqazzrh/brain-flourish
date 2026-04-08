import { useState, useEffect, useRef } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { computeBFS, getBFSMessage, getFacilitatorScript, BFSResult } from '@/lib/bfs-scoring';
import { getPillarScores, getAllPillarScoresForParticipant, PillarScores, getSessionByParticipant } from '@/lib/storage';
import { AgeBand, DemandProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, Minus, Download, Save, CheckCircle2, FileDown, ChevronDown, ChevronUp, Image } from 'lucide-react';
import jsPDF from 'jspdf';

type Screen = 'input' | 'participant_result' | 'facilitator_output' | 'saved';

const AGE_BANDS: AgeBand[] = ['18-24', '25-29', '30-34', '35-44', '45-54'];
const DEMAND_PROFILES: DemandProfile[] = ['HIGH', 'MODERATE', 'LOWER'];

export default function BFSScoring() {
  const { participant, currentSessionNumber } = useSession();
  const [screen, setScreen] = useState<Screen>('input');
  const [selectedSession, setSelectedSession] = useState(String(currentSessionNumber));
  const [allSessionScores, setAllSessionScores] = useState<PillarScores[]>([]);
  const [pillarScores, setPillarScores] = useState<PillarScores | null>(null);
  const [loading, setLoading] = useState(true);

  const hasDemographics = !!participant?.demographics;
  const autoAge = participant?.demographics?.age_band || '';
  const autoProfile = participant?.demographics?.demand_profile || '';

  const [ageBand, setAgeBand] = useState<AgeBand | ''>(autoAge as AgeBand | '');
  const [demandProfile, setDemandProfile] = useState<DemandProfile | ''>(autoProfile as DemandProfile | '');
  const [recallRaw, setRecallRaw] = useState('');
  const [lockinRaw, setLockinRaw] = useState('');
  const [sharpnessRaw, setSharpnessRaw] = useState('');
  const [fluencyScore, setFluencyScore] = useState('');
  const [bfsResult, setBfsResult] = useState<BFSResult | null>(null);

  // Session test data for raw breakdown
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    if (!participant) { setLoading(false); return; }
    const load = async () => {
      const [all, current] = await Promise.all([
        getAllPillarScoresForParticipant(participant.participant_id),
        getPillarScores(participant.participant_id, currentSessionNumber),
      ]);
      setAllSessionScores(all);
      setPillarScores(current);
      if (current) {
        setRecallRaw(current.recall_raw != null ? String(current.recall_raw) : '');
        setLockinRaw(current.lockin_raw != null ? String(current.lockin_raw) : '');
        setSharpnessRaw(current.sharpness_raw != null ? String(current.sharpness_raw) : '');
        setFluencyScore(current.recall_fluency != null ? String(current.recall_fluency) : '');
      }
      // Load session raw data
      try {
        const sess = await getSessionByParticipant(participant.participant_id, currentSessionNumber);
        setSessionData(sess);
      } catch {}
      setLoading(false);
    };
    load();
  }, [participant, currentSessionNumber]);

  const hasAutoScores = !!(pillarScores?.recall_raw != null || pillarScores?.lockin_raw != null || pillarScores?.sharpness_raw != null);
  const sessionNum = parseInt(selectedSession) || currentSessionNumber;

  const sessionOptions = (() => {
    const sessions: number[] = [];
    const maxSess = Math.max(currentSessionNumber, ...allSessionScores.map(s => s.session_number));
    for (let i = 1; i <= maxSess; i++) sessions.push(i);
    return sessions;
  })();

  const handleSessionChange = async (val: string) => {
    setSelectedSession(val);
    const num = parseInt(val);
    const scores = await getPillarScores(participant?.participant_id || '', num);
    setPillarScores(scores);
    setRecallRaw(scores?.recall_raw != null ? String(scores.recall_raw) : '');
    setLockinRaw(scores?.lockin_raw != null ? String(scores.lockin_raw) : '');
    setSharpnessRaw(scores?.sharpness_raw != null ? String(scores.sharpness_raw) : '');
    setFluencyScore(scores?.recall_fluency != null ? String(scores.recall_fluency) : '');
    try {
      const sess = await getSessionByParticipant(participant?.participant_id || '', num);
      setSessionData(sess);
    } catch {}
    setScreen('input');
  };

  const handleCalculate = () => {
    if (!ageBand || !demandProfile) return;
    const result = computeBFS(parseFloat(recallRaw) || 0, parseFloat(lockinRaw) || 0, parseFloat(sharpnessRaw) || 0, demandProfile, ageBand);
    if (result) { setBfsResult(result); setScreen('participant_result'); }
  };

  const canCalculate = ageBand && demandProfile && recallRaw && lockinRaw && sharpnessRaw;

  if (loading) {
    return <div className="text-center p-8 text-muted-foreground">Loading scores...</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {screen === 'input' && (
          <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-display text-2xl text-foreground">BFS Scoring</h2>
              <p className="text-sm text-muted-foreground">Session {sessionNum} scores for {participant?.participant_id || 'participant'}</p>
            </div>

            {sessionOptions.length > 1 && (
              <div className="card-elevated p-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-foreground whitespace-nowrap">View Session:</label>
                  <Select value={selectedSession} onValueChange={handleSessionChange}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {sessionOptions.map(s => {
                        const sc = allSessionScores.find(x => x.session_number === s);
                        const complete = sc?.recall_raw != null && sc?.lockin_raw != null && sc?.sharpness_raw != null;
                        const partial = sc?.recall_raw != null || sc?.lockin_raw != null || sc?.sharpness_raw != null;
                        return (
                          <SelectItem key={s} value={String(s)}>
                            Session {s} {complete ? '✓' : partial ? '(partial)' : ''}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="card-elevated p-6 space-y-4">
              <p className="text-display text-sm text-primary">PARTICIPANT BIODATA</p>
              {participant && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>ID: <strong className="text-foreground">{participant.participant_id}</strong></span>
                  {participant.demographics && <span className="ml-2">• <strong className="text-foreground">{participant.demographics.name}</strong></span>}
                </div>
              )}
              {hasDemographics && (
                <div className="bg-success/10 border border-success/20 rounded-lg px-4 py-2 text-xs text-success font-medium">
                  ✓ Biodata auto-populated from participant registration
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Age Band</label>
                  <Select value={ageBand} onValueChange={(v) => setAgeBand(v as AgeBand)} disabled={hasDemographics}>
                    <SelectTrigger className={hasDemographics ? 'bg-muted' : ''}><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>{AGE_BANDS.map(ab => <SelectItem key={ab} value={ab}>{ab}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Demand Profile</label>
                  <Select value={demandProfile} onValueChange={(v) => setDemandProfile(v as DemandProfile)} disabled={hasDemographics}>
                    <SelectTrigger className={hasDemographics ? 'bg-muted' : ''}><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>{DEMAND_PROFILES.map(dp => <SelectItem key={dp} value={dp}>{dp}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              {hasDemographics && participant?.demographics && (
                <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground pt-2 border-t">
                  <div><span className="block text-foreground font-medium">{formatOccupationLabel(participant.demographics.occupation_type)}</span>Occupation</div>
                  <div><span className="block text-foreground font-medium">{formatSeniorityLabel(participant.demographics.seniority_level)}</span>Seniority</div>
                  <div><span className="block text-foreground font-medium">{formatEducationLabel(participant.demographics.education_level)}</span>Education</div>
                </div>
              )}
            </div>

            <div className="card-elevated p-6 space-y-4">
              <p className="text-display text-sm text-primary">RAW PILLAR SCORES — SESSION {sessionNum}</p>
              {hasAutoScores && (
                <div className="bg-success/10 border border-success/20 rounded-lg px-4 py-2 text-xs text-success font-medium">
                  ✓ Scores auto-populated from completed tests
                  {pillarScores?.recall_raw != null && ' • Recall ✓'}
                  {pillarScores?.lockin_raw != null && ' • Lock-In ✓'}
                  {pillarScores?.sharpness_raw != null && ' • Sharpness ✓'}
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Recall</label>
                  <Input type="number" min="0" max="100" value={recallRaw} onChange={e => setRecallRaw(e.target.value)} placeholder="0-100" className="text-center text-lg h-12" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Lock-In</label>
                  <Input type="number" min="0" max="100" value={lockinRaw} onChange={e => setLockinRaw(e.target.value)} placeholder="0-100" className="text-center text-lg h-12" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Sharpness</label>
                  <Input type="number" min="0" max="100" value={sharpnessRaw} onChange={e => setSharpnessRaw(e.target.value)} placeholder="0-100" className="text-center text-lg h-12" />
                </div>
              </div>
            </div>

            <Button variant="hero" size="xl" className="w-full" disabled={!canCalculate} onClick={handleCalculate}>Calculate BFS</Button>
          </motion.div>
        )}

        {screen === 'participant_result' && bfsResult && (
          <ParticipantDisplay
            result={bfsResult}
            sessionNumber={sessionNum}
            ageBand={ageBand as AgeBand}
            demandProfile={demandProfile as DemandProfile}
            participantId={participant?.participant_id || ''}
            participantName={participant?.demographics?.name || ''}
            allScores={allSessionScores}
            sessionData={sessionData}
            recallRaw={parseFloat(recallRaw) || 0}
            lockinRaw={parseFloat(lockinRaw) || 0}
            sharpnessRaw={parseFloat(sharpnessRaw) || 0}
            onContinue={() => setScreen('facilitator_output')}
          />
        )}

        {screen === 'facilitator_output' && bfsResult && (
          <FacilitatorDisplay
            result={bfsResult}
            recallRaw={parseFloat(recallRaw)}
            lockinRaw={parseFloat(lockinRaw)}
            sharpnessRaw={parseFloat(sharpnessRaw)}
            fluencyScore={fluencyScore ? parseInt(fluencyScore) : undefined}
            participantId={participant?.participant_id || 'Unknown'}
            sessionNumber={sessionNum}
            allScores={allSessionScores}
            ageBand={ageBand as AgeBand}
            demandProfile={demandProfile as DemandProfile}
            onSave={() => setScreen('saved')}
          />
        )}

        {screen === 'saved' && bfsResult && (
          <SavedScreen result={bfsResult} participantId={participant?.participant_id || 'Unknown'} sessionNumber={sessionNum} onNewSession={() => setScreen('input')} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ===== SCORE BAR CHART ===== */
function ScoreBar({ label, score, target, color }: { label: string; score: number; target: number; color: string }) {
  const barRef = useRef<HTMLDivElement>(null);
  const scorePct = Math.min(score, 100);
  const targetPct = Math.min(target, 100);
  const isAbove = score >= target;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <span className="text-display text-sm text-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-display text-2xl ${isAbove ? 'text-success' : 'text-destructive'}`}>{score}</span>
          <span className="text-sm text-muted-foreground">/ 100</span>
        </div>
      </div>
      <div ref={barRef} className="h-8 bg-muted rounded-lg overflow-hidden relative">
        {/* Score fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${scorePct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-lg ${color}`}
        />
        {/* Remaining capacity (gray) */}
        <div className="absolute top-0 right-0 h-full bg-muted" style={{ width: `${100 - scorePct}%` }} />
        {/* Target line */}
        <div
          className="absolute top-0 h-full w-[3px] bg-success z-10"
          style={{ left: `${targetPct}%` }}
        >
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-success whitespace-nowrap">
            {target}
          </div>
        </div>
      </div>
      {!isAbove && (
        <p className="text-xs text-destructive font-medium">
          {target - score} points below minimum threshold
        </p>
      )}
    </div>
  );
}

/* ===== PNG EXPORT ===== */
function drawRawDataOnCanvas(ctx: CanvasRenderingContext2D, w: number, startY: number, sessionData: any, recallRaw: number, lockinRaw: number, sharpnessRaw: number): number {
  let y = startY;
  const margin = 80;

  // Section header
  ctx.font = 'bold 28px "Space Grotesk", system-ui, sans-serif';
  ctx.fillStyle = '#f8fafc';
  ctx.textAlign = 'left';
  ctx.fillText('RAW PERFORMANCE DATA', margin, y);
  y += 24;
  ctx.font = '16px "IBM Plex Sans", system-ui, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Actual test performance — no algorithms or percentiles', margin, y);
  y += 30;

  const drawRow = (label: string, value: string, yPos: number) => {
    ctx.font = '18px "IBM Plex Sans", system-ui, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText(label, margin + 20, yPos);
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'right';
    ctx.fillText(value, w - margin - 20, yPos);
    return yPos + 26;
  };

  const drawSectionHeader = (label: string, score: number, color: string, yPos: number) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(margin + 10, yPos - 5, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = 'bold 20px "Space Grotesk", system-ui, sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'left';
    ctx.fillText(label, margin + 26, yPos);
    ctx.font = 'bold 22px "Space Grotesk", system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(String(score), w - margin - 20, yPos);
    return yPos + 30;
  };

  const recallData = sessionData?.recall_test_data;
  const lockinData = sessionData?.lockin_test_data;
  const sharpnessData = sessionData?.sharpness_test_data;

  // RECALL
  y = drawSectionHeader('RECALL', recallRaw, '#3b82f6', y);
  if (recallData) {
    const totalUnits = (recallData.units_recalled?.length || 0) + (recallData.units_missed?.length || 0) || 20;
    y = drawRow('Units recalled', `${recallData.raw_score} / ${totalUnits}`, y);
    y = drawRow('Units missed', String(recallData.units_missed?.length || 0), y);
    y = drawRow('Distraction valid answers', `${recallData.distraction_valid_count} in 90s`, y);
    y = drawRow('Distraction repeats', String(recallData.distraction_invalid_count || 0), y);
    y = drawRow('Recall duration', `${recallData.recall_duration_seconds}s`, y);
    y = drawRow('Prompt used', recallData.one_time_prompt_used ? 'Yes' : 'No', y);
    if (recallData.category_scores) {
      for (const [cat, cs] of Object.entries(recallData.category_scores) as [string, any][]) {
        y = drawRow(`  ${cat.replace('_', ' ')}`, `${cs.score} / ${cs.max}`, y);
      }
    }
  } else {
    y = drawRow('No detailed data', '', y);
  }
  y += 10;

  // Separator
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(margin, y); ctx.lineTo(w - margin, y); ctx.stroke();
  y += 20;

  // LOCK-IN
  y = drawSectionHeader('LOCK-IN', lockinRaw, '#8b5cf6', y);
  if (lockinData?.scores) {
    y = drawRow('Total stimuli', String(lockinData.scores.totalNonTargets + lockinData.scores.totalTargets), y);
    y = drawRow('Hits (correct taps)', `${lockinData.scores.hits} / ${lockinData.scores.totalNonTargets}`, y);
    y = drawRow('Misses (no tap)', String(lockinData.scores.misses), y);
    y = drawRow('False alarms', `${lockinData.scores.falseAlarms} / ${lockinData.scores.totalTargets}`, y);
    y = drawRow('Mean reaction time', `${lockinData.scores.meanRT}ms`, y);
    y = drawRow('RT consistency (std dev)', `${lockinData.scores.rtStdDev}ms`, y);
    if (lockinData.segments?.length >= 3) {
      for (let i = 0; i < lockinData.segments.length; i++) {
        const seg = lockinData.segments[i];
        y = drawRow(`Stage ${i + 1} (${seg.range_seconds?.[0] || i * 30}–${seg.range_seconds?.[1] || (i + 1) * 30}s)`, `${(seg.accuracy * 100).toFixed(1)}% accuracy`, y);
      }
      y = drawRow('Degradation index', `${lockinData.degradationIndex > 0 ? '+' : ''}${lockinData.degradationIndex}%`, y);
    }
  } else {
    y = drawRow('No detailed data', '', y);
  }
  y += 10;

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(margin, y); ctx.lineTo(w - margin, y); ctx.stroke();
  y += 20;

  // SHARPNESS
  y = drawSectionHeader('SHARPNESS', sharpnessRaw, '#f59e0b', y);
  if (sharpnessData) {
    if (sharpnessData.dualTask) {
      ctx.font = 'bold 14px "IBM Plex Sans", system-ui, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'left';
      ctx.fillText('DUAL TASK', margin + 20, y); y += 22;
      y = drawRow('Visual baseline accuracy', `${(sharpnessData.dualTask.blockA.baselineAccuracy * 100).toFixed(1)}%`, y);
      y = drawRow('Visual baseline hits', `${sharpnessData.dualTask.blockA.correctTaps} / ${sharpnessData.dualTask.blockA.evenStimuli}`, y);
      y = drawRow('Auditory baseline accuracy', `${(sharpnessData.dualTask.blockB.baselineAccuracy * 100).toFixed(1)}%`, y);
      y = drawRow('Auditory baseline hits', `${sharpnessData.dualTask.blockB.correctTaps} / ${sharpnessData.dualTask.blockB.highTones}`, y);
      y = drawRow('Dual-task visual hits', `${sharpnessData.dualTask.blockC.visualCorrectTaps} / ${sharpnessData.dualTask.blockC.visualEvenStimuli}`, y);
      y = drawRow('Dual-task auditory hits', `${sharpnessData.dualTask.blockC.auditoryCorrectTaps} / ${sharpnessData.dualTask.blockC.auditoryHighTones}`, y);
      y = drawRow('Visual cost', `${(sharpnessData.dualTask.visualDualTaskCost * 100).toFixed(1)}%`, y);
      y = drawRow('Auditory cost', `${(sharpnessData.dualTask.auditoryDualTaskCost * 100).toFixed(1)}%`, y);
    }
    if (sharpnessData.choiceRT) {
      ctx.font = 'bold 14px "IBM Plex Sans", system-ui, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'left';
      ctx.fillText('CHOICE REACTION TIME', margin + 20, y); y += 22;
      y = drawRow('Total trials', String(sharpnessData.choiceRT.totalTrials), y);
      y = drawRow('Correct responses', `${sharpnessData.choiceRT.correctResponses} / ${sharpnessData.choiceRT.totalTrials}`, y);
      y = drawRow('Compatible mean RT', `${sharpnessData.choiceRT.compatibleMeanRT}ms`, y);
      y = drawRow('Incompatible mean RT', `${sharpnessData.choiceRT.incompatibleMeanRT}ms`, y);
      y = drawRow('Simon Effect', `${sharpnessData.choiceRT.simonEffect}ms`, y);
    }
    if (sharpnessData.categorySwitch) {
      ctx.font = 'bold 14px "IBM Plex Sans", system-ui, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'left';
      ctx.fillText('CATEGORY SWITCHING', margin + 20, y); y += 22;
      y = drawRow('Total trials', String(sharpnessData.categorySwitch.totalTrials), y);
      y = drawRow('Correct responses', `${sharpnessData.categorySwitch.correctResponses} / ${sharpnessData.categorySwitch.totalTrials}`, y);
      y = drawRow('Switch trial accuracy', `${sharpnessData.categorySwitch.switchCorrect} / ${sharpnessData.categorySwitch.switchTrials}`, y);
      y = drawRow('Stay trial accuracy', `${sharpnessData.categorySwitch.stayCorrect} / ${sharpnessData.categorySwitch.stayTrials}`, y);
      y = drawRow('Switch cost (RT)', `${sharpnessData.categorySwitch.rtSwitchCost}ms`, y);
    }
  } else {
    y = drawRow('No detailed data', '', y);
  }

  return y;
}

async function exportScoreCardPNG(
  result: BFSResult,
  participantId: string,
  participantName: string,
  sessionNumber: number,
  sessionData?: any,
  recallRaw?: number,
  lockinRaw?: number,
  sharpnessRaw?: number,
) {
  // First pass: measure height needed for raw data
  const measureCanvas = document.createElement('canvas');
  measureCanvas.width = 1200;
  measureCanvas.height = 4000;
  const measureCtx = measureCanvas.getContext('2d')!;
  const rawDataEndY = drawRawDataOnCanvas(measureCtx, 1200, 0, sessionData, recallRaw || 0, lockinRaw || 0, sharpnessRaw || 0);

  const canvas = document.createElement('canvas');
  const w = 1200;
  const baseH = 950; // space for header + bars + message
  const h = baseH + rawDataEndY + 80; // add raw data height + footer
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, w, h);

  // Header gradient accent
  const grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, '#0d9488');
  grad.addColorStop(1, '#14b8a6');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, 6);

  // Title
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 48px "Space Grotesk", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('BRAIN FITNESS SCORE', w / 2, 80);

  ctx.font = '24px "IBM Plex Sans", system-ui, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Reclaim Your Brain', w / 2, 120);

  // Participant info
  ctx.font = '20px "IBM Plex Sans", system-ui, sans-serif';
  ctx.fillStyle = '#64748b';
  const nameLabel = participantName ? `${participantName} (${participantId})` : participantId;
  ctx.fillText(`${nameLabel}  •  Session ${sessionNumber}  •  ${new Date().toLocaleDateString()}`, w / 2, 165);

  // Divider
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 195);
  ctx.lineTo(w - 80, 195);
  ctx.stroke();

  // Composite score
  const compositeY = 320;
  const compositeColor = result.bfsComposite >= 75 ? '#10b981' : '#ef4444';
  ctx.font = 'bold 160px "Space Grotesk", system-ui, sans-serif';
  ctx.fillStyle = compositeColor;
  ctx.textAlign = 'center';
  ctx.fillText(String(result.bfsComposite), w / 2, compositeY);

  ctx.font = '28px "IBM Plex Sans", system-ui, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('BFS COMPOSITE  /  100', w / 2, compositeY + 40);

  ctx.font = '22px "IBM Plex Sans", system-ui, sans-serif';
  const gapColor = result.bfsGap >= 0 ? '#10b981' : '#ef4444';
  ctx.fillStyle = gapColor;
  const gapText = result.bfsGap >= 0 ? `+${result.bfsGap} above minimum` : `${Math.abs(result.bfsGap)} below minimum`;
  ctx.fillText(`Minimum: ${result.bfsTarget}  |  ${gapText}`, w / 2, compositeY + 80);

  // Pillar bars
  const barStartY = 460;
  const barMargin = 80;
  const barW = w - barMargin * 2;
  const barH = 48;
  const barGap = 100;

  const pillars = [
    { label: 'RECALL', score: result.recallBFS, color: '#3b82f6' },
    { label: 'LOCK-IN', score: result.lockinBFS, color: '#8b5cf6' },
    { label: 'SHARPNESS', score: result.sharpnessBFS, color: '#f59e0b' },
  ];

  pillars.forEach((p, i) => {
    const y = barStartY + i * barGap;
    ctx.font = 'bold 22px "Space Grotesk", system-ui, sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'left';
    ctx.fillText(p.label, barMargin, y - 8);
    ctx.textAlign = 'right';
    ctx.fillStyle = p.score >= 75 ? '#10b981' : '#ef4444';
    ctx.font = 'bold 28px "Space Grotesk", system-ui, sans-serif';
    ctx.fillText(String(p.score), w - barMargin, y - 8);
    ctx.fillStyle = '#1e293b';
    ctx.beginPath(); ctx.roundRect(barMargin, y, barW, barH, 8); ctx.fill();
    const fillW = (p.score / 100) * barW;
    ctx.fillStyle = p.score >= 75 ? '#10b981' : '#ef4444';
    ctx.beginPath(); ctx.roundRect(barMargin, y, fillW, barH, 8); ctx.fill();
    const threshX = barMargin + (75 / 100) * barW;
    ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(threshX, y - 4); ctx.lineTo(threshX, y + barH + 4); ctx.stroke();
    ctx.font = '12px "IBM Plex Sans", system-ui, sans-serif';
    ctx.fillStyle = '#22c55e'; ctx.textAlign = 'center';
    ctx.fillText('MIN 75', threshX, y + barH + 18);
  });

  // Message
  const msgY = barStartY + 3 * barGap + 40;
  ctx.fillStyle = '#334155';
  ctx.beginPath(); ctx.roundRect(barMargin, msgY, barW, 100, 12); ctx.fill();
  ctx.font = '20px "IBM Plex Sans", system-ui, sans-serif';
  ctx.fillStyle = '#e2e8f0'; ctx.textAlign = 'center';
  const msg = getBFSMessage(result.bfsStatus);
  const words = msg.split(' ');
  let line = '';
  let lineY = msgY + 35;
  const maxLineW = barW - 40;
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxLineW && line) {
      ctx.fillText(line.trim(), w / 2, lineY); line = word + ' '; lineY += 28;
    } else { line = test; }
  }
  ctx.fillText(line.trim(), w / 2, lineY);

  // Separator before raw data
  const rawStartY = msgY + 140;
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(barMargin, rawStartY); ctx.lineTo(w - barMargin, rawStartY); ctx.stroke();

  // Draw raw performance data
  drawRawDataOnCanvas(ctx, w, rawStartY + 30, sessionData, recallRaw || 0, lockinRaw || 0, sharpnessRaw || 0);

  // Footer
  ctx.font = '16px "IBM Plex Sans", system-ui, sans-serif';
  ctx.fillStyle = '#475569'; ctx.textAlign = 'center';
  ctx.fillText('Reclaim Your Brain  |  Brain Fitness Score v2.0  |  reclaimyourbrain.com', w / 2, h - 40);

  // Download
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${participantId}_BFS_Session${sessionNumber}.png`;
  a.click();
}

/* ===== RAW PERFORMANCE BREAKDOWN ===== */
function RawBreakdown({ sessionData, recallRaw, lockinRaw, sharpnessRaw }: {
  sessionData: any; recallRaw: number; lockinRaw: number; sharpnessRaw: number;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const recallData = sessionData?.recall_test_data;
  const lockinData = sessionData?.lockin_test_data;
  const sharpnessData = sessionData?.sharpness_test_data;

  return (
    <div className="space-y-3">
      <h3 className="text-display text-base text-foreground">RAW PERFORMANCE DATA</h3>
      <p className="text-xs text-muted-foreground">Actual test performance — no algorithms or percentiles</p>

      {/* RECALL */}
      <div className="card-elevated overflow-hidden">
        <button onClick={() => setExpanded(expanded === 'recall' ? null : 'recall')} className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-info" />
            <span className="text-display text-sm text-foreground">RECALL</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-display text-lg text-foreground">{recallRaw}</span>
            {expanded === 'recall' ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </button>
        {expanded === 'recall' && recallData && (
          <div className="px-4 pb-4 space-y-2 border-t">
            <div className="pt-3 space-y-1.5">
              <InfoRow label="Units recalled" value={`${recallData.raw_score} / ${recallData.units_recalled?.length + recallData.units_missed?.length || 20}`} />
              <InfoRow label="Units missed" value={String(recallData.units_missed?.length || 0)} />
              <InfoRow label="Distraction valid answers" value={`${recallData.distraction_valid_count} in 90s`} />
              <InfoRow label="Distraction repeats" value={String(recallData.distraction_invalid_count || 0)} />
              <InfoRow label="Recall duration" value={`${recallData.recall_duration_seconds}s`} />
              <InfoRow label="Prompt used" value={recallData.one_time_prompt_used ? 'Yes' : 'No'} />
              {recallData.category_scores && (
                <div className="border-t pt-2 mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Category Hits / Total:</p>
                  {Object.entries(recallData.category_scores).map(([cat, cs]: [string, any]) => (
                    <div key={cat} className="flex justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{cat.replace('_', ' ')}</span>
                      <span className="text-foreground font-medium">{cs.score} / {cs.max}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {expanded === 'recall' && !recallData && (
          <div className="px-4 pb-4 border-t pt-3">
            <p className="text-sm text-muted-foreground">No detailed data saved for this session.</p>
          </div>
        )}
      </div>

      {/* LOCK-IN */}
      <div className="card-elevated overflow-hidden">
        <button onClick={() => setExpanded(expanded === 'lockin' ? null : 'lockin')} className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[hsl(270,50%,55%)]" />
            <span className="text-display text-sm text-foreground">LOCK-IN</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-display text-lg text-foreground">{lockinRaw}</span>
            {expanded === 'lockin' ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </button>
        {expanded === 'lockin' && lockinData && (
          <div className="px-4 pb-4 space-y-2 border-t">
            <div className="pt-3 space-y-1.5">
              {lockinData.scores && (
                <>
                  <InfoRow label="Total stimuli" value={String(lockinData.scores.totalNonTargets + lockinData.scores.totalTargets)} />
                  <InfoRow label="Hits (correct taps)" value={`${lockinData.scores.hits} / ${lockinData.scores.totalNonTargets}`} />
                  <InfoRow label="Misses (no tap)" value={String(lockinData.scores.misses)} />
                  <InfoRow label="False alarms (tapped on 7→3)" value={`${lockinData.scores.falseAlarms} / ${lockinData.scores.totalTargets}`} />
                  <InfoRow label="Mean reaction time" value={`${lockinData.scores.meanRT}ms`} />
                  <InfoRow label="RT consistency (std dev)" value={`${lockinData.scores.rtStdDev}ms`} />
                </>
              )}
              {lockinData.segments && lockinData.segments.length >= 3 && (
                <div className="border-t pt-2 mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Performance by 30-second stage:</p>
                  {lockinData.segments.map((seg: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Stage {i + 1} ({seg.range_seconds?.[0] || i * 30}–{seg.range_seconds?.[1] || (i + 1) * 30}s)
                      </span>
                      <span className="text-foreground font-medium">
                        {(seg.accuracy * 100).toFixed(1)}% accuracy
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm border-t pt-1">
                    <span className="text-muted-foreground">Degradation index</span>
                    <span className={`font-medium ${lockinData.degradationIndex < 0 ? 'text-destructive' : 'text-success'}`}>
                      {lockinData.degradationIndex > 0 ? '+' : ''}{lockinData.degradationIndex}%
                    </span>
                  </div>
                </div>
              )}
              {lockinData.interruptionFlags?.length > 0 && (
                <div className="border-t pt-2 mt-2">
                  <InfoRow label="Interruptions flagged" value={String(lockinData.interruptionFlags.length)} />
                </div>
              )}
            </div>
          </div>
        )}
        {expanded === 'lockin' && !lockinData && (
          <div className="px-4 pb-4 border-t pt-3">
            <p className="text-sm text-muted-foreground">No detailed data saved for this session.</p>
          </div>
        )}
      </div>

      {/* SHARPNESS */}
      <div className="card-elevated overflow-hidden">
        <button onClick={() => setExpanded(expanded === 'sharpness' ? null : 'sharpness')} className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-display text-sm text-foreground">SHARPNESS</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-display text-lg text-foreground">{sharpnessRaw}</span>
            {expanded === 'sharpness' ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </button>
        {expanded === 'sharpness' && sharpnessData && (
          <div className="px-4 pb-4 space-y-3 border-t">
            <div className="pt-3">
              {/* Dual Task */}
              {sharpnessData.dualTask && (
                <div className="space-y-1.5 mb-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase">Dual Task</p>
                  <InfoRow label="Visual baseline accuracy" value={`${(sharpnessData.dualTask.blockA.baselineAccuracy * 100).toFixed(1)}%`} />
                  <InfoRow label="Visual baseline hits" value={`${sharpnessData.dualTask.blockA.correctTaps} / ${sharpnessData.dualTask.blockA.evenStimuli}`} />
                  <InfoRow label="Auditory baseline accuracy" value={`${(sharpnessData.dualTask.blockB.baselineAccuracy * 100).toFixed(1)}%`} />
                  <InfoRow label="Auditory baseline hits" value={`${sharpnessData.dualTask.blockB.correctTaps} / ${sharpnessData.dualTask.blockB.highTones}`} />
                  <InfoRow label="Dual-task visual hits" value={`${sharpnessData.dualTask.blockC.visualCorrectTaps} / ${sharpnessData.dualTask.blockC.visualEvenStimuli}`} />
                  <InfoRow label="Dual-task auditory hits" value={`${sharpnessData.dualTask.blockC.auditoryCorrectTaps} / ${sharpnessData.dualTask.blockC.auditoryHighTones}`} />
                  <InfoRow label="Visual cost" value={`${(sharpnessData.dualTask.visualDualTaskCost * 100).toFixed(1)}%`} />
                  <InfoRow label="Auditory cost" value={`${(sharpnessData.dualTask.auditoryDualTaskCost * 100).toFixed(1)}%`} />
                </div>
              )}

              {/* Choice RT */}
              {sharpnessData.choiceRT && (
                <div className="space-y-1.5 mb-3 border-t pt-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase">Choice Reaction Time</p>
                  <InfoRow label="Total trials" value={String(sharpnessData.choiceRT.totalTrials)} />
                  <InfoRow label="Correct responses" value={`${sharpnessData.choiceRT.correctResponses} / ${sharpnessData.choiceRT.totalTrials}`} />
                  <InfoRow label="Compatible mean RT" value={`${sharpnessData.choiceRT.compatibleMeanRT}ms`} />
                  <InfoRow label="Incompatible mean RT" value={`${sharpnessData.choiceRT.incompatibleMeanRT}ms`} />
                  <InfoRow label="Simon Effect (conflict cost)" value={`${sharpnessData.choiceRT.simonEffect}ms`} />
                </div>
              )}

              {/* Category Switch */}
              {sharpnessData.categorySwitch && (
                <div className="space-y-1.5 border-t pt-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase">Category Switching</p>
                  <InfoRow label="Total trials" value={String(sharpnessData.categorySwitch.totalTrials)} />
                  <InfoRow label="Correct responses" value={`${sharpnessData.categorySwitch.correctResponses} / ${sharpnessData.categorySwitch.totalTrials}`} />
                  <InfoRow label="Switch trial accuracy" value={`${sharpnessData.categorySwitch.switchCorrect} / ${sharpnessData.categorySwitch.switchTrials}`} />
                  <InfoRow label="Stay trial accuracy" value={`${sharpnessData.categorySwitch.stayCorrect} / ${sharpnessData.categorySwitch.stayTrials}`} />
                  <InfoRow label="Switch cost (RT)" value={`${sharpnessData.categorySwitch.rtSwitchCost}ms`} />
                </div>
              )}
            </div>
          </div>
        )}
        {expanded === 'sharpness' && !sharpnessData && (
          <div className="px-4 pb-4 border-t pt-3">
            <p className="text-sm text-muted-foreground">No detailed data saved for this session.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== PARTICIPANT RESULT DISPLAY ===== */
function ParticipantDisplay({ result, sessionNumber, participantId, participantName, ageBand, demandProfile, allScores, sessionData, recallRaw, lockinRaw, sharpnessRaw, onContinue }: {
  result: BFSResult; sessionNumber: number; participantId: string; participantName: string; ageBand: AgeBand; demandProfile: DemandProfile; allScores: PillarScores[]; sessionData: any; recallRaw: number; lockinRaw: number; sharpnessRaw: number; onContinue: () => void;
}) {
  const sessionBFS: { session: number; bfs: number }[] = allScores
    .filter(s => s.recall_raw != null && s.lockin_raw != null && s.sharpness_raw != null)
    .map(s => {
      const r = computeBFS(s.recall_raw!, s.lockin_raw!, s.sharpness_raw!, demandProfile, ageBand);
      return { session: s.session_number, bfs: r?.bfsComposite || 0 };
    });

  const lastBFS = sessionBFS.length >= 2 ? sessionBFS[sessionBFS.length - 2].bfs : null;
  const movement = lastBFS != null ? result.bfsComposite - lastBFS : null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-1">Session {sessionNumber}</p>
        <h2 className="text-display text-2xl text-foreground">YOUR BRAIN FITNESS SCORE</h2>
      </div>

      {/* Composite Score - Hero */}
      <div className="card-elevated p-8 text-center space-y-3">
        <motion.p
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className={`text-display text-7xl ${result.bfsComposite >= 75 ? 'text-success' : 'text-destructive'}`}
        >
          {result.bfsComposite}
        </motion.p>
        <p className="text-muted-foreground text-lg">out of 100</p>
        <div className="flex justify-center gap-6 pt-2">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Minimum</p>
            <p className="text-display text-lg text-success">{result.bfsTarget}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Gap</p>
            <p className={`text-display text-lg ${result.bfsGap < 0 ? 'text-destructive' : 'text-success'}`}>
              {result.bfsGap > 0 ? '+' : ''}{result.bfsGap}
            </p>
          </div>
        </div>
        {result.bfsComposite < 75 && (
          <div className="bg-destructive/10 rounded-lg px-4 py-2 mt-3">
            <p className="text-sm text-destructive font-medium">
              {Math.abs(result.bfsGap)}-point gap — this is why you're here
            </p>
          </div>
        )}
      </div>

      {/* Pillar Bars - New Design */}
      <div className="space-y-5">
        <ScoreBar label="RECALL" score={result.recallBFS} target={75} color="bg-info" />
        <ScoreBar label="LOCK-IN" score={result.lockinBFS} target={75} color="bg-[hsl(270,50%,55%)]" />
        <ScoreBar label="SHARPNESS" score={result.sharpnessBFS} target={75} color="bg-warning" />
      </div>

      {/* Movement */}
      {movement != null && (
        <div className="card-elevated p-4 flex items-center justify-center gap-6">
          <div className="text-center"><p className="text-xs text-muted-foreground">Previous</p><p className="text-display text-lg text-foreground">{lastBFS}</p></div>
          <div className="text-center"><p className="text-xs text-muted-foreground">Today</p><p className="text-display text-lg text-foreground">{result.bfsComposite}</p></div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Movement</p>
            <div className="flex items-center justify-center gap-1">
              {movement > 0 ? <ArrowUp className="w-4 h-4 text-success" /> : movement < 0 ? <ArrowDown className="w-4 h-4 text-destructive" /> : <Minus className="w-4 h-4 text-muted-foreground" />}
              <p className={`text-display text-lg ${movement > 0 ? 'text-success' : movement < 0 ? 'text-destructive' : 'text-foreground'}`}>{movement > 0 ? '+' : ''}{movement}</p>
            </div>
          </div>
        </div>
      )}

      {/* Message */}
      <div className="card-sunken p-5 space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
        <p className="text-base text-foreground leading-relaxed">{getBFSMessage(result.bfsStatus)}</p>
      </div>

      {/* Raw Breakdown */}
      <RawBreakdown sessionData={sessionData} recallRaw={recallRaw} lockinRaw={lockinRaw} sharpnessRaw={sharpnessRaw} />

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="xl"
          className="flex-1 gap-2"
          onClick={() => exportScoreCardPNG(result, participantId, participantName, sessionNumber, sessionData, recallRaw, lockinRaw, sharpnessRaw)}
        >
          <Image className="w-5 h-5" /> Share PNG
        </Button>
        <Button
          variant="outline"
          size="xl"
          className="gap-2"
          onClick={() => generateScorePDF(result, sessionNumber, participantId, allScores, ageBand, demandProfile, sessionData, recallRaw, lockinRaw, sharpnessRaw)}
        >
          <FileDown className="w-5 h-5" /> PDF
        </Button>
        <Button variant="hero" size="xl" className="flex-1" onClick={onContinue}>Facilitator View</Button>
      </div>
    </motion.div>
  );
}

function generateScorePDF(result: BFSResult, sessionNumber: number, participantId: string, allScores: PillarScores[], ageBand: AgeBand, demandProfile: DemandProfile) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 25;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('BRAIN FITNESS SCORE REPORT', w / 2, y, { align: 'center' });
  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Participant: ${participantId}  |  Session ${sessionNumber}  |  ${new Date().toLocaleDateString()}`, w / 2, y, { align: 'center' });
  y += 12;

  doc.setDrawColor(200);
  doc.line(margin, y, w - margin, y);
  y += 10;

  const pillars = [
    { label: 'RECALL', score: result.recallBFS },
    { label: 'LOCK-IN', score: result.lockinBFS },
    { label: 'SHARPNESS', score: result.sharpnessBFS },
  ];

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PILLAR SCORES', margin, y);
  y += 8;

  for (const p of pillars) {
    const barW = w - margin * 2 - 50;
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(margin, y, barW, 8, 2, 2, 'F');
    const fillW = Math.min(p.score / 100, 1) * barW;
    const color = p.score >= 75 ? [16, 185, 129] : [239, 68, 68];
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(margin, y, fillW, 8, 2, 2, 'F');
    // Threshold line
    const threshX = margin + (75 / 100) * barW;
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(0.5);
    doc.line(threshX, y - 1, threshX, y + 9);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30);
    doc.text(p.label, margin + barW + 4, y + 6);
    doc.text(String(p.score), w - margin, y + 6, { align: 'right' });
    y += 14;
  }

  y += 4;
  doc.setDrawColor(200);
  doc.line(margin, y, w - margin, y);
  y += 10;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('BFS COMPOSITE', margin, y);
  doc.setFontSize(28);
  doc.text(`${result.bfsComposite}`, w - margin, y, { align: 'right' });
  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Minimum: ${result.bfsTarget}  |  Gap: ${result.bfsGap > 0 ? '+' : ''}${result.bfsGap} points`, margin, y);
  y += 12;

  doc.setDrawColor(200);
  doc.line(margin, y, w - margin, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  const msg = getBFSMessage(result.bfsStatus);
  const msgLines = doc.splitTextToSize(msg, w - margin * 2);
  doc.text(msgLines, margin, y);
  y += msgLines.length * 5 + 10;

  if (allScores.length > 1) {
    doc.setDrawColor(200);
    doc.line(margin, y, w - margin, y);
    y += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SCORE HISTORY', margin, y);
    y += 8;

    const cols = [margin, margin + 30, margin + 60, margin + 90, margin + 120];
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Session', cols[0], y);
    doc.text('Recall', cols[1], y);
    doc.text('Lock-In', cols[2], y);
    doc.text('Sharpness', cols[3], y);
    doc.text('BFS', cols[4], y);
    y += 2;
    doc.line(margin, y, w - margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    for (const s of allScores) {
      const complete = s.recall_raw != null && s.lockin_raw != null && s.sharpness_raw != null;
      let bfs = '—';
      if (complete) {
        const r = computeBFS(s.recall_raw!, s.lockin_raw!, s.sharpness_raw!, demandProfile, ageBand);
        bfs = String(r?.bfsComposite || '—');
      }
      doc.text(`S${s.session_number}`, cols[0], y);
      doc.text(s.recall_raw != null ? String(s.recall_raw) : '—', cols[1], y);
      doc.text(s.lockin_raw != null ? String(s.lockin_raw) : '—', cols[2], y);
      doc.text(s.sharpness_raw != null ? String(s.sharpness_raw) : '—', cols[3], y);
      doc.text(bfs, cols[4], y);
      y += 6;
    }
  }

  doc.save(`${participantId}_session${sessionNumber}_BFS_report.pdf`);
}

function FacilitatorDisplay({ result, recallRaw, lockinRaw, sharpnessRaw, fluencyScore, participantId, sessionNumber, allScores, ageBand, demandProfile, onSave }: {
  result: BFSResult; recallRaw: number; lockinRaw: number; sharpnessRaw: number; fluencyScore?: number; participantId: string; sessionNumber: number; allScores: PillarScores[]; ageBand: AgeBand; demandProfile: DemandProfile; onSave: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      <div className="text-center">
        <p className="text-display text-sm text-primary">FACILITATOR OUTPUT</p>
        <p className="text-sm text-muted-foreground">{participantId} • Session {sessionNumber}</p>
      </div>

      <div className="card-elevated p-6 space-y-4">
        <h3 className="text-display text-base text-foreground">SESSION {sessionNumber} SCORES</h3>
        <InfoRow label="Recall" value={`${recallRaw} / 100`} />
        <InfoRow label="Lock-In" value={`${lockinRaw} / 100`} />
        <InfoRow label="Sharpness" value={`${sharpnessRaw} / 100`} />
        {fluencyScore != null && <InfoRow label="Fluency" value={String(fluencyScore)} />}
        <div className="border-t pt-2">
          <InfoRow label="BFS Composite" value={`${result.bfsComposite} / 100`} />
          <InfoRow label="Minimum" value={String(result.bfsTarget)} />
          <InfoRow label="Gap" value={`${result.bfsGap > 0 ? '+' : ''}${result.bfsGap}`} />
        </div>
      </div>

      <div className="card-sunken p-5 space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Facilitator Script</p>
        <p className="text-base text-foreground leading-relaxed whitespace-pre-line">{getFacilitatorScript(result.bfsComposite, result.bfsGap)}</p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" size="xl" className="flex-1 gap-2" onClick={() => {
          const headers = ['Session', 'Recall', 'Lock-In', 'Sharpness', 'BFS Composite'];
          const rows = allScores.map(s => {
            const complete = s.recall_raw != null && s.lockin_raw != null && s.sharpness_raw != null;
            let bfs = '';
            if (complete) {
              const r = computeBFS(s.recall_raw!, s.lockin_raw!, s.sharpness_raw!, demandProfile, ageBand);
              bfs = String(r?.bfsComposite || '');
            }
            return [s.session_number, s.recall_raw ?? '', s.lockin_raw ?? '', s.sharpness_raw ?? '', bfs].join(',');
          });
          const csv = [headers.join(','), ...rows].join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${participantId}_session_${sessionNumber}_report.csv`;
          a.click();
          URL.revokeObjectURL(url);
        }}>
          <Download className="w-5 h-5" /> Export CSV
        </Button>
        <Button variant="hero" size="xl" className="flex-1 gap-2" onClick={onSave}>
          <Save className="w-5 h-5" /> Save & Complete
        </Button>
      </div>
    </motion.div>
  );
}

function SavedScreen({ result, participantId, sessionNumber, onNewSession }: {
  result: BFSResult; participantId: string; sessionNumber: number; onNewSession: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 text-center">
      <CheckCircle2 className="w-16 h-16 text-success mx-auto" />
      <h2 className="text-display text-2xl text-foreground">Session Complete</h2>
      <p className="text-muted-foreground">{participantId} — Session {sessionNumber}</p>
      <div className="card-elevated p-6">
        <p className="text-sm text-muted-foreground">BFS Composite</p>
        <p className="text-display text-4xl text-primary">{result.bfsComposite}</p>
      </div>
      <Button variant="outline" size="xl" className="w-full" onClick={onNewSession}>Back to Scoring</Button>
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

function formatOccupationLabel(type: string): string {
  const map: Record<string, string> = { 'knowledge-worker': 'Knowledge Worker', 'creative': 'Creative', 'student': 'Student', 'blue-collar': 'Blue Collar', 'unemployed': 'Unemployed' };
  return map[type] || type;
}

function formatSeniorityLabel(level: string): string {
  const map: Record<string, string> = { 'entry': 'Entry', 'mid': 'Mid', 'senior': 'Senior', 'executive': 'Executive', 'not-applicable': 'N/A' };
  return map[level] || level;
}

function formatEducationLabel(level: string): string {
  const map: Record<string, string> = { 'high-school': 'High School', 'some-college': 'Some College', 'bachelors': "Bachelor's", 'masters': "Master's", 'doctorate': 'Doctorate', 'other': 'Other' };
  return map[level] || level;
}
