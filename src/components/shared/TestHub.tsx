import { useState } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { Brain, Lock, Zap, LogOut, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import BFSScoring from '@/components/scoring/BFSScoring';

type Tab = 'tests' | 'scoring';

export default function TestHub() {
  const { participant, facilitator, location, isPractice, clearParticipant, logout, assignedForm } = useSession();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('tests');

  const modules = [
    {
      title: 'Recall Test',
      subtitle: 'Episodic Verbal Memory',
      icon: Brain,
      path: '/recall',
      module: 1,
      ready: true,
    },
    {
      title: 'Lock-In Test',
      subtitle: 'Sustained Attention',
      icon: Lock,
      path: '/lock-in',
      module: 2,
      ready: true,
    },
    {
      title: 'Sharpness Test',
      subtitle: 'Processing Speed',
      icon: Zap,
      path: '/sharpness',
      module: 3,
      ready: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 border-b">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-display text-xl text-foreground">Brain Fitness Score</h1>
            <p className="text-sm text-muted-foreground">
              {facilitator?.name} • {location}
              {isPractice && <span className="ml-2 text-warning font-medium">Practice Mode</span>}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground gap-1">
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </header>

      {/* Participant info */}
      <div className="px-6 py-4 bg-primary/5 border-b">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Participant</p>
            <p className="text-display text-lg text-foreground">{participant?.participant_id}</p>
            <p className="text-xs text-muted-foreground">
              Form {assignedForm} • Session {(participant?.session_count || 0) + 1}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={clearParticipant}>
            Change Participant
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b">
        <div className="max-w-2xl mx-auto flex">
          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'tests'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Brain className="w-4 h-4" /> Tests
          </button>
          <button
            onClick={() => setActiveTab('scoring')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'scoring'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Scoring
          </button>
        </div>
      </div>

      {/* Tab content */}
      <main className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full">
        {activeTab === 'tests' && (
          <>
            <p className="text-sm text-muted-foreground mb-4">Select a test module to begin:</p>
            <div className="space-y-4">
              {modules.map((mod, i) => (
                <motion.div
                  key={mod.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <button
                    onClick={() => navigate(mod.path)}
                    className="w-full text-left block card-elevated p-6 hover:border-primary/40 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <mod.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-medium">MODULE {mod.module}</span>
                          <span className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full font-medium">Ready</span>
                        </div>
                        <h2 className="text-display text-xl text-foreground mt-1">{mod.title}</h2>
                        <p className="text-sm text-muted-foreground">{mod.subtitle}</p>
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'scoring' && <BFSScoring />}
      </main>

      <footer className="px-6 py-4 text-center">
        <p className="text-xs text-muted-foreground">Reclaim Your Brain | BFS v2.0 | 2026</p>
      </footer>
    </div>
  );
}
