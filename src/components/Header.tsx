import { ThemeToggle } from './ThemeToggle';
import { ConnectWalletButton } from './ConnectWalletButton';
import { MobileMenu } from './MobileMenu';
import { NotificationPanel } from './NotificationPanel';
import { motion } from 'framer-motion';

export function Header() {
  return (
    <motion.header 
      className="sticky top-0 z-50 glass border-b"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <motion.a 
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-3 cursor-pointer"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div 
            className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <span className="text-xl font-bold text-primary-foreground">R</span>
          </motion.div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-gradient">Mini-Rialo</h1>
            <p className="text-xs text-muted-foreground">Testnet Simulator</p>
          </div>
        </motion.a>

        <nav className="hidden md:flex items-center gap-6">
          {['Dashboard', 'Tokens', 'Workflows', 'Leaderboard'].map((item, index) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              whileHover={{ y: -2 }}
            >
              {item}
              <motion.span 
                className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"
                layoutId="underline"
              />
            </motion.a>
          ))}
        </nav>

        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <NotificationPanel />
          
          <ThemeToggle />

          <div className="hidden sm:block">
            <ConnectWalletButton />
          </div>

          <MobileMenu />
        </motion.div>
      </div>
    </motion.header>
  );
}
