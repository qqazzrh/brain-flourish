import { useState } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { generateParticipantId, findParticipant, saveParticipant, getNextFormForParticipant } from '@/lib/storage';
import { ParticipantRecord } from '@/lib/types';
import { UserPlus, RotateCcw, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type SubScreen = 'choice' | 'new' | 'returning' | 'found' | 'not-found';

export default function SessionSetup() {
  const { facilitator, location, isPractice, setParticipant } = useSession();
  const [sub, setSub] = useState<SubScreen>('choice');
  const [newId, setNewId] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [yearInput, setYearInput] = useState('');
  const [numInput, setNumInput] = useState('');
  const [foundParticipant, setFoundParticipant] = useState<ParticipantRecord | null>(null);
  const [searchedId, setSearchedId] = useState('');

  const handleNewParticipant = () => {
    if (isPractice) {
      const practiceP: ParticipantRecord = {
        participant_id: 'RYB-PRACTICE',
        created_at: new Date().toISOString(),
        created_by_facilitator: facilitator?.id || '',
        created_at_location: location,
        session_count: 0,
        last_session_date: null,
        last_recall_raw_score: null,
        sessions: [],
      };
      setNewId('RYB-PRACTICE');
      setFoundParticipant(practiceP);
      setSub('new');
      return;
    }
    const id = generateParticipantId();
    setNewId(id);
    const p: ParticipantRecord = {
      participant_id: id,
      created_at: new Date().toISOString(),
      created_by_facilitator: facilitator?.id || '',
      created_at_location: location,
      session_count: 0,
      last_session_date: null,
      last_recall_raw_score: null,
      sessions: [],
    };
    saveParticipant(p);
    setFoundParticipant(p);
    setSub('new');
  };

  const handleLookup = () => {
    const id = `RYB-${yearInput}-${numInput.padStart(4, '0')}`;
    setSearchedId(id);
    const p = findParticipant(id);
    if (p) {
      setFoundParticipant(p);
      setSub('found');
    } else {
      setSub('not-found');
    }
  };

  const handleBeginTest = (type: 'new' | 'returning') => {
    if (!foundParticipant) return;
    const form = getNextFormForParticipant(foundParticipant.participant_id);
    setParticipant(foundParticipant, type, form);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <AnimatePresence mode="wait">
        {sub === 'choice' && (
          <motion.div key="choice" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-lg space-y-5">
            {isPractice && (
              <div className="text-center px-4 py-2 bg-warning/10 text-warning rounded-lg font-medium text-sm">
                Practice Mode Active
              </div>
            )}
            <button
              onClick={handleNewParticipant}
              className="w-full min-h-[160px] card-elevated p-8 flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-colors cursor-pointer"
            >
              <UserPlus className="w-10 h-10 text-primary" />
              <span className="text-display text-xl text-foreground">New Participant</span>
              <span className="text-muted-foreground">First time here</span>
            </button>

            <button
              onClick={() => setSub('returning')}
              className="w-full min-h-[160px] card-elevated p-8 flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-10 h-10 text-primary" />
              <span className="text-display text-xl text-foreground">Returning Participant</span>
              <span className="text-muted-foreground">I have a participant ID</span>
            </button>
          </motion.div>
        )}

        {sub === 'new' && (
          <motion.div key="new" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-md space-y-6">
            <h2 className="text-display text-2xl text-foreground">New Participant</h2>
            <p className="text-muted-foreground">Your Participant ID has been created:</p>
            <div className="card-elevated p-6 text-center">
              <span className="text-display text-3xl text-primary">{newId}</span>
            </div>
            <div className="card-sunken p-4 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-warning mt-0.5 shrink-0" />
                <p className="text-sm text-foreground">
                  Ask the participant to write this down or photograph it now.
                  This ID is needed for all future sessions. It cannot be recovered if lost.
                </p>
              </div>
            </div>
            <div className="border-t pt-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Facilitator: confirm the participant has recorded their ID before tapping Begin.
              </p>
              <div className="flex items-center gap-3">
                <Checkbox id="confirm" checked={confirmed} onCheckedChange={(v) => setConfirmed(v === true)} />
                <label htmlFor="confirm" className="text-sm font-medium cursor-pointer text-foreground">
                  Participant has recorded their ID
                </label>
              </div>
              <Button variant="hero" size="xl" className="w-full" disabled={!confirmed} onClick={() => handleBeginTest('new')}>
                Begin Session
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
            <Button variant="hero" size="xl" className="w-full" disabled={yearInput.length !== 4 || numInput.length === 0} onClick={handleLookup}>
              Confirm ID
            </Button>
            <div className="border-t pt-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">ID not found?</p>
              <Button variant="ghost" onClick={handleNewParticipant}>Register as new participant</Button>
            </div>
            <Button variant="ghost" onClick={() => setSub('choice')} className="w-full text-muted-foreground">← Back</Button>
          </motion.div>
        )}

        {sub === 'found' && foundParticipant && (
          <motion.div key="found" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-md space-y-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-success" />
              <h2 className="text-display text-2xl text-foreground">Participant Found</h2>
            </div>
            <div className="card-elevated p-6 space-y-3">
              <Row label="ID" value={foundParticipant.participant_id} />
              <Row label="Sessions completed" value={String(foundParticipant.session_count)} />
              <Row label="Last session" value={foundParticipant.last_session_date || 'N/A'} />
              <Row label="Last Recall score" value={foundParticipant.last_recall_raw_score != null ? `${foundParticipant.last_recall_raw_score} / 20` : 'N/A'} />
            </div>
            <div className="card-sunken p-4">
              <Row label="Today's form" value={`${getNextFormForParticipant(foundParticipant.participant_id)} (${getFormDomain(getNextFormForParticipant(foundParticipant.participant_id))})`} />
            </div>
            <Button variant="hero" size="xl" className="w-full" onClick={() => handleBeginTest('returning')}>
              Begin Session
            </Button>
            <Button variant="ghost" onClick={() => setSub('returning')} className="w-full text-muted-foreground">← Back</Button>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function getFormDomain(form: string): string {
  const map: Record<string, string> = { A: 'Logistics', B: 'Medicine', C: 'Engineering', D: 'Finance' };
  return map[form] || '';
}
