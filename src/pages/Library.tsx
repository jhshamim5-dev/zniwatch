import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookmarkCheck, Trash2, History, Play, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLibrary } from '@/hooks/useLibrary';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import BottomNav from '@/components/BottomNav';

const LibraryPage = () => {
  const navigate = useNavigate();
  const { library, removeFromLibrary } = useLibrary();
  const { history, continueWatching, removeFromHistory, formatTimeLeft, formatProgress } = useWatchHistory();
  const [activeTab, setActiveTab] = useState<'library' | 'history'>('library');

  const handleContinueWatching = (item: typeof continueWatching[0]) => {
    navigate(`/watch/${item.animeId}?epId=${encodeURIComponent(item.epId)}&ep=${item.episode}&audio=${item.audioType}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24 sm:pb-32">
      <div className="container pt-6 sm:pt-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
          <BookmarkCheck className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          My Library
        </h1>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'library'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <BookmarkCheck className="w-4 h-4 inline-block mr-2" />
            Watchlist ({library.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <History className="w-4 h-4 inline-block mr-2" />
            History ({history.length})
          </button>
        </div>
      </div>

      {activeTab === 'library' && (
        <div className="container">
          {library.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4"
            >
              {library.map((item, index) => (
                <motion.div
                  key={item.animeId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative"
                >
                  <div
                    onClick={() => navigate(`/anime/${item.animeId}`)}
                    className="cursor-pointer"
                  >
                    <div className="relative aspect-[2/3] rounded-lg sm:rounded-xl overflow-hidden mb-2 sm:mb-3 shadow-card">
                      <img
                        src={item.animeCover}
                        alt={item.animeTitle}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                    </div>
                    <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {item.animeTitle}
                    </h3>
                    {item.totalEpisodes && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                        {item.totalEpisodes} episodes
                      </p>
                    )}
                  </div>

                  <motion.button
                    initial={{ opacity: 0 }}
                    whileHover={{ scale: 1.1 }}
                    className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-destructive/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromLibrary(item.animeId);
                    }}
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-destructive-foreground" />
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 sm:py-20"
            >
              <BookmarkCheck className="w-16 h-16 sm:w-20 sm:h-20 text-muted-foreground mx-auto mb-4 sm:mb-6" />
              <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">Your library is empty</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto px-4">
                Start adding anime to your library by tapping the heart icon on any anime page
              </p>
              <motion.button
                onClick={() => navigate('/')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base shadow-glow"
              >
                Explore Anime
              </motion.button>
            </motion.div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="container">
          {continueWatching.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                Continue Watching
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {continueWatching.map((item, index) => (
                    <motion.div
                      key={`${item.animeId}-${item.episode}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative flex gap-3 p-3 rounded-xl bg-card hover:bg-card/80 cursor-pointer transition-colors group"
                    >
                      <div 
                        onClick={() => handleContinueWatching(item)}
                        className="flex gap-3 flex-1"
                      >
                        <div className="relative w-24 sm:w-28 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.animeCover}
                            alt={item.animeTitle}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-8 h-8 text-white fill-white" />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${formatProgress(item.timestamp, item.duration)}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                            {item.animeTitle}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Episode {item.episode} • {item.audioType.toUpperCase()}
                          </p>
                          <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatTimeLeft(item.timestamp, item.duration)}
                          </div>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromHistory(item.animeId);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-destructive-foreground" />
                      </motion.button>
                    </motion.div>
                  ))}
              </div>
            </div>
          )}

          {history.length > 0 ? (
            <>
              <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Watch History
              </h2>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4"
              >
                {history.map((item, index) => (
                  <motion.div
                    key={item.animeId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative"
                  >
                    <div
                      onClick={() => navigate(`/anime/${item.animeId}`)}
                      className="cursor-pointer"
                    >
                      <div className="relative aspect-[2/3] rounded-lg sm:rounded-xl overflow-hidden mb-2 sm:mb-3 shadow-card">
                        <img
                          src={item.animeCover}
                          alt={item.animeTitle}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="text-[10px] sm:text-xs text-white/90 bg-black/60 px-2 py-1 rounded-md inline-block">
                            EP {item.episode} • {item.audioType.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 group-hover:text-primary transition-colors">
                        {item.animeTitle}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                        {item.totalEpisodes} episodes
                      </p>
                    </div>

                    <motion.button
                      initial={{ opacity: 0 }}
                      whileHover={{ scale: 1.1 }}
                      className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-destructive/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(item.animeId);
                      }}
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-destructive-foreground" />
                    </motion.button>
                  </motion.div>
                ))}
              </motion.div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 sm:py-20"
            >
              <History className="w-16 h-16 sm:w-20 sm:h-20 text-muted-foreground mx-auto mb-4 sm:mb-6" />
              <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">No watch history</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto px-4">
                Start watching anime and your progress will be saved here
              </p>
              <motion.button
                onClick={() => navigate('/')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base shadow-glow"
              >
                Explore Anime
              </motion.button>
            </motion.div>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default LibraryPage;
