import { useState, useEffect, useCallback } from 'react';
import { watchHistoryDB, WatchHistoryEntry } from '@/lib/db';

export const useWatchHistory = () => {
  const [history, setHistory] = useState<WatchHistoryEntry[]>([]);
  const [continueWatching, setContinueWatching] = useState<WatchHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshHistory = useCallback(async () => {
    try {
      const [allHistory, continueItems] = await Promise.all([
        watchHistoryDB.getAllHistory(),
        watchHistoryDB.getAllContinueWatching()
      ]);
      setHistory(allHistory);
      setContinueWatching(continueItems);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const saveProgress = useCallback(async (entry: Omit<WatchHistoryEntry, 'id'>) => {
    try {
      await watchHistoryDB.add(entry);
      refreshHistory();
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  }, [refreshHistory]);

  const getAnimeProgress = useCallback(async (animeId: string): Promise<WatchHistoryEntry | null> => {
    try {
      return await watchHistoryDB.getLatestForAnime(animeId);
    } catch (err) {
      console.error('Failed to get anime progress:', err);
      return null;
    }
  }, []);

  const getEpisodeProgress = useCallback(async (animeId: string, episode: number): Promise<WatchHistoryEntry | null> => {
    try {
      return await watchHistoryDB.getByAnimeEpisode(animeId, episode);
    } catch (err) {
      console.error('Failed to get episode progress:', err);
      return null;
    }
  }, []);

  const removeFromHistory = useCallback(async (animeId: string) => {
    try {
      await watchHistoryDB.deleteAllForAnime(animeId);
      refreshHistory();
    } catch (err) {
      console.error('Failed to remove from history:', err);
    }
  }, [refreshHistory]);

  const clearHistory = useCallback(async () => {
    try {
      await watchHistoryDB.clearAll();
      setHistory([]);
      setContinueWatching([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  }, []);

  const formatTimeLeft = useCallback((timestamp: number, duration: number) => {
    const remaining = duration - timestamp;
    const mins = Math.floor(remaining / 60);
    if (mins < 1) return 'Less than 1 min left';
    if (mins === 1) return '1 min left';
    return `${mins} mins left`;
  }, []);

  const formatProgress = useCallback((timestamp: number, duration: number) => {
    if (duration <= 0) return 0;
    return Math.min(Math.round((timestamp / duration) * 100), 100);
  }, []);

  return {
    history,
    continueWatching,
    isLoading,
    saveProgress,
    getAnimeProgress,
    getEpisodeProgress,
    removeFromHistory,
    clearHistory,
    refreshHistory,
    formatTimeLeft,
    formatProgress
  };
};
