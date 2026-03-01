import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Star, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimeMedia, getDisplayTitle, formatTimeUntilAiring } from '@/lib/anilist';

interface HeroSliderProps {
  anime: AnimeMedia[];
}

const HeroSlider = ({ anime }: HeroSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % anime.length);
  }, [anime.length]);

  useEffect(() => {
    const interval = setInterval(goToNext, 10000);
    return () => clearInterval(interval);
  }, [goToNext]);

  if (!anime.length) return null;

  const current = anime[currentIndex];
  const title = getDisplayTitle(current.title);

  return (
    <div className="relative h-[55vh] sm:h-[60vh] md:h-[70vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${current.bannerImage || current.coverImage.extraLarge})`,
            }}
          />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-transparent opacity-40" />

        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative h-full container flex flex-col justify-end pb-8 sm:pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-xl lg:max-w-2xl"
          >
            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              {current.nextAiringEpisode && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="airing-badge px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold text-primary-foreground flex items-center gap-1"
                >
                  <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  Ep {current.nextAiringEpisode.episode} in {formatTimeUntilAiring(current.nextAiringEpisode.timeUntilAiring)}
                </motion.span>
              )}
              {current.averageScore && (
                <span className="rating-badge px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold text-primary-foreground flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                  {(current.averageScore / 10).toFixed(1)}
                </span>
              )}
              {current.genres?.slice(0, 2).map((genre) => (
                <span
                  key={genre}
                  className="glass px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium text-foreground hidden sm:inline-block"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 leading-tight line-clamp-2">
              {title}
            </h1>

            {/* Episodes & Studio */}
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 flex-wrap">
              {current.episodes && (
                <span>{current.episodes} Episodes</span>
              )}
              {current.studios?.nodes[0] && (
                <>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground hidden sm:block" />
                  <span className="hidden sm:inline">{current.studios.nodes[0].name}</span>
                </>
              )}
              {current.seasonYear && (
                <>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                  <span>{current.season} {current.seasonYear}</span>
                </>
              )}
            </div>

            {/* CTA Button */}
            <motion.button
              onClick={() => navigate(`/anime/${current.id}`)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group flex items-center gap-2 sm:gap-3 bg-primary text-primary-foreground px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base shadow-glow hover:shadow-glow-lg transition-shadow"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              Watch Now
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </AnimatePresence>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 flex gap-1.5 sm:gap-2">
          {anime.slice(0, 5).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-6 sm:w-8 bg-primary'
                  : 'w-1 sm:w-1.5 bg-muted-foreground/50 hover:bg-muted-foreground'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
