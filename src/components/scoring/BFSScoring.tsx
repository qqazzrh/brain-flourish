import { useState } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { computeBFS, getBFSMessage, getFacilitatorScript, BFSResult } from '@/lib/bfs-scoring';
import { getParticipantSessions } from '@/lib/storage';
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
  const { participant } = useSession();
  const [screen, setScreen] = useState<Screen>('input');

  const hasDemographics = !!participant?.demographics;
  const autoAge = participant?.demographics?.age_band || '';
  const autoProfile = participant?.demographics?.demand_profile || '';

  // Input state — pre-fill from demographics
  const [ageBand, setAgeBand] = useState<AgeBand | ''>(autoAge as AgeBand | '');
  const [demandProfile, setDemandProfile] = useState<DemandProfile | ''>(autoProfile as DemandProfile | '');
  const [recallRaw, setRecallRaw] = useState('');
  const [lockinRaw, setLockinRaw] = useState('');
  const [sharpnessRaw, setSharpnessRaw] = useState('');

  // Secondary scores (for facilitator display)
  const [fluencyScore, setFluencyScore] = useState('');

  // Result
  const [bfsResult, setBfsResult] = useState<BFSResult | null>(null);

  // Previous BFS for movement
  const previousSessions = participant ? getParticipantSessions(participant.participant_id) : [];
  const lastBFS = previousSessions.length > 0 ? (previousSessions[previousSessions.length - 1] as any)?.bfs_composite : null;

  const handleCalculate = () => {
    if (!ageBand || !demandProfile) return;
    const rr = parseFloat(recallRaw) || 0;
    const lr = parseFloat(lockinRaw) || 0;
    const sr = parseFloat(sharpnessRaw) || 0;

    const result = computeBFS(rr, lr, sr, demandProfile, ageBand);
    if (result) {
      setBfsResult(result);
      setScreen('participant_result');
    }
  };

  const canCalculate = ageBand && demandProfile && recallRaw && lockinRaw && sharpnessRaw;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {screen === 'input' && (
          <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-display text-2xl text-foreground">BFS Scoring</h2>
              <p className="text-sm text-muted-foreground">
                Enter participant biodata and raw pillar scores to compute the Brain Fitness Score.
              </p>
            </div>

            {/* Biodata */}
            <div className="card-elevated p-6 space-y-4">
              <p className="text-display text-sm text-primary">PARTICIPANT BIODATA</p>
              {participant && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>ID: <strong className="text-foreground">{participant.participant_id}</strong></span>
                  {participant.demographics && (
                    <span className="ml-2">• <strong className="text-foreground">{participant.demographics.name}</strong></span>
                  )}
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
                    <SelectContent>
                      {AGE_BANDS.map(ab => (
                        <SelectItem key={ab} value={ab}>{ab}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Demand Profile</label>
                  <Select value={demandProfile} onValueChange={(v) => setDemandProfile(v as DemandProfile)} disabled={hasDemographics}>
                    <SelectTrigger className={hasDemographics ? 'bg-muted' : ''}><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {DEMAND_PROFILES.map(dp => (
                        <SelectItem key={dp} value={dp}>{dp}</SelectItem>
                      ))}
                    </SelectContent>
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

            {/* Raw Pillar Scores */}
            <div className="card-elevated p-6 space-y-4">
              <p className="text-display text-sm text-primary">RAW PILLAR SCORES</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Recall</label>
                  <Input
                    type="number" min="0" max="100"
                    value={recallRaw}
                    onChange={e => setRecallRaw(e.target.value)}
                    placeholder="0-100"
                    className="text-center text-lg h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Lock-In</label>
                  <Input
                    type="number" min="0" max="100"
                    value={lockinRaw}
                    onChange={e => setLockinRaw(e.target.value)}
                    placeholder="0-100"
                    className="text-center text-lg h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Sharpness</label>
                  <Input
                    type="number" min="0" max="100"
                    value={sharpnessRaw}
                    onChange={e => setSharpnessRaw(e.target.value)}
                    placeholder="0-100"
                    className="text-center text-lg h-12"
                  />
                </div>
              </div>
            </div>

            {/* Secondary (optional) */}
            <div className="card-elevated p-6 space-y-4">
              <p className="text-display text-sm text-muted-foreground">SECONDARY SCORES (OPTIONAL)</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Fluency Score</label>
                  <Input
                    type="number"
                    value={fluencyScore}
                    onChange={e => setFluencyScore(e.target.value)}
                    placeholder="—"
                    className="text-center h-10"
                  />
                </div>
              </div>
            </div>

            <Button variant="hero" size="xl" className="w-full" disabled={!canCalculate} onClick={handleCalculate}>
              Calculate BFS
            </Button>
          </motion.div>
        )}

        {screen === 'participant_result' && bfsResult && (
          <ParticipantDisplay
            result={bfsResult}
            lastBFS={lastBFS}
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
            onSave={() => setScreen('saved')}
          />
        )}

        {screen === 'saved' && bfsResult && (
          <SavedScreen
            result={bfsResult}
            participantId={participant?.participant_id || 'Unknown'}
            onNewSession={() => setScreen('input')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// === Participant BFS Display ===
function ParticipantDisplay({ result, lastBFS, onContinue }: {
  result: BFSResult;
  lastBFS: number | null;
  onContinue: () => void;
}) {
  const movement = lastBFS != null ? result.bfsComposite - lastBFS : null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      <h2 className="text-display text-2xl text-foreground text-center">YOUR BRAIN FITNESS SCORE</h2>

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
          <div>
            <p className="text-xs text-muted-foreground">Target</p>
            <p className="text-display text-lg text-primary">{result.bfsTarget}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Gap</p>
            <p className={`text-display text-lg ${result.bfsGap < 0 ? 'text-destructive' : result.bfsGap > 0 ? 'text-success' : 'text-foreground'}`}>
              {result.bfsGap > 0 ? '+' : ''}{result.bfsGap} points
            </p>
          </div>
        </div>
      </div>

      {movement != null && (
        <div className="card-elevated p-4 flex items-center justify-center gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Previous BFS</p>
            <p className="text-display text-lg text-foreground">{lastBFS}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Today's BFS</p>
            <p className="text-display text-lg text-foreground">{result.bfsComposite}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Movement</p>
            <p className={`text-display text-lg flex items-center gap-1 ${movement > 0 ? 'text-success' : movement < 0 ? 'text-destructive' : 'text-foreground'}`}>
              {movement > 0 ? <ArrowUp className="w-4 h-4" /> : movement < 0 ? <ArrowDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
              {movement > 0 ? '+' : ''}{movement}
            </p>
          </div>
        </div>
      )}

      <div className="card-sunken p-4 text-center">
        <p className="text-sm text-muted-foreground italic">{getBFSMessage(result.bfsStatus)}</p>
      </div>

      <Button variant="hero" size="xl" className="w-full" onClick={onContinue}>Continue</Button>
    </motion.div>
  );
}

// === Bar component ===
function PillarBar({ label, score, target }: { label: string; score: number; target: number }) {
  const scorePos = Math.min(score, 100);
  const targetPos = Math.min(target, 100);

  return (
    <div className="space-y-1">
      <p className="text-display text-sm text-foreground">{label}</p>
      <div className="relative h-8 bg-muted rounded-full overflow-hidden">
        {/* Score fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${scorePos}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`absolute inset-y-0 left-0 rounded-full ${scorePos < targetPos ? 'bg-warning' : 'bg-success'}`}
        />
        {/* Target marker */}
        <div className="absolute inset-y-0 flex items-center" style={{ left: `${targetPos}%` }}>
          <div className="w-0.5 h-full bg-foreground/40" />
        </div>
        {/* Score label */}
        <div className="absolute inset-y-0 flex items-center px-3" style={{ left: `${Math.max(0, scorePos - 8)}%` }}>
          <span className="text-xs font-bold text-foreground">{score}</span>
        </div>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span style={{ marginLeft: `${targetPos - 5}%` }} className="text-foreground/60">{target} target</span>
        <span>100</span>
      </div>
    </div>
  );
}

// === Facilitator Full Output ===
function FacilitatorDisplay({ result, recallRaw, lockinRaw, sharpnessRaw, fluencyScore, participantId, onSave }: {
  result: BFSResult;
  recallRaw: number;
  lockinRaw: number;
  sharpnessRaw: number;
  fluencyScore?: number;
  participantId: string;
  onSave: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-display text-xl text-foreground">BFS FULL OUTPUT — FACILITATOR VIEW</h2>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-2 text-xs text-primary font-medium">
        DATA RETRIEVED FROM PARTICIPANT RECORD
      </div>

      <div className="card-elevated p-4 space-y-2 text-sm">
        <Row label="Participant ID" value={participantId} />
        <Row label="Profile" value={result.profileCell.replace('_', ' / ')} />
        <Row label="Norm version" value="1.0 (ASSUMED)" />
      </div>

      {/* Recall section */}
      <div className="card-elevated p-4 space-y-2 text-sm">
        <p className="text-display text-xs text-primary">RECALL</p>
        <Row label="Raw score" value={`${recallRaw} / 100`} />
        <Row label="Benchmark (80th)" value={String(result.benchmarks.recall)} />
        <Row label="Est. percentile" value={`${result.recallPercentile.toFixed(1)}th`} />
        <Row label="BFS component" value={String(result.recallBFS)} />
        {fluencyScore != null && (
          <div className="pt-1 border-t mt-1">
            <Row label="Fluency (research)" value={`${fluencyScore} items`} />
            <p className="text-xs text-muted-foreground italic">Research data — not included in BFS calculation</p>
          </div>
        )}
      </div>

      {/* Lock-In section */}
      <div className="card-elevated p-4 space-y-2 text-sm">
        <p className="text-display text-xs text-primary">LOCK-IN</p>
        <Row label="Raw score" value={`${lockinRaw} / 100`} />
        <Row label="Benchmark (80th)" value={String(result.benchmarks.lockin)} />
        <Row label="Est. percentile" value={`${result.lockinPercentile.toFixed(1)}th`} />
        <Row label="BFS component" value={String(result.lockinBFS)} />
      </div>

      {/* Sharpness section */}
      <div className="card-elevated p-4 space-y-2 text-sm">
        <p className="text-display text-xs text-primary">SHARPNESS</p>
        <Row label="Raw score" value={`${sharpnessRaw} / 100`} />
        <Row label="Benchmark (80th)" value={String(result.benchmarks.sharpness)} />
        <Row label="Est. percentile" value={`${result.sharpnessPercentile.toFixed(1)}th`} />
        <Row label="BFS component" value={String(result.sharpnessBFS)} />
      </div>

      {/* Composite */}
      <div className="card-elevated p-5 text-center space-y-2 border-2 border-primary/20">
        <p className="text-display text-xs text-muted-foreground">COMPOSITE BFS</p>
        <p className="text-display text-4xl text-foreground">{result.bfsComposite}<span className="text-xl text-muted-foreground"> / 100</span></p>
        <div className="flex justify-center gap-6 text-sm">
          <span className="text-muted-foreground">Target: <strong className="text-foreground">{result.bfsTarget}</strong></span>
          <span className="text-muted-foreground">Gap: <strong className={result.bfsGap < 0 ? 'text-destructive' : 'text-success'}>{result.bfsGap > 0 ? '+' : ''}{result.bfsGap}</strong></span>
        </div>
      </div>

      {/* Facilitator script */}
      <div className="card-sunken p-4 space-y-2">
        <p className="text-xs text-muted-foreground">SAY TO PARTICIPANT:</p>
        <p className="text-base font-medium text-foreground italic">
          {getFacilitatorScript(result.bfsComposite, result.bfsGap)}
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="hero" size="xl" className="flex-1" onClick={onSave}>
          <Save className="w-5 h-5 mr-2" /> Save Session
        </Button>
        <Button variant="outline" size="xl" className="flex-1">
          <Download className="w-5 h-5 mr-2" /> Export Scorecard
        </Button>
      </div>
    </motion.div>
  );
}

// === Saved screen ===
function SavedScreen({ result, participantId, onNewSession }: {
  result: BFSResult;
  participantId: string;
  onNewSession: () => void;
}) {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 14);
  const nextDateStr = nextDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const todayStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      <div className="text-center space-y-3">
        <CheckCircle2 className="w-16 h-16 text-success mx-auto" />
        <h2 className="text-display text-2xl text-foreground">SESSION SAVED</h2>
      </div>

      <div className="card-elevated p-6 space-y-3 text-sm">
        <Row label="Participant ID" value={participantId} />
        <Row label="BFS" value={`${result.bfsComposite} / 100`} />
        <Row label="Saved" value={todayStr} />
      </div>

      <div className="card-elevated p-6 space-y-3">
        <p className="text-display text-sm text-primary">NEXT BFS TEST AVAILABLE</p>
        <p className="text-lg font-medium text-foreground">From: {nextDateStr}</p>
        <p className="text-xs text-muted-foreground">(14-day minimum between tests)</p>
      </div>

      <div className="card-sunken p-4 space-y-2">
        <p className="text-xs text-muted-foreground">SAY TO PARTICIPANT:</p>
        <p className="text-sm font-medium text-foreground italic">
          "Your next test is available from {nextDateStr}. Between now and then, your exercise sessions will start building your score. We'll track your progress every time you come in."
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" size="xl" className="flex-1">
          <Download className="w-5 h-5 mr-2" /> Export Scorecard PDF
        </Button>
        <Button variant="hero" size="xl" className="flex-1" onClick={onNewSession}>
          Start New Session
        </Button>
      </div>
    </motion.div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function formatOccupationLabel(type: string): string {
  const map: Record<string, string> = {
    'knowledge-worker': 'Knowledge Worker', 'creative': 'Creative',
    'student': 'Student', 'blue-collar': 'Blue Collar', 'unemployed': 'Unemployed',
  };
  return map[type] || type;
}

function formatSeniorityLabel(level: string): string {
  const map: Record<string, string> = {
    'entry': 'Entry', 'mid': 'Mid', 'senior': 'Senior',
    'executive': 'Executive', 'not-applicable': 'N/A',
  };
  return map[level] || level;
}

function formatEducationLabel(level: string): string {
  const map: Record<string, string> = {
    'high-school': 'High School', 'some-college': 'Some College',
    'bachelors': "Bachelor's", 'masters': "Master's",
    'doctorate': 'Doctorate', 'other': 'Other',
  };
  return map[level] || level;
}
