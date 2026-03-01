import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search as SearchIcon, X, Tv, Film, Clock, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSearchAnime } from '@/hooks/useAnime';
import AnimeCard from '@/components/AnimeCard';

type FilterType = 'all' | 'tv' | 'movie';

const SEARCH_HISTORY_KEY = 'anime-search-history';
const MAX_HISTORY = 15;

const getSearchHistory = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveSearchHistory = (history: string[]) => {
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
};

const SearchPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchHistory, setSearchHistory] = useState<string[]>(getSearchHistory);

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const addToHistory = useCallback((term: string) => {
    const trimmed = term.trim();
    if (trimmed.length < 1) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(h => h.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, MAX_HISTORY);
      saveSearchHistory(updated);
      return updated;
    });
  }, []);

  const removeFromHistory = useCallback((term: string) => {
    setSearchHistory(prev => {
      const updated = prev.filter(h => h !== term);
      saveSearchHistory(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    saveSearchHistory([]);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      if (query.trim().length >= 2) {
        addToHistory(query);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, addToHistory]);

  const { data: results, isLoading } = useSearchAnime(debouncedQuery);

  const filteredResults = useMemo(() => {
    if (!results) return [];
    if (filter === 'all') return results;
    
    return results.filter(anime => {
      const format = (anime.format || '').toLowerCase();
      if (filter === 'tv') {
        return format.includes('tv') || format.includes('series') || format.includes('ona') || format.includes('ova');
      }
      if (filter === 'movie') {
        return format.includes('movie') || format.includes('special');
      }
      return true;
    });
  }, [results, filter]);

  const showHistory = !debouncedQuery && searchHistory.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 glass-strong border-b border-border/50">
        <div className="container py-3 sm:py-4 flex items-center gap-2 sm:gap-4">
          <motion.button
              onClick={handleBack}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>

          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anime..."
              autoFocus
              className="w-full h-10 sm:h-12 pl-10 sm:pl-12 pr-10 sm:pr-12 rounded-lg sm:rounded-xl bg-secondary border-0 text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            )}
            </div>
          </div>

          <div className="container py-2 flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('tv')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                filter === 'tv'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              TV
            </button>
            <button
              onClick={() => setFilter('movie')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
                filter === 'movie'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              Movie
            </button>
          </div>
        </div>

      <div className="container py-4 sm:py-6 pb-24 sm:pb-32">
        <AnimatePresence mode="wait">
          {showHistory && (
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm sm:text-base font-semibold text-muted-foreground">Recent Searches</h3>
                <button
                  onClick={clearHistory}
                  className="text-xs sm:text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {searchHistory.map((term) => (
                  <div
                    key={term}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/80 transition-colors group cursor-pointer"
                    onClick={() => setQuery(term)}
                  >
                    <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm flex-1 truncate">{term}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFromHistory(term); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-secondary rounded"
                    >
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {!showHistory && isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4"
            >
              {[...Array(12)].map((_, i) => (
                <div key={i}>
                  <div className="aspect-[2/3] shimmer rounded-lg sm:rounded-xl mb-2 sm:mb-3" />
                  <div className="h-3 sm:h-4 w-3/4 shimmer rounded mb-1.5 sm:mb-2" />
                  <div className="h-2.5 sm:h-3 w-1/2 shimmer rounded" />
                </div>
              ))}
            </motion.div>
          ) : !showHistory && filteredResults && filteredResults.length > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4"
              >
                {filteredResults.map((anime, index) => (
                  <AnimeCard key={anime.id} anime={anime} index={index} variant="grid" />
                ))}
              </motion.div>
          ) : !showHistory && debouncedQuery.length > 2 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 sm:py-20"
            >
              <SearchIcon className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-1.5 sm:mb-2">No results found</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Try searching with different keywords
              </p>
            </motion.div>
          ) : !showHistory ? (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 sm:py-20"
            >
              <SearchIcon className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-1.5 sm:mb-2">Search for anime</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Type at least 3 characters to start searching
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SearchPage;
