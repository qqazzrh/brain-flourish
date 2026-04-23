import { useState, useEffect } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { getFacilitators } from '@/lib/storage';
import { Facilitator } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Brain, Lock, Zap } from 'lucide-react';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FacilitatorLogin() {
  const { setFacilitator, setPractice } = useSession();
  const navigate = useNavigate();
  const [selectedFac, setSelectedFac] = useState('');
  const [location, setLocation] = useState('');
  const [facilitators, setFacilitators] = useState<Facilitator[]>([]);

  useEffect(() => {
    getFacilitators().then(setFacilitators);
  }, []);

  const handleContinue = (practice: boolean) => {
    const fac = facilitators.find(f => f.id === selectedFac);
    if (!fac || !location.trim()) return;
    setFacilitator(fac, location.trim());
    setPractice(practice);
  };

  const isValid = selectedFac && location.trim().length > 0;

  const tests = [
    { icon: Brain, label: 'Recall', desc: 'Episodic Verbal Memory' },
    { icon: Lock, label: 'Lock-In', desc: 'Sustained Attention' },
    { icon: Zap, label: 'Sharpness', desc: 'Processing Speed & Flexibility' },
  ];

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-2">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-display text-3xl text-foreground">Brain Fitness Score</h1>
          <p className="text-muted-foreground text-lg">Reclaim Your Brain</p>
        </div>

        {/* Three test modules preview */}
        <div className="flex justify-center gap-4">
          {tests.map((t) => (
            <div key={t.label} className="flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/50">
              <t.icon className="w-5 h-5 text-primary" />
              <span className="text-xs font-medium text-foreground">{t.label}</span>
              <span className="text-[10px] text-muted-foreground text-center leading-tight">{t.desc}</span>
            </div>
          ))}
        </div>

        <div className="card-elevated p-6 space-y-5">
          <p className="text-sm font-medium text-muted-foreground text-center">Facilitator Login</p>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Select your name</label>
            <Select value={selectedFac} onValueChange={setSelectedFac}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Choose facilitator..." />
              </SelectTrigger>
              <SelectContent>
                {facilitators.filter(f => f.id !== 'FAC-005').map(f => (
                  <SelectItem key={f.id} value={f.id} className="text-base">{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Location</label>
            <Input
              placeholder="e.g. Chicago — F45 Fulton Market"
              value={location}
              onChange={e => setLocation(e.target.value.slice(0, 50))}
              className="h-12 text-base"
            />
            <p className="text-xs text-muted-foreground">{location.length}/50 characters</p>
          </div>

          <Button
            variant="hero"
            size="xl"
            className="w-full"
            disabled={!isValid}
            onClick={() => handleContinue(false)}
          >
            Continue
          </Button>
        </div>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => {
              const pracFac = facilitators.find(f => f.id === 'FAC-005') || { id: 'FAC-005', name: 'Practice Facilitator' };
              setFacilitator(pracFac, 'Practice Session');
              setPractice(true);
            }}
            className="text-muted-foreground"
          >
            Enter Practice Mode
          </Button>
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg" onClick={() => navigate('/mini-game')} className="gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Try the 60-second Mini Game (no login)
          </Button>
        </div>

        <footer className="text-center">
          <p className="text-xs text-muted-foreground">Reclaim Your Brain | BFS v2.0 | 2026</p>
        </footer>
      </div>
    </div>
  );
}