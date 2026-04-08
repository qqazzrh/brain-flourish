import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { computeBFS, getBFSMessage, getFacilitatorScript, BFSResult } from '@/lib/bfs-scoring';
import { getPillarScores, getAllPillarScoresForParticipant, PillarScores } from '@/lib/storage';
import { AgeBand, DemandProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, Minus, Download, Save, CheckCircle2 } from 'lucide-react';

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

  // Load data
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
    setScreen('input');
  };

  const handleCalculate = () => {
    if (!ageBand || !demandProfile) return;
    const result = computeBFS(parseFloat(recallRaw) || 0, parseFloat(lockinRaw) || 0, parseFloat(sharpnessRaw) || 0, demandProfile, ageBand);
    if (result) { setBfsResult(result); setScreen('participant_result'); }
  };

  const canCalculate = ageBand && demandProfile && recallRaw && lockinRaw && sharpnessRaw;

  const getPreviousSessionBFS = useCallback(async (): Promise<number | null> => {
    if (sessionNum <= 1) return null;
    const prevScores = await getPillarScores(participant?.participant_id || '', sessionNum - 1);
    if (!prevScores || prevScores.recall_raw == null || prevScores.lockin_raw == null || prevScores.sharpness_raw == null) return null;
    const prevResult = computeBFS(prevScores.recall_raw, prevScores.lockin_raw, prevScores.sharpness_raw, demandProfile as DemandProfile, ageBand as AgeBand);
    return prevResult?.bfsComposite || null;
  }, [sessionNum, participant, demandProfile, ageBand]);

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

            <div className="card-elevated p-6 space-y-4">
              <p className="text-display text-sm text-muted-foreground">SECONDARY SCORES (OPTIONAL)</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Fluency Score</label>
                  <Input type="number" value={fluencyScore} onChange={e => setFluencyScore(e.target.value)} placeholder="—" className="text-center h-10" />
                </div>
              </div>
            </div>

            <Button variant="hero" size="xl" className="w-full" disabled={!canCalculate} onClick={handleCalculate}>Calculate BFS</Button>

            {allSessionScores.length > 0 && (
              <div className="card-elevated p-6 space-y-4">
                <p className="text-display text-sm text-primary">SESSION HISTORY</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 text-muted-foreground font-medium">Session</th>
                        <th className="text-center py-2 text-muted-foreground font-medium">Recall</th>
                        <th className="text-center py-2 text-muted-foreground font-medium">Lock-In</th>
                        <th className="text-center py-2 text-muted-foreground font-medium">Sharpness</th>
                        <th className="text-center py-2 text-muted-foreground font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allSessionScores.map(s => {
                        const complete = s.recall_raw != null && s.lockin_raw != null && s.sharpness_raw != null;
                        return (
                          <tr key={s.session_number} className={`border-b last:border-0 ${s.session_number === sessionNum ? 'bg-primary/5' : ''}`}>
                            <td className="py-2 text-foreground font-medium">Session {s.session_number}</td>
                            <td className="py-2 text-center">{s.recall_raw != null ? s.recall_raw : '—'}</td>
                            <td className="py-2 text-center">{s.lockin_raw != null ? s.lockin_raw : '—'}</td>
                            <td className="py-2 text-center">{s.sharpness_raw != null ? s.sharpness_raw : '—'}</td>
                            <td className="py-2 text-center">
                              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${complete ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                {complete ? 'Complete' : 'Partial'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {screen === 'participant_result' && bfsResult && (
          <ParticipantDisplay result={bfsResult} sessionNumber={sessionNum} ageBand={ageBand as AgeBand} demandProfile={demandProfile as DemandProfile} participantId={participant?.participant_id || ''} getPreviousBFS={getPreviousSessionBFS} onContinue={() => setScreen('facilitator_output')} />
        )}

        {screen === 'facilitator_output' && bfsResult && (
          <FacilitatorDisplay result={bfsResult} recallRaw={parseFloat(recallRaw)} lockinRaw={parseFloat(lockinRaw)} sharpnessRaw={parseFloat(sharpnessRaw)} fluencyScore={fluencyScore ? parseInt(fluencyScore) : undefined} participantId={participant?.participant_id || 'Unknown'} sessionNumber={sessionNum} onSave={() => setScreen('saved')} />
        )}

        {screen === 'saved' && bfsResult && (
          <SavedScreen result={bfsResult} participantId={participant?.participant_id || 'Unknown'} sessionNumber={sessionNum} onNewSession={() => setScreen('input')} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ParticipantDisplay({ result, sessionNumber, participantId, ageBand, demandProfile, getPreviousBFS, onContinue }: {
  result: BFSResult; sessionNumber: number; participantId: string; ageBand: AgeBand; demandProfile: DemandProfile; getPreviousBFS: () => Promise<number | null>; onContinue: () => void;
}) {
  const [lastBFS, setLastBFS] = useState<number | null>(null);

  useEffect(() => {
    getPreviousBFS().then(setLastBFS);
  }, [getPreviousBFS]);

  const movement = lastBFS != null ? result.bfsComposite - lastBFS : null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-1">Session {sessionNumber}</p>
        <h2 className="text-display text-2xl text-foreground">YOUR BRAIN FITNESS SCORE</h2>
      </div>

      <div className="space-y-5">
        <PillarBar label="RECALL" score={result.recallBFS} target={75} />
        <PillarBar label="LOCK-IN" score={result.lockinBFS} target={75} />
        <PillarBar label="SHARPNESS" score={result.sharpnessBFS} target={75} />
      </div>

      <div className="card-elevated p-6 text-center space-y-3">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">BFS</p>
          <p className="text-display text-5xl text-foreground">{result.bfsComposite}<span className="text-2xl text-muted-foreground"> / 100</span></p>
        </div>
        <div className="flex justify-center gap-8">
          <div><p className="text-xs text-muted-foreground">Target</p><p className="text-display text-lg text-primary">{result.bfsTarget}</p></div>
          <div><p className="text-xs text-muted-foreground">Gap</p><p className={`text-display text-lg ${result.bfsGap < 0 ? 'text-destructive' : result.bfsGap > 0 ? 'text-success' : 'text-foreground'}`}>{result.bfsGap > 0 ? '+' : ''}{result.bfsGap} points</p></div>
        </div>
      </div>

      {movement != null && (
        <div className="card-elevated p-4 flex items-center justify-center gap-4">
          <div className="text-center"><p className="text-xs text-muted-foreground">Previous BFS</p><p className="text-display text-lg text-foreground">{lastBFS}</p></div>
          <div className="text-center"><p className="text-xs text-muted-foreground">Today's BFS</p><p className="text-display text-lg text-foreground">{result.bfsComposite}</p></div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Movement</p>
            <div className="flex items-center justify-center gap-1">
              {movement > 0 ? <ArrowUp className="w-4 h-4 text-success" /> : movement < 0 ? <ArrowDown className="w-4 h-4 text-destructive" /> : <Minus className="w-4 h-4 text-muted-foreground" />}
              <p className={`text-display text-lg ${movement > 0 ? 'text-success' : movement < 0 ? 'text-destructive' : 'text-foreground'}`}>{movement > 0 ? '+' : ''}{movement}</p>
            </div>
          </div>
        </div>
      )}

      <div className="card-sunken p-5 space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Message</p>
        <p className="text-base text-foreground leading-relaxed">{getBFSMessage(result.bfsStatus)}</p>
      </div>

      <Button variant="hero" size="xl" className="w-full" onClick={onContinue}>View Facilitator Output</Button>
    </motion.div>
  );
}

function PillarBar({ label, score, target }: { label: string; score: number; target: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-display text-sm text-foreground">{label}</span>
        <span className="text-display text-lg text-foreground">{score}</span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden relative">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(score, 100)}%` }} />
        <div className="absolute top-0 h-full w-0.5 bg-foreground/40" style={{ left: `${target}%` }} />
      </div>
    </div>
  );
}

function FacilitatorDisplay({ result, recallRaw, lockinRaw, sharpnessRaw, fluencyScore, participantId, sessionNumber, onSave }: {
  result: BFSResult; recallRaw: number; lockinRaw: number; sharpnessRaw: number; fluencyScore?: number; participantId: string; sessionNumber: number; onSave: () => void;
}) {

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      <div className="text-center">
        <p className="text-display text-sm text-primary">FACILITATOR OUTPUT</p>
        <p className="text-sm text-muted-foreground">{participantId} • Session {sessionNumber}</p>
      </div>

      <div className="card-elevated p-6 space-y-4">
        <h3 className="text-display text-base text-foreground">DETAILED BREAKDOWN</h3>
        <InfoRow label="Recall Raw" value={String(recallRaw)} />
        <InfoRow label="Lock-In Raw" value={String(lockinRaw)} />
        <InfoRow label="Sharpness Raw" value={String(sharpnessRaw)} />
        {fluencyScore != null && <InfoRow label="Fluency" value={String(fluencyScore)} />}
        <div className="border-t pt-2">
          <InfoRow label="BFS Composite" value={`${result.bfsComposite} / 100`} />
          <InfoRow label="Target" value={String(result.bfsTarget)} />
          <InfoRow label="Gap" value={`${result.bfsGap > 0 ? '+' : ''}${result.bfsGap}`} />
        </div>
      </div>

      <div className="card-sunken p-5 space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Facilitator Script</p>
        <p className="text-base text-foreground leading-relaxed whitespace-pre-line">{getFacilitatorScript(result.bfsComposite, result.bfsGap)}</p>
      </div>

      <Button variant="hero" size="xl" className="w-full gap-2" onClick={onSave}>
        <Save className="w-5 h-5" /> Save & Complete
      </Button>
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
