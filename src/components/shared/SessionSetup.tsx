import { useState } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateParticipantId, findParticipant, saveParticipant, getNextFormForParticipant, getAllPillarScoresForParticipant, getPillarScores, PillarScores } from '@/lib/storage';
import {
  ParticipantRecord, ParticipantDemographics,
  AgeBand, Gender, EducationLevel, OccupationType, SeniorityLevel, DemandProfile,
} from '@/lib/types';
import { UserPlus, RotateCcw, AlertTriangle, CheckCircle2, XCircle, ArrowLeft, Play, Plus, Brain, Lock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type SubScreen = 'choice' | 'demographics' | 'new' | 'returning' | 'found' | 'not-found' | 'session-history';

const AGE_BANDS: { value: AgeBand; label: string }[] = [
  { value: '18-24', label: '18–24' }, { value: '25-29', label: '25–29' },
  { value: '30-34', label: '30–34' }, { value: '35-44', label: '35–44' }, { value: '45-54', label: '45–54' },
];
const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' }, { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' }, { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];
const EDUCATION_LEVELS: { value: EducationLevel; label: string }[] = [
  { value: 'high-school', label: 'High School' }, { value: 'some-college', label: 'Some College' },
  { value: 'bachelors', label: "Bachelor's Degree" }, { value: 'masters', label: "Master's Degree" },
  { value: 'doctorate', label: 'Doctorate' }, { value: 'other', label: 'Other' },
];
const OCCUPATION_TYPES: { value: OccupationType; label: string }[] = [
  { value: 'knowledge-worker', label: 'Knowledge Worker' }, { value: 'creative', label: 'Creative' },
  { value: 'student', label: 'Student' }, { value: 'blue-collar', label: 'Blue Collar' }, { value: 'unemployed', label: 'Unemployed' },
];
const SENIORITY_LEVELS: { value: SeniorityLevel; label: string }[] = [
  { value: 'entry', label: 'Entry Level' }, { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior' }, { value: 'executive', label: 'Executive' }, { value: 'not-applicable', label: 'Not Applicable' },
];

function deriveDemandProfile(occupation: OccupationType, seniority: SeniorityLevel): DemandProfile {
  if (occupation === 'knowledge-worker' && (seniority === 'senior' || seniority === 'executive')) return 'HIGH';
  if (occupation === 'knowledge-worker' || occupation === 'creative') return 'MODERATE';
  return 'LOWER';
}

export default function SessionSetup() {
  const { facilitator, location, isPractice, setParticipant } = useSession();
  const [sub, setSub] = useState<SubScreen>('choice');
  const [newId, setNewId] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [yearInput, setYearInput] = useState('');
  const [numInput, setNumInput] = useState('');
  const [foundParticipant, setFoundParticipant] = useState<ParticipantRecord | null>(null);
  const [searchedId, setSearchedId] = useState('');
  const [loading, setLoading] = useState(false);

  const [dName, setDName] = useState('');
  const [dAge, setDAge] = useState<AgeBand | ''>('');
  const [dGender, setDGender] = useState<Gender | ''>('');
  const [dEducation, setDEducation] = useState<EducationLevel | ''>('');
  const [dOccupation, setDOccupation] = useState<OccupationType | ''>('');
  const [dSeniority, setDSeniority] = useState<SeniorityLevel | ''>('');

  const demographicsValid = dName.trim().length >= 2 && dAge !== '' && dGender !== '' && dEducation !== '' && dOccupation !== '' && dSeniority !== '';

  const handleCreateWithDemographics = async () => {
    if (!demographicsValid || loading) return;
    setLoading(true);

    const demandProfile = deriveDemandProfile(dOccupation as OccupationType, dSeniority as SeniorityLevel);
    const demographics: ParticipantDemographics = {
      name: dName.trim(), age_band: dAge as AgeBand, gender: dGender as Gender,
      education_level: dEducation as EducationLevel, occupation_type: dOccupation as OccupationType,
      seniority_level: dSeniority as SeniorityLevel, demand_profile: demandProfile,
    };

    const id = await generateParticipantId();
    setNewId(id);
    const p: ParticipantRecord = {
      participant_id: id, created_at: new Date().toISOString(),
      created_by_facilitator: facilitator?.id || '', created_at_location: location,
      demographics, session_count: 0, last_session_date: null, last_recall_raw_score: null, sessions: [],
    };
    await saveParticipant(p);
    setFoundParticipant(p);
    setSub('new');
    setLoading(false);
  };

  const handleNewParticipant = () => {
    if (isPractice) {
      const practiceP: ParticipantRecord = {
        participant_id: 'RYB-PRACTICE', created_at: new Date().toISOString(),
        created_by_facilitator: facilitator?.id || '', created_at_location: location,
        session_count: 0, last_session_date: null, last_recall_raw_score: null, sessions: [],
      };
      setNewId('RYB-PRACTICE');
      setFoundParticipant(practiceP);
      setSub('new');
      return;
    }
    setSub('demographics');
  };

  const handleLookup = async () => {
    setLoading(true);
    const id = `RYB-${yearInput}-${numInput.padStart(4, '0')}`;
    setSearchedId(id);
    const p = await findParticipant(id);
    if (p) {
      setFoundParticipant(p);
      setSub('session-history');
    } else {
      setSub('not-found');
    }
    setLoading(false);
  };

  const handleBeginSession = async (p: ParticipantRecord, type: 'new' | 'returning', sessionNumber: number) => {
    const form = await getNextFormForParticipant(p.participant_id);
    setParticipant(p, type, form, sessionNumber);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <AnimatePresence mode="wait">
        {sub === 'choice' && (
          <motion.div key="choice" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-lg space-y-5">
            {isPractice && (
              <div className="text-center px-4 py-2 bg-warning/10 text-warning rounded-lg font-medium text-sm">Practice Mode Active</div>
            )}
            <button onClick={handleNewParticipant} className="w-full min-h-[160px] card-elevated p-8 flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-colors cursor-pointer">
              <UserPlus className="w-10 h-10 text-primary" />
              <span className="text-display text-xl text-foreground">New Participant</span>
              <span className="text-muted-foreground">First time here</span>
            </button>
            <button onClick={() => setSub('returning')} className="w-full min-h-[160px] card-elevated p-8 flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-colors cursor-pointer">
              <RotateCcw className="w-10 h-10 text-primary" />
              <span className="text-display text-xl text-foreground">Returning Participant</span>
              <span className="text-muted-foreground">I have a participant ID</span>
            </button>
          </motion.div>
        )}

        {sub === 'demographics' && (
          <motion.div key="demographics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-md space-y-5">
            <div>
              <h2 className="text-display text-2xl text-foreground">New Participant</h2>
              <p className="text-muted-foreground text-sm mt-1">Collect participant details before registration.</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <Input placeholder="Enter participant name" value={dName} onChange={e => setDName(e.target.value.slice(0, 100))} className="h-12" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Age Group</label>
              <Select value={dAge} onValueChange={v => setDAge(v as AgeBand)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select age group" /></SelectTrigger>
                <SelectContent>{AGE_BANDS.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Gender</label>
              <Select value={dGender} onValueChange={v => setDGender(v as Gender)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>{GENDERS.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Education Level</label>
              <Select value={dEducation} onValueChange={v => setDEducation(v as EducationLevel)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select education level" /></SelectTrigger>
                <SelectContent>{EDUCATION_LEVELS.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Occupation Type</label>
              <Select value={dOccupation} onValueChange={v => setDOccupation(v as OccupationType)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select occupation type" /></SelectTrigger>
                <SelectContent>{OCCUPATION_TYPES.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Seniority Level</label>
              <Select value={dSeniority} onValueChange={v => setDSeniority(v as SeniorityLevel)}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select seniority level" /></SelectTrigger>
                <SelectContent>{SENIORITY_LEVELS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {dOccupation && dSeniority && (
              <div className="card-sunken p-3 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Demand Profile</span>
                <span className="text-display text-sm text-primary">{deriveDemandProfile(dOccupation as OccupationType, dSeniority as SeniorityLevel)}</span>
              </div>
            )}
            <Button variant="hero" size="xl" className="w-full" disabled={!demographicsValid || loading} onClick={handleCreateWithDemographics}>
              {loading ? 'Registering...' : 'Register Participant'}
            </Button>
            <Button variant="ghost" onClick={() => setSub('choice')} className="w-full text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </motion.div>
        )}

        {sub === 'new' && (
          <motion.div key="new" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-md space-y-6">
            <h2 className="text-display text-2xl text-foreground">New Participant</h2>
            <p className="text-muted-foreground">Your Participant ID has been created:</p>
            <div className="card-elevated p-6 text-center">
              <span className="text-display text-3xl text-primary">{newId}</span>
            </div>
            {foundParticipant?.demographics && (
              <div className="card-sunken p-4 space-y-2">
                <Row label="Name" value={foundParticipant.demographics.name} />
                <Row label="Age" value={foundParticipant.demographics.age_band} />
                <Row label="Occupation" value={formatOccupation(foundParticipant.demographics.occupation_type)} />
                <Row label="Demand Profile" value={foundParticipant.demographics.demand_profile} />
              </div>
            )}
            <div className="card-sunken p-4 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-warning mt-0.5 shrink-0" />
                <p className="text-sm text-foreground">Ask the participant to write this down or photograph it now. This ID is needed for all future sessions. It cannot be recovered if lost.</p>
              </div>
            </div>
            <div className="border-t pt-4 space-y-4">
              <p className="text-sm text-muted-foreground">Facilitator: confirm the participant has recorded their ID before tapping Begin.</p>
              <div className="flex items-center gap-3">
                <Checkbox id="confirm" checked={confirmed} onCheckedChange={(v) => setConfirmed(v === true)} />
                <label htmlFor="confirm" className="text-sm font-medium cursor-pointer text-foreground">Participant has recorded their ID</label>
              </div>
              <Button variant="hero" size="xl" className="w-full" disabled={!confirmed} onClick={() => foundParticipant && handleBeginSession(foundParticipant, 'new', 1)}>
                Begin Session 1
              </Button>
            </div>
          </motion.div>
        )}

        {sub === 'returning' && (
          <motion.div key="returning" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-md space-y-6">
            <h2 className="text-display text-2xl text-foreground">Returning Participant</h2>
            <p className="text-muted-foreground">Enter Participant ID:</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium text-muted-foreground">RYB -</span>
              <Input placeholder="YYYY" value={yearInput} onChange={e => setYearInput(e.target.value.replace(/\D/g, '').slice(0, 4))} className="w-24 h-12 text-center text-lg" inputMode="numeric" />
              <span className="text-lg font-medium text-muted-foreground">-</span>
              <Input placeholder="NNNN" value={numInput} onChange={e => setNumInput(e.target.value.replace(/\D/g, '').slice(0, 4))} className="w-24 h-12 text-center text-lg" inputMode="numeric" />
            </div>
            <Button variant="hero" size="xl" className="w-full" disabled={yearInput.length !== 4 || numInput.length === 0 || loading} onClick={handleLookup}>
              {loading ? 'Looking up...' : 'Confirm ID'}
            </Button>
            <div className="border-t pt-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">ID not found?</p>
              <Button variant="ghost" onClick={handleNewParticipant}>Register as new participant</Button>
            </div>
            <Button variant="ghost" onClick={() => setSub('choice')} className="w-full text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </motion.div>
        )}

        {sub === 'session-history' && foundParticipant && (
          <SessionHistoryScreen
            participant={foundParticipant}
            onContinue={(sessionNum) => handleBeginSession(foundParticipant, 'returning', sessionNum)}
            onStartNew={(sessionNum) => handleBeginSession(foundParticipant, 'returning', sessionNum)}
            onBack={() => setSub('returning')}
          />
        )}

        {sub === 'found' && foundParticipant && (
          <motion.div key="found" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-md space-y-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-success" />
              <h2 className="text-display text-2xl text-foreground">Welcome Back</h2>
            </div>
            <div className="card-elevated p-6 space-y-3">
              <Row label="ID" value={foundParticipant.participant_id} />
              {foundParticipant.demographics && (
                <>
                  <Row label="Name" value={foundParticipant.demographics.name} />
                  <Row label="Age" value={foundParticipant.demographics.age_band} />
                  <Row label="Profile" value={foundParticipant.demographics.demand_profile} />
                </>
              )}
              <Row label="Sessions completed" value={String(foundParticipant.session_count)} />
              <Row label="Last session" value={foundParticipant.last_session_date || 'N/A'} />
            </div>
            <Button variant="hero" size="xl" className="w-full" onClick={() => handleBeginSession(foundParticipant, 'returning', foundParticipant.session_count + 1)}>
              Begin Session {foundParticipant.session_count + 1}
            </Button>
            <Button variant="ghost" onClick={() => setSub('returning')} className="w-full text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </motion.div>
        )}

        {sub === 'not-found' && (
          <motion.div key="not-found" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-md space-y-6">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-destructive" />
              <h2 className="text-display text-2xl text-foreground">ID Not Recognised</h2>
            </div>
            <p className="text-muted-foreground">{searchedId} could not be found.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setSub('returning')}>Try Again</Button>
              <Button variant="default" className="flex-1" onClick={handleNewParticipant}>New Participant</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SessionHistoryScreen({ participant, onContinue, onStartNew, onBack }: {
  participant: ParticipantRecord;
  onContinue: (sessionNum: number) => void;
  onStartNew: (sessionNum: number) => void;
  onBack: () => void;
}) {
  const [allScores, setAllScores] = useState<PillarScores[]>([]);
  const [loaded, setLoaded] = useState(false);

  useState(() => {
    getAllPillarScoresForParticipant(participant.participant_id).then(scores => {
      setAllScores(scores);
      setLoaded(true);
    });
  });

  const totalSessions = Math.max(participant.session_count, allScores.length);

  const sessions: { number: number; complete: boolean; recall: boolean; lockin: boolean; sharpness: boolean }[] = [];
  for (let i = 1; i <= totalSessions; i++) {
    const scores = allScores.find(s => s.session_number === i);
    const recall = scores?.recall_raw != null;
    const lockin = scores?.lockin_raw != null;
    const sharpness = scores?.sharpness_raw != null;
    sessions.push({ number: i, complete: recall && lockin && sharpness, recall, lockin, sharpness });
  }

  const latestIncomplete = sessions.find(s => !s.complete && (s.recall || s.lockin || s.sharpness));
  const nextNewSession = totalSessions + 1;

  if (!loaded) {
    return <div className="text-center p-8 text-muted-foreground">Loading session history...</div>;
  }

  return (
    <motion.div key="session-history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-md space-y-6">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="w-8 h-8 text-success" />
        <h2 className="text-display text-2xl text-foreground">Welcome Back</h2>
      </div>

      <div className="card-elevated p-5 space-y-3">
        <Row label="ID" value={participant.participant_id} />
        {participant.demographics && (
          <>
            <Row label="Name" value={participant.demographics.name} />
            <Row label="Age" value={participant.demographics.age_band} />
            <Row label="Profile" value={participant.demographics.demand_profile} />
          </>
        )}
        <Row label="Total sessions" value={String(totalSessions)} />
        <Row label="Last session" value={participant.last_session_date || 'N/A'} />
      </div>

      {sessions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-display text-sm text-foreground">SESSION HISTORY</h3>
          {sessions.map(s => (
            <div key={s.number} className={`card-elevated p-4 space-y-2 ${!s.complete && (s.recall || s.lockin || s.sharpness) ? 'border-warning/40' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="text-display text-base text-foreground">Session {s.number}</span>
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${s.complete ? 'bg-success/10 text-success' : (s.recall || s.lockin || s.sharpness) ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}>
                  {s.complete ? 'Completed' : (s.recall || s.lockin || s.sharpness) ? 'Incomplete' : 'Not started'}
                </span>
              </div>
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  <span className={s.recall ? 'text-success' : 'text-muted-foreground'}>Recall {s.recall ? '✓' : '—'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span className={s.lockin ? 'text-success' : 'text-muted-foreground'}>Lock-In {s.lockin ? '✓' : '—'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span className={s.sharpness ? 'text-success' : 'text-muted-foreground'}>Sharpness {s.sharpness ? '✓' : '—'}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {latestIncomplete && (
          <Button variant="hero" size="xl" className="w-full gap-2" onClick={() => onContinue(latestIncomplete.number)}>
            <Play className="w-5 h-5" /> Continue Session {latestIncomplete.number}
          </Button>
        )}
        <Button variant={latestIncomplete ? 'outline' : 'hero'} size="xl" className="w-full gap-2" onClick={() => onStartNew(nextNewSession)}>
          <Plus className="w-5 h-5" /> Start New Session {nextNewSession}
        </Button>
      </div>

      <Button variant="ghost" onClick={onBack} className="w-full text-muted-foreground">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Button>
    </motion.div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function formatOccupation(type: string): string {
  const map: Record<string, string> = {
    'knowledge-worker': 'Knowledge Worker', 'creative': 'Creative',
    'student': 'Student', 'blue-collar': 'Blue Collar', 'unemployed': 'Unemployed',
  };
  return map[type] || type;
}
