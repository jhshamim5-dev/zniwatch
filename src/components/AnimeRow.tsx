import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { AnimeMedia } from '@/lib/anilist';
import AnimeCard from './AnimeCard';

interface AnimeRowProps {
  title: string;
  anime: AnimeMedia[];
  onViewMore?: () => void;
  isLoading?: boolean;
}

const AnimeRow = ({ title, anime, onViewMore, isLoading }: AnimeRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <section className="py-4 sm:py-6">
        <div className="container">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="h-6 sm:h-7 w-32 sm:w-40 shimmer rounded-lg" />
          </div>
          <div className="flex gap-3 sm:gap-4 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-32 sm:w-36 md:w-40 lg:w-44">
                <div className="aspect-[2/3] shimmer rounded-lg sm:rounded-xl mb-2 sm:mb-3" />
                <div className="h-3 sm:h-4 w-3/4 shimmer rounded mb-1.5 sm:mb-2" />
                <div className="h-2.5 sm:h-3 w-1/2 shimmer rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-4 sm:py-6"
    >
      <div className="container">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">{title}</h2>
          {onViewMore && (
            <motion.button
              onClick={onViewMore}
              whileHover={{ x: 4 }}
              className="flex items-center gap-1 text-xs sm:text-sm text-primary font-medium hover:text-primary/80 transition-colors"
            >
              View More
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </motion.button>
          )}
        </div>

        <div className="relative">
          <div ref={scrollRef} className="flex gap-3 sm:gap-4 overflow-x-auto hide-scrollbar pb-3 sm:pb-4 -mx-4 px-4">
            {anime.map((item, index) => (
              <AnimeCard key={item.id} anime={item} index={index} />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default AnimeRow;
