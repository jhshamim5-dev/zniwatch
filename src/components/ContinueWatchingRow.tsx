import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { useAnimeDetails } from '@/hooks/useAnime';
import { WatchHistoryEntry } from '@/lib/db';

interface ContinueCardProps {
  item: WatchHistoryEntry;
  index: number;
}

const ContinueCard = ({ item, index }: ContinueCardProps) => {
  const navigate = useNavigate();
  const { data: anime } = useAnimeDetails(item.animeId);
  const { formatTimeLeft, formatProgress } = useWatchHistory();

  if (!anime) return null;

  const progressPercent = formatProgress(item.timestamp, item.duration);
  const timeLeftLabel = formatTimeLeft(item.timestamp, item.duration);

  const handleContinue = () => {
    navigate(`/watch/${item.animeId}?epId=${encodeURIComponent(item.epId || '')}&ep=${item.episode}&audio=${item.audioType}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="flex-shrink-0 w-72 sm:w-80"
    >
      <div
        onClick={handleContinue}
        className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group"
      >
          <img
            src={anime.bannerImage || anime.coverImage.extraLarge}
            alt={anime.title.english || anime.title.romaji}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <Play className="w-6 h-6 text-primary-foreground ml-1" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-sm font-semibold line-clamp-1 mb-1">
            {anime.title.english || anime.title.romaji}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
            <span>EP {item.episode}</span>
            <span className="w-1 h-1 rounded-full bg-gray-500" />
            <span>{timeLeftLabel}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.audioType === 'dub' ? 'bg-primary text-primary-foreground' : 'bg-white/20'}`}>
              {item.audioType.toUpperCase()}
            </span>
          </div>
          
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ContinueWatchingRow = () => {
  const { continueWatching, isLoading } = useWatchHistory();

  if (isLoading || continueWatching.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-4 sm:py-6"
    >
      <div className="container">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Continue Watching</h2>
        </div>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-6 sm:w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-6 sm:w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          <div className="flex gap-3 sm:gap-4 overflow-x-auto hide-scrollbar pb-3 sm:pb-4 -mx-4 px-4">
            {continueWatching.map((item, index) => (
              <ContinueCard key={`${item.animeId}-${item.episode}`} item={item} index={index} />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default ContinueWatchingRow;
