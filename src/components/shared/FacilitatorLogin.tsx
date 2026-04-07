import { useState } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { FACILITATORS } from '@/lib/content-library';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Brain } from 'lucide-react';

export default function FacilitatorLogin() {
  const { setFacilitator, setPractice } = useSession();
  const [selectedFac, setSelectedFac] = useState('');
  const [location, setLocation] = useState('');

  const handleContinue = (practice: boolean) => {
    const fac = FACILITATORS.find(f => f.id === selectedFac);
    if (!fac || !location.trim()) return;
    setFacilitator(fac, location.trim());
    setPractice(practice);
  };

  const isValid = selectedFac && location.trim().length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-2">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-display text-3xl text-foreground">Reclaim Your Brain</h1>
          <p className="text-muted-foreground text-lg">Facilitator Login</p>
        </div>

        <div className="card-elevated p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Select your name</label>
            <Select value={selectedFac} onValueChange={setSelectedFac}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Choose facilitator..." />
              </SelectTrigger>
              <SelectContent>
                {FACILITATORS.filter(f => f.id !== 'FAC-005').map(f => (
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
              const pracFac = FACILITATORS.find(f => f.id === 'FAC-005')!;
              setFacilitator(pracFac, 'Practice Session');
              setPractice(true);
            }}
            className="text-muted-foreground"
          >
            Enter Practice Mode
          </Button>
        </div>
      </div>
    </div>
  );
}
