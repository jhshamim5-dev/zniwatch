import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Play, Tv, Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimeMedia, getDisplayTitle, formatTimeUntilAiring } from '@/lib/anilist';

interface AnimeCardProps {
  anime: AnimeMedia;
  index?: number;
  variant?: 'default' | 'compact' | 'grid';
}

const AnimeCard = ({ anime, index = 0, variant = 'default' }: AnimeCardProps) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const title = getDisplayTitle(anime.title);

  const handleClick = () => {
    navigate(`/anime/${anime.id}`);
  };

  if (variant === 'grid') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={handleClick}
        className="group cursor-pointer"
      >
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3">
          {!imageLoaded && (
            <div className="absolute inset-0 shimmer" />
          )}
            <img
              src={anime.coverImage.extraLarge || anime.coverImage.large}
              alt={title}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-glow"
            >
              <Play className="w-6 h-6 text-primary-foreground fill-current ml-1" />
            </motion.div>
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {anime.averageScore && (
              <span className="rating-badge px-2 py-0.5 rounded-md text-xs font-semibold text-primary-foreground flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                {(anime.averageScore / 10).toFixed(1)}
              </span>
            )}
          </div>

          {anime.nextAiringEpisode && (
            <div className="absolute bottom-2 left-2 right-2">
              <span className="airing-badge px-2 py-1 rounded-md text-xs font-semibold text-primary-foreground flex items-center gap-1 w-fit">
                <Clock className="w-3 h-3" />
                Ep {anime.nextAiringEpisode.episode} • {formatTimeUntilAiring(anime.nextAiringEpisode.timeUntilAiring)}
              </span>
            </div>
          )}
        </div>

        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            {anime.format && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {anime.format.toLowerCase().includes('movie') ? (
                  <Film className="w-3 h-3" />
                ) : (
                  <Tv className="w-3 h-3" />
                )}
                {anime.format}
              </span>
            )}
            {anime.episodes && (
              <span className="text-xs text-muted-foreground">
                {anime.episodes} Eps
              </span>
            )}
          </div>
        </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      onClick={handleClick}
      className={`group cursor-pointer flex-shrink-0 ${
        variant === 'compact' ? 'w-28 sm:w-32' : 'w-32 sm:w-36 md:w-40 lg:w-44'
      }`}
    >
      <div className="relative aspect-[2/3] rounded-lg sm:rounded-xl overflow-hidden mb-2 sm:mb-3 shadow-card card-hover">
        {!imageLoaded && (
          <div className="absolute inset-0 shimmer" />
        )}
          <img
            src={anime.coverImage.extraLarge || anime.coverImage.large}
            alt={title}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.div
            initial={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center shadow-glow"
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground fill-current ml-0.5" />
          </motion.div>
        </div>

        {/* Rating Badge */}
        {anime.averageScore && (
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2">
            <span className="rating-badge px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold text-primary-foreground flex items-center gap-0.5 sm:gap-1">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
              {(anime.averageScore / 10).toFixed(1)}
            </span>
          </div>
        )}

        {/* Airing Badge */}
        {anime.nextAiringEpisode && (
          <div className="absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-2 sm:left-2 sm:right-2">
            <span className="airing-badge px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[8px] sm:text-[10px] font-semibold text-primary-foreground flex items-center gap-0.5 sm:gap-1">
              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              Ep {anime.nextAiringEpisode.episode}
            </span>
          </div>
        )}
      </div>

      <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 group-hover:text-primary transition-colors leading-tight">
        {title}
      </h3>
      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
        {anime.episodes ? `${anime.episodes} eps` : anime.status}
      </p>
    </motion.div>
    );
};

export default AnimeCard;
