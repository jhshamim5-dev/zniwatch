import { useQuery } from '@tanstack/react-query';
import {
  fetchTopAiring,
    fetchMostPopular,
    fetchTopUpcoming,
    fetchMostFavorite,
    fetchLatestEpisode,

  searchAnime,
  fetchAnimeInfo,
  fetchEpisodes
} from '@/lib/api';

export const useTrendingAnime = (perPage = 10) => {
  return useQuery({
    queryKey: ['trending-anime'],
    queryFn: () => fetchTopAiring(),
  });
};

export const usePopularAnime = (perPage = 20) => {
  return useQuery({
    queryKey: ['popular-anime'],
    queryFn: () => fetchMostPopular(),
  });
};

export const useUpcomingAnime = (perPage = 20) => {
  return useQuery({
    queryKey: ['upcoming-anime'],
    queryFn: () => fetchTopUpcoming(),
  });
};

export const useLatestEpisodeAnime = () => {
  return useQuery({
    queryKey: ['latest-episode-anime'],
    queryFn: () => fetchLatestEpisode(),
  });
};

export const useFavoriteAnime = (perPage = 15) => {
  return useQuery({
    queryKey: ['favorite-anime'],
    queryFn: () => fetchMostFavorite(),
  });
};

export const useAiringAnime = (perPage = 10) => {
  return useQuery({
    queryKey: ['airing-anime'],
    queryFn: () => fetchTopAiring(),
  });
};

export const useSearchAnime = (search: string, enabled = true) => {
  return useQuery({
    queryKey: ['search-anime', search],
    queryFn: () => searchAnime(search),
    enabled: enabled && search.length > 2,
  });
};

export const useAnimeDetails = (id: string) => {
  return useQuery({
    queryKey: ['anime-details', id],
    queryFn: () => fetchAnimeInfo(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
};

export const useAnimeEpisodes = (id: string) => {
  return useQuery({
    queryKey: ['anime-episodes', id],
    queryFn: () => fetchEpisodes(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 30,
  });
};
