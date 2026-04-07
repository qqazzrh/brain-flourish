import { useSession } from '@/contexts/SessionContext';
import { Brain, Lock, Zap, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function TestHub() {
  const { participant, facilitator, location, isPractice, clearParticipant, logout, assignedForm } = useSession();
  const navigate = useNavigate();

  const modules = [
    {
      title: 'Recall Test',
      subtitle: 'Episodic Verbal Memory',
      description: 'Passage recall with dynamic scoring',
      icon: Brain,
      path: '/recall',
      module: 1,
      ready: true,
    },
    {
      title: 'Lock-In Test',
      subtitle: 'Sustained Attention',
      description: 'Continuous performance test',
      icon: Lock,
      path: '/lock-in',
      module: 2,
      ready: true,
    },
    {
      title: 'Sharpness Test',
      subtitle: 'Processing Speed',
      description: 'Processing speed & flexibility',
      icon: Zap,
      path: '/sharpness',
      module: 3,
      ready: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with session info */}
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

      {/* Module cards */}
      <main className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full">
        <p className="text-sm text-muted-foreground mb-4">Select a test module to begin:</p>
        <div className="space-y-4">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {mod.ready ? (
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
              ) : (
                <div className="card-elevated p-6 opacity-60">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <mod.icon className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-medium">MODULE {mod.module}</span>
                        <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full font-medium">Coming Soon</span>
                      </div>
                      <h2 className="text-display text-xl text-foreground mt-1">{mod.title}</h2>
                      <p className="text-sm text-muted-foreground">{mod.subtitle}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="px-6 py-4 text-center">
        <p className="text-xs text-muted-foreground">Reclaim Your Brain | BFS v2.0 | 2026</p>
      </footer>
    </div>
  );
}
