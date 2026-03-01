import { motion } from 'framer-motion';
import { Home, BookmarkCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';
  const isLibrary = location.pathname === '/library';

  const navItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/', active: isHome },
    { id: 'library', icon: BookmarkCheck, label: 'Library', path: '/library', active: isLibrary },
  ];

  const handleNavigation = (path: string) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50"
    >
      <div className="glass-strong rounded-2xl px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-around md:justify-center md:gap-12 shadow-glow max-w-md mx-auto md:max-w-none md:mx-0">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => handleNavigation(item.path)}
            className="relative flex flex-col items-center gap-0.5 sm:gap-1 min-w-[60px]"
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              className="relative"
              animate={{
                scale: item.active ? 1.1 : 1,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              {item.active && (
                <motion.div
                  layoutId="nav-glow"
                  className="absolute -inset-3 rounded-full bg-primary/20 blur-lg"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon
                className={`w-5 h-5 sm:w-6 sm:h-6 relative z-10 transition-colors duration-300 ${
                  item.active ? 'text-primary' : 'text-muted-foreground'
                }`}
                strokeWidth={item.active ? 2.5 : 2}
              />
            </motion.div>
            <motion.span
              className={`text-[10px] sm:text-xs font-medium transition-colors duration-300 ${
                item.active ? 'text-primary' : 'text-muted-foreground'
              }`}
              animate={{ opacity: item.active ? 1 : 0.7 }}
            >
              {item.label}
            </motion.span>
            {item.active && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute -bottom-1.5 sm:-bottom-2 w-1 h-1 rounded-full bg-primary"
                initial={false}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </motion.nav>
  );
};

export default BottomNav;
