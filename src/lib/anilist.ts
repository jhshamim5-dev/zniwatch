import { ApolloClient, InMemoryCache, gql, HttpLink } from '@apollo/client';

const httpLink = new HttpLink({
  uri: 'https://graphql.anilist.co',
});

export const anilistClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export const TRENDING_ANIME_QUERY = gql`
  query TrendingAnime($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          extraLarge
          large
          color
        }
        bannerImage
        description(asHtml: false)
        episodes
        averageScore
        status
        season
        seasonYear
        nextAiringEpisode {
          airingAt
          episode
          timeUntilAiring
        }
        genres
        studios(isMain: true) {
          nodes {
            name
          }
        }
        trailer {
          id
          site
        }
      }
    }
  }
`;

export const POPULAR_ANIME_QUERY = gql`
  query PopularAnime($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
        id
        title {
          romaji
          english
        }
        coverImage {
          extraLarge
          large
          color
        }
        episodes
        averageScore
        status
        nextAiringEpisode {
          airingAt
          episode
          timeUntilAiring
        }
      }
    }
  }
`;

export const AIRING_ANIME_QUERY = gql`
  query AiringAnime($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, status: RELEASING, sort: POPULARITY_DESC, isAdult: false) {
        id
        title {
          romaji
          english
        }
        coverImage {
          extraLarge
          large
          color
        }
        bannerImage
        episodes
        averageScore
        status
        nextAiringEpisode {
          airingAt
          episode
          timeUntilAiring
        }
        genres
      }
    }
  }
`;

export const SEARCH_ANIME_QUERY = gql`
  query SearchAnime($search: String, $page: Int, $perPage: Int, $format: MediaFormat) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, search: $search, isAdult: false, format: $format) {
        id
        title {
          romaji
          english
        }
        coverImage {
          extraLarge
          large
          color
        }
        episodes
        averageScore
        status
        format
        nextAiringEpisode {
          airingAt
          episode
          timeUntilAiring
        }
      }
    }
  }
`;

export const ANIME_DETAILS_QUERY = gql`
  query AnimeDetails($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      idMal
      title {
        romaji
        english
        native
      }
      coverImage {
        extraLarge
        large
        color
      }
      bannerImage
      description(asHtml: false)
      episodes
      duration
      averageScore
      meanScore
      popularity
      status
      season
      seasonYear
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      nextAiringEpisode {
        airingAt
        episode
        timeUntilAiring
      }
      genres
      tags {
        name
        rank
      }
      studios(isMain: true) {
        nodes {
          name
        }
      }
      staff(sort: RELEVANCE, perPage: 12) {
        edges {
          role
          node {
            id
            name {
              full
            }
            image {
              large
            }
            primaryOccupations
          }
        }
      }
      characters(sort: ROLE, perPage: 12) {
        nodes {
          id
          name {
            full
          }
          image {
            large
          }
        }
      }
      trailer {
        id
        site
      }
      streamingEpisodes {
        title
        thumbnail
        url
      }
      recommendations(perPage: 6) {
        nodes {
          mediaRecommendation {
            id
            title {
              romaji
            }
            coverImage {
              large
            }
          }
        }
      }
      relations {
        nodes {
          id
          title {
            romaji
          }
          type
          format
          coverImage {
            large
          }
        }
      }
    }
  }
`;

export interface AnimeMedia {
  id: string | number;
  idMal?: number;
  subCount?: number;
  dubCount?: number;
  title: {
    romaji: string;
    english: string | null;
    native?: string;
  };
  coverImage: {
    extraLarge: string;
    large: string;
    color: string | null;
  };
  bannerImage: string | null;
  description: string | null;
  episodes: number | null;
  duration?: number;
  averageScore: number | null;
  meanScore?: number;
  popularity?: number;
  status: string;
  format?: string;
  season?: string;
  seasonYear?: number;
  startDate?: {
    year: number;
    month: number;
    day: number;
  };
  endDate?: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
  nextAiringEpisode: {
    airingAt: number;
    episode: number;
    timeUntilAiring: number;
  } | null;
  genres: string[];
  tags?: { name: string; rank: number }[];
  studios?: {
    nodes: { name: string }[];
  };
  staff?: {
    edges: {
      role: string;
      node: {
        id: number;
        name: { full: string };
        image: { large: string };
        primaryOccupations: string[];
      };
    }[];
  };
  characters?: {
    nodes: {
      id: number;
      name: { full: string };
      image: { large: string };
    }[];
  };
  trailer?: {
    id: string;
    site: string;
  } | null;
  streamingEpisodes?: {
    title: string;
    thumbnail: string;
    url: string;
  }[];
  recommendations?: {
    nodes: {
      mediaRecommendation: {
        id: number;
        title: { romaji: string };
        coverImage: { large: string };
      };
    }[];
  };
  relations?: {
    nodes: {
      id: number;
      title: { romaji: string };
      type: string;
      format: string;
      coverImage: { large: string };
    }[];
  };
}

export const formatTimeUntilAiring = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const getDisplayTitle = (title: AnimeMedia['title']): string => {
  return title.english || title.romaji;
};
