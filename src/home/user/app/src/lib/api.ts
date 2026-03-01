import { AnimeMedia, anilistClient, ANIME_DETAILS_QUERY } from './anilist';

const BASE_URL = 'https://animeapi-sage.vercel.app';

const fetchWithTimeout = async (url: string, timeout = 15000): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export interface CustomAnimeItem {
  id: string;
  data_id: string;
  poster: string;
  title: string;
  japanese_title: string;
  description?: string;
  type?: string;
  duration?: string;
  total_episodes?: number;
  release_date?: string;
  tvInfo?: {
    showType: string;
    rating?: string | null;
    duration?: string;
    sub?: string | number;
    dub?: string | number | null;
    eps?: string | number | null;
  };
  adultContent?: boolean;
}

export interface CustomInfoData {
  adultContent: boolean;
  data_id: string;
  id: string;
  anilistId: string;
  malId: string;
  title: string;
  japanese_title: string;
  synonyms: string;
  poster: string;
  showType: string;
  animeInfo: {
    Overview: string;
    Japanese: string;
    Synonyms: string;
    Aired: string;
    Premiered: string;
    Duration: string;
    Status: string;
    'MAL Score': string;
    Genres: string[];
    Studios: string;
    Producers: string[];
    trailers?: {
      title: string;
      url: string;
      thumbnail: string;
    }[];
    tvInfo?: {
      rating: string;
      quality: string;
      sub: string;
      dub: string;
      showType: string;
      duration: string;
    };
  };
  charactersVoiceActors?: {
    character: {
      id: string;
      poster: string;
      name: string;
      cast: string;
    };
    voiceActor: {
      id: string;
      poster: string;
      name: string;
      cast: string;
    };
  }[];
  recommended_data?: {
    data_id: string;
    id: string;
    title: string;
    japanese_title: string;
    poster: string;
    tvInfo?: {
      showType: string;
      duration?: string;
      sub?: string;
      dub?: string;
      eps?: string;
    };
    adultContent?: boolean;
  }[];
  recommendedAnimes?: CustomAnimeItem[];
  relatedAnimes?: {
    id: string;
    title: string;
    poster: string;
    type: string;
  }[];
  seasons?: {
    id: string;
    name: string;
    title: string;
    poster: string;
    isCurrent?: boolean;
  }[];
}

export interface CustomInfoResponse {
  success: boolean;
  results: {
    data: CustomInfoData;
  };
}

export interface CustomEpisode {
  episode_no: number;
  id: string;
  title: string;
  japanese_title: string;
  filler: boolean;
}

export interface CustomEpisodesResponse {
  success: boolean;
  results: {
    totalEpisodes: number;
    episodes: CustomEpisode[];
  };
}

export interface CustomListResponse {
  success: boolean;
  results: {
    data: CustomAnimeItem[];
    totalPages?: number;
  };
}

export const mapCustomToAnimeMedia = (item: CustomAnimeItem): AnimeMedia => {
  const eps = item.total_episodes || (item.tvInfo?.eps ? Number(item.tvInfo.eps) : null);
  const rating = item.tvInfo?.rating ? parseFloat(item.tvInfo.rating) * 10 : null;
  return {
    id: item.id as any,
    title: {
      romaji: item.title,
      english: item.title,
      native: item.japanese_title,
    },
    coverImage: {
      extraLarge: item.poster,
      large: item.poster,
      color: null,
    },
    bannerImage: item.poster,
    description: item.description || null,
    episodes: eps,
    status: 'RELEASING',
    averageScore: rating,
    genres: [],
    nextAiringEpisode: null,
    format: item.tvInfo?.showType || item.type || undefined,
  };
};

export const mapCustomInfoToAnimeMedia = (data: CustomInfoData): AnimeMedia => {
  const trailerInfo = data.animeInfo.trailers?.[0];
  const youtubeId = trailerInfo?.url?.split('/embed/')?.[1] || null;
  
  const characters = data.charactersVoiceActors?.map(cv => ({
    id: cv.character.id as any,
    name: { full: cv.character.name },
    image: { large: cv.character.poster },
  })) || [];

    const subCount = parseInt(data.animeInfo.tvInfo?.sub || '0') || 0;
    const dubCount = parseInt(data.animeInfo.tvInfo?.dub || '0') || 0;
    const episodeCount = subCount || dubCount || null;

  const studios = data.animeInfo.Studios 
    ? data.animeInfo.Studios.split(',').map(s => s.trim().replace(/-/g, ' '))
    : [];

    const relations: any[] = [
      ...(data.seasons || []).map(s => ({
        id: s.id,
        title: { 
          romaji: s.title || s.name,
          english: s.title || s.name,
          native: s.title || s.name
        },
        type: 'Season',
        format: 'TV',
        status: 'FINISHED',
        coverImage: { 
          extraLarge: s.poster,
          large: s.poster,
          color: null 
        },
        bannerImage: s.poster,
        episodes: null,
        averageScore: null,
        genres: [],
        nextAiringEpisode: null
      })),
      ...(data.relatedAnimes || []).map(rel => ({
        id: rel.id,
        title: { 
          romaji: rel.title,
          english: rel.title,
          native: rel.title
        },
        type: rel.type,
        format: rel.type,
        status: 'FINISHED',
        coverImage: { 
          extraLarge: rel.poster,
          large: rel.poster,
          color: null 
        },
        bannerImage: rel.poster,
        episodes: null,
        averageScore: null,
        genres: [],
        nextAiringEpisode: null
      })),
      ...(data.recommended_data || []).filter(rec => !rec.adultContent).map(rec => ({
          id: rec.id,
          title: { 
            romaji: rec.title,
            english: rec.title,
            native: rec.japanese_title || rec.title
          },
          type: 'RECOMMENDED',
          format: rec.tvInfo?.showType || 'TV',
          status: 'FINISHED',
          coverImage: { 
            extraLarge: rec.poster,
            large: rec.poster,
            color: null 
          },
          bannerImage: rec.poster,
          episodes: rec.tvInfo?.eps ? parseInt(rec.tvInfo.eps) : null,
          averageScore: null,
          genres: [],
          nextAiringEpisode: null
        }))
    ];

      return {
        id: data.id as any,
        idMal: Number(data.malId) || undefined,
        subCount: subCount,
        dubCount: dubCount,
      title: {
        romaji: data.title,
        english: data.title,
        native: data.japanese_title,
      },
      coverImage: {
        extraLarge: data.poster,
        large: data.poster,
        color: null,
      },
      bannerImage: data.poster,
      description: data.animeInfo.Overview,
      episodes: episodeCount,
      duration: parseInt(data.animeInfo.Duration) || undefined,
      averageScore: data.animeInfo['MAL Score'] ? parseFloat(data.animeInfo['MAL Score']) * 10 : null,
      status: data.animeInfo.Status?.replace(/-/g, ' ') || 'Unknown',
      genres: data.animeInfo.Genres || [],
      studios: {
        nodes: studios.map(name => ({ name })),
      },
      nextAiringEpisode: null,
      trailer: youtubeId ? { id: youtubeId, site: 'youtube' } : null,
      characters: {
        nodes: characters,
      },
      relations: {
        nodes: relations,
      },
      recommendations: {
        nodes: [],
      },
    };

};

export const fetchTopAiring = async (): Promise<AnimeMedia[]> => {
  const res = await fetchWithTimeout(`${BASE_URL}/api/top-airing`);
  const data: CustomListResponse = await res.json();
  return data.results.data.map(mapCustomToAnimeMedia);
};

export const fetchMostPopular = async (): Promise<AnimeMedia[]> => {
  const res = await fetchWithTimeout(`${BASE_URL}/api/most-popular`);
  const data: CustomListResponse = await res.json();
  return data.results.data.map(mapCustomToAnimeMedia);
};

export const fetchCompleted = async (): Promise<AnimeMedia[]> => {
  const res = await fetchWithTimeout(`${BASE_URL}/api/completed`);
  const data: CustomListResponse = await res.json();
  return data.results.data.map(mapCustomToAnimeMedia);
};

export const fetchMostFavorite = async (): Promise<AnimeMedia[]> => {
  const res = await fetchWithTimeout(`${BASE_URL}/api/most-favorite`);
  const data: CustomListResponse = await res.json();
  return data.results.data.map(mapCustomToAnimeMedia);
};

export const fetchTopUpcoming = async (): Promise<AnimeMedia[]> => {
  const res = await fetchWithTimeout(`${BASE_URL}/api/top-upcoming`);
  const data: CustomListResponse = await res.json();
  return data.results.data.map(mapCustomToAnimeMedia);
};

export const searchAnime = async (keyword: string): Promise<AnimeMedia[]> => {
  const res = await fetchWithTimeout(`${BASE_URL}/api/search?keyword=${encodeURIComponent(keyword)}`);
  const data: CustomListResponse = await res.json();
  return data.results.data.map(mapCustomToAnimeMedia);
};

export const fetchAnimeInfo = async (id: string): Promise<AnimeMedia> => {
  const res = await fetchWithTimeout(`${BASE_URL}/api/info?id=${id}`);
  const json: CustomInfoResponse = await res.json();
  
  if (!json.success || !json.results?.data) {
    throw new Error('Failed to fetch anime info');
  }
  
  const customData = json.results.data;
  const baseInfo = mapCustomInfoToAnimeMedia(customData);
  
  if (customData.anilistId) {
    try {
      const anilistRes = await anilistClient.query({
        query: ANIME_DETAILS_QUERY,
        variables: { id: parseInt(customData.anilistId) },
      });
      
      const anilistData = anilistRes.data?.Media;
      if (anilistData) {
        return {
          ...baseInfo,
          bannerImage: anilistData.bannerImage || baseInfo.bannerImage,
          coverImage: {
            extraLarge: anilistData.coverImage?.extraLarge || baseInfo.coverImage.extraLarge,
            large: anilistData.coverImage?.large || baseInfo.coverImage.large,
            color: anilistData.coverImage?.color || null,
          },
          trailer: anilistData.trailer || baseInfo.trailer,
          staff: anilistData.staff,
          characters: (anilistData.characters?.nodes?.length || 0) > 0 
            ? anilistData.characters 
            : baseInfo.characters,
            recommendations: (baseInfo.recommendations?.nodes?.length || 0) > 0
              ? baseInfo.recommendations
              : anilistData.recommendations,
            relations: (baseInfo.relations?.nodes?.length || 0) > 0
              ? baseInfo.relations
              : anilistData.relations,
          nextAiringEpisode: anilistData.nextAiringEpisode,
          startDate: anilistData.startDate,
          endDate: anilistData.endDate,
          meanScore: anilistData.meanScore,
          popularity: anilistData.popularity,
          streamingEpisodes: anilistData.streamingEpisodes,
        };
      }
    } catch (e) {
      console.warn('Failed to fetch Anilist data:', e);
    }
  }
  
  return baseInfo;
};

export const fetchEpisodes = async (id: string): Promise<CustomEpisodesResponse['results']> => {
  const res = await fetchWithTimeout(`${BASE_URL}/api/episodes/${id}`);
  const json: CustomEpisodesResponse = await res.json();
  
  if (!json.success || !json.results) {
    throw new Error('Failed to fetch episodes');
  }
  
  return json.results;
};

export interface DubbedAnimeResponse {
  success: boolean;
  results: {
    data: CustomAnimeItem[];
    totalPages: number;
  };
}

export interface DubbedAnimeResult {
  data: CustomAnimeItem[];
  totalPages: number;
  currentPage: number;
}

export const fetchDubbedAnime = async (page: number = 1): Promise<DubbedAnimeResult> => {
  const res = await fetchWithTimeout(`${BASE_URL}/api/dubbed-anime?page=${page}`);
  const json: DubbedAnimeResponse = await res.json();
  
  if (!json.success || !json.results) {
    throw new Error('Failed to fetch dubbed anime');
  }
  
  return {
    ...json.results,
    currentPage: page,
  };
};
