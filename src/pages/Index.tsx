import { Link } from 'react-router-dom';
import { Brain, Activity, Zap, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const modules = [
  {
    title: 'Recall Test',
    subtitle: 'Episodic Verbal Memory',
    description: 'Test passage recall with dynamic scoring',
    icon: Brain,
    path: '/recall',
    status: 'active' as const,
    module: 1,
  },
  {
    title: 'Lock-In Test',
    subtitle: 'Sustained Attention',
    description: 'Coming soon — Module 2',
    icon: Lock,
    path: '/lock-in',
    status: 'placeholder' as const,
    module: 2,
  },
  {
    title: 'Sharpness Test',
    subtitle: 'Processing Speed',
    description: 'Coming soon — Module 3',
    icon: Zap,
    path: '/sharpness',
    status: 'placeholder' as const,
    module: 3,
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 py-8 text-center space-y-3">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div className="text-left">
            <h1 className="text-display text-2xl text-foreground">Brain Fitness Score</h1>
            <p className="text-sm text-muted-foreground">Reclaim Your Brain — Test Battery v2.0</p>
          </div>
        </motion.div>
      </header>

      {/* Module cards */}
      <main className="flex-1 px-6 pb-10 max-w-2xl mx-auto w-full">
        <div className="space-y-4">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {mod.status === 'active' ? (
                <Link
                  to={mod.path}
                  className="block card-elevated p-6 hover:border-primary/40 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <mod.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-medium">MODULE {mod.module}</span>
                        <span className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full font-medium">Active</span>
                      </div>
                      <h2 className="text-display text-xl text-foreground mt-1">{mod.title}</h2>
                      <p className="text-sm text-muted-foreground">{mod.subtitle}</p>
                      <p className="text-sm text-muted-foreground mt-1">{mod.description}</p>
                    </div>
                  </div>
                </Link>
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
                      <p className="text-sm text-muted-foreground mt-1">{mod.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center">
        <p className="text-xs text-muted-foreground">Reclaim Your Brain | BFS v2.0 | 2026</p>
      </footer>
    </div>
  );
}
