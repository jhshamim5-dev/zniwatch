import { motion } from 'framer-motion';
import { ArrowLeft, Mic, Loader2, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { fetchDubbedAnime, CustomAnimeItem, DubbedAnimeResult } from '@/lib/api';
import BottomNav from '@/components/BottomNav';

const DubbedAnimePage = () => {
  const navigate = useNavigate();
  const { ref, inView } = useInView({ threshold: 0, rootMargin: '200px' });

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['dubbed-anime'],
    queryFn: ({ pageParam }) => fetchDubbedAnime(pageParam),
    getNextPageParam: (lastPage: DubbedAnimeResult) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allAnime = data?.pages.flatMap((page) => page.data) || [];

  return (
    <div className="min-h-screen bg-background pb-24 sm:pb-32">
      <div className="container pt-6 sm:pt-8">
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <motion.button
            onClick={handleBack}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full glass flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3">
              <Mic className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              Dubbed Anime
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Anime available with English dub
            </p>
          </div>
        </div>
      </div>

      <div className="container">
        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] rounded-lg sm:rounded-xl bg-secondary mb-2 sm:mb-3" />
                <div className="h-3 sm:h-4 bg-secondary rounded w-3/4 mb-1 sm:mb-2" />
                <div className="h-2 sm:h-3 bg-secondary rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16 sm:py-20">
            <Mic className="w-16 h-16 sm:w-20 sm:h-20 text-muted-foreground mx-auto mb-4 sm:mb-6" />
            <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">Failed to load</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
              Unable to fetch dubbed anime. Please try again.
            </p>
            <motion.button
              onClick={() => window.location.reload()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 sm:px-6 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base shadow-glow"
            >
              Retry
            </motion.button>
          </div>
        ) : allAnime.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4"
            >
              {allAnime.map((item: CustomAnimeItem, index: number) => (
                <motion.div
                  key={`${item.id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.02, 0.5) }}
                  className="group relative"
                >
                  <div
                    onClick={() => navigate(`/anime/${item.id}`)}
                    className="cursor-pointer"
                  >
                      <div className="relative aspect-[2/3] rounded-lg sm:rounded-xl overflow-hidden mb-2 sm:mb-3 shadow-card">
                        <img
                          src={item.poster}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                        
                        {item.tvInfo?.rating && (
                          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2">
                            <span className="rating-badge px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold text-primary-foreground flex items-center gap-0.5 sm:gap-1">
                              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                              {item.tvInfo.rating}
                            </span>
                          </div>
                        )}
                        
                          {item.tvInfo && (
                            <div className="absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-2 sm:left-2 sm:right-2 flex gap-1 sm:gap-1.5 flex-wrap">
                              {item.tvInfo.sub && Number(item.tvInfo.sub) > 0 && (
                                <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-blue-500/90 backdrop-blur-sm rounded text-[9px] sm:text-[10px] font-medium text-white">
                                  SUB: {item.tvInfo.sub}
                                </span>
                              )}
                              {item.tvInfo.dub && Number(item.tvInfo.dub) > 0 && (
                                <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-purple-500/90 backdrop-blur-sm rounded text-[9px] sm:text-[10px] font-medium text-white">
                                  DUB: {item.tvInfo.dub}
                                </span>
                              )}
                            </div>
                          )}
                      </div>
                    <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    {item.tvInfo?.showType && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                        {item.tvInfo.showType}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <div ref={ref} className="py-8 flex justify-center min-h-[60px]">
              {isFetchingNextPage && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Loading more...</span>
                </div>
              )}
              {!hasNextPage && allAnime.length > 0 && (
                <p className="text-sm text-muted-foreground">No more anime to load</p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-16 sm:py-20">
            <Mic className="w-16 h-16 sm:w-20 sm:h-20 text-muted-foreground mx-auto mb-4 sm:mb-6" />
            <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">No dubbed anime found</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Check back later for dubbed anime content
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default DubbedAnimePage;
