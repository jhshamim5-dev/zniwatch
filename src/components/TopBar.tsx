import { motion } from 'framer-motion';
import { Search, User, Users, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const TopBar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const logoText = "ZNIWATCH";
  const letterVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.08,
        duration: 0.4,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    }),
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-40"
    >
      <div className="container py-3 sm:py-4 flex items-center justify-between">
        <motion.button
          onClick={() => navigate('/search')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full glass flex items-center justify-center hover:bg-primary/20 transition-colors"
        >
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center"
        >
          {logoText.split('').map((letter, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={letterVariants}
              initial="hidden"
              animate="visible"
              className={`text-lg sm:text-2xl font-black tracking-wider ${
                i < 3 
                  ? 'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]' 
                  : 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]'
              }`}
              style={{
                textShadow: i < 3 
                  ? '0 0 20px rgba(74,222,128,0.6), 0 0 40px rgba(74,222,128,0.3)' 
                  : '0 0 15px rgba(255,255,255,0.4)',
              }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.div>

        <div className="relative">
          <motion.button
            onClick={() => setMenuOpen(!menuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full glass flex items-center justify-center hover:bg-primary/20 transition-colors"
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
          </motion.button>

          {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-11 sm:top-12 glass-strong rounded-xl overflow-hidden min-w-36 sm:min-w-40 shadow-lg"
              >
                <button className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm hover:bg-primary/10 transition-colors flex items-center gap-2">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Profile
                </button>
                <button 
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/dubbed');
                  }}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm hover:bg-primary/10 transition-colors flex items-center gap-2"
                >
                  <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Dubbed Anime
                </button>
                <button 
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/community');
                    }}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm hover:bg-primary/10 transition-colors flex items-center gap-2"
                  >
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Community
                  </button>
                </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default TopBar;
