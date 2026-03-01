import { useState, useEffect, useCallback } from 'react';
import { watchlistDB, WatchlistEntry } from '@/lib/db';
import { AnimeMedia } from '@/lib/anilist';

export const useLibrary = () => {
  const [library, setLibrary] = useState<WatchlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshLibrary = useCallback(async () => {
    try {
      const all = await watchlistDB.getAll();
      setLibrary(all);
    } catch (err) {
      console.error('Failed to load watchlist:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshLibrary();
  }, [refreshLibrary]);

  const addToLibrary = useCallback(async (anime: AnimeMedia) => {
    try {
      await watchlistDB.add({
        animeId: String(anime.id),
        animeTitle: anime.title.english || anime.title.romaji,
        animeCover: anime.coverImage.extraLarge || anime.coverImage.large,
        totalEpisodes: anime.episodes || 0,
        addedAt: Date.now()
      });
      refreshLibrary();
    } catch (err) {
      console.error('Failed to add to watchlist:', err);
    }
  }, [refreshLibrary]);

  const removeFromLibrary = useCallback(async (animeId: string) => {
    try {
      await watchlistDB.delete(animeId);
      refreshLibrary();
    } catch (err) {
      console.error('Failed to remove from watchlist:', err);
    }
  }, [refreshLibrary]);

  const isInLibrary = useCallback(async (animeId: string) => {
    try {
      return await watchlistDB.exists(animeId);
    } catch (err) {
      console.error('Failed to check watchlist:', err);
      return false;
    }
  }, []);

  const toggleLibrary = useCallback(async (anime: AnimeMedia) => {
    const exists = await watchlistDB.exists(String(anime.id));
    if (exists) {
      await removeFromLibrary(String(anime.id));
    } else {
      await addToLibrary(anime);
    }
  }, [addToLibrary, removeFromLibrary]);

  return {
    library,
    isLoading,
    addToLibrary,
    removeFromLibrary,
    isInLibrary,
    toggleLibrary,
    refreshLibrary
  };
};
