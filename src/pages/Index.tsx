import { Header } from '@/components/Header';
import { MetricCard } from '@/components/MetricCard';
import { ActivityChart } from '@/components/ActivityChart';
import { TokenPanel } from '@/components/TokenPanel';
import { WorkflowBuilder } from '@/components/WorkflowBuilder';
import { Leaderboard } from '@/components/Leaderboard';
import { AISuggestions } from '@/components/AISuggestions';
import { mockNetworkMetrics } from '@/lib/mockData';
import { motion } from 'framer-motion';
import heroBg from '@/assets/hero-bg.png';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        {/* Animated Background Image */}
        <motion.div 
          className="absolute inset-0"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ 
            scale: [1.1, 1.05, 1.1],
            opacity: 1
          }}
          transition={{ 
            scale: { duration: 20, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 1 }
          }}
        >
          <img 
            src={heroBg} 
            alt="" 
            className="w-full h-full object-cover"
          />
        </motion.div>
        
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
        
        <motion.div 
          className="absolute inset-0 gradient-secondary opacity-30"
          animate={{ opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div 
          className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(217,91%,60%,0.15),transparent_50%)]"
          animate={{ 
            background: [
              'radial-gradient(circle_at_70%_80%,hsl(217,91%,60%,0.15),transparent_50%)',
              'radial-gradient(circle_at_30%_50%,hsl(240,91%,70%,0.12),transparent_50%)',
              'radial-gradient(circle_at_70%_80%,hsl(217,91%,60%,0.15),transparent_50%)',
            ]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        <div className="container mx-auto px-4 py-12 md:py-16 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-primary/20 text-sm font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.span 
                className="w-2 h-2 rounded-full bg-success"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              Sepolia Testnet Active
            </motion.div>
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Experience the Future of{' '}
              <motion.span 
                className="text-gradient"
                animate={{ 
                  backgroundPosition: ['0%', '100%', '0%']
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Automated Finance
              </motion.span>
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Create tokens, build automated workflows, and watch network effects unfold in this gamified testnet environment.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section id="dashboard" className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          {mockNetworkMetrics.map((metric, index) => (
            <MetricCard key={metric.name} metric={metric} index={index} />
          ))}
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 pb-8 md:pb-12">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Chart & Tokens */}
          <div className="lg:col-span-2 space-y-6">
            <ActivityChart />
            <div id="tokens">
              <TokenPanel />
            </div>
            <WorkflowBuilder />
          </div>

          {/* Right Column - AI Suggestions */}
          <div className="space-y-6">
            <AISuggestions />
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section id="leaderboard" className="container mx-auto px-4 pb-12 md:pb-16">
        <Leaderboard />
      </section>

      {/* Footer */}
      <motion.footer 
        className="border-t py-6 md:py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <motion.div 
                className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center"
                whileHover={{ rotate: 10 }}
              >
                <span className="text-sm font-bold text-primary-foreground">R</span>
              </motion.div>
              <span className="text-sm text-muted-foreground">
                Mini-Rialo Simulator • Sepolia Testnet
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>built with ❤️ by</span>
              <motion.a 
                href="https://x.com/RitaCryptoTips" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors font-medium"
                whileHover={{ y: -2 }}
              >
                r3taLabs
              </motion.a>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default Index;
